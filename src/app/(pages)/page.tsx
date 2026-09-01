import Image from 'next/image'
import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { cookies } from 'next/headers'
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BellRingIcon,
  CheckCircle2Icon,
  CircleDollarSignIcon,
  ClipboardCheckIcon,
  Clock3Icon,
  FileTextIcon,
  HeartHandshakeIcon,
  LayoutDashboardIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  UploadCloudIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersRoundIcon,
  WalletCardsIcon
} from 'lucide-react'

import { faqData } from '@/assets/data/faq-section'
import { testimonialsData } from '@/assets/data/testimonials'
import FAQ from '@/components/blocks/faq-section'
import Testimonials from '@/components/blocks/testimonials-section/testimonials-section'
import ContactUs from '@/components/shadcn-studio/blocks/contact-us-page-02/contact-us-page-02'
import FuneralHomesPage from '@/components/shadcn-studio/blocks/funeralHomes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { languageCookieName, normalizeLanguage } from '@/lib/i18n'
import db from '@/utils/db'
import { fetchLatestAssociationContributionAssessmentForMonth } from '@/utils/sagi-contribution-summary'

type HeroStat = {
  value: string
  label: string
}

const heroStats: HeroStat[] = [
  { value: '$20', label: 'maximum monthly member contribution' },
  { value: '$20,000', label: 'family support after vesting' },
  { value: '30 days', label: 'target payout after documents' }
]

const sagicamUrl = 'https://www.sagicam.org/'
const sagiNigeriaUrl = 'https://saginigeria.org/'

const CameroonFlagIcon = () => (
  <span aria-hidden='true' className='flex h-4 w-6 overflow-hidden rounded-[2px] ring-1 ring-white/50'>
    <span className='flex-1 bg-[#007a5e]' />
    <span className='relative flex flex-1 items-center justify-center bg-[#ce1126]'>
      <span className='text-[8px] leading-none text-[#fcd116]'>★</span>
    </span>
    <span className='flex-1 bg-[#fcd116]' />
  </span>
)

const NigeriaFlagIcon = () => (
  <span aria-hidden='true' className='flex h-4 w-6 overflow-hidden rounded-[2px] ring-1 ring-white/50'>
    <span className='flex-1 bg-[#008751]' />
    <span className='flex-1 bg-white' />
    <span className='flex-1 bg-[#008751]' />
  </span>
)

const steps = [
  {
    icon: UserPlusIcon,
    title: 'Register members',
    description: 'Delegates add individual, family, association, or group members to their dashboard.'
  },
  {
    icon: WalletCardsIcon,
    title: 'Contribute together',
    description: 'Members keep participation active through predictable, low-overhead contributions.'
  },
  {
    icon: BadgeCheckIcon,
    title: 'Stay vested',
    description: 'The platform makes member status clear before a family ever needs support.'
  },
  {
    icon: HeartHandshakeIcon,
    title: 'Receive support',
    description:
      'If affected, When documentation is complete, SAGI coordinates funeral assistance and payout processing.'
  }
]

const eligibilityHighlights = [
  'No health checks',
  'No age limitation',
  'No nationality limitation',
  'Any group size',
  'Individual, Families and associations welcome',
  'Self-service delegate dashboard'
]

const memberStatuses = [
  {
    name: 'Pending',
    badge: 'Registration started',
    icon: Clock3Icon,
    description: 'The member has started registration but is not eligible for benefits yet.',
    points: ['Waiting period is active', 'Registration fee not received', 'Benefits are not available yet'],
    className: 'border-amber-500/40 bg-amber-100 dark:bg-amber-500/20'
  },
  {
    name: 'Awaiting Publication',
    badge: 'Paid and waiting',
    icon: FileTextIcon,
    description: 'The member registration was paid, and the member is waiting to finish the waiting period.',
    points: ['Registration fee received.', 'Awaiting publication ', 'Benefits are not available yet.'],
    className: 'border-sky-500/40 bg-sky-100 dark:bg-sky-500/20'
  },
  {
    name: 'Vested',
    badge: 'Eligible',
    icon: ShieldCheckIcon,
    description: 'The member has satisfied the requirements and is eligible for family support.',
    points: ['Waiting period is complete', 'Registration is complete', 'Eligible for benefits.'],
    className: 'border-emerald-500/40 bg-emerald-500/10',
    featured: true
  },
  {
    name: 'Not in Good Standing',
    badge: 'Action needed',
    icon: LockKeyholeIcon,
    description: 'The member has missed one or more contributions.',
    points: ['Missed contribution ', 'Eligibility is paused', 'Delegate can review next steps'],
    className: 'border-rose-500/40 bg-rose-100 dark:bg-rose-500/20'
  }
]

const benefitSchedule = [
  {
    status: 'Pending',
    benefit: '$0',
    timing: 'Registration started',
    description: 'Benefits are not available while registration, payment, and waiting-period steps are still open.',
    icon: Clock3Icon,
    rowClassName: 'bg-amber-100 dark:bg-amber-500/20',
    iconClassName: 'border-amber-500/40 bg-amber-500/20 text-amber-700 dark:text-amber-200'
  },
  {
    status: 'Awaiting Publication',
    benefit: '$0',
    timing: 'Paid and waiting',
    description: 'Benefits begin only after the waiting period is complete and the member is published as eligible.',
    icon: FileTextIcon,
    rowClassName: 'bg-sky-100 dark:bg-sky-500/20',
    iconClassName: 'border-sky-500/40 bg-sky-500/20 text-sky-700 dark:text-sky-200'
  },
  {
    status: 'Vested',
    benefit: 'Up to $20,000',
    timing: 'Eligible after approval',
    description: 'Family support is available when the member is vested, current, and required documents are approved.',
    icon: ShieldCheckIcon,
    rowClassName: 'bg-emerald-500/10',
    iconClassName: 'border-emerald-600 bg-emerald-600 text-white',
    featured: true
  },
  {
    status: 'Not in Good Standing',
    benefit: 'Canceled or paused',
    timing: 'Action needed',
    description: 'Benefits are canceled or paused while contribution or standing issues are unresolved.',
    icon: LockKeyholeIcon,
    rowClassName: 'bg-rose-100 dark:bg-rose-500/20',
    iconClassName: 'border-rose-500/40 bg-rose-500/20 text-rose-700 dark:text-rose-200'
  }
]

const dashboardActions = [
  {
    icon: UsersRoundIcon,
    title: 'Member records',
    description: 'Review member rosters, status, contributions, and changes without emailing back and forth.'
  },
  {
    icon: UserPlusIcon,
    title: 'Add members',
    description: 'Register new participants with the personal and beneficiary details SAGI requires.'
  },
  {
    icon: UserMinusIcon,
    title: 'Remove members',
    description: 'Keep the group clean when a member withdraws or no longer participates.'
  },
  {
    icon: UploadCloudIcon,
    title: 'Submit documents',
    description: 'Upload death announcement documentation and keep a traceable support record.'
  }
]

const trustStats = [
  { icon: CircleDollarSignIcon, value: '$15M+', label: 'distributed to families' },
  { icon: UsersRoundIcon, value: '800+', label: 'families reached' },
  { icon: ClipboardCheckIcon, value: '17+', label: 'years of experience' },
  { icon: BellRingIcon, value: '24/7', label: 'online member access' }
]

const ruleHighlights = [
  'Members become eligible only after their waiting period and registration requirements are complete.',
  'Delegates can manage registrations, removals, death announcements, and document submissions online.',
  'SAGI helps coordinate funeral-home support while keeping contribution and member records visible.',
  'Participation is designed around solidarity: every member contributes so families are not left alone.'
]

type HomeLanguage = 'en' | 'fr'

type HomeSearchParams = {
  lang?: string | string[]
}

const registeredMemberNumberFormatters: Record<HomeLanguage, Intl.NumberFormat> = {
  en: new Intl.NumberFormat('en-US'),
  fr: new Intl.NumberFormat('fr-FR')
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const monthFormatters: Record<HomeLanguage, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en-US', {
    month: 'long'
  }),
  fr: new Intl.DateTimeFormat('fr-FR', {
    month: 'long'
  })
}

const heroContributionBannerVisibleFrom = new Date('2026-07-31T00:00:00-04:00')

const isHeroContributionBannerVisible = (date: Date) => date >= heroContributionBannerVisibleFrom

type RotatingHeroImage = {
  src: string
  alt: Record<HomeLanguage, string>
  objectPosition: string
}

const rotatingHeroImages: RotatingHeroImage[] = [
  {
    src: '/images/hero/sagi-hero-jan-feb.jpg',
    alt: {
      en: 'Community members reviewing support documents together',
      fr: 'Membres de la communauté examinant ensemble des documents de soutien'
    },
    objectPosition: '58% 100%'
  },
  {
    src: '/images/hero/sagi-hero-february.jpg',
    alt: {
      en: 'Community members welcoming a family with support documents',
      fr: 'Membres de la communauté accueillant une famille avec des documents de soutien'
    },
    objectPosition: '62% 100%'
  },
  {
    src: '/images/hero/sagi-hero-mar-apr.jpg',
    alt: {
      en: 'Multigenerational family reviewing support information at home',
      fr: 'Famille multigénérationnelle consultant des informations de soutien à la maison'
    },
    objectPosition: '62% 100%'
  },
  {
    src: '/images/hero/sagi-hero-april.jpg',
    alt: {
      en: 'Family and delegate reviewing membership support information',
      fr: 'Famille et déléguée consultant des informations de soutien'
    },
    objectPosition: '62% 100%'
  },
  {
    src: '/images/hero/sagi-hero-may-jun.jpg',
    alt: {
      en: 'Community delegates organizing member support records',
      fr: 'Délégués communautaires organisant les dossiers de soutien des membres'
    },
    objectPosition: '62% 100%'
  },
  {
    src: '/images/hero/sagi-hero-june.jpg',
    alt: {
      en: 'Delegate team reconciling member records and contribution details',
      fr: 'Équipe de délégués vérifiant les dossiers des membres et les cotisations'
    },
    objectPosition: '63% 100%'
  },
  {
    src: '/images/hero/sagi-hero-jul-aug.jpg',
    alt: {
      en: 'Community members meeting in a circle for mutual aid support',
      fr: 'Membres de la communauté réunis en cercle pour un soutien solidaire'
    },
    objectPosition: '54% 100%'
  },
  {
    src: '/images/hero/sagi-hero-august.jpg',
    alt: {
      en: 'Community members exchanging support forms after a member session',
      fr: 'Membres de la communauté échangeant des formulaires après une séance'
    },
    objectPosition: '65% 100%'
  },
  {
    src: '/images/hero/sagi-hero-sep-oct.jpg',
    alt: {
      en: 'Family and community members gathered for a dignified support moment',
      fr: 'Famille et membres de la communauté réunis dans un moment de soutien digne'
    },
    objectPosition: '62% 100%'
  },
  {
    src: '/images/hero/sagi-hero-october.jpg',
    alt: {
      en: 'Family and delegate having a compassionate support conversation',
      fr: 'Famille et déléguée dans une conversation de soutien compatissante'
    },
    objectPosition: '66% 100%'
  },
  {
    src: '/images/hero/sagi-hero-nov-dec.jpg',
    alt: {
      en: 'Family members reviewing contribution records together',
      fr: 'Membres d’une famille examinant ensemble des dossiers de cotisation'
    },
    objectPosition: '62% 100%'
  },
  {
    src: '/images/hero/sagi-hero-december.jpg',
    alt: {
      en: 'Delegates reviewing year-end contribution records together',
      fr: 'Délégués examinant ensemble les dossiers de cotisation de fin d’année'
    },
    objectPosition: '64% 100%'
  }
]

const heroImageRotationIntervalDays = 5
const millisecondsPerDay = 24 * 60 * 60 * 1000

const getSeededRandomValue = (seed: number) => {
  let value = seed >>> 0

  value ^= value >>> 16
  value = Math.imul(value, 0x7feb352d)
  value ^= value >>> 15
  value = Math.imul(value, 0x846ca68b)
  value ^= value >>> 16

  return value >>> 0
}

const getRandomizedHeroImageIndex = (rotationPeriodIndex: number, imageCount: number) => {
  const cycleIndex = rotationPeriodIndex % imageCount
  const cycleSeed = Math.floor(rotationPeriodIndex / imageCount)
  const imageIndexes = Array.from({ length: imageCount }, (_, index) => index)

  for (let index = imageIndexes.length - 1; index > 0; index -= 1) {
    const swapIndex = getSeededRandomValue(cycleSeed * imageCount + index) % (index + 1)
    const selectedIndex = imageIndexes[index]

    imageIndexes[index] = imageIndexes[swapIndex]
    imageIndexes[swapIndex] = selectedIndex
  }

  return imageIndexes[cycleIndex] ?? 0
}

const getRotatingHeroImage = (date: Date) => {
  const startOfDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const daysSinceEpoch = Math.floor(startOfDay / millisecondsPerDay)
  const rotationPeriodIndex = Math.floor(daysSinceEpoch / heroImageRotationIntervalDays)
  const imageIndex = getRandomizedHeroImageIndex(rotationPeriodIndex, rotatingHeroImages.length)

  return rotatingHeroImages[imageIndex] ?? rotatingHeroImages[0]
}

const totalRegisteredLabels: Record<HomeLanguage, string> = {
  en: 'total registered to date',
  fr: 'total des inscrits à ce jour'
}

const frenchHeroStats: HeroStat[] = [
  { value: '$20', label: 'cotisation mensuelle maximale par membre' },
  { value: '$20,000', label: 'soutien familial après acquisition des droits' },
  { value: '30 jours', label: 'objectif de paiement après réception des documents' }
]

const frenchSteps = [
  {
    icon: UserPlusIcon,
    title: 'Inscrire les membres',
    description:
      'Les délégués ajoutent les membres individuels, les familles, les associations ou les groupes dans leur tableau de bord.'
  },
  {
    icon: WalletCardsIcon,
    title: 'Contribuer ensemble',
    description: 'Les membres gardent leur participation active grâce à des cotisations prévisibles et simples.'
  },
  {
    icon: BadgeCheckIcon,
    title: 'Rester acquis',
    description: 'La plateforme rend le statut de chaque membre clair avant qu’une famille ait besoin de soutien.'
  },
  {
    icon: HeartHandshakeIcon,
    title: 'Recevoir du soutien',
    description:
      'Lorsque les documents sont complets, SAGI coordonne l’aide funéraire et le traitement du paiement.'
  }
]

const frenchEligibilityHighlights = [
  'Aucun examen médical',
  "Aucune limite d'âge",
  'Aucune limite de nationalité',
  'Toute taille de groupe',
  'Individus, familles et associations bienvenus',
  'Tableau de bord autonome pour les délégués'
]

const frenchMemberStatuses = [
  {
    name: 'En attente',
    badge: 'Inscription commencée',
    icon: Clock3Icon,
    description: "Le membre a commencé l'inscription, mais il n'est pas encore admissible aux avantages.",
    points: ["La période d'attente est active", "Les frais d'inscription ne sont pas reçus", 'Les avantages ne sont pas encore disponibles'],
    className: 'border-amber-500/40 bg-amber-100 dark:bg-amber-500/20'
  },
  {
    name: 'En attente de publication',
    badge: 'Payé et en attente',
    icon: FileTextIcon,
    description:
      "L'inscription du membre a été payée, et le membre attend la fin de sa période d'attente.",
    points: ["Frais d'inscription reçus.", 'Publication en attente', 'Les avantages ne sont pas encore disponibles.'],
    className: 'border-sky-500/40 bg-sky-100 dark:bg-sky-500/20'
  },
  {
    name: 'Acquis',
    badge: 'Admissible',
    icon: ShieldCheckIcon,
    description: 'Le membre a satisfait aux exigences et est admissible au soutien familial.',
    points: ["La période d'attente est terminée", "L'inscription est complète", 'Admissible aux avantages.'],
    className: 'border-emerald-500/40 bg-emerald-500/10',
    featured: true
  },
  {
    name: 'Pas en règle',
    badge: 'Action requise',
    icon: LockKeyholeIcon,
    description: 'Le membre a manqué une ou plusieurs cotisations.',
    points: ['Cotisation manquée', "L'admissibilité est suspendue", 'Le délégué peut examiner les prochaines étapes'],
    className: 'border-rose-500/40 bg-rose-100 dark:bg-rose-500/20'
  }
]

const frenchBenefitSchedule = [
  {
    status: 'En attente',
    benefit: '$0',
    timing: 'Inscription commencée',
    description:
      "Les avantages ne sont pas disponibles tant que l'inscription, le paiement et la période d'attente ne sont pas terminés.",
    icon: Clock3Icon,
    rowClassName: 'bg-amber-100 dark:bg-amber-500/20',
    iconClassName: 'border-amber-500/40 bg-amber-500/20 text-amber-700 dark:text-amber-200'
  },
  {
    status: 'En attente de publication',
    benefit: '$0',
    timing: 'Payé et en attente',
    description:
      "Les avantages commencent seulement après la fin de la période d'attente et la publication du membre comme admissible.",
    icon: FileTextIcon,
    rowClassName: 'bg-sky-100 dark:bg-sky-500/20',
    iconClassName: 'border-sky-500/40 bg-sky-500/20 text-sky-700 dark:text-sky-200'
  },
  {
    status: 'Acquis',
    benefit: "Jusqu'à $20,000",
    timing: 'Admissible après approbation',
    description:
      'Le soutien familial est disponible lorsque le membre est acquis, à jour et que les documents requis sont approuvés.',
    icon: ShieldCheckIcon,
    rowClassName: 'bg-emerald-500/10',
    iconClassName: 'border-emerald-600 bg-emerald-600 text-white',
    featured: true
  },
  {
    status: 'Pas en règle',
    benefit: 'Annulé ou suspendu',
    timing: 'Action requise',
    description:
      'Les avantages sont annulés ou suspendus tant que les problèmes de cotisation ou de statut ne sont pas résolus.',
    icon: LockKeyholeIcon,
    rowClassName: 'bg-rose-100 dark:bg-rose-500/20',
    iconClassName: 'border-rose-500/40 bg-rose-500/20 text-rose-700 dark:text-rose-200'
  }
]

const frenchDashboardActions = [
  {
    icon: UsersRoundIcon,
    title: 'Dossiers des membres',
    description: 'Consultez les listes, statuts, cotisations et changements sans allers-retours par courriel.'
  },
  {
    icon: UserPlusIcon,
    title: 'Ajouter des membres',
    description: 'Inscrivez de nouveaux participants avec les détails personnels et bénéficiaires requis par SAGI.'
  },
  {
    icon: UserMinusIcon,
    title: 'Retirer des membres',
    description: 'Gardez le groupe à jour lorsqu’un membre se retire ou ne participe plus.'
  },
  {
    icon: UploadCloudIcon,
    title: 'Soumettre les documents',
    description: 'Téléversez les documents d’annonce de décès et gardez un dossier de soutien traçable.'
  }
]

const frenchTrustStats = [
  { icon: CircleDollarSignIcon, value: '$15M+', label: 'distribués aux familles' },
  { icon: UsersRoundIcon, value: '800+', label: 'familles aidées' },
  { icon: ClipboardCheckIcon, value: '17+', label: "années d'expérience" },
  { icon: BellRingIcon, value: '24/7', label: 'accès en ligne des membres' }
]

const frenchRuleHighlights = [
  "Les membres deviennent admissibles seulement après la période d'attente et les exigences d'inscription.",
  'Les délégués peuvent gérer les inscriptions, les retraits, les annonces de décès et les documents en ligne.',
  'SAGI aide à coordonner le soutien funéraire tout en gardant les cotisations et dossiers visibles.',
  'La participation repose sur la solidarité: chaque membre contribue pour que les familles ne soient pas seules.'
]

const frenchFaqData = [
  {
    question: "Qu'est-ce que SAGI?",
    answer:
      'SAGI est une communauté de solidarité qui aide les membres et les familles à se préparer aux dépenses funéraires grâce aux cotisations partagées et à un soutien organisé.'
  },
  {
    question: 'Qui peut rejoindre SAGI?',
    answer:
      'Les individus, familles, groupes et associations peuvent participer s’ils respectent les exigences d’inscription et les règles de participation de SAGI.'
  },
  {
    question: 'Quand un membre est-il admissible au soutien?',
    answer:
      'Un membre est admissible lorsqu’il est acquis, a terminé la période d’attente, a complété son inscription et est à jour dans les cotisations requises.'
  },
  {
    question: "Que peut faire un délégué depuis le tableau de bord?",
    answer:
      'Les délégués peuvent inscrire des membres, vérifier les statuts, gérer les retraits, soumettre les documents de décès et suivre les cotisations ou paiements.'
  },
  {
    question: 'Comment contacter SAGI pour obtenir de l’aide?',
    answer:
      'Vous pouvez appeler SAGI au (804) 214-6390, envoyer un courriel à info@mySagi.org ou envoyer un message avec le formulaire de contact.'
  }
]

const frenchTestimonialsData = [
  {
    name: "Délégué d'association",
    handle: 'Groupe de membres',
    rating: 5,
    content:
      'Le tableau de bord donne à notre groupe un seul endroit pour vérifier les statuts, les cotisations et les documents.'
  },
  {
    name: 'Coordonnatrice familiale',
    handle: 'Membre SAGI',
    rating: 5,
    content:
      'SAGI rend les règles visibles avant une urgence. Cette clarté compte beaucoup lorsque les familles sont déjà sous pression.'
  },
  {
    name: 'Administrateur de groupe',
    handle: 'Portail délégué',
    rating: 4.5,
    content:
      'Ajouter des membres et soumettre les documents en ligne a réduit les allers-retours qui ralentissaient tout.'
  },
  {
    name: 'Trésorière communautaire',
    handle: 'Suivi des cotisations',
    rating: 4.5,
    content:
      'Les libelles de statut nous aident a expliquer qui est en attente, qui demande une action et qui est acquis.'
  },
  {
    name: "Président d'association",
    handle: 'Soutien aux membres',
    rating: 4.5,
    content:
      'Le processus est organisé: inscrire, contribuer, rester à jour et savoir quels documents sont requis.'
  },
  {
    name: 'Délégué SAGI',
    handle: 'Dossiers en ligne',
    rating: 5,
    content:
      'Avoir les dossiers des membres et les documents de décès dans le même système donne plus de confiance à notre groupe.'
  },
  {
    name: 'Famille membre',
    handle: 'Soutien funéraire',
    rating: 4.5,
    content:
      'Savoir qu’un chemin de soutien existe apporte une tranquillité d’esprit bien avant un moment difficile.'
  },
  {
    name: 'Secrétaire de groupe',
    handle: 'Outils autonomes',
    rating: 4.5,
    content:
      'Notre équipe de délégués peut gérer les changements courants directement au lieu d’attendre chaque mise à jour.'
  },
  {
    name: 'Membre communautaire',
    handle: 'Solidarité',
    rating: 4.5,
    content:
      'La cotisation mensuelle est prévisible et le but est facile à expliquer: nous nous aidons quand les familles en ont le plus besoin.'
  }
]

const homeContent = {
  en: {
    language: {
      label: 'Language',
      english: 'English',
      french: 'Français'
    },
    hero: {
      badge: 'Member-funded funeral support',
      title: 'SAGI: Active Solidarity Ltd.',
      description:
        'A mutual aid community where low monthly contributions create real funeral support for families when it matters most.',
      primaryCta: 'Join SAGI',
      secondaryCta: 'See how it works',
      sagicamCta: 'Visit SAGICAM',
      sagiNigeriaCta: 'Visit SAGINIGERIA',
      imageAlt: 'Family receiving compassionate guidance with support documents'
    },
    heroStats,
    monthlyContributionCard: {
      contributionLabel: (month: string) => `${month}'s Contribution per member`,
      deathCountLabel: 'Number of deaths'
    },
    howIntro: {
      eyebrow: 'How SAGI works',
      title: 'A clear path from registration to family support.',
      description:
        'From first registration to urgent family support, every step is organized so members and delegates know what comes next.'
    },
    steps,
    whoIntro: {
      eyebrow: 'Who can join',
      title: 'Built for individuals, families, associations, and groups.',
      description:
        'SAGI should feel open and practical from the first visit: no health checks, no group-size ceiling, and no complicated gatekeeping.',
      imageAlt: 'Black delegate reviewing member information on a phone'
    },
    eligibilityHighlights,
    memberStatusIntro: {
      eyebrow: 'Member status',
      title: 'Know exactly where every member stands.',
      description:
        'These four statuses explain when a member is newly registered, awaiting publication, ready for support, or needs action.'
    },
    memberStatuses,
    benefitIntro: {
      eyebrow: 'Benefit schedule',
      title: 'What support is available by member status.',
      description:
        'A simple schedule helps families and delegates understand when support is available, paused, or still waiting on registration steps.',
      imageAlt: 'Family reviewing benefit support paperwork with an advisor',
      columns: ['Status', 'Benefit', 'Timing', 'What it means'],
      eligibleStatus: 'Eligible status'
    },
    benefitSchedule,
    dashboardIntro: {
      eyebrow: 'Delegate dashboard',
      title: 'Delegate working hub.',
      description: 'Delegates can manage the everyday details that keep member records current and support requests moving.'
    },
    dashboardActions,
    dashboardImages: {
      allMembers: 'All members table preview',
      addMember: 'Add member form preview',
      deathAnnouncement: 'Death announcement form preview'
    },
    trustIntro: {
      eyebrow: 'Trust and rules',
      title: 'Show the rules before families need them.',
      description:
        'Trust comes from clear expectations: who is eligible, what delegates can do, and what support looks like during a hard moment.'
    },
    trustStats,
    ruleHighlights,
    dashboardCta: 'Delegates can manage members, documents, and contributions from the dashboard.',
    loginCta: 'Login',
    testimonialsSection: {
      title: 'Trusted by families and delegates',
      description: 'A practical support system built around clear rules, organized records, and community care.'
    },
    testimonials: testimonialsData,
    faqSection: {
      badge: 'FAQ',
      title: 'Have more questions?',
      description:
        'SAGI combines mutual aid, clear member rules, and a self-service dashboard so delegates and families know what to expect before support is needed.',
      cardTitle: "Can't find answers?",
      cardDescription:
        "We're here to help with registration, member status, documents, and funeral support questions.",
      contactCta: 'Contact us'
    },
    faqItems: faqData,
    contactSection: {
      title: 'How Can We Help?',
      description: "Have a question or need assistance? Contact us and let's find a solution together!",
      infoTitle: 'Contact Information',
      infoDescription:
        "If you could not find the information you were looking for, please don't hesitate to contact us.",
      whatsappAriaLabel: 'Chat with SAGI on WhatsApp',
      whatsappLabel: 'Chat with SAGI',
      whatsappMessage: 'Hello SAGI, I need help.',
      form: {
        nameLabel: 'Your Name',
        namePlaceholder: 'Enter your name here...',
        emailLabel: 'Your Email',
        emailPlaceholder: 'Enter your email here...',
        subjectLabel: 'Your Subject',
        subjectPlaceholder: 'Enter your subject here...',
        messageLabel: 'Message',
        messagePlaceholder: 'Type here',
        submit: 'Send Message'
      }
    }
  },
  fr: {
    language: {
      label: 'Langue',
      english: 'English',
      french: 'Français'
    },
    hero: {
      badge: 'Soutien funéraire financé par les membres',
      title: 'SAGI: Active Solidarity Ltd.',
      description:
        'Une communauté de solidarité où de faibles cotisations mensuelles créent un vrai soutien funéraire pour les familles au moment le plus important.',
      primaryCta: 'Rejoindre SAGI',
      secondaryCta: 'Voir le fonctionnement',
      sagicamCta: 'Visiter SAGICAM',
      sagiNigeriaCta: 'Visiter SAGINIGERIA',
      imageAlt: 'Famille recevant un accompagnement compatissant avec des documents de soutien'
    },
    heroStats: frenchHeroStats,
    monthlyContributionCard: {
      contributionLabel: (month: string) => `Cotisation par membre de ${month}`,
      deathCountLabel: 'Nombre de décès'
    },
    howIntro: {
      eyebrow: 'Comment fonctionne SAGI',
      title: "Un chemin clair de l'inscription au soutien familial.",
      description:
        "De la première inscription au soutien familial urgent, chaque étape est organisée afin que les membres et les délégués sachent ce qui vient ensuite."
    },
    steps: frenchSteps,
    whoIntro: {
      eyebrow: 'Qui peut rejoindre',
      title: 'Conçu pour les individus, familles, associations et groupes.',
      description:
        'SAGI doit être ouvert et pratique dès la première visite: aucun examen médical, aucune limite de taille de groupe et aucune barrière compliquée.',
      imageAlt: 'Délégué noir consultant les informations des membres sur un téléphone'
    },
    eligibilityHighlights: frenchEligibilityHighlights,
    memberStatusIntro: {
      eyebrow: 'Statut du membre',
      title: 'Savoir exactement où se trouve chaque membre.',
      description:
        'Ces quatre statuts expliquent quand un membre est nouvellement inscrit, en attente de publication, prêt pour le soutien ou demande une action.'
    },
    memberStatuses: frenchMemberStatuses,
    benefitIntro: {
      eyebrow: 'Calendrier des avantages',
      title: 'Quel soutien est disponible selon le statut du membre.',
      description:
        'Un calendrier simple aide les familles et les délégués à comprendre quand le soutien est disponible, suspendu ou encore en attente des étapes d’inscription.',
      imageAlt: 'Famille examinant les documents de soutien avec une conseillère',
      columns: ['Statut', 'Avantage', 'Délai', 'Ce que cela signifie'],
      eligibleStatus: 'Statut admissible'
    },
    benefitSchedule: frenchBenefitSchedule,
    dashboardIntro: {
      eyebrow: 'Tableau de bord délégué',
      title: 'Centre de travail des délégués.',
      description:
        'Les délégués peuvent gérer les détails quotidiens qui gardent les dossiers des membres à jour et les demandes de soutien en mouvement.'
    },
    dashboardActions: frenchDashboardActions,
    dashboardImages: {
      allMembers: 'Aperçu du tableau de tous les membres',
      addMember: 'Aperçu du formulaire d’ajout de membre',
      deathAnnouncement: 'Aperçu du formulaire d’annonce de décès'
    },
    trustIntro: {
      eyebrow: 'Confiance et règles',
      title: 'Montrer les règles avant que les familles en aient besoin.',
      description:
        'La confiance vient d’attentes claires: qui est admissible, ce que les délégués peuvent faire et à quoi ressemble le soutien pendant un moment difficile.'
    },
    trustStats: frenchTrustStats,
    ruleHighlights: frenchRuleHighlights,
    dashboardCta: 'Les délégués peuvent gérer les membres, les documents et les cotisations depuis le tableau de bord.',
    loginCta: 'Connexion',
    testimonialsSection: {
      title: 'Approuvé par les familles et les délégués',
      description: 'Un système de soutien pratique fondé sur des règles claires, des dossiers organisés et la solidarité.'
    },
    testimonials: frenchTestimonialsData,
    faqSection: {
      badge: 'FAQ',
      title: 'Vous avez d’autres questions?',
      description:
        'SAGI combine solidarité, règles claires et tableau de bord autonome pour que les délégués et les familles sachent à quoi s’attendre avant qu’un soutien soit nécessaire.',
      cardTitle: 'Vous ne trouvez pas de réponse?',
      cardDescription:
        'Nous pouvons aider avec l’inscription, le statut des membres, les documents et les questions de soutien funéraire.',
      contactCta: 'Nous contacter'
    },
    faqItems: frenchFaqData,
    contactSection: {
      title: 'Comment pouvons-nous aider?',
      description: 'Vous avez une question ou besoin d’aide? Contactez-nous et trouvons une solution ensemble.',
      infoTitle: 'Coordonnées',
      infoDescription:
        'Si vous n’avez pas trouvé l’information que vous cherchiez, n’hésitez pas à nous contacter.',
      whatsappAriaLabel: 'Discuter avec SAGI sur WhatsApp',
      whatsappLabel: 'Discuter avec SAGI',
      whatsappMessage: "Bonjour SAGI, j’ai besoin d’aide.",
      form: {
        nameLabel: 'Votre nom',
        namePlaceholder: 'Entrez votre nom ici...',
        emailLabel: 'Votre courriel',
        emailPlaceholder: 'Entrez votre courriel ici...',
        subjectLabel: 'Votre sujet',
        subjectPlaceholder: 'Entrez votre sujet ici...',
        messageLabel: 'Message',
        messagePlaceholder: 'Écrivez ici',
        submit: 'Envoyer le message'
      }
    }
  }
}

type HomeContent = (typeof homeContent)[HomeLanguage]

const getLanguage = (params?: HomeSearchParams, cookieLanguage?: string): HomeLanguage => {
  const rawLang = Array.isArray(params?.lang) ? params?.lang[0] : params?.lang

  return normalizeLanguage(rawLang ?? cookieLanguage)
}

const fetchTotalRegisteredMembers = async () => {
  noStore()

  const [activeMembers, removedMembers, deceasedMembers] = await Promise.all([
    db.member.count(),
    db.removedMember.count(),
    db.deceasedMember.count()
  ])

  return activeMembers + removedMembers + deceasedMembers
}

const fetchHeroContributionBanner = async () => {
  noStore()

  const currentMonthAssessment = await fetchLatestAssociationContributionAssessmentForMonth()

  return {
    amountPerMember: Number(currentMonthAssessment?.amountPerVestedMember ?? 0),
    deathCount: currentMonthAssessment?.deathCount ?? 0
  }
}

const Home = async ({ searchParams }: { searchParams?: Promise<HomeSearchParams> }) => {
  const cookieStore = await cookies()
  const params = searchParams ? await searchParams : undefined
  const language = getLanguage(params, cookieStore.get(languageCookieName)?.value)
  const copy = homeContent[language]
  const shouldShowHeroContributionBanner = isHeroContributionBannerVisible(new Date())

  const [heroContributionBanner, totalRegisteredMembers] = await Promise.all([
    shouldShowHeroContributionBanner ? fetchHeroContributionBanner() : Promise.resolve(null),
    fetchTotalRegisteredMembers()
  ])

  return (
    <div lang={language}>
      <HeroSection
        copy={copy}
        heroContributionBanner={heroContributionBanner}
        language={language}
        totalRegisteredMembers={totalRegisteredMembers}
      />
      <HowItWorksSection copy={copy} />
      <WhoCanJoinSection copy={copy} />
      <MemberStatusSection copy={copy} />
      <BenefitScheduleSection copy={copy} />
      <DelegateDashboardSection copy={copy} />
      <FuneralHomesPage language={language} />
      <TrustSection copy={copy} />
      <Testimonials testimonials={copy.testimonials} copy={copy.testimonialsSection} />
      <FAQ faqItems={copy.faqItems} copy={copy.faqSection} />
      <ContactUs copy={copy.contactSection} />
    </div>
  )
}

export default Home

const getTotalRegisteredStat = (totalRegisteredMembers: number, language: HomeLanguage): HeroStat => ({
  value: registeredMemberNumberFormatters[language].format(totalRegisteredMembers),
  label: totalRegisteredLabels[language]
})

function SectionIntro({
  eyebrow,
  title,
  description,
  align = 'center'
}: {
  eyebrow: string
  title: string
  description: string
  align?: 'center' | 'left'
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl space-y-4 text-center' : 'max-w-3xl space-y-4'}>
      <Badge variant='outline' className='border-primary/40 text-primary bg-background/80 px-3 py-1 text-sm'>
        {eyebrow}
      </Badge>
      <h2 className='text-3xl font-semibold tracking-tight text-balance md:text-4xl lg:text-5xl'>{title}</h2>
      <p className='text-muted-foreground text-lg leading-8'>{description}</p>
    </div>
  )
}

function HeroSection({
  copy,
  heroContributionBanner,
  language,
  totalRegisteredMembers
}: {
  copy: HomeContent
  heroContributionBanner: Awaited<ReturnType<typeof fetchHeroContributionBanner>> | null
  language: HomeLanguage
  totalRegisteredMembers: number
}) {
  const heroStatsWithTotalRegistered = [getTotalRegisteredStat(totalRegisteredMembers, language), ...copy.heroStats]
  const currentDate = new Date()
  const heroImage = getRotatingHeroImage(currentDate)

  const contributionAmount = heroContributionBanner
    ? currencyFormatter.format(heroContributionBanner.amountPerMember)
    : null

  const contributionMonth = monthFormatters[language].format(currentDate)

  return (
    <section
      id='home'
      className='relative isolate mt-3 min-h-[82svh] overflow-hidden pt-28 pb-16 sm:mt-4 sm:pt-32 lg:pt-36'
    >
      <Image
        src={heroImage.src}
        alt={heroImage.alt[language]}
        fill
        priority
        unoptimized
        sizes='100vw'
        className='-z-20 object-cover brightness-105 saturate-105'
        style={{ objectPosition: heroImage.objectPosition }}
      />
      <div className='absolute inset-0 -z-10 bg-slate-950/20' />
      <div className='absolute inset-0 -z-10 bg-linear-to-r from-slate-950/82 via-slate-950/48 to-slate-950/12' />

      <div className='mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl space-y-7'>
          <div className='flex flex-wrap items-center gap-3'>
            <Badge className='bg-white/12 text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-white/12'>
              {copy.hero.badge}
            </Badge>
          </div>
          <div className='space-y-5'>
            <h1 className='text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl lg:text-7xl'>
              {copy.hero.title}
            </h1>
            <p className='max-w-4xl text-xl leading-9 font-medium text-white/88 sm:text-2xl sm:leading-10'>
              {copy.hero.description}
            </p>
          </div>

          <div className='flex flex-wrap gap-3'>
            <Button asChild size='lg' className='rounded-full'>
              <Link href='/sign-up' prefetch={false}>
                {copy.hero.primaryCta}
                <ArrowRightIcon className='size-4' />
              </Link>
            </Button>
            <Button
              asChild
              size='lg'
              variant='outline'
              className='rounded-full border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white'
            >
              <Link href={`${language === 'fr' ? '/?lang=fr' : '/'}#how-it-works`}>{copy.hero.secondaryCta}</Link>
            </Button>
            <Button
              asChild
              size='lg'
              variant='outline'
              className='rounded-full border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white'
            >
              <a href={sagicamUrl} target='_blank' rel='noopener noreferrer'>
                {copy.hero.sagicamCta}
                <CameroonFlagIcon />
              </a>
            </Button>
            <Button
              asChild
              size='lg'
              variant='outline'
              className='rounded-full border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white'
            >
              <a href={sagiNigeriaUrl} target='_blank' rel='noopener noreferrer'>
                {copy.hero.sagiNigeriaCta}
                <NigeriaFlagIcon />
              </a>
            </Button>
          </div>
        </div>

        <div className='grid gap-6 border-t border-white/18 pt-6 text-white sm:grid-cols-2 lg:flex lg:items-start lg:justify-between'>
          {heroStatsWithTotalRegistered.map((stat, index) => (
            <div
              key={stat.label}
              className={`space-y-1 lg:max-w-48 ${
                index === 0
                  ? 'lg:text-left'
                  : index === heroStatsWithTotalRegistered.length - 1
                    ? 'lg:text-right'
                    : 'lg:text-center'
              }`}
            >
              <p className='text-3xl font-semibold sm:text-4xl'>{stat.value}</p>
              <p className='text-sm leading-6 text-white/72'>{stat.label}</p>
            </div>
          ))}
        </div>

        {heroContributionBanner ? (
          <div className='grid w-full gap-4 rounded-lg border border-primary/30 bg-primary/20 px-4 py-3 text-white shadow-xl shadow-primary/10 backdrop-blur-md sm:px-5 sm:py-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center'>
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-white/76'>
                {copy.monthlyContributionCard.contributionLabel(contributionMonth)}:
              </p>
              <p className='text-2xl font-extrabold tabular-nums text-emerald-300 sm:text-3xl'>
                {contributionAmount}
              </p>
            </div>
            <div aria-hidden='true' className='h-px w-full bg-white/25 md:h-12 md:w-px' />
            <div className='min-w-0 md:text-right'>
              <p className='text-sm font-semibold text-white/76'>{copy.monthlyContributionCard.deathCountLabel}:</p>
              <p className='text-2xl font-extrabold tabular-nums text-purple-300 sm:text-3xl'>
                {heroContributionBanner.deathCount}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function HowItWorksSection({ copy }: { copy: HomeContent }) {
  return (
    <section id='how-it-works' className='py-16 sm:py-20 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8'>
        <SectionIntro
          eyebrow={copy.howIntro.eyebrow}
          title={copy.howIntro.title}
          description={copy.howIntro.description}
        />

        <ol className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {copy.steps.map((step, index) => (
            <li key={step.title}>
              <Card className='h-full rounded-lg shadow-none'>
                <CardContent className='space-y-5'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='bg-primary/10 text-primary flex size-12 items-center justify-center rounded-lg'>
                      <step.icon className='size-6' />
                    </div>
                    <span className='text-muted-foreground font-mono text-sm'>0{index + 1}</span>
                  </div>
                  <div className='space-y-2'>
                    <h3 className='text-xl font-semibold'>{step.title}</h3>
                    <p className='text-muted-foreground leading-7'>{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function WhoCanJoinSection({ copy }: { copy: HomeContent }) {
  return (
    <section id='join' className='bg-muted py-16 sm:py-20 lg:py-24'>
      <div className='mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8'>
        <div className='relative min-h-88 overflow-hidden rounded-lg lg:min-h-full'>
          <Image
            src='/images/who-can-join-member.webp'
            alt={copy.whoIntro.imageAlt}
            fill
            sizes='(min-width: 1024px) 40vw, 100vw'
            className='object-cover'
          />
        </div>

        <div className='space-y-8'>
          <SectionIntro
            eyebrow={copy.whoIntro.eyebrow}
            title={copy.whoIntro.title}
            description={copy.whoIntro.description}
            align='left'
          />

          <div className='grid gap-3 sm:grid-cols-2'>
            {copy.eligibilityHighlights.map(item => (
              <div key={item} className='bg-background flex items-start gap-3 rounded-lg border p-4'>
                <CheckCircle2Icon className='text-primary mt-0.5 size-5 shrink-0' />
                <span className='font-medium'>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function MemberStatusSection({ copy }: { copy: HomeContent }) {
  return (
    <section id='member-status' className='py-16 sm:py-20 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8'>
        <SectionIntro
          eyebrow={copy.memberStatusIntro.eyebrow}
          title={copy.memberStatusIntro.title}
          description={copy.memberStatusIntro.description}
        />

        <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
          {copy.memberStatuses.map(status => (
            <Card
              key={status.name}
              className={`relative h-full overflow-hidden rounded-lg ${
                status.featured
                  ? `shadow-lg shadow-emerald-950/10 ${status.className}`
                  : `shadow-none ${status.className}`
              }`}
            >
              <CardContent className='flex h-full flex-col gap-6'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='space-y-3'>
                    <Badge
                      variant={status.featured ? 'default' : 'secondary'}
                      className={status.featured ? 'bg-emerald-600 text-white hover:bg-emerald-600' : undefined}
                    >
                      {status.badge}
                    </Badge>
                    <h3 className='text-2xl font-semibold'>{status.name}</h3>
                  </div>
                  <div
                    className={`flex size-11 items-center justify-center rounded-lg border ${
                      status.featured ? 'border-emerald-600 bg-emerald-600 shadow-sm' : 'bg-background'
                    }`}
                  >
                    <status.icon className={status.featured ? 'size-5 text-white' : 'text-primary size-5'} />
                  </div>
                </div>

                <p className='text-muted-foreground leading-7'>{status.description}</p>

                <ul className='mt-auto space-y-3'>
                  {status.points.map(point => (
                    <li key={point} className='flex items-start gap-2 text-sm leading-6'>
                      <CheckCircle2Icon className='text-primary mt-1 size-4 shrink-0' />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function BenefitScheduleSection({ copy }: { copy: HomeContent }) {
  return (
    <section id='benefit-schedule' className='bg-muted py-16 sm:py-20 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8'>
        <div className='grid gap-6 lg:grid-cols-[1fr_26rem] lg:items-end'>
          <SectionIntro
            eyebrow={copy.benefitIntro.eyebrow}
            title={copy.benefitIntro.title}
            description={copy.benefitIntro.description}
            align='left'
          />

          <div className='bg-background overflow-hidden rounded-lg border p-2 shadow-sm lg:justify-self-end'>
            <Image
              src='/images/benefit-support-planning.jpg'
              alt={copy.benefitIntro.imageAlt}
              width={520}
              height={260}
              sizes='(min-width: 1024px) 416px, 100vw'
              className='h-44 w-full rounded-md object-cover object-center sm:h-52 lg:w-[26rem]'
            />
          </div>
        </div>

        <div className='bg-background overflow-hidden rounded-lg border'>
          <div className='bg-muted/60 text-muted-foreground hidden grid-cols-[1fr_0.8fr_1fr_1.35fr] gap-4 border-b px-5 py-3 text-sm font-medium md:grid'>
            {copy.benefitIntro.columns.map(column => (
              <span key={column}>{column}</span>
            ))}
          </div>

          <div className='divide-y'>
            {copy.benefitSchedule.map(item => (
              <div
                key={item.status}
                className={`grid gap-4 px-5 py-5 md:grid-cols-[1fr_0.8fr_1fr_1.35fr] md:items-center ${item.rowClassName}`}
              >
                <div className='flex items-center gap-3'>
                  <div className={`flex size-10 items-center justify-center rounded-lg border ${item.iconClassName}`}>
                    <item.icon className='size-5' aria-hidden='true' />
                  </div>
                  <div>
                    <p className='font-semibold'>{item.status}</p>
                    {item.featured && (
                      <p className='text-xs font-medium text-emerald-700'>{copy.benefitIntro.eligibleStatus}</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className='text-muted-foreground text-xs font-medium md:hidden'>{copy.benefitIntro.columns[1]}</p>
                  <p className='text-lg font-semibold'>{item.benefit}</p>
                </div>

                <div>
                  <p className='text-muted-foreground text-xs font-medium md:hidden'>{copy.benefitIntro.columns[2]}</p>
                  <p className='font-medium'>{item.timing}</p>
                </div>

                <p className='text-muted-foreground leading-7'>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function DelegateDashboardSection({ copy }: { copy: HomeContent }) {
  return (
    <section id='delegate-dashboard' className='bg-muted py-16 sm:py-20 lg:py-24'>
      <div className='mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8'>
        <div className='space-y-8'>
          <SectionIntro
            eyebrow={copy.dashboardIntro.eyebrow}
            title={copy.dashboardIntro.title}
            description={copy.dashboardIntro.description}
            align='left'
          />

          <div className='grid gap-4 sm:grid-cols-2'>
            {copy.dashboardActions.map(action => (
              <Card key={action.title} className='rounded-lg shadow-none'>
                <CardContent className='space-y-4'>
                  <div className='bg-background flex size-11 items-center justify-center rounded-lg border'>
                    <action.icon className='text-primary size-5' />
                  </div>
                  <div className='space-y-2'>
                    <h3 className='font-semibold'>{action.title}</h3>
                    <p className='text-muted-foreground text-sm leading-6'>{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className='grid gap-4'>
          <div className='bg-background overflow-hidden rounded-lg border p-3 shadow-sm'>
            <Image
              src='/images/all-members-table-preview.svg'
              alt={copy.dashboardImages.allMembers}
              width={1060}
              height={640}
              className='h-auto w-full rounded-md'
            />
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='bg-background overflow-hidden rounded-lg border p-3 shadow-sm'>
              <Image
                src='/images/add-member-form-preview.svg'
                alt={copy.dashboardImages.addMember}
                width={600}
                height={460}
                className='h-auto w-full rounded-md'
              />
            </div>
            <div className='bg-background overflow-hidden rounded-lg border p-3 shadow-sm'>
              <Image
                src='/images/death-announcement-form-preview.svg'
                alt={copy.dashboardImages.deathAnnouncement}
                width={600}
                height={460}
                className='h-auto w-full rounded-md'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustSection({ copy }: { copy: HomeContent }) {
  return (
    <section id='trust' className='py-16 sm:py-20 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8'>
        <div className='grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start'>
          <SectionIntro
            eyebrow={copy.trustIntro.eyebrow}
            title={copy.trustIntro.title}
            description={copy.trustIntro.description}
            align='left'
          />

          <div className='grid gap-4 sm:grid-cols-2'>
            {copy.trustStats.map(stat => (
              <Card key={stat.label} className='rounded-lg shadow-none'>
                <CardContent className='space-y-4'>
                  <div className='text-primary bg-primary/10 flex size-11 items-center justify-center rounded-lg'>
                    <stat.icon className='size-5' />
                  </div>
                  <div>
                    <p className='text-3xl font-semibold'>{stat.value}</p>
                    <p className='text-muted-foreground leading-7'>{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          {copy.ruleHighlights.map(rule => (
            <div key={rule} className='bg-muted/50 flex gap-3 rounded-lg border p-5'>
              <FileTextIcon className='text-primary mt-1 size-5 shrink-0' />
              <p className='text-muted-foreground leading-7'>{rule}</p>
            </div>
          ))}
        </div>

        <div className='bg-primary/10 flex flex-wrap items-center justify-between gap-4 rounded-lg border p-5'>
          <div className='flex items-center gap-3'>
            <LayoutDashboardIcon className='text-primary size-6 shrink-0' />
            <p className='font-medium'>
              {copy.dashboardCta}
            </p>
          </div>
          <Button asChild variant='outline' className='rounded-full'>
            <Link href='/sign-in' prefetch={false}>
              {copy.loginCta}
              <ArrowRightIcon className='size-4' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
