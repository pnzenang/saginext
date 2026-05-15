import Team from '@/components/shadcn-studio/blocks/team-section-04/team-section-04'

const teamMembers = [
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-6.png',
    alt: 'Phillip Rothman',
    name: 'Phillip Rothman',
    role: 'Founder & CEO',
    bgColor: 'bg-sky-600/10 dark:bg-sky-600/10',
    avatarBg: 'bg-sky-600/40 dark:bg-sky-600/40',
    socialLinkColor: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      github: '#',
      instagram: '#'
    }
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-2.png',
    alt: 'James Kenter',
    name: 'James Kenter',
    role: 'Engineering Manager',
    bgColor: 'bg-primary/10',
    avatarBg: 'bg-primary/40',
    socialLinkColor: 'group-hover:text-primary',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      github: '#',
      instagram: '#'
    }
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-4.png',
    alt: 'Alena Lubin',
    name: 'Alena Lubin',
    role: 'Frontend Developer',
    bgColor: 'bg-green-600/10 dark:bg-green-600/10',
    avatarBg: 'bg-green-600/40 dark:bg-green-600/40',
    socialLinkColor: 'group-hover:text-green-600 dark:group-hover:text-green-400',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      github: '#',
      instagram: '#'
    }
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-3.png',
    alt: 'Cristofer Kenter',
    name: 'Cristofer Kenter',
    role: 'Product Designer',
    bgColor: 'bg-destructive/10',
    avatarBg: 'bg-destructive/40',
    socialLinkColor: 'group-hover:text-destructive',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      github: '#',
      instagram: '#'
    }
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-7.png',
    alt: 'Carter Saris',
    name: 'Carter Saris',
    role: 'UX Researcher',
    bgColor: 'bg-amber-600/10 dark:bg-amber-600/10',
    avatarBg: 'bg-amber-600/40 dark:bg-amber-600/40',
    socialLinkColor: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      github: '#',
      instagram: '#'
    }
  }
]

const TeamPage = () => {
  return <Team teamMembers={teamMembers} />
}

export default TeamPage
