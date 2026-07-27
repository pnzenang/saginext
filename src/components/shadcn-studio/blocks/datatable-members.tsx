'use client'

import type { ReactNode } from 'react'
import { useEffect, useId, useMemo, useState } from 'react'

import type { Cell, Column, ColumnDef, ColumnFiltersState, PaginationState, RowData, Row } from '@tanstack/react-table'
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
  ArrowRight,
  ArrowUpDown,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Clock,
  CircleDollarSign,
  Cross,
  Ellipsis,
  FileSpreadsheetIcon,
  FileTextIcon,
  Hourglass,
  Pencil,
  SearchIcon,
  ShieldCheck,
  Trash2,
  UploadIcon,
  Users,
  XIcon
} from 'lucide-react'
import Link from 'next/link'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

import PaginationControls from '@/components/global/PaginationControls'
import PrintButton from '@/components/global/PrintButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePersistentColumnFilters } from '@/hooks/use-persistent-column-filters'
import { usePagination } from '@/hooks/use-pagination'
import { formatMemberStatus, type AppLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { registrationFeePerEligibleMember } from '@/utils/payment-constants'
import {
  getRegistrationPaymentCountdown,
  getRegistrationPaymentCountdownLabel,
  registrationPaymentDeadlineDays
} from '@/utils/registration-payment-deadline'
import type { AssociationContributionSummary } from '@/utils/sagi-contribution-summary'
import type { AssociationRegistrationSummary } from '@/utils/sagi-registration-summary'
import { getSelectFilterValues } from '@/utils/table-filter-values'
import { getTableCellTitle } from '@/utils/table'
import { formatLongevity } from '@/utils/formatLongevity'
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

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

const memberTableCopy = {
  en: {
    actions: {
      announceDeath: "Announce Member's Death",
      edit: "Edit Member's Details",
      open: 'Open member actions',
      remove: 'Remove Member'
    },
    all: 'All',
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
      status: 'Status'
    },
    export: {
      all: 'Export All',
      asCsv: 'Export as CSV',
      asExcel: 'Export as Excel',
      asJson: 'Export as JSON',
      page: 'Export Page',
      printPdf: 'Print PDF'
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
    payment: {
      contributionCta: 'Go to contribution payment',
      contributionDetail: (count: number, amount: string) => `${count} vested member(s) x ${amount}`,
      contributionTitle: (month: string) => `${month}'s Contribution`,
      registrationCta: 'Go to registration payment',
      registrationDetail: (count: number, amount: string) => `${count} pending member(s) x ${amount}`,
      registrationTitle: 'Registration Payment',
      sent: 'Sent',
      verified: 'Verified'
    },
    pendingMatriculation: 'Pending',
    summary: {
      awaiting: 'Awaiting',
      delinquent: 'Delinquent',
      pending: 'Pending',
      total: 'Total Membership',
      vested: 'Vested'
    },
    title: 'All Active Members'
  },
  fr: {
    actions: {
      announceDeath: 'Annoncer le décès du membre',
      edit: 'Modifier les détails du membre',
      open: 'Ouvrir les actions du membre',
      remove: 'Retirer le membre'
    },
    all: 'Tous',
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
      status: 'Statut'
    },
    export: {
      all: 'Tout exporter',
      asCsv: 'Exporter en CSV',
      asExcel: 'Exporter en Excel',
      asJson: 'Exporter en JSON',
      page: 'Exporter la page',
      printPdf: 'Imprimer PDF'
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
    payment: {
      contributionCta: 'Aller au paiement des cotisations',
      contributionDetail: (count: number, amount: string) => `${count} membre(s) acquis x ${amount}`,
      contributionTitle: (month: string) => `Cotisation de ${month}`,
      registrationCta: "Aller au paiement d'inscription",
      registrationDetail: (count: number, amount: string) => `${count} membre(s) en attente x ${amount}`,
      registrationTitle: "Paiement d'inscription",
      sent: 'Envoyé',
      verified: 'Vérifié'
    },
    pendingMatriculation: 'En attente',
    summary: {
      awaiting: 'En attente de publication',
      delinquent: 'Pas en règle',
      pending: 'En attente',
      total: 'Total des membres',
      vested: 'Acquis'
    },
    title: 'Tous les membres actifs'
  }
} as const

type MemberTableCopy = (typeof memberTableCopy)[AppLanguage]

const getMonthFormatter = (language: AppLanguage) =>
  new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'long'
  })

const getVisibleMatriculationNumber = (status: unknown, matriculationNumber: unknown, pendingLabel = 'Pending') => {
  if (status === memberStatus.Pending || status === memberStatus.Awaiting) return pendingLabel

  return String(matriculationNumber ?? '')
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

const getColumns = (copy: MemberTableCopy, language: AppLanguage): ColumnDef<MemberType>[] => [
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
      label: copy.columns.associationCode
    },
    size: 72
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
    size: 96
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
    size: 180
  },
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
    size: 130
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

      return <div>{formatLongevity(field, new Date(), language)}</div>
    },
    meta: {
      label: copy.columns.longevity
    },
    size: 112
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
        transfer_From_SAGIEUROPE:
          'bg-orange-600/10 text-orange-600 focus-visible:ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5',
        transfer_From_SAGINIGERIA:
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
    size: 112
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
          'bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5',
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
    id: 'actions',
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

const PaymentSummaryRow = ({ label, value }: { label: ReactNode; value: number }) => (
  <div className='text-primary/80 flex items-start justify-between gap-4'>
    <span className='min-w-0 break-words'>{label}</span>
    <span className='shrink-0 text-right tabular-nums'>{formatCurrency(value)}</span>
  </div>
)

const PaymentRouteCard = ({
  amount,
  cta,
  description,
  details,
  href,
  title
}: {
  amount: number
  cta: string
  description: ReactNode
  details: ReactNode
  href: string
  title: string
}) => (
  <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
    <p className='flex items-center gap-2 text-lg font-extrabold break-words sm:text-xl'>
      <CircleDollarSign className='size-5 shrink-0' aria-hidden='true' />
      {title}: {formatCurrency(amount)}
    </p>
    <div className='text-primary/80 mt-1 text-sm font-semibold break-words'>{description}</div>
    <div className='text-primary/80 mt-3 grid gap-1.5 text-xs font-semibold'>{details}</div>
    <Button asChild className='mt-4 w-fit'>
      <Link href={href}>
        {cta}
        <ArrowRight aria-hidden='true' />
      </Link>
    </Button>
  </div>
)

const AssociationPaymentNavigationCards = ({
  currentContribution,
  currentRegistrationPayment,
  language,
  paymentCopy
}: {
  currentContribution: AssociationContributionSummary
  currentRegistrationPayment: AssociationRegistrationSummary
  language: AppLanguage
  paymentCopy: MemberTableCopy['payment']
}) => {
  const currentMonthName = getMonthFormatter(language).format(new Date())
  const registrationMembersCount = Math.round(currentRegistrationPayment.balanceDues / registrationFeePerEligibleMember)

  return (
    <div className='grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-2'>
      <PaymentRouteCard
        amount={currentContribution.amountOwed}
        cta={paymentCopy.contributionCta}
        description={
          <>
            {paymentCopy.contributionDetail(
              currentContribution.vestedMembersCount,
              formatCurrency(currentContribution.amountPerVestedMember)
            )}
          </>
        }
        details={
          <>
            <PaymentSummaryRow label={paymentCopy.sent} value={currentContribution.amountReceived} />
            <PaymentSummaryRow label={paymentCopy.verified} value={currentContribution.amountVerified} />
          </>
        }
        href='/contributions'
        title={paymentCopy.contributionTitle(currentMonthName)}
      />
      <PaymentRouteCard
        amount={currentRegistrationPayment.balanceDues}
        cta={paymentCopy.registrationCta}
        description={
          <>
            {paymentCopy.registrationDetail(registrationMembersCount, formatCurrency(registrationFeePerEligibleMember))}
          </>
        }
        details={
          <>
            <PaymentSummaryRow label={paymentCopy.sent} value={currentRegistrationPayment.amountReceived} />
            <PaymentSummaryRow label={paymentCopy.verified} value={currentRegistrationPayment.amountVerified} />
          </>
        }
        href='/registrationsPayments'
        title={paymentCopy.registrationTitle}
      />
    </div>
  )
}

type MembersDataTableProps = {
  currentContribution: AssociationContributionSummary
  currentRegistrationPayment: AssociationRegistrationSummary
  data: MemberType[]
  language?: AppLanguage
  readOnly?: boolean
}

const MembersDataTable = ({
  currentContribution,
  currentRegistrationPayment,
  data,
  language = 'en',
  readOnly = false
}: MembersDataTableProps) => {
  const copy = memberTableCopy[language]

  const tableColumns = useMemo(() => {
    const nextColumns = getColumns(copy, language)

    return readOnly ? nextColumns.filter(column => column.id !== 'actions') : nextColumns
  }, [copy, language, readOnly])

  const [columnFilters, setColumnFilters] = usePersistentColumnFilters('sagi:all-members:columnFilters')

  const pageSize = 200

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize
  })

  useEffect(() => {
    setColumnFilters(currentFilters => mergeNameColumnFilters(currentFilters))
  }, [columnFilters, setColumnFilters])

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
      pagination
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination
  })

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
    link.setAttribute('download', `payments-export-${new Date().toISOString().split('T')[0]}.csv`)
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

    XLSX.writeFile(workbook, `payments-export-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportVisibleColumnsToExcel = () => {
    const dataToExport = table.getFilteredRowModel().rows.map(row => {
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
        [copy.columns.longevity]: formatLongevity(createdAt, new Date(), language),
        [copy.columns.recommendation]: row.getValue('delegateRecommendation'),
        [copy.columns.status]: formatMemberStatus(row.getValue('memberStatus') as string, language),
        [copy.columns.registrationDues]: getRegistrationPaymentWarning(row.original, language)
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Members')

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

    XLSX.writeFile(workbook, `all-members-visible-columns-${new Date().toISOString().split('T')[0]}.xlsx`)
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
    link.setAttribute('download', `payments-export-${new Date().toISOString().split('T')[0]}.json`)
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
          {!readOnly ? (
            <div className='w-full pb-2'>
              <AssociationPaymentNavigationCards
                currentContribution={currentContribution}
                currentRegistrationPayment={currentRegistrationPayment}
                language={language}
                paymentCopy={copy.payment}
              />
            </div>
          ) : null}
          <div className='flex items-center justify-between gap-3 py-2 max-sm:flex-col max-sm:items-stretch sm:px-6 sm:py-4'>
            <p className='text-primary text-sm font-extrabold sm:whitespace-nowrap' aria-live='polite'>
              <span>{copy.found(formatNumber(table.getRowCount()))}</span>
            </p>

            <div className='flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center'>
              <Pagination>
                <PaginationContent>
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
              <div className='grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center'>
                <PrintButton
                  label={copy.export.printPdf}
                  className='bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 w-full sm:w-auto'
                />
                <Button
                  type='button'
                  onClick={exportVisibleColumnsToExcel}
                  disabled={table.getFilteredRowModel().rows.length === 0}
                  className='bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 w-full sm:w-auto'
                >
                  <FileSpreadsheetIcon />
                  {copy.export.page}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className='bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 w-full sm:w-auto'>
                      <UploadIcon />
                      {copy.export.all}
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
          </div>
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

                  return (
                    <TableHead
                      key={header.id}
                      title={headerTitle}
                      style={{ width: `${header.getSize()}px` }}
                      className={cn(
                        'px-1.5 leading-tight font-extrabold whitespace-normal text-white first:pl-3 last:px-3',
                        getResponsiveColumnClassName(header.column.id)
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              'inline-flex h-full cursor-pointer items-center gap-1 select-none'
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
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronUpIcon className='shrink-0 opacity-60' size={16} aria-hidden='true' />,
                            desc: <ChevronDownIcon className='shrink-0 opacity-60' size={16} aria-hidden='true' />
                          }[header.column.getIsSorted() as string] ?? (
                            <ArrowUpDown className='shrink-0 opacity-60' size={16} aria-hidden='true' />
                          )}
                        </div>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='hover:bg-primary/30'>
                  {row.getVisibleCells().map(cell => {
                    const cellLabel = getMemberTableCellLabel(cell)

                    return (
                      <TableCell
                        key={cell.id}
                        data-label={cellLabel}
                        title={getTableCellTitle(cell)}
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

function Filter({
  column,
  copy,
  language
}: {
  column: Column<any, unknown>
  copy: MemberTableCopy
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

function RowActions({ copy, memberId }: { copy: MemberTableCopy['actions']; memberId: string }) {
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
            <Link href={`/all-members/${memberId}/edit`}>
              <span className='flex gap-3 text-blue-500'>
                <Pencil className='text-blue-500' />
                {copy.edit}
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`/all-members/${memberId}/deathAnnouncement`}>
              <span className='flex gap-3 text-purple-500'>
                <Cross className='text-purple-500' />
                {copy.announceDeath}
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`/all-members/${memberId}/removeMember`}>
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
