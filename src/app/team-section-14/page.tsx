import Team from '@/components/shadcn-studio/blocks/team-section-14/team-section-14'

const teamdata = [
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-94.png',
    buttonImg: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-95.png',
    name: 'Anika Kenter',
    title: 'Motion Designer',
    description:
      '"I specialize in creating dynamic animations and motion graphics that bring brands to life. With a keen eye for fluid transitions and engaging visual storytelling, I transform static designs into captivating experiences that resonate with audiences."',
    colorClass: 'bg-green-600/20 dark:bg-green-400/20',
    iconColorClass: 'text-green-600 dark:text-green-400/60',
    facebookLink: '#',
    twitterLink: '#',
    githubLink: '#',
    instagramLink: '#'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-93.png',
    buttonImg: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-96.png',
    name: 'Phillip Bothman',
    title: 'Founder & CEO',
    description:
      '"Working with this team has been an absolute pleasure. Their attention to detail, creative approach, and commitment to quality exceeded our expectations. They understood our vision from day one and transformed it into something even better than we imagined.”',
    colorClass: 'bg-primary/20',
    iconColorClass: 'text-primary',
    facebookLink: '#',
    twitterLink: '#',
    githubLink: '#',
    instagramLink: '#'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-92.png',
    buttonImg: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-102.png',
    name: 'Justin Pasta ',
    title: 'HR Manager',
    description:
      '"I lead our human resources initiatives, focusing on talent acquisition, employee development, and fostering a positive workplace culture. My goal is to build high-performing teams and create an environment where everyone can thrive and reach their full potential."',
    colorClass: 'bg-sky-600/20 dark:bg-sky-400/20',
    iconColorClass: 'text-sky-600 dark:text-sky-400/60',
    facebookLink: '#',
    twitterLink: '#',
    githubLink: '#',
    instagramLink: '#'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-97.png',
    buttonImg: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-98.png',
    name: 'Zain Saris',
    title: 'HR Executive',
    description:
      '"I support our HR operations by managing recruitment processes, employee onboarding, and maintaining personnel records. I ensure smooth HR workflows and help create a welcoming experience for new team members joining our organization."',
    colorClass: 'bg-destructive/20',
    iconColorClass: 'text-destructive',
    facebookLink: '#',
    twitterLink: '#',
    githubLink: '#',
    instagramLink: '#'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-91.png',
    buttonImg: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-99.png',
    name: 'Jordyn Bothman',
    title: 'UI/UX Designer',
    description:
      '"I craft intuitive and beautiful user experiences by combining research-driven insights with creative design solutions. My passion lies in solving complex user problems through clean interfaces and seamless interactions that delight users at every touchpoint."',
    colorClass: 'bg-amber-600/20 dark:bg-amber-400/20',
    iconColorClass: 'text-amber-600 dark:text-amber-400/60',
    facebookLink: '#',
    twitterLink: '#',
    githubLink: '#',
    instagramLink: '#'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-100.png',
    buttonImg: 'https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/team/image-101.png',
    name: 'Kaiya Stanton',
    title: 'UI/UX Designer',
    description:
      '"I design user-centered digital experiences that balance aesthetics with functionality. Through user research, wireframing, and prototyping, I create designs that not only look great but also solve real user needs and drive business goals."',
    colorClass: 'bg-sky-600/20 dark:bg-sky-400/20',
    iconColorClass: 'text-sky-600 dark:text-sky-400/60',
    facebookLink: '#',
    twitterLink: '#',
    githubLink: '#',
    instagramLink: '#'
  }
]

const TeamPage = () => {
  return <Team teamdata={teamdata} />
}

export default TeamPage
