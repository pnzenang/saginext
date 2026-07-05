import type { MenuItem } from '@/utils/types'
import {
  contributionStatus,
  deceasedMemberDocumentStatusLabels,
  deceasedMemberDocumentStatuses,
  memberStatus,
  memberTransferRequestStatusLabels,
  memberTransferRequestStatuses,
  nameChangeRequestStatusLabels,
  nameChangeRequestStatuses,
  type DeceasedMemberDocumentStatus,
  type MemberTransferRequestStatus,
  type NameChangeRequestStatus
} from '@/utils/types'

export const languageCookieName = 'sagi-language'

export const supportedLanguages = ['en', 'fr'] as const

export type AppLanguage = (typeof supportedLanguages)[number]

type LanguageOption = {
  label: string
  shortLabel: string
  ariaLabel: string
}

export const languageOptions: Record<AppLanguage, LanguageOption> = {
  en: {
    label: 'English',
    shortLabel: 'EN',
    ariaLabel: 'Show site in English'
  },
  fr: {
    label: 'Français',
    shortLabel: 'FR',
    ariaLabel: 'Afficher le site en français'
  }
}

export const normalizeLanguage = (value?: string | string[] | null): AppLanguage => {
  const language = Array.isArray(value) ? value[0] : value

  return language === 'fr' ? 'fr' : 'en'
}

export const getLanguageSetHref = (language: AppLanguage, next: string) => {
  const params = new URLSearchParams({
    lang: language,
    next
  })

  return `/api/language?${params.toString()}`
}

export const siteHeaderText = {
  en: {
    login: 'Login'
  },
  fr: {
    login: 'Connexion'
  }
} as const

export const dashboardText = {
  en: {
    brand: 'SAGI-USA',
    sidebar: {
      admin: 'Admin'
    }
  },
  fr: {
    brand: 'SAGI-USA',
    sidebar: {
      admin: 'Admin'
    }
  }
} as const

const dashboardMenuLabelTranslations: Record<string, string> = {
  'Navigation Instructions': 'Instructions de navigation',
  'Internal Rules At Glance': 'Aperçu des règles internes',
  'Add Member': 'Ajouter un membre',
  'All Members': 'Tous les membres',
  'Registrations Payments': "Paiements d'inscription",
  'Contributions Payments': 'Paiements des cotisations',
  'Remove Member': 'Retirer un membre',
  'Removed Members': 'Membres retirés',
  'Death Announcement': 'Annonce de décès',
  'All Deceased Members': 'Tous les membres décédés',
  'Payment Instructions': 'Instructions de paiement',
  'Monthly Additions': 'Ajouts mensuels',
  'Death Documentations': 'Documents de décès',
  'Name Change & Documentations': 'Changement de nom et documents',
  'Member Transfer': 'Transfert de membre',
  Profile: 'Profil',
  'Admin Profiles': 'Profils',
  'Admin All Members': 'Tous les membres',
  'Admin Name Changes': 'Changements de nom',
  'Admin Member Transfers': 'Transferts de membres',
  'Admin All Removed': 'Tous les membres retirés',
  'Admin All Deceased': 'Tous les membres décédés',
  'Admin Count ': 'Décompte',
  'Contribution Calculation': 'Calcul des cotisations',
  'Payment Update': 'Mise à jour des paiements',
  'Admin Contribution Payments': 'Paiements des cotisations',
  'Admin Registration Payments': "Paiements d'inscription",
  'Admin Transaction History': 'Historique des transactions'
}

const contributionTableLabelPattern = /^(.+)'s Contribution Table$/

export const translateDashboardMenuLabel = (label: string, language: AppLanguage) => {
  if (language !== 'fr') return label

  const contributionTableLabelMatch = label.match(contributionTableLabelPattern)

  if (contributionTableLabelMatch) {
    return `Tableau des cotisations de ${contributionTableLabelMatch[1]}`
  }

  return dashboardMenuLabelTranslations[label] ?? label
}

export const translateDashboardMenuItems = (items: MenuItem[], language: AppLanguage): MenuItem[] =>
  items.map(item => ({
    ...item,
    label: translateDashboardMenuLabel(item.label, language)
  }))

export const memberStatusLabels: Record<AppLanguage, Record<memberStatus, string>> = {
  en: {
    [memberStatus.Pending]: 'Pending',
    [memberStatus.Awaiting]: 'Awaiting Publication',
    [memberStatus.Vested]: 'Vested',
    [memberStatus.Delinquent]: 'Not in Good Standing'
  },
  fr: {
    [memberStatus.Pending]: 'En attente',
    [memberStatus.Awaiting]: 'En attente de publication',
    [memberStatus.Vested]: 'Acquis',
    [memberStatus.Delinquent]: 'Pas en règle'
  }
}

export const contributionStatusLabels: Record<AppLanguage, Record<contributionStatus, string>> = {
  en: {
    [contributionStatus.review]: 'Case In Review',
    [contributionStatus.denied]: 'Contribution Denied',
    [contributionStatus.underway]: 'Contribution Underway',
    [contributionStatus.completed]: 'Contribution Completed'
  },
  fr: {
    [contributionStatus.review]: 'Dossier en révision',
    [contributionStatus.denied]: 'Cotisation refusée',
    [contributionStatus.underway]: 'Cotisation en cours',
    [contributionStatus.completed]: 'Cotisation terminée'
  }
}

export const deceasedMemberDocumentStatusLabelsByLanguage: Record<
  AppLanguage,
  Record<DeceasedMemberDocumentStatus, string>
> = {
  en: deceasedMemberDocumentStatusLabels,
  fr: {
    approved: 'Approuvé',
    rejected: 'Rejeté',
    submitted: 'Soumis'
  }
}

export const nameChangeRequestStatusLabelsByLanguage: Record<AppLanguage, Record<NameChangeRequestStatus, string>> = {
  en: nameChangeRequestStatusLabels,
  fr: {
    approved: 'Approuvé',
    documentation_requested: 'Documents demandés',
    rejected: 'Rejeté',
    submitted: 'Soumis'
  }
}

export const memberTransferRequestStatusLabelsByLanguage: Record<
  AppLanguage,
  Record<MemberTransferRequestStatus, string>
> = {
  en: memberTransferRequestStatusLabels,
  fr: {
    admin_approved: 'Approuvé par l’admin',
    admin_rejected: 'Rejeté par l’admin',
    cancelled: 'Annulé',
    initiating_delegate_approved: 'Approbation du délégué destinataire en attente',
    receiving_delegate_approved: 'Approuvé par les deux délégués',
    receiving_delegate_pending: 'Libération en attente du délégué',
    receiving_delegate_rejected: 'Rejeté par le délégué'
  }
}

export const formatMemberStatus = (status: string | null | undefined, language: AppLanguage) =>
  status && Object.values(memberStatus).includes(status as memberStatus)
    ? memberStatusLabels[language][status as memberStatus]
    : (status ?? '')

export const formatContributionStatus = (status: string | null | undefined, language: AppLanguage) =>
  status && Object.values(contributionStatus).includes(status as contributionStatus)
    ? contributionStatusLabels[language][status as contributionStatus]
    : (status ?? '')

export const formatDeceasedMemberDocumentStatus = (status: string, language: AppLanguage) =>
  deceasedMemberDocumentStatuses.includes(status as DeceasedMemberDocumentStatus)
    ? deceasedMemberDocumentStatusLabelsByLanguage[language][status as DeceasedMemberDocumentStatus]
    : status

export const formatNameChangeRequestStatus = (status: string, language: AppLanguage) =>
  nameChangeRequestStatuses.includes(status as NameChangeRequestStatus)
    ? nameChangeRequestStatusLabelsByLanguage[language][status as NameChangeRequestStatus]
    : status

export const formatMemberTransferRequestStatus = (status: string, language: AppLanguage) =>
  memberTransferRequestStatuses.includes(status as MemberTransferRequestStatus)
    ? memberTransferRequestStatusLabelsByLanguage[language][status as MemberTransferRequestStatus]
    : status
