import { Check } from 'lucide-react'

const features = [
  {
    title: 'No Health Checks, No Problem.',
    description:
      'Everybody can Join SAGI if they meet the basic requirements of being ready to participate, SAGI is open to all, it is meant to be inclusive and welcoming to everyone.',
    icon: Check
  },
  {
    title: 'No minimum or maximum group size',
    description:
      'Group of any size can join, the organization is designed to be flexible and accommodating, so Individuals can participate, groups, families and associations are welcome.',
    icon: Check
  },
  {
    title: '100% self-service',
    description:
      'Group administrators have full control over their group,  on their dashboard, No need to send emails to remove or add members, announce deaths or send documents .',
    icon: Check
  },
  {
    title: 'Responsive by Default',
    description:
      'Every delegate has the ability to access and interact with the platform seamlessly across all devices. Whether you are on a desktop, tablet, or smartphone, you can manage your group.',
    icon: Check
  },
  {
    title: 'No Limitations on Nationality',
    description:
      'SAGI is open to all, it is meant to be inclusive and welcoming to everyone, regardless of their nationality or language.',
    icon: Check
  },
  {
    title: 'No Age Limitations',
    description:
      'SAGI welcome all ages as far as you can participate, we understand that life is unpredictable, so there are no age limitations for joining SAGI.',
    icon: Check
  }
]

const Features = () => {
  return (
    <div className='mx-auto flex max-w-7xl flex-col gap-12 rounded-lg px-6 py-12 sm:px-8 sm:py-14 lg:px-12'>
      <h2 className='text-center text-4xl font-semibold tracking-tight text-pretty sm:text-4xl lg:text-6xl'>
        Easy to Join and participate.
      </h2>
      <p className='text-muted-foreground text-center text-xl sm:text-2xl'>Just register and start participating.</p>

      <div className='mt-2 grid grid-cols-1 gap-6 sm:mt-5 sm:grid-cols-2 lg:grid-cols-3'>
        {features.map((feature, index) => (
          <div className='border-primary/20 bg-primary/10 rounded-lg border px-5 py-7' key={index}>
            <div className='bg-primary/10 text-primary dark:bg-primary/15 flex h-10 w-10 items-center justify-center rounded-lg'>
              <feature.icon />
            </div>
            <h3 className='mt-5 text-xl font-semibold tracking-[-0.005em]'>{feature.title}</h3>
            <p className='text-foreground/90 mt-2 text-base'>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Features
