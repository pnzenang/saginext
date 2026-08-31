'use client'

import { useActionState, useCallback, useEffect, useId, useMemo, useState } from 'react'

import { flushSync, useFormStatus } from 'react-dom'

import type {
  Cell,
  Column,
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowData,
  Row,
  RowSelectionState
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getPaginationRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import {
  AlertTriangle,
  ArrowUpDown,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Clock,
  Cross,
  Ellipsis,
  FileSpreadsheetIcon,
  FileTextIcon,
  Hourglass,
  Loader,
  Pencil,
  SearchIcon,
  ShieldCheck,
  Trash2,
  UploadIcon,
  UserCheck,
  Users,
  XIcon
} from 'lucide-react'
import Link from 'next/link'
import Papa from 'papaparse'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

import PaginationControls from '@/components/global/PaginationControls'
import PrintButton from '@/components/global/PrintButton'
import RemoveOverduePendingMembersButton from '@/components/global/RemoveOverduePendingMembersButton'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePersistentColumnFilters } from '@/hooks/use-persistent-column-filters'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { usePagination } from '@/hooks/use-pagination'
import { formatMemberStatus, type AppLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { getTableCellTitle } from '@/utils/table'
import { getSelectFilterValues } from '@/utils/table-filter-values'
import { formatLongevity, formatLongevityInDays } from '@/utils/formatLongevity'
import {
  getRegistrationPaymentCountdown,
  getRegistrationPaymentCountdownLabel,
  getOverdueRegistrationPaymentCreatedAtCutoff,
  registrationPaymentDeadlineDays
} from '@/utils/registration-payment-deadline'
import {
  makeAwaitingMembersVestedAction,
  makeMembersDelinquentAction,
  makeMembersVestedAction,
  makeVestedMembersAwaitingAction,
  movePendingMembersToAwaitingPublicationAction
} from '@/utils/actions'
import { memberStatus, type MemberType } from '@/utils/types'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
    label?: string
  }
}

const numberFormatter = new Intl.NumberFormat('en-US')
const formatNumber = (value: number) => numberFormatter.format(value)
const adminActionButtonClassName = 'h-10 min-h-10 min-w-0 overflow-hidden whitespace-nowrap'
const adminActionButtonLabelClassName = 'min-w-0 truncate'
const dismissedSharedNameRowStorageKey = 'sagi:admin-all-members:dismissedSharedNameRows'

const adminMemberTableCopy = {
  en: {
    actions: {
      announceDeath: "Announce Member's Death",
      edit: "Edit Member's Details",
      open: 'Open member actions',
      remove: 'Remove Member'
    },
    all: 'All',
    autoVest: {
      button: (count: number) => `Make Vested (${count} awaiting)`,
      cancel: 'Cancel',
      confirm: 'Make Vested',
      description: (count: number) =>
        `This will move ${count} selected awaiting member${count === 1 ? '' : 's'} to Vested. No contribution credit will be created.`,
      pending: 'Please wait...',
      title: 'Move selected awaiting members to Vested?'
    },
    bulkAwaiting: {
      button: (count: number) => `Make Awaiting (${count} pending)`,
      cancel: 'Cancel',
      confirm: 'Make Awaiting',
      description: (count: number) =>
        `This will move ${count} selected pending member${count === 1 ? '' : 's'} to Awaiting Publication. Their registration fee dues will no longer count as pending.`,
      pending: 'Please wait...',
      title: 'Move selected pending members to Awaiting?'
    },
    bulkVestedAwaiting: {
      button: (count: number) => `Make Awaiting (${count} vested)`,
      cancel: 'Cancel',
      confirm: 'Make Awaiting',
      description: (count: number) =>
        `This will move ${count} selected vested member${count === 1 ? '' : 's'} to Awaiting Publication. Accounting records will not be changed.`,
      pending: 'Please wait...',
      title: 'Move selected vested members to Awaiting?'
    },
    bulkDelinquent: {
      button: (count: number) => `Make Delinquent (${count} vested)`,
      cancel: 'Cancel',
      confirm: 'Make Delinquent',
      description: (count: number) =>
        `This will move ${count} selected vested member${count === 1 ? '' : 's'} to Not in Good Standing.`,
      pending: 'Please wait...',
      title: 'Move selected vested members to Delinquent?'
    },
    bulkVested: {
      button: (count: number) => `Make Vested (${count} delinquent)`,
      cancel: 'Cancel',
      confirm: 'Make Vested',
      description: (count: number) =>
        `This will move ${count} selected delinquent member${count === 1 ? '' : 's'} back to Vested.`,
      pending: 'Please wait...',
      title: 'Move selected delinquent members to Vested?'
    },
    columns: {
      actions: 'Actions',
      actionsShort: 'Act.',
      associationCode: 'Association Code',
      code: 'Code',
      firstName: 'First Name',
      firstShort: 'First',
      lastAndMiddleNames: 'Last and Middle Names',
      lastAndMiddleShort: 'Last/Middle',
      longevity: 'Longevity',
      longevityShort: 'Long.',
      matriculation: 'Matriculation',
      matriculationShort: 'Matric.',
      name: 'Name',
      recommendation: 'Recommendation',
      recommendationShort: 'Rec.',
      registrationDues: `Registration Dues (${registrationPaymentDeadlineDays} days)`,
      registrationDuesShort: 'Reg. Dues',
      select: 'Select',
      status: 'Status'
    },
    export: {
      all: 'Export All',
      asCsv: 'Export as CSV',
      asExcel: 'Export as Excel',
      asJson: 'Export as JSON',
      page: 'Export Page',
      printPdf: 'Print PDF',
      printSelection: (count: number) => `Print Selection (${count})`,
      selection: (count: number) => `Export Selection (${count})`
    },
    filters: {
      clear: (label: string) => `Clear ${label} search`,
      names: 'names',
      search: (label: string) => `Search ${label}`,
      select: (label: string) => `Select ${label}`,
      show: 'Show',
      resultsPlaceholder: 'Select number of results'
    },
    found: (count: string) => `${count} Member(s) Found`,
    noMembers: 'No Member Found, add members.',
    pagination: {
      next: 'Next',
      nextAria: 'Go to next page',
      previous: 'Previous',
      previousAria: 'Go to previous page'
    },
    pendingMatriculation: 'Pending',
    sharedLastNameWords: {
      button: (count: number) => `Shared Name Matches (${count})`,
      dateOfBirth: 'Date of Birth',
      description: (groupCount: string, memberCount: string) =>
        `${groupCount} matching word pair(s), across ${memberCount} member record(s).`,
      dismissRow: 'Not a duplicate',
      dismissRowAria: (memberName: string, firstSharedNameWord: string, secondSharedNameWord: string) =>
        `Hide ${memberName} from the ${firstSharedNameWord} and ${secondSharedNameWord} match set`,
      dismissedRows: (count: number) => `${count} dismissed row${count === 1 ? '' : 's'}`,
      empty: 'No members share both last/middle and first-name words.',
      emptyAfterDismissal: 'All matching rows have been dismissed as not duplicates.',
      jumpToWord: 'Choose shared words',
      memberCount: (count: number) => `${count} member${count === 1 ? '' : 's'}`,
      resetDismissedRows: 'Show dismissed rows',
      title: 'Members Sharing Last/Middle and First Name Words'
    },
    selection: {
      member: (name: string) => `Select ${name}`,
      page: 'Select all pending, awaiting, vested, or delinquent members on this page'
    },
    summary: {
      awaiting: 'Awaiting',
      delinquent: 'Delinquent',
      pending: 'Pending',
      total: 'Total Membership',
      vested: 'Vested'
    },
    title: 'All Active Members (Admin)'
  },
  fr: {
    actions: {
      announceDeath: 'Annoncer le décès du membre',
      edit: 'Modifier les détails du membre',
      open: 'Ouvrir les actions du membre',
      remove: 'Retirer le membre'
    },
    all: 'Tous',
    autoVest: {
      button: (count: number) => `Marquer acquis (${count} en attente)`,
      cancel: 'Annuler',
      confirm: 'Marquer acquis',
      description: (count: number) =>
        `Cette action déplacera ${count} membre${count === 1 ? '' : 's'} en attente de publication sélectionné${count === 1 ? '' : 's'} vers Acquis. Aucun crédit de cotisation ne sera créé.`,
      pending: 'Veuillez patienter...',
      title: 'Passer les membres en attente sélectionnés à Acquis ?'
    },
    bulkAwaiting: {
      button: (count: number) => `Mettre en attente (${count} en attente)`,
      cancel: 'Annuler',
      confirm: 'Mettre en attente',
      description: (count: number) =>
        `Cette action déplacera ${count} membre${count === 1 ? '' : 's'} en attente sélectionné${count === 1 ? '' : 's'} vers En attente de publication. Les frais d'inscription ne compteront plus comme dus.`,
      pending: 'Veuillez patienter...',
      title: 'Passer les membres sélectionnés à En attente de publication ?'
    },
    bulkVestedAwaiting: {
      button: (count: number) => `Mettre en attente (${count} acquis)`,
      cancel: 'Annuler',
      confirm: 'Mettre en attente',
      description: (count: number) =>
        `Cette action déplacera ${count} membre${count === 1 ? '' : 's'} acquis sélectionné${count === 1 ? '' : 's'} vers En attente de publication. Les enregistrements comptables ne seront pas modifiés.`,
      pending: 'Veuillez patienter...',
      title: 'Passer les membres acquis sélectionnés à En attente de publication ?'
    },
    bulkDelinquent: {
      button: (count: number) => `Marquer pas en règle (${count} acquis)`,
      cancel: 'Annuler',
      confirm: 'Marquer pas en règle',
      description: (count: number) =>
        `Cette action déplacera ${count} membre${count === 1 ? '' : 's'} acquis sélectionné${count === 1 ? '' : 's'} vers Pas en règle.`,
      pending: 'Veuillez patienter...',
      title: 'Passer les membres acquis sélectionnés à Pas en règle ?'
    },
    bulkVested: {
      button: (count: number) => `Marquer acquis (${count} pas en règle)`,
      cancel: 'Annuler',
      confirm: 'Marquer acquis',
      description: (count: number) =>
        `Cette action replacera ${count} membre${count === 1 ? '' : 's'} pas en règle sélectionné${count === 1 ? '' : 's'} au statut Acquis.`,
      pending: 'Veuillez patienter...',
      title: 'Passer les membres pas en règle sélectionnés à Acquis ?'
    },
    columns: {
      actions: 'Actions',
      actionsShort: 'Act.',
      associationCode: "Code de l'association",
      code: 'Code',
      firstName: 'Prénom',
      firstShort: 'Prénom',
      lastAndMiddleNames: 'Nom et prénoms intermédiaires',
      lastAndMiddleShort: 'Nom/prénoms',
      longevity: 'Ancienneté',
      longevityShort: 'Anc.',
      matriculation: 'Matricule',
      matriculationShort: 'Matric.',
      name: 'Nom',
      recommendation: 'Recommandation',
      recommendationShort: 'Reco.',
      registrationDues: `Frais d'inscription (${registrationPaymentDeadlineDays} jours)`,
      registrationDuesShort: 'Frais inscr.',
      select: 'Sélectionner',
      status: 'Statut'
    },
    export: {
      all: 'Tout exporter',
      asCsv: 'Exporter en CSV',
      asExcel: 'Exporter en Excel',
      asJson: 'Exporter en JSON',
      page: 'Exporter la page',
      printPdf: 'Imprimer PDF',
      printSelection: (count: number) => `Imprimer sélection (${count})`,
      selection: (count: number) => `Exporter sélection (${count})`
    },
    filters: {
      clear: (label: string) => `Effacer la recherche ${label}`,
      names: 'noms',
      search: (label: string) => `Rechercher ${label}`,
      select: (label: string) => `Sélectionner ${label}`,
      show: 'Afficher',
      resultsPlaceholder: 'Sélectionner le nombre de résultats'
    },
    found: (count: string) => `${count} membre(s) trouvé(s)`,
    noMembers: 'Aucun membre trouvé, ajoutez des membres.',
    pagination: {
      next: 'Suivant',
      nextAria: 'Aller à la page suivante',
      previous: 'Précédent',
      previousAria: 'Aller à la page précédente'
    },
    pendingMatriculation: 'En attente',
    sharedLastNameWords: {
      button: (count: number) => `Correspondances de noms (${count})`,
      dateOfBirth: 'Date de naissance',
      description: (groupCount: string, memberCount: string) =>
        `${groupCount} paire(s) de mots correspondants, dans ${memberCount} fiche(s) membre.`,
      dismissRow: 'Pas doublon',
      dismissRowAria: (memberName: string, firstSharedNameWord: string, secondSharedNameWord: string) =>
        `Masquer ${memberName} dans la correspondance ${firstSharedNameWord} et ${secondSharedNameWord}`,
      dismissedRows: (count: number) => `${count} ligne${count === 1 ? '' : 's'} masquée${count === 1 ? '' : 's'}`,
      empty: 'Aucun membre ne partage à la fois des mots de nom/prénoms et de prénom.',
      emptyAfterDismissal: 'Toutes les lignes correspondantes ont été masquées comme non-doublons.',
      jumpToWord: 'Choisir des mots partagés',
      memberCount: (count: number) => `${count} membre${count === 1 ? '' : 's'}`,
      resetDismissedRows: 'Réafficher les lignes masquées',
      title: 'Membres partageant des mots de nom/prénoms et de prénom'
    },
    selection: {
      member: (name: string) => `Sélectionner ${name}`,
      page: 'Sélectionner tous les membres en attente, en attente de publication, acquis ou pas en règle sur cette page'
    },
    summary: {
      awaiting: 'En attente de publication',
      delinquent: 'Pas en règle',
      pending: 'En attente',
      total: 'Total des membres',
      vested: 'Acquis'
    },
    title: 'Tous les membres actifs (admin)'
  }
} as const

type AdminMemberTableCopy = (typeof adminMemberTableCopy)[AppLanguage]
type SharedLastNameSortDirection = 'asc' | 'desc'
type SharedLastNameSortKey =
  | 'associationCode'
  | 'dateOfBirth'
  | 'firstName'
  | 'lastAndMiddleNames'
  | 'memberMatriculationNumber'
  | 'memberStatus'

type SharedLastNameSortState = {
  direction: SharedLastNameSortDirection
  key: SharedLastNameSortKey
}

const getVisibleMatriculationNumber = (status: unknown, matriculationNumber: unknown, pendingLabel = 'Pending') => {
  if (status === memberStatus.Pending || status === memberStatus.Awaiting) return pendingLabel

  return String(matriculationNumber ?? '')
}

const getVisibleLongevity = (startDate: Date, status: unknown, language: AppLanguage) => {
  if (status === memberStatus.Pending || status === memberStatus.Awaiting) {
    return formatLongevityInDays(startDate, new Date(), language)
  }

  return formatLongevity(startDate, new Date(), language)
}

const nameFilterIds = new Set(['firstName', 'lastAndMiddleNames'])

const mergeNameColumnFilters = (filters: ColumnFiltersState) => {
  const legacyNameFilters = filters.filter(filter => nameFilterIds.has(filter.id))

  if (legacyNameFilters.length === 0) return filters

  const nextFilters = filters.filter(filter => filter.id !== 'name' && !nameFilterIds.has(filter.id))
  const existingNameFilter = filters.find(filter => filter.id === 'name')

  const nameSearchValue = [existingNameFilter?.value, ...legacyNameFilters.map(filter => filter.value)]
    .map(value => String(value ?? '').trim())
    .filter(Boolean)
    .join(' ')

  if (!nameSearchValue) return nextFilters

  return [...nextFilters, { id: 'name', value: nameSearchValue }]
}

const filterName = (row: Row<MemberType>, columnId: string, filterValue: unknown) => {
  const searchTerms = String(filterValue ?? '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  if (searchTerms.length === 0) return true

  const name = String(row.getValue(columnId) ?? '').toLowerCase()

  return searchTerms.every(term => name.includes(term))
}

const getRegistrationPaymentWarning = (member: MemberType, language: AppLanguage) => {
  if (member.memberStatus !== memberStatus.Pending) return ''

  const countdown = getRegistrationPaymentCountdown(member.createdAt)
  const countdownLabel = getRegistrationPaymentCountdownLabel(countdown.daysRemaining, language)

  return `${countdownLabel}.`
}

const getRegistrationPaymentSortValue = (member: MemberType) => {
  if (member.memberStatus !== memberStatus.Pending) return undefined

  return getRegistrationPaymentCountdown(member.createdAt).daysRemaining
}

const ignoredSharedNameWords = new Set([
  'DE',
  'DES',
  'DU',
  'EP',
  'EPOUSE',
  'EPOUSES',
  'EPOUX',
  'EPSE',
  'EPX',
  'LA',
  'LE',
  'LES',
  'NE',
  'NEE',
  'VEUF',
  'VEUVE',
  'VVE'
])

const getNameWords = (name: string) =>
  Array.from(
    new Set(
      name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .match(/[A-Z0-9]+/g) ?? []
    )
  ).filter(word => word.length >= 2 && !ignoredSharedNameWords.has(word))

const sortMembersByName = (left: MemberType, right: MemberType) => {
  const leftName = `${left.lastAndMiddleNames} ${left.firstName}`
  const rightName = `${right.lastAndMiddleNames} ${right.firstName}`

  return leftName.localeCompare(rightName) || left.associationCode.localeCompare(right.associationCode)
}

const getSharedNameWordCombination = (leftNameWord: string, rightNameWord: string): [string, string] =>
  leftNameWord.localeCompare(rightNameWord) <= 0 ? [leftNameWord, rightNameWord] : [rightNameWord, leftNameWord]

const getSharedNameWordGroupKey = (leftNameWord: string, rightNameWord: string) =>
  getSharedNameWordCombination(leftNameWord, rightNameWord).join(':')

const getSharedNameWordGroupKeyForGroup = ({
  firstSharedNameWord,
  secondSharedNameWord
}: {
  firstSharedNameWord: string
  secondSharedNameWord: string
}) => getSharedNameWordGroupKey(firstSharedNameWord, secondSharedNameWord)

const getSharedNameWordRowDismissalKey = (
  group: {
    firstSharedNameWord: string
    secondSharedNameWord: string
  },
  memberId: string
) => `${getSharedNameWordGroupKeyForGroup(group)}:${memberId}`

const getSharedLastAndMiddleNameGroups = (members: MemberType[]) => {
  const groupsByWordPair = new Map<
    string,
    {
      firstSharedNameWord: string
      members: MemberType[]
      secondSharedNameWord: string
    }
  >()

  members.forEach(member => {
    const firstNameWords = getNameWords(member.firstName)
    const lastAndMiddleNameWords = getNameWords(member.lastAndMiddleNames)

    lastAndMiddleNameWords.forEach(lastAndMiddleNameWord => {
      firstNameWords.forEach(firstNameWord => {
        const groupKey = getSharedNameWordGroupKey(lastAndMiddleNameWord, firstNameWord)

        const [firstSharedNameWord, secondSharedNameWord] = getSharedNameWordCombination(
          lastAndMiddleNameWord,
          firstNameWord
        )

        const group = groupsByWordPair.get(groupKey) ?? {
          firstSharedNameWord,
          members: [],
          secondSharedNameWord
        }

        if (!group.members.some(groupMember => groupMember.id === member.id)) {
          group.members.push(member)
        }

        groupsByWordPair.set(groupKey, group)
      })
    })
  })

  return Array.from(groupsByWordPair.values())
    .filter(group => group.members.length > 1)
    .map(group => ({
      ...group,
      members: [...group.members].sort(sortMembersByName)
    }))
    .sort(
      (left, right) =>
        right.members.length - left.members.length ||
        left.firstSharedNameWord.localeCompare(right.firstSharedNameWord) ||
        left.secondSharedNameWord.localeCompare(right.secondSharedNameWord)
    )
}

const getSharedNameWordGroupId = (firstSharedNameWord: string, secondSharedNameWord: string) =>
  `shared-name-words-${firstSharedNameWord.toLowerCase()}-${secondSharedNameWord.toLowerCase()}`

const getDateOfBirthSortValue = (dateOfBirth: string) => {
  const match = dateOfBirth.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)

  if (!match) return Number.NEGATIVE_INFINITY

  return Date.UTC(Number(match[3]), Number(match[1]) - 1, Number(match[2]))
}

const getSharedLastNameSortValue = (
  member: MemberType,
  key: SharedLastNameSortKey,
  copy: AdminMemberTableCopy,
  language: AppLanguage
) => {
  if (key === 'dateOfBirth') return getDateOfBirthSortValue(member.dateOfBirth)

  if (key === 'memberMatriculationNumber') {
    return getVisibleMatriculationNumber(member.memberStatus, member.memberMatriculationNumber, copy.pendingMatriculation)
  }

  if (key === 'memberStatus') {
    return member.memberStatus ? formatMemberStatus(member.memberStatus, language) : ''
  }

  return member[key] ?? ''
}

const compareSharedLastNameMembers = (
  left: MemberType,
  right: MemberType,
  sort: SharedLastNameSortState,
  copy: AdminMemberTableCopy,
  language: AppLanguage
) => {
  const leftValue = getSharedLastNameSortValue(left, sort.key, copy, language)
  const rightValue = getSharedLastNameSortValue(right, sort.key, copy, language)
  const direction = sort.direction === 'asc' ? 1 : -1

  if (typeof leftValue === 'number' && typeof rightValue === 'number') {
    return (leftValue - rightValue) * direction || sortMembersByName(left, right)
  }

  return String(leftValue).localeCompare(String(rightValue)) * direction || sortMembersByName(left, right)
}

const RegistrationPaymentWarningCell = ({ language, member }: { language: AppLanguage; member: MemberType }) => {
  const warning = getRegistrationPaymentWarning(member, language)

  if (member.memberStatus !== memberStatus.Pending) {
    return null
  }

  return (
    <Badge
      variant='outline'
      className='border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/40 dark:bg-destructive/15 w-full max-w-full justify-start truncate rounded-sm text-left'
    >
      <AlertTriangle aria-hidden='true' />
      {warning}
    </Badge>
  )
}

const getColumns = (copy: AdminMemberTableCopy, language: AppLanguage): ColumnDef<MemberType>[] => [
  {
    id: 'select',
    header: ({ table }) => {
      const selectablePageRows = table.getRowModel().rows.filter(row => row.getCanSelect())
      const selectedPageRows = selectablePageRows.filter(row => row.getIsSelected())

      const checked =
        selectablePageRows.length > 0 && selectedPageRows.length === selectablePageRows.length
          ? true
          : selectedPageRows.length > 0
            ? 'indeterminate'
            : false

      return (
        <div className='flex items-center justify-center'>
          <Checkbox
            aria-label={copy.selection.page}
            checked={checked}
            disabled={selectablePageRows.length === 0}
            onCheckedChange={value => {
              selectablePageRows.forEach(row => row.toggleSelected(Boolean(value)))
            }}
          />
        </div>
      )
    },
    cell: ({ row }) => {
      const memberName = [row.original.firstName, row.original.lastAndMiddleNames].filter(Boolean).join(' ')
      const labelName = memberName || row.original.memberMatriculationNumber

      return (
        <div className='flex items-center justify-center'>
          <Checkbox
            aria-label={copy.selection.member(labelName)}
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={value => row.toggleSelected(Boolean(value))}
          />
        </div>
      )
    },
    enableHiding: false,
    enableSorting: false,
    meta: {
      label: copy.columns.select
    },
    size: 42
  },
  {
    header: copy.columns.code,
    accessorKey: 'associationCode',
    cell: ({ row }) => (
      <div className='flex min-w-0 items-center gap-2'>
        <div className='flex min-w-0 flex-col'>
          <span className='truncate font-medium'>{row.getValue('associationCode')}</span>
        </div>
      </div>
    ),
    meta: {
      filterVariant: 'select',
      label: copy.columns.associationCode
    },
    size: 56
  },
  {
    header: copy.columns.matriculationShort,
    accessorKey: 'memberMatriculationNumber',
    cell: ({ row }) => {
      const status = row.getValue('memberStatus')
      const matriculationNumber = row.getValue('memberMatriculationNumber')

      return (
        <div className='flex min-w-0 items-center gap-2'>
          <div className='flex min-w-0 flex-col'>
            <span className='truncate font-medium'>
              {getVisibleMatriculationNumber(status, matriculationNumber, copy.pendingMatriculation)}
            </span>
          </div>
        </div>
      )
    },
    meta: {
      label: copy.columns.matriculation
    },
    size: 120
  },
  {
    header: copy.columns.lastAndMiddleShort,
    accessorKey: 'lastAndMiddleNames',
    cell: ({ row }) => (
      <div className='flex min-w-0 items-center gap-2'>
        <div className='flex min-w-0 flex-col'>
          <span className='truncate font-medium'>{row.getValue('lastAndMiddleNames')}</span>
        </div>
      </div>
    ),
    meta: {
      label: copy.columns.lastAndMiddleNames
    },
    size: 220
  },

  // {
  //   header: 'Middle Names',
  //   accessorKey: 'middleName',
  //   cell: ({ row }) => (
  //     <div className='flex items-center gap-2'>
  //       <div className='flex flex-col'>
  //         <span className='font-medium'>{row.getValue('middleName')}</span>
  //       </div>
  //     </div>
  //   ),
  //   size: 100
  // },
  {
    header: copy.columns.firstShort,
    accessorKey: 'firstName',
    cell: ({ row }) => (
      <div className='flex min-w-0 items-center gap-2'>
        <div className='flex min-w-0 flex-col'>
          <span className='truncate font-medium'>{row.getValue('firstName')}</span>
        </div>
      </div>
    ),
    meta: {
      label: copy.columns.firstName
    },
    size: 140
  },
  {
    id: 'name',
    header: copy.columns.name,
    accessorFn: row => `${row.lastAndMiddleNames} ${row.firstName}`,
    filterFn: filterName
  },

  {
    accessorKey: 'createdAt', // The key in your data object
    header: copy.columns.longevityShort,
    cell: ({ row }) => {
      const field = row.getValue('createdAt') as Date
      const status = row.getValue('memberStatus')

      return <div>{getVisibleLongevity(field, status, language)}</div>
    },
    meta: {
      label: copy.columns.longevity
    },
    size: 80
  },
  {
    header: copy.columns.recommendationShort,
    accessorKey: 'delegateRecommendation',
    cell: ({ row }) => {
      const recommendation = row.getValue('delegateRecommendation') as string

      const styles = {
        // transfer: 'text-blue-500 bg-transparent ',
        // confirm: ' text-muted-foreground bg-transparent',
        confirm:
          'bg-green-600/10 text-zinc-600 focus-visible:ring-zinc-600/20 dark:bg-zinc-400/10 dark:text-zinc-400 dark:focus-visible:ring-zinc-400/40 [a&]:hover:bg-zinc-600/5 dark:[a&]:hover:bg-zinc-400/5',
        transfer_From_SAGICAM:
          'bg-orange-600/10 text-orange-600 focus-visible:ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5',
        transfer_From_SAGINIGERIA:
          'bg-orange-600/10 text-orange-600 focus-visible:ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5',
        transfer_From_SAGIEUROPE:
          'bg-orange-600/10 text-orange-600 focus-visible:ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5',
        transfer_From_SAGIGHANA:
          'bg-orange-600/10 text-orange-600 focus-visible:ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5',
        transfer_From_SAGICOTEDIVOIRE:
          'bg-orange-600/10 text-orange-600 focus-visible:ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5',
        transfer_Out:
          'bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5',
        transfer_In:
          'bg-purple-600/10 text-purple-600 focus-visible:ring-purple-600/20 dark:bg-purple-400/10 dark:text-purple-400 dark:focus-visible:ring-purple-400/40 [a&]:hover:bg-purple-600/5 dark:[a&]:hover:bg-purple-400/5'
      }[recommendation]

      return (
        <Badge
          className={cn(
            'w-full max-w-full justify-start truncate rounded-sm border text-left capitalize focus-visible:outline-none',
            styles
          )}
        >
          {row.getValue('delegateRecommendation')}
        </Badge>
      )
    },
    meta: {
      filterVariant: 'select',
      label: copy.columns.recommendation
    },
    size: 86
  },

  {
    header: copy.columns.status,
    accessorKey: 'memberStatus',
    cell: ({ row }) => {
      const status = row.getValue('memberStatus') as string

      const styles = {
        vested:
          'bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5',
        pending:
          'bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5',
        not_in_good_standing:
          'bg-red-600/10 text-red-600 focus-visible:ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5',
        awaiting_publication:
          'bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5'
      }[status]

      return (
        <Badge
          className={cn(
            'w-full max-w-full justify-start truncate rounded-sm border-none capitalize focus-visible:outline-none',
            styles
          )}
        >
          {formatMemberStatus(status, language)}
        </Badge>
      )
    },
    meta: {
      filterVariant: 'select',
      label: copy.columns.status
    },
    size: 88
  },
  {
    id: 'registrationPaymentWarning',
    header: copy.columns.registrationDuesShort,
    accessorFn: row => getRegistrationPaymentSortValue(row),
    cell: ({ row }) => <RegistrationPaymentWarningCell language={language} member={row.original} />,
    sortUndefined: 'last',
    meta: {
      label: copy.columns.registrationDues
    },
    size: 150
  },
  {
    header: copy.columns.actionsShort,
    accessorKey: 'id',
    cell: ({ row: { original } }) => {
      // Destructuring 'id' directly from the row data
      const { id } = original

      return <RowActions copy={copy.actions} memberId={id} />
    },
    meta: {
      label: copy.columns.actions
    },
    size: 56
  }
]

const getColumnLabel = (column: Column<MemberType, unknown>) => {
  const metaLabel = column.columnDef.meta?.label

  if (typeof metaLabel === 'string' && metaLabel.trim()) return metaLabel

  return typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id
}

const getMemberTableCellLabel = (cell: Cell<MemberType, unknown>) => getColumnLabel(cell.column)

const getMemberTableCellTitle = (cell: Cell<MemberType, unknown>, language: AppLanguage) => {
  if (cell.column.id === 'registrationPaymentWarning') {
    return cell.row.original.memberStatus === memberStatus.Pending
      ? getRegistrationPaymentWarning(cell.row.original, language)
      : undefined
  }

  if (cell.column.id === 'memberStatus') {
    const status = cell.getValue()

    return typeof status === 'string' ? formatMemberStatus(status, language) : undefined
  }

  return getTableCellTitle(cell)
}

const MembersDataTable = ({ data, language = 'en' }: { data: MemberType[]; language?: AppLanguage }) => {
  const copy = adminMemberTableCopy[language]
  const [columnFilters, setColumnFilters] = usePersistentColumnFilters('sagi:admin-all-members:columnFilters')

  const [dismissedSharedNameRowKeys, setDismissedSharedNameRowKeys] = usePersistentState<string[]>(
    dismissedSharedNameRowStorageKey,
    []
  )

  const [printSelectedOnly, setPrintSelectedOnly] = useState(false)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const clearRowSelection = useCallback(() => setRowSelection({}), [])

  const [makeAwaitingVestedState, makeAwaitingVestedFormAction] = useActionState(makeAwaitingMembersVestedAction, {
    message: ''
  })

  const [moveToAwaitingState, moveToAwaitingFormAction] = useActionState(
    movePendingMembersToAwaitingPublicationAction,
    {
      message: ''
    }
  )

  const [makeDelinquentState, makeDelinquentFormAction] = useActionState(makeMembersDelinquentAction, {
    message: ''
  })

  const [makeVestedAwaitingState, makeVestedAwaitingFormAction] = useActionState(makeVestedMembersAwaitingAction, {
    message: ''
  })

  const [makeVestedState, makeVestedFormAction] = useActionState(makeMembersVestedAction, {
    message: ''
  })

  const pageSize = 200

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize
  })

  useEffect(() => {
    setColumnFilters(currentFilters => mergeNameColumnFilters(currentFilters))
  }, [columnFilters, setColumnFilters])

  const tableColumns = useMemo(() => getColumns(copy, language), [copy, language])

  const table = useReactTable({
    data,
    columns: tableColumns,
    initialState: {
      columnVisibility: {
        name: false
      }
    },
    state: {
      columnFilters,
      pagination,
      rowSelection
    },
    onColumnFiltersChange: setColumnFilters,
    enableRowSelection: row =>
      row.original.memberStatus === memberStatus.Pending ||
      row.original.memberStatus === memberStatus.Awaiting ||
      row.original.memberStatus === memberStatus.Vested ||
      row.original.memberStatus === memberStatus.Delinquent,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableSortingRemoval: false,
    getRowId: row => row.id,
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination
  })

  useEffect(() => {
    if (!moveToAwaitingState.message) return

    toast(moveToAwaitingState.message)
    clearRowSelection()
  }, [clearRowSelection, moveToAwaitingState.message])

  useEffect(() => {
    if (!makeDelinquentState.message) return

    toast(makeDelinquentState.message)
    clearRowSelection()
  }, [clearRowSelection, makeDelinquentState.message])

  useEffect(() => {
    if (!makeVestedAwaitingState.message) return

    toast(makeVestedAwaitingState.message)
    clearRowSelection()
  }, [clearRowSelection, makeVestedAwaitingState.message])

  useEffect(() => {
    if (!makeVestedState.message) return

    toast(makeVestedState.message)
    clearRowSelection()
  }, [clearRowSelection, makeVestedState.message])

  useEffect(() => {
    if (!makeAwaitingVestedState.message) return

    toast(makeAwaitingVestedState.message)
    clearRowSelection()
  }, [clearRowSelection, makeAwaitingVestedState.message])

  const selectedMembers = table.getSelectedRowModel().rows.map(row => row.original)
  const selectedPendingMembers = selectedMembers.filter(member => member.memberStatus === memberStatus.Pending)

  const selectedPendingCount = selectedPendingMembers.length
  const overdueRegistrationCutoffTime = getOverdueRegistrationPaymentCreatedAtCutoff().getTime()

  const selectedOverduePendingMembers = selectedPendingMembers.filter(member => {
    const createdAt = new Date(member.createdAt).getTime()

    return Number.isFinite(createdAt) && createdAt < overdueRegistrationCutoffTime
  })

  const selectedOverduePendingMemberIds = selectedOverduePendingMembers.map(member => member.id)
  const selectedOverduePendingCount = selectedOverduePendingMembers.length
  const selectedAwaitingMembers = selectedMembers.filter(member => member.memberStatus === memberStatus.Awaiting)

  const selectedAwaitingCount = selectedAwaitingMembers.length

  const selectedVestedMembers = selectedMembers.filter(member => member.memberStatus === memberStatus.Vested)

  const selectedVestedCount = selectedVestedMembers.length
  const selectedDelinquentMembers = selectedMembers.filter(member => member.memberStatus === memberStatus.Delinquent)

  const selectedDelinquentCount = selectedDelinquentMembers.length

  const hasMatriculationColumn = Boolean(table.getColumn('memberMatriculationNumber'))

  const getResponsiveColumnClassName = (columnId: string) =>
    cn(
      hasMatriculationColumn && columnId === 'associationCode' && 'md:hidden lg:table-cell',
      hasMatriculationColumn && columnId === 'memberMatriculationNumber' && 'md:pl-4 lg:pl-2'
    )

  const summaryTotals = table.getCoreRowModel().rows.reduce(
    (acc, row) => {
      const status = row.getValue('memberStatus')

      if (status === memberStatus.Vested) acc.vested += 1
      if (status === memberStatus.Pending) acc.pending += 1
      if (status === memberStatus.Awaiting) acc.awaiting += 1
      if (status === memberStatus.Delinquent) acc.delinquent += 1

      acc.total += 1

      return acc
    },
    {
      vested: 0,
      pending: 0,
      awaiting: 0,
      delinquent: 0,
      total: 0
    }
  )

  const summaryCards = [
    {
      label: copy.summary.vested,
      value: summaryTotals.vested,
      icon: ShieldCheck,
      colorClassName: 'text-green-600 dark:text-green-400',
      cardClassName: 'border-green-500/20 bg-green-500/10'
    },
    {
      label: copy.summary.awaiting,
      value: summaryTotals.awaiting,
      icon: Clock,
      colorClassName: 'text-blue-600 dark:text-blue-400',
      cardClassName: 'border-blue-500/20 bg-blue-500/10'
    },
    {
      label: copy.summary.pending,
      value: summaryTotals.pending,
      icon: Hourglass,
      colorClassName: 'text-amber-600 dark:text-amber-400',
      cardClassName: 'border-amber-500/20 bg-amber-500/10'
    },
    {
      label: copy.summary.delinquent,
      value: summaryTotals.delinquent,
      icon: AlertTriangle,
      colorClassName: 'text-destructive',
      cardClassName: 'border-destructive/20 bg-destructive/10'
    },
    {
      label: copy.summary.total,
      value: summaryTotals.total,
      icon: Users,
      colorClassName: 'text-foreground',
      cardClassName: 'border-foreground/10 bg-muted/70'
    }
  ]

  const allSharedLastAndMiddleNameGroups = useMemo(() => getSharedLastAndMiddleNameGroups(data), [data])
  const dismissedSharedNameRowKeySet = useMemo(() => new Set(dismissedSharedNameRowKeys), [dismissedSharedNameRowKeys])

  const sharedLastAndMiddleNameGroups = useMemo(
    () =>
      allSharedLastAndMiddleNameGroups
        .map(group => ({
          ...group,
          members: group.members.filter(
            member => !dismissedSharedNameRowKeySet.has(getSharedNameWordRowDismissalKey(group, member.id))
          )
        }))
        .filter(group => group.members.length > 1),
    [allSharedLastAndMiddleNameGroups, dismissedSharedNameRowKeySet]
  )

  const dismissedSharedNameRowCount = useMemo(
    () =>
      allSharedLastAndMiddleNameGroups.reduce(
        (count, group) =>
          count +
          group.members.filter(member =>
            dismissedSharedNameRowKeySet.has(getSharedNameWordRowDismissalKey(group, member.id))
          ).length,
        0
      ),
    [allSharedLastAndMiddleNameGroups, dismissedSharedNameRowKeySet]
  )

  const sharedLastNameWordMemberCount = useMemo(
    () => new Set(sharedLastAndMiddleNameGroups.flatMap(group => group.members.map(member => member.id))).size,
    [sharedLastAndMiddleNameGroups]
  )

  const dismissSharedNameRow = useCallback(
    (rowKey: string) => {
      setDismissedSharedNameRowKeys(currentKeys =>
        currentKeys.includes(rowKey) ? currentKeys : [...currentKeys, rowKey]
      )
    },
    [setDismissedSharedNameRowKeys]
  )

  const resetDismissedSharedNameRows = useCallback(() => {
    setDismissedSharedNameRowKeys([])
  }, [setDismissedSharedNameRowKeys])

  const exportToCSV = () => {
    const selectedRows = table.getSelectedRowModel().rows

    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map(row => row.original)
        : table.getFilteredRowModel().rows.map(row => row.original)

    const csv = Papa.unparse(dataToExport, {
      header: true
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `all-members-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = () => {
    const selectedRows = table.getSelectedRowModel().rows

    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map(row => row.original)
        : table.getFilteredRowModel().rows.map(row => row.original)

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments')

    const cols = [{ wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 15 }]

    worksheet['!cols'] = cols

    XLSX.writeFile(workbook, `all-members-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const getVisibleColumnExportRows = (rows: Row<MemberType>[]) =>
    rows.map(row => {
      const createdAt = row.getValue('createdAt') as Date

      return {
        [copy.columns.code]: row.getValue('associationCode'),
        [copy.columns.matriculation]: getVisibleMatriculationNumber(
          row.getValue('memberStatus'),
          row.getValue('memberMatriculationNumber'),
          copy.pendingMatriculation
        ),
        [copy.columns.lastAndMiddleNames]: row.getValue('lastAndMiddleNames'),
        [copy.columns.firstName]: row.getValue('firstName'),
        [copy.columns.longevity]: getVisibleLongevity(createdAt, row.getValue('memberStatus'), language),
        [copy.columns.recommendation]: row.getValue('delegateRecommendation'),
        [copy.columns.status]: formatMemberStatus(row.getValue('memberStatus') as string, language),
        [copy.columns.registrationDues]: getRegistrationPaymentWarning(row.original, language)
      }
    })

  const writeVisibleColumnsToExcel = (rows: Row<MemberType>[], fileNamePrefix: string, sheetName: string) => {
    const dataToExport = getVisibleColumnExportRows(rows)
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    const cols = [
      { wch: 12 },
      { wch: 18 },
      { wch: 28 },
      { wch: 18 },
      { wch: 32 },
      { wch: 28 },
      { wch: 22 },
      { wch: 68 }
    ]

    worksheet['!cols'] = cols

    XLSX.writeFile(workbook, `${fileNamePrefix}-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportVisibleColumnsToExcel = () => {
    writeVisibleColumnsToExcel(table.getFilteredRowModel().rows, 'all-members-visible-columns', 'All Members')
  }

  const exportSelectedVisibleColumnsToExcel = () => {
    const selectedRows = table.getSelectedRowModel().rows

    if (selectedRows.length === 0) return

    writeVisibleColumnsToExcel(selectedRows, 'selected-members-visible-columns', 'Selected Members')
  }

  const printSelectedRowsToPdf = () => {
    if (selectedMembers.length === 0) return

    const stopPrintingSelection = () => setPrintSelectedOnly(false)

    window.addEventListener('afterprint', stopPrintingSelection, { once: true })
    flushSync(() => setPrintSelectedOnly(true))
    window.print()
  }

  const exportToJSON = () => {
    const selectedRows = table.getSelectedRowModel().rows

    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map(row => row.original)
        : table.getFilteredRowModel().rows.map(row => row.original)

    const json = JSON.stringify(dataToExport, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `all-members-${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 2
  })

  return (
    <div className='border-primary w-full min-w-0 overflow-hidden rounded-lg border'>
      <div className='border-b'>
        <div className='flex flex-col gap-4 border-b p-4 sm:p-6'>
          <span className='text-xl leading-tight font-semibold sm:text-3xl lg:text-5xl'>{copy.title}</span>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
            {summaryCards.map(status => {
              const Icon = status.icon

              return (
                <Card key={status.label} className={`gap-1 py-2 sm:py-3 ${status.cardClassName}`}>
                  <CardHeader className='px-3 pb-0 sm:px-4'>
                    <CardTitle
                      className={`flex w-full items-center justify-between gap-2 text-xs font-medium sm:text-sm ${status.colorClassName}`}
                    >
                      <span>{status.label}</span>
                      <Icon className='size-4 shrink-0' aria-hidden='true' />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='px-3 sm:px-4'>
                    <p className={`text-2xl leading-none font-extrabold lg:text-3xl ${status.colorClassName}`}>
                      {formatNumber(status.value)}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <div className='flex flex-col gap-3 py-2 sm:px-6 sm:py-4'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-primary text-sm font-extrabold sm:whitespace-nowrap' aria-live='polite'>
                <span>{copy.found(formatNumber(table.getRowCount()))}</span>
              </p>

              <Pagination className='mx-0 justify-start sm:w-auto sm:justify-end'>
                <PaginationContent className='flex-wrap justify-start sm:justify-end'>
                  <PaginationItem>
                    <Button
                      className='disabled:pointer-events-none disabled:opacity-50'
                      variant={'ghost'}
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      aria-label={copy.pagination.previousAria}
                    >
                      <ChevronLeftIcon aria-hidden='true' className='text-primary' />
                      <span className='text-primary max-sm:hidden'>{copy.pagination.previous}</span>
                    </Button>
                  </PaginationItem>

                  {showLeftEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {pages.map(page => {
                    const isActive = page === table.getState().pagination.pageIndex + 1

                    return (
                      <PaginationItem key={page}>
                        <Button
                          size='icon'
                          className={`${!isActive && 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-red-300/40'}`}
                          onClick={() => table.setPageIndex(page - 1)}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          {page}
                        </Button>
                      </PaginationItem>
                    )
                  })}

                  {showRightEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <Button
                      className='disabled:pointer-events-none disabled:opacity-50'
                      variant={'ghost'}
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      aria-label={copy.pagination.nextAria}
                    >
                      <span className='text-primary max-sm:hidden'>{copy.pagination.next}</span>
                      <ChevronRightIcon aria-hidden='true' className='text-primary' />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>

            <div className='grid w-full grid-cols-1 items-stretch gap-2 sm:grid-cols-2 xl:grid-cols-6 [&_button]:h-10 [&_button]:min-h-10 [&_button]:min-w-0 [&_button]:overflow-hidden [&_button]:whitespace-nowrap [&_button]:w-full'>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className={cn(
                      adminActionButtonClassName,
                      'bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-blue-700/30'
                    )}
                    disabled={selectedPendingCount === 0}
                  >
                    <UserCheck />
                    <span className={adminActionButtonLabelClassName}>
                      {copy.bulkAwaiting.button(selectedPendingCount)}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{copy.bulkAwaiting.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {copy.bulkAwaiting.description(selectedPendingCount)}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <form action={moveToAwaitingFormAction}>
                    {selectedPendingMembers.map(member => (
                      <input key={member.id} type='hidden' name='memberIds' value={member.id} />
                    ))}
                    <AlertDialogFooter>
                      <AlertDialogCancel type='button'>{copy.bulkAwaiting.cancel}</AlertDialogCancel>
                      <BulkAwaitingSubmitButton copy={copy.bulkAwaiting} disabled={selectedPendingCount === 0} />
                    </AlertDialogFooter>
                  </form>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className={cn(
                      adminActionButtonClassName,
                      'bg-sky-700 text-white hover:bg-sky-800 focus-visible:ring-sky-700/30'
                    )}
                    disabled={selectedVestedCount === 0}
                  >
                    <Clock />
                    <span className={adminActionButtonLabelClassName}>
                      {copy.bulkVestedAwaiting.button(selectedVestedCount)}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{copy.bulkVestedAwaiting.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {copy.bulkVestedAwaiting.description(selectedVestedCount)}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <form action={makeVestedAwaitingFormAction}>
                    {selectedVestedMembers.map(member => (
                      <input key={member.id} type='hidden' name='memberIds' value={member.id} />
                    ))}
                    <AlertDialogFooter>
                      <AlertDialogCancel type='button'>{copy.bulkVestedAwaiting.cancel}</AlertDialogCancel>
                      <BulkVestedAwaitingSubmitButton
                        copy={copy.bulkVestedAwaiting}
                        disabled={selectedVestedCount === 0}
                      />
                    </AlertDialogFooter>
                  </form>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className={cn(
                      adminActionButtonClassName,
                      'bg-green-700 text-white hover:bg-green-800 focus-visible:ring-green-700/30'
                    )}
                    disabled={selectedDelinquentCount === 0}
                  >
                    <ShieldCheck />
                    <span className={adminActionButtonLabelClassName}>
                      {copy.bulkVested.button(selectedDelinquentCount)}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{copy.bulkVested.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {copy.bulkVested.description(selectedDelinquentCount)}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <form action={makeVestedFormAction}>
                    {selectedDelinquentMembers.map(member => (
                      <input key={member.id} type='hidden' name='memberIds' value={member.id} />
                    ))}
                    <AlertDialogFooter>
                      <AlertDialogCancel type='button'>{copy.bulkVested.cancel}</AlertDialogCancel>
                      <BulkVestedSubmitButton copy={copy.bulkVested} disabled={selectedDelinquentCount === 0} />
                    </AlertDialogFooter>
                  </form>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className={cn(
                      adminActionButtonClassName,
                      'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-700/30'
                    )}
                    disabled={selectedVestedCount === 0}
                  >
                    <AlertTriangle />
                    <span className={adminActionButtonLabelClassName}>
                      {copy.bulkDelinquent.button(selectedVestedCount)}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{copy.bulkDelinquent.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {copy.bulkDelinquent.description(selectedVestedCount)}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <form action={makeDelinquentFormAction}>
                    {selectedVestedMembers.map(member => (
                      <input key={member.id} type='hidden' name='memberIds' value={member.id} />
                    ))}
                    <AlertDialogFooter>
                      <AlertDialogCancel type='button'>{copy.bulkDelinquent.cancel}</AlertDialogCancel>
                      <BulkDelinquentSubmitButton copy={copy.bulkDelinquent} disabled={selectedVestedCount === 0} />
                    </AlertDialogFooter>
                  </form>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className={cn(
                      adminActionButtonClassName,
                      'bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700/30'
                    )}
                    disabled={selectedAwaitingCount === 0}
                  >
                    <ShieldCheck />
                    <span className={adminActionButtonLabelClassName}>
                      {copy.autoVest.button(selectedAwaitingCount)}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{copy.autoVest.title}</AlertDialogTitle>
                    <AlertDialogDescription>{copy.autoVest.description(selectedAwaitingCount)}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <form action={makeAwaitingVestedFormAction}>
                    {selectedAwaitingMembers.map(member => (
                      <input key={member.id} type='hidden' name='memberIds' value={member.id} />
                    ))}
                    <AlertDialogFooter>
                      <AlertDialogCancel type='button'>{copy.autoVest.cancel}</AlertDialogCancel>
                      <BulkAwaitingVestedSubmitButton copy={copy.autoVest} disabled={selectedAwaitingCount === 0} />
                    </AlertDialogFooter>
                  </form>
                </AlertDialogContent>
              </AlertDialog>
              <RemoveOverduePendingMembersButton
                language={language}
                memberIds={selectedOverduePendingMemberIds}
                onRemoved={clearRowSelection}
                overdueCount={selectedOverduePendingCount}
              />
            </div>

            <div className='grid w-full grid-cols-1 items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-6 xl:flex xl:justify-end [&_button]:h-10 [&_button]:min-h-10 [&_button]:min-w-0 [&_button]:overflow-hidden [&_button]:whitespace-nowrap [&_button]:w-full xl:[&_button]:w-auto'>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    type='button'
                    disabled={allSharedLastAndMiddleNameGroups.length === 0}
                    className={cn(
                      adminActionButtonClassName,
                      'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'
                    )}
                  >
                    <SearchIcon />
                    <span className={adminActionButtonLabelClassName}>
                      {copy.sharedLastNameWords.button(sharedLastAndMiddleNameGroups.length)}
                    </span>
                  </Button>
                </SheetTrigger>
                <SharedLastNameWordsPanel
                  copy={copy}
                  dismissedRowCount={dismissedSharedNameRowCount}
                  groups={sharedLastAndMiddleNameGroups}
                  language={language}
                  memberCount={sharedLastNameWordMemberCount}
                  onDismissRow={dismissSharedNameRow}
                  onResetDismissedRows={resetDismissedSharedNameRows}
                />
              </Sheet>
              <PrintButton
                label={copy.export.printPdf}
                className={cn(
                  adminActionButtonClassName,
                  'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'
                )}
              />
              <PrintButton
                label={copy.export.printSelection(selectedMembers.length)}
                onClick={event => {
                  event.preventDefault()
                  printSelectedRowsToPdf()
                }}
                disabled={selectedMembers.length === 0}
                className={cn(
                  adminActionButtonClassName,
                  'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'
                )}
              />
              <Button
                type='button'
                onClick={exportSelectedVisibleColumnsToExcel}
                disabled={selectedMembers.length === 0}
                className={cn(
                  adminActionButtonClassName,
                  'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'
                )}
              >
                <FileSpreadsheetIcon />
                <span className={adminActionButtonLabelClassName}>{copy.export.selection(selectedMembers.length)}</span>
              </Button>
              <Button
                type='button'
                onClick={exportVisibleColumnsToExcel}
                disabled={table.getFilteredRowModel().rows.length === 0}
                className={cn(
                  adminActionButtonClassName,
                  'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'
                )}
              >
                <FileSpreadsheetIcon />
                <span className={adminActionButtonLabelClassName}>{copy.export.page}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className={cn(
                      adminActionButtonClassName,
                      'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'
                    )}
                  >
                    <UploadIcon />
                    <span className={adminActionButtonLabelClassName}>{copy.export.all}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileTextIcon className='mr-2 size-4' />
                    {copy.export.asCsv}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToExcel}>
                    <FileSpreadsheetIcon className='mr-2 size-4' />
                    {copy.export.asExcel}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportToJSON}>
                    <FileTextIcon className='mr-2 size-4' />
                    {copy.export.asJson}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {moveToAwaitingState.message ? (
            <p className='text-primary text-sm font-semibold' aria-live='polite'>
              {moveToAwaitingState.message}
            </p>
          ) : null}
          {makeDelinquentState.message ? (
            <p className='text-primary text-sm font-semibold' aria-live='polite'>
              {makeDelinquentState.message}
            </p>
          ) : null}
          {makeVestedState.message ? (
            <p className='text-primary text-sm font-semibold' aria-live='polite'>
              {makeVestedState.message}
            </p>
          ) : null}
          {makeAwaitingVestedState.message ? (
            <p className='text-primary text-sm font-semibold' aria-live='polite'>
              {makeAwaitingVestedState.message}
            </p>
          ) : null}
          <div className='grid grid-cols-1 gap-6 max-md:*:last:col-span-full sm:grid-cols-2 md:grid-cols-3'>
            {/* <Filter column={table.getColumn('dateOfBirth')!} /> */}
          </div>
        </div>
        <div className='flex items-start gap-4 p-4 max-sm:flex-col sm:items-center sm:justify-between sm:p-6'>
          <div className='grid w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:items-center'>
            <Filter column={table.getColumn('associationCode')!} copy={copy} language={language} />
            <Filter column={table.getColumn('name')!} copy={copy} language={language} />

            <Filter column={table.getColumn('delegateRecommendation')!} copy={copy} language={language} />
            <Filter column={table.getColumn('memberStatus')!} copy={copy} language={language} />
          </div>
          <div className='flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='#rowSelect' className=''>
                {copy.filters.show}
              </Label>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={value => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger id='rowSelect' className='w-full whitespace-nowrap sm:w-fit'>
                  <SelectValue placeholder={copy.filters.resultsPlaceholder} />
                </SelectTrigger>
                <SelectContent className='[&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto'>
                  {[5, 10, 25, 50, 100, 200].map(pageSize => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Table mobileCards className='table-fixed text-xs sm:min-w-0 lg:text-sm'>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className='bg-primary hover:bg-primary/80 h-14 border-t'>
                {headerGroup.headers.map(header => {
                  const headerTitle = getColumnLabel(header.column)

                  const headerText =
                    typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : undefined

                  const headerContent = flexRender(header.column.columnDef.header, header.getContext())

                  return (
                    <TableHead
                      key={header.id}
                      title={headerTitle}
                      showTitleTooltip={Boolean(headerText && headerText !== headerTitle)}
                      style={{ width: `${header.getSize()}px` }}
                      className={cn(
                        'overflow-hidden px-1.5 leading-tight font-extrabold whitespace-normal text-white first:pl-3 last:px-3',
                        getResponsiveColumnClassName(header.column.id)
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              'inline-flex h-full max-w-full min-w-0 cursor-pointer items-center gap-1 select-none'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={e => {
                            if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault()
                              header.column.getToggleSortingHandler()?.(e)
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {headerText ? <span className='min-w-0 truncate'>{headerContent}</span> : headerContent}
                          {{
                            asc: <ChevronUpIcon className='shrink-0 opacity-60' size={16} aria-hidden='true' />,
                            desc: <ChevronDownIcon className='shrink-0 opacity-60' size={16} aria-hidden='true' />
                          }[header.column.getIsSorted() as string] ?? (
                            <ArrowUpDown className='shrink-0 opacity-60' size={16} aria-hidden='true' />
                          )}
                        </div>
                      ) : headerText ? (
                        <span className='block min-w-0 truncate'>{headerContent}</span>
                      ) : (
                        headerContent
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn('hover:bg-primary/30', printSelectedOnly && !row.getIsSelected() && 'print:hidden')}
                >
                  {row.getVisibleCells().map(cell => {
                    const cellLabel = getMemberTableCellLabel(cell)

                    return (
                      <TableCell
                        key={cell.id}
                        data-label={cellLabel}
                        title={getMemberTableCellTitle(cell, language)}
                        className={cn(
                          'h-14 px-1.5 whitespace-normal first:w-12.5 first:pl-3 last:w-20 last:px-3',
                          getResponsiveColumnClassName(cell.column.id)
                        )}
                      >
                        <span className='sr-only'>{cellLabel}: </span>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length} className='h-24 text-center'>
                  {copy.noMembers}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className='flex justify-center border-t p-4 sm:justify-end sm:p-6'>
          <PaginationControls
            activePage={table.getState().pagination.pageIndex + 1}
            canNext={table.getCanNextPage()}
            canPrevious={table.getCanPreviousPage()}
            getPageButtonClassName={isActive =>
              cn(
                !isActive &&
                  'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-red-300/40'
              )
            }
            iconClassName='text-primary'
            labelClassName='text-primary max-sm:hidden'
            onNext={() => table.nextPage()}
            onPageChange={page => table.setPageIndex(page - 1)}
            onPrevious={() => table.previousPage()}
            pages={pages}
            nextAriaLabel={copy.pagination.nextAria}
            nextLabel={copy.pagination.next}
            previousAriaLabel={copy.pagination.previousAria}
            previousLabel={copy.pagination.previous}
            showLeftEllipsis={showLeftEllipsis}
            showRightEllipsis={showRightEllipsis}
          />
        </div>
      </div>
    </div>
  )
}

export default MembersDataTable

function SharedLastNameWordsPanel({
  copy,
  dismissedRowCount,
  groups,
  language,
  memberCount,
  onDismissRow,
  onResetDismissedRows
}: {
  copy: AdminMemberTableCopy
  dismissedRowCount: number
  groups: ReturnType<typeof getSharedLastAndMiddleNameGroups>
  language: AppLanguage
  memberCount: number
  onDismissRow: (rowKey: string) => void
  onResetDismissedRows: () => void
}) {
  const [sharedNameSort, setSharedNameSort] = useState<SharedLastNameSortState>({
    direction: 'asc',
    key: 'lastAndMiddleNames'
  })

  const sortedGroups = useMemo(
    () =>
      groups.map(group => ({
        ...group,
        members: [...group.members].sort((left, right) =>
          compareSharedLastNameMembers(left, right, sharedNameSort, copy, language)
        )
      })),
    [copy, groups, language, sharedNameSort]
  )

  const alphabetizedDropdownGroups = useMemo(
    () =>
      [...sortedGroups].sort(
        (left, right) =>
          left.firstSharedNameWord.localeCompare(right.firstSharedNameWord) ||
          left.secondSharedNameWord.localeCompare(right.secondSharedNameWord)
      ),
    [sortedGroups]
  )

  const scrollToGroup = (firstSharedNameWord: string, secondSharedNameWord: string) => {
    document
      .getElementById(getSharedNameWordGroupId(firstSharedNameWord, secondSharedNameWord))
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
  }

  const toggleSharedNameSort = (key: SharedLastNameSortKey) => {
    setSharedNameSort(currentSort => ({
      direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
      key
    }))
  }

  const renderSortableHeader = (key: SharedLastNameSortKey, label: string, className?: string) => {
    const isActive = sharedNameSort.key === key
    const SortIcon = isActive ? (sharedNameSort.direction === 'asc' ? ChevronUpIcon : ChevronDownIcon) : ArrowUpDown

    return (
      <TableHead
        aria-sort={isActive ? (sharedNameSort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={className}
      >
        <button
          type='button'
          className='inline-flex h-full max-w-full min-w-0 items-center gap-1 text-left font-medium'
          onClick={() => toggleSharedNameSort(key)}
        >
          <span className='truncate'>{label}</span>
          <SortIcon aria-hidden='true' className='size-3.5 shrink-0 opacity-70' />
        </button>
      </TableHead>
    )
  }

  return (
    <SheetContent className='w-[min(100vw,1200px)] gap-0 p-0 sm:max-w-none'>
      <SheetHeader className='border-b p-4 pr-12 sm:p-6 sm:pr-12'>
        <SheetTitle className='text-xl'>{copy.sharedLastNameWords.title}</SheetTitle>
        <SheetDescription className='flex flex-wrap items-center gap-2'>
          <span>{copy.sharedLastNameWords.description(formatNumber(groups.length), formatNumber(memberCount))}</span>
          {dismissedRowCount > 0 ? (
            <Badge variant='outline' className='rounded-sm'>
              {copy.sharedLastNameWords.dismissedRows(dismissedRowCount)}
            </Badge>
          ) : null}
        </SheetDescription>
      </SheetHeader>
      {groups.length > 0 || dismissedRowCount > 0 ? (
        <div className='bg-background flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
          {groups.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type='button' variant='outline' className='w-full justify-between sm:w-auto'>
                  <span>{copy.sharedLastNameWords.jumpToWord}</span>
                  <ChevronDownIcon aria-hidden='true' className='size-4 opacity-70' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='max-h-80 w-[min(calc(100vw-2rem),22rem)] overflow-y-auto'>
                {alphabetizedDropdownGroups.map(group => (
                  <DropdownMenuItem
                    key={getSharedNameWordGroupKeyForGroup(group)}
                    className='flex cursor-pointer items-center justify-between gap-4'
                    onSelect={() => scrollToGroup(group.firstSharedNameWord, group.secondSharedNameWord)}
                  >
                    <span className='flex min-w-0 items-center gap-1.5 font-mono font-semibold'>
                      <span className='truncate'>{group.firstSharedNameWord}</span>
                      <span className='text-muted-foreground'>+</span>
                      <span className='truncate'>{group.secondSharedNameWord}</span>
                    </span>
                    <Badge variant='secondary' className='rounded-sm'>
                      {group.members.length}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <p className='text-muted-foreground text-sm'>{copy.sharedLastNameWords.emptyAfterDismissal}</p>
          )}
          {dismissedRowCount > 0 ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='w-full sm:w-auto'
              onClick={onResetDismissedRows}
            >
              {copy.sharedLastNameWords.resetDismissedRows}
            </Button>
          ) : null}
        </div>
      ) : null}
      <ScrollArea className='min-h-0 flex-1'>
        <div className='space-y-4 p-4 sm:p-6'>
          {groups.length === 0 ? (
            <div className='text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm'>
              {dismissedRowCount > 0 ? copy.sharedLastNameWords.emptyAfterDismissal : copy.sharedLastNameWords.empty}
            </div>
          ) : (
            sortedGroups.map(group => {
              const groupKey = getSharedNameWordGroupKeyForGroup(group)

              return (
                <section
                  key={groupKey}
                  id={getSharedNameWordGroupId(group.firstSharedNameWord, group.secondSharedNameWord)}
                  className='scroll-mt-3 overflow-hidden rounded-md border'
                >
                  <div className='bg-muted/60 flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2'>
                    <div className='flex min-w-0 flex-wrap items-center gap-1.5'>
                      <Badge variant='secondary' className='rounded-sm font-mono text-sm'>
                        {group.firstSharedNameWord}
                      </Badge>
                      <span className='text-muted-foreground text-xs font-semibold'>+</span>
                      <Badge variant='outline' className='rounded-sm font-mono text-sm'>
                        {group.secondSharedNameWord}
                      </Badge>
                    </div>
                    <span className='text-muted-foreground text-xs font-medium'>
                      {copy.sharedLastNameWords.memberCount(group.members.length)}
                    </span>
                  </div>
                  <Table className='text-xs'>
                    <TableHeader>
                      <TableRow className='bg-muted/40 hover:bg-muted/40'>
                        {renderSortableHeader('associationCode', copy.columns.code, 'w-20')}
                        {renderSortableHeader('memberMatriculationNumber', copy.columns.matriculationShort, 'w-36')}
                        {renderSortableHeader('lastAndMiddleNames', copy.columns.lastAndMiddleShort, 'min-w-56')}
                        {renderSortableHeader('firstName', copy.columns.firstShort, 'min-w-40')}
                        {renderSortableHeader('dateOfBirth', copy.sharedLastNameWords.dateOfBirth, 'w-32')}
                        {renderSortableHeader('memberStatus', copy.columns.status, 'w-28 max-w-28')}
                        <TableHead className='w-36'>{copy.columns.actionsShort}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.members.map(member => {
                        const memberName = `${member.firstName} ${member.lastAndMiddleNames}`.trim()
                        const dismissalKey = getSharedNameWordRowDismissalKey(group, member.id)

                        return (
                          <TableRow key={`${groupKey}-${member.id}`}>
                            <TableCell className='font-mono font-semibold'>{member.associationCode}</TableCell>
                            <TableCell className='font-mono'>
                              {getVisibleMatriculationNumber(
                                member.memberStatus,
                                member.memberMatriculationNumber,
                                copy.pendingMatriculation
                              )}
                            </TableCell>
                            <TableCell title={member.lastAndMiddleNames} className='max-w-64'>
                              <span className='block truncate font-semibold'>{member.lastAndMiddleNames}</span>
                            </TableCell>
                            <TableCell title={member.firstName} className='max-w-48'>
                              <span className='block truncate'>{member.firstName}</span>
                            </TableCell>
                            <TableCell className='font-mono'>{member.dateOfBirth}</TableCell>
                            <TableCell className='w-28 max-w-28'>
                              {member.memberStatus ? (
                                <Badge variant='outline' className='w-full max-w-full justify-start truncate rounded-sm capitalize'>
                                  {formatMemberStatus(member.memberStatus, language)}
                                </Badge>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <Button
                                type='button'
                                variant='ghost'
                                size='xs'
                                className='text-muted-foreground hover:text-foreground h-7'
                                onClick={() => onDismissRow(dismissalKey)}
                                aria-label={copy.sharedLastNameWords.dismissRowAria(
                                  memberName,
                                  group.firstSharedNameWord,
                                  group.secondSharedNameWord
                                )}
                              >
                                <XIcon aria-hidden='true' className='size-3.5' />
                                <span>{copy.sharedLastNameWords.dismissRow}</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </section>
              )
            })
          )}
        </div>
      </ScrollArea>
    </SheetContent>
  )
}

function BulkAwaitingSubmitButton({
  copy,
  disabled
}: {
  copy: AdminMemberTableCopy['bulkAwaiting']
  disabled: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type='submit'
      disabled={disabled || pending}
      className={cn(
        adminActionButtonClassName,
        'bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-blue-700/30'
      )}
    >
      {pending ? (
        <>
          <Loader className='animate-spin' />
          {copy.pending}
        </>
      ) : (
        copy.confirm
      )}
    </Button>
  )
}

function BulkDelinquentSubmitButton({
  copy,
  disabled
}: {
  copy: AdminMemberTableCopy['bulkDelinquent']
  disabled: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type='submit'
      disabled={disabled || pending}
      className={cn(
        adminActionButtonClassName,
        'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-700/30'
      )}
    >
      {pending ? (
        <>
          <Loader className='animate-spin' />
          {copy.pending}
        </>
      ) : (
        copy.confirm
      )}
    </Button>
  )
}

function BulkVestedAwaitingSubmitButton({
  copy,
  disabled
}: {
  copy: AdminMemberTableCopy['bulkVestedAwaiting']
  disabled: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type='submit'
      disabled={disabled || pending}
      className={cn(
        adminActionButtonClassName,
        'bg-sky-700 text-white hover:bg-sky-800 focus-visible:ring-sky-700/30'
      )}
    >
      {pending ? (
        <>
          <Loader className='animate-spin' />
          {copy.pending}
        </>
      ) : (
        copy.confirm
      )}
    </Button>
  )
}

function BulkVestedSubmitButton({ copy, disabled }: { copy: AdminMemberTableCopy['bulkVested']; disabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type='submit'
      disabled={disabled || pending}
      className={cn(
        adminActionButtonClassName,
        'bg-green-700 text-white hover:bg-green-800 focus-visible:ring-green-700/30'
      )}
    >
      {pending ? (
        <>
          <Loader className='animate-spin' />
          {copy.pending}
        </>
      ) : (
        copy.confirm
      )}
    </Button>
  )
}

function BulkAwaitingVestedSubmitButton({
  copy,
  disabled
}: {
  copy: AdminMemberTableCopy['autoVest']
  disabled: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type='submit'
      disabled={disabled || pending}
      className={cn(
        adminActionButtonClassName,
        'bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700/30'
      )}
    >
      {pending ? (
        <>
          <Loader className='animate-spin' />
          {copy.pending}
        </>
      ) : (
        copy.confirm
      )}
    </Button>
  )
}

function Filter({
  column,
  copy,
  language
}: {
  column: Column<any, unknown>
  copy: AdminMemberTableCopy
  language: AppLanguage
}) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnHeader = getColumnLabel(column)
  const filterValue = (columnFilterValue ?? '') as string
  const searchLabel = column.id === 'name' ? copy.filters.names : columnHeader.toLowerCase()

  const sortedUniqueValues = useMemo(() => {
    if (filterVariant === 'range') return []

    return getSelectFilterValues(column.getFacetedUniqueValues().keys())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [column.getFacetedUniqueValues(), filterVariant])

  if (filterVariant === 'select') {
    return (
      <div className='border-primary w-full space-y-2 rounded border border-dashed sm:max-w-2xs'>
        {/* <Label htmlFor={`${id}-select`}>Select {columnHeader}</Label> */}
        <Select
          value={columnFilterValue?.toString() ?? 'all'}
          onValueChange={value => {
            column.setFilterValue(value === 'all' ? undefined : value)
          }}
        >
          <SelectTrigger id={`${id}-select`} className='w-full capitalize'>
            <SelectValue placeholder={copy.filters.select(columnHeader)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{copy.all}</SelectItem>
            {sortedUniqueValues.map(value => (
              <SelectItem key={String(value)} value={String(value)} className='capitalize'>
                {column.id === 'memberStatus' ? formatMemberStatus(String(value), language) : String(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className='border-primary w-full rounded border sm:max-w-2xs'>
      <Label htmlFor={`${id}-input`} className='sr-only'>
        {columnHeader}
      </Label>
      <div className='relative'>
        <Input
          id={`${id}-input`}
          className='peer pr-9 pl-9'
          value={filterValue}
          onChange={e => column.setFilterValue(e.target.value)}
          placeholder={copy.filters.search(searchLabel)}
          type='text'
        />
        <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
          <SearchIcon size={16} />
        </div>
        {filterValue ? (
          <Button
            type='button'
            variant='ghost'
            size='icon-xs'
            className='text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full'
            onClick={() => column.setFilterValue(undefined)}
            aria-label={copy.filters.clear(searchLabel)}
          >
            <XIcon className='size-3.5' />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function RowActions({ copy, memberId }: { copy: AdminMemberTableCopy['actions']; memberId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex'>
          <Button size='icon' variant='ghost' className='rounded-full p-2' aria-label={copy.open}>
            <Ellipsis className='size-6' aria-hidden='true' />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='center' className='border-primary rounded border'>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href={`/admin-all-members/${memberId}/edit`}>
              <span className='flex gap-3 text-blue-500'>
                <Pencil className='text-blue-500' />
                {copy.edit}
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`/admin-all-members/${memberId}/deathAnnouncement`}>
              <span className='flex gap-3 text-purple-500'>
                <Cross className='text-purple-500' />
                {copy.announceDeath}
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`/admin-all-members/${memberId}/removeMember`}>
              <span className='flex gap-3 text-red-500'>
                <Trash2 className='text-red-500' />
                {copy.remove}
              </span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
