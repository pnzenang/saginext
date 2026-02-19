import { fetchProfile } from '@/utils/actions';
import {
  LuInfinity as InfinityIcon,
  LuMessagesSquare,
  LuZap,
  LuZoomIn,
} from 'react-icons/lu';

const feature = [
  {
    title: 'Quality',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi necessitatibus, culpa at vitae molestias tenetur explicabo.',
    icon: <LuZoomIn className='size-6' />,
  },
  {
    title: 'Innovation',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi necessitatibus, culpa at vitae molestias tenetur explicabo.',
    icon: <LuZap className='size-6' />,
  },
  {
    title: 'Customer Support',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi necessitatibus, culpa at vitae molestias tenetur explicabo.',
    icon: <LuMessagesSquare className='size-6' />,
  },
  {
    title: 'Customer Support',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi necessitatibus, culpa at vitae molestias tenetur explicabo.',
    icon: <LuMessagesSquare className='size-6' />,
  },
  {
    title: 'Customer Support',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi necessitatibus, culpa at vitae molestias tenetur explicabo.',
    icon: <LuMessagesSquare className='size-6' />,
  },
  {
    title: 'Customer Support',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi necessitatibus, culpa at vitae molestias tenetur explicabo.',
    icon: <LuMessagesSquare className='size-6' />,
  },
  {
    title: 'Customer Support',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi necessitatibus, culpa at vitae molestias tenetur explicabo.',
    icon: <LuMessagesSquare className='size-6' />,
  },
  {
    title: 'Reliability',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi necessitatibus, culpa at vitae molestias tenetur explicabo.',
    icon: <InfinityIcon className='size-6' />,
  },
];

const NavigationInstructions = async () => {
  const profile = await fetchProfile();
  return (
    <section className='py-52'>
      <div className='container'>
        <div className='flex w-full flex-col items-center'>
          <div className='flex flex-col items-center space-y-4 text-center sm:space-y-6 md:max-w-5xl md:text-center'>
            <h2 className='text-4xl md:text-5xl lg:text-7xl font-bold'>
              Navigation Instructions
            </h2>

            <p className='text-muted-foreground md:max-w-2xl'>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi
              necessitatibus, culpa at vitae molestias tenetur explicabo.
              Voluptatum amet architecto suscipit pariatur eligendi repellendus
              mollitia dolore unde sint?
            </p>
          </div>
        </div>
        <div className='mx-auto mt-20 grid max-w-7xl gap-6 md:grid-cols-2'>
          {feature.map((feature, idx) => (
            <div
              className='flex flex-col justify-between rounded-lg bg-accent p-6 md:min-h-[300px] md:p-8'
              key={idx}
            >
              <span className='mb-6 flex size-11 items-center justify-center rounded-full bg-background'>
                {feature.icon}
              </span>
              <div>
                <h3 className='text-lg font-medium md:text-2xl'>
                  {feature.title}
                </h3>
                <p className='mt-2 text-muted-foreground'>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NavigationInstructions;
