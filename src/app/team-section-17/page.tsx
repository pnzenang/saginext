import Team2 from '@/components/shadcn-studio/blocks/team-section-17/team-section-17'

const teamMembers = [
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-69.png',
    name: 'Sarah Mitchell',
    role: 'Founder & CEO',
    bgClass: 'bg-primary/10',
    imageClass: 'bg-primary/20'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-70.png',
    name: 'Marcus Chen',
    role: 'Chief Technology Officer',
    bgClass: 'bg-green-600/10 dark:bg-green-400/10',
    imageClass: 'bg-green-600/40 dark:bg-green-400/40'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-71.png',
    name: 'David Thompson',
    role: 'Senior Software Engineer',
    bgClass: 'bg-amber-600/10 dark:bg-amber-400/10',
    imageClass: 'bg-amber-600/40 dark:bg-amber-400/40'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-72.png',
    name: 'James Rodriguez',
    role: 'Backend Developer',
    bgClass: 'bg-sky-600/10 dark:bg-sky-400/10',
    imageClass: 'bg-sky-600/40 dark:bg-sky-400/40'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-73.png',
    name: 'Michael Anderson',
    role: 'DevOps Engineer',
    bgClass: 'bg-destructive/10',
    imageClass: 'bg-destructive/40'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-74.png',
    name: 'Emma Williams',
    role: 'UI/UX Designer',
    bgClass: 'bg-primary/10',
    imageClass: 'bg-primary/20'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-75.png',
    name: 'Robert Martinez',
    role: 'Frontend Developer',
    bgClass: 'bg-green-600/10 dark:bg-green-400/10',
    imageClass: 'bg-green-600/40 dark:bg-green-400/40'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-76.png',
    name: 'Daniel Brown',
    role: 'Product Manager',
    bgClass: 'bg-amber-600/10 dark:bg-amber-400/10',
    imageClass: 'bg-amber-600/40 dark:bg-amber-400/40'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-77.png',
    name: 'Jessica Taylor',
    role: 'Marketing Director',
    bgClass: 'bg-sky-600/10 dark:bg-sky-400/10',
    imageClass: 'bg-sky-600/40 dark:bg-sky-400/40'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-78.png',
    name: 'Olivia Garcia',
    role: 'Head of Design',
    bgClass: 'bg-destructive/10',
    imageClass: 'bg-destructive/40'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-70.png',
    name: 'Christopher Lee',
    role: 'Software Architect',
    bgClass: 'bg-primary/10',
    imageClass: 'bg-primary/20'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-72.png',
    name: 'Andrew Wilson',
    role: 'Data Engineer',
    bgClass: 'bg-green-600/10 dark:bg-green-400/10',
    imageClass: 'bg-green-600/40 dark:bg-green-400/40'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-73.png',
    name: 'Matthew Johnson',
    role: 'Security Engineer',
    bgClass: 'bg-amber-600/10 dark:bg-amber-400/10',
    imageClass: 'bg-amber-600/40 dark:bg-amber-400/40'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-75.png',
    name: 'Joshua Davis',
    role: 'Mobile Developer',
    bgClass: 'bg-sky-600/10 dark:bg-sky-400/10',
    imageClass: 'bg-sky-600/40 dark:bg-sky-400/40'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-71.png',
    name: 'Anthony Moore',
    role: 'QA Engineer',
    bgClass: 'bg-destructive/10',
    imageClass: 'bg-destructive/40'
  }
]

const TeamPage = () => {
  return <Team2 teamMembers2={teamMembers} />
}

export default TeamPage
