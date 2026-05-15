'use client'

import { useEffect, useState } from 'react'

import { motion } from 'motion/react'
import { MoveDownLeftIcon, MoveUpRightIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { MotionPreset } from '@/components/ui/motion-preset'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Orbiting } from '@/components/ui/orbiting'

import { cn } from '@/lib/utils'

export type TransactionItem = {
  id: string
  amount: number
  type: 'debit' | 'credit'
}

const UpdatedBalanceCard = ({
  balance,
  transactions,
  categories
}: {
  balance: number
  transactions: TransactionItem[]
  categories: string[]
}) => {
  const [apiLeft, setApiLeft] = useState<CarouselApi>()
  const [apiRight, setApiRight] = useState<CarouselApi>()
  const [currentBalance, setCurrentBalance] = useState(balance)
  const [current, setCurrent] = useState(0)
  const [isFirstRender, setIsFirstRender] = useState(true)

  useEffect(() => {
    if (!apiLeft) return

    const interval = setInterval(() => {
      apiLeft.scrollPrev()
    }, 3000)

    apiLeft.on('select', () => {
      setCurrent(apiLeft.selectedScrollSnap() + 1)
    })

    return () => clearInterval(interval)
  }, [apiLeft])

  useEffect(() => {
    if (!apiRight) return

    const interval = setInterval(() => {
      apiRight.scrollPrev()
    }, 3000)

    return () => clearInterval(interval)
  }, [apiRight])

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false)

      return
    }

    setCurrentBalance(prev =>
      transactions[current % transactions.length].type === 'credit'
        ? prev + transactions[current % transactions.length].amount
        : prev - transactions[current % transactions.length].amount
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, transactions])

  return (
    <Card className='group/palette bg-muted h-full border-0 shadow-none lg:col-span-2'>
      <MotionPreset
        fade
        blur
        slide={{ direction: 'down', offset: 15 }}
        delay={0.15}
        transition={{ duration: 0.5 }}
        className='relative flex h-87.5 items-center justify-center overflow-hidden py-3'
      >
        <div className='flex w-full flex-col items-center justify-center gap-7'>
          <div className='relative z-2 flex w-full items-center'>
            <div className='bg-border absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2' />
            <div className='from-muted pointer-events-none absolute top-1/2 left-0 h-1 w-[calc(50%-72px)] -translate-y-1/2 bg-linear-to-r to-transparent lg:w-[calc(50%-80px)]' />
            <div className='from-muted pointer-events-none absolute top-1/2 right-0 h-1 w-[calc(50%-72px)] -translate-y-1/2 bg-linear-to-l to-transparent lg:w-[calc(50%-80px)]' />
            <Carousel
              setApi={setApiLeft}
              opts={{
                align: 'end',
                watchDrag: false,
                loop: true
              }}
              className='w-[calc(50%-72px)] lg:w-[calc(50%-80px)]'
            >
              <CarouselContent className='ml-4 py-4'>
                {transactions.map(transaction => (
                  <CarouselItem key={transaction.id} className='pr-4 pl-0 sm:max-md:basis-1/2 xl:basis-1/2'>
                    <span
                      className={cn(
                        'bg-card flex items-center justify-center gap-1 rounded-full px-3 py-2 text-sm shadow-xl',
                        {
                          'text-destructive': transaction.type === 'debit',
                          'text-green-600 dark:text-green-400': transaction.type === 'credit'
                        }
                      )}
                    >
                      {transaction.type === 'debit' ? (
                        <MoveDownLeftIcon className='size-3.5 shrink-0' />
                      ) : (
                        <MoveUpRightIcon className='size-3.5 shrink-0' />
                      )}
                      ${transaction.amount}
                    </span>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <div className='bg-background relative flex w-36 shrink-0 flex-col items-center rounded-xl border px-4.5 py-4 lg:w-40'>
              <span className='text-muted-foreground text-sm lg:text-base'>Current balance</span>
              <span className='text-xl font-semibold lg:text-2xl'>
                $<NumberTicker value={currentBalance} delay={0.2} />
              </span>
              <span className='bg-border absolute top-1/2 left-0 -z-1 size-1.5 -translate-x-1 -translate-y-1/2 rounded-full' />
              <span className='bg-border absolute top-1/2 right-0 -z-1 size-1.5 translate-x-1 -translate-y-1/2 rounded-full' />
            </div>

            <Carousel
              setApi={setApiRight}
              opts={{
                align: 'start',
                watchDrag: false,
                loop: true,
                startIndex: 2
              }}
              className='w-[calc(50%-72px)] lg:w-[calc(50%-80px)]'
            >
              <CarouselContent className='mr-4 ml-0 py-4'>
                {transactions.map(transaction => (
                  <CarouselItem key={transaction.id} className='sm:max-md:basis-1/2 xl:basis-1/2'>
                    <span
                      className={cn(
                        'bg-card flex items-center justify-center gap-1 rounded-full px-3 py-2 text-sm shadow-xl',
                        {
                          'text-destructive': transaction.type === 'debit',
                          'text-green-600 dark:text-green-400': transaction.type === 'credit'
                        }
                      )}
                    >
                      {transaction.type === 'debit' ? (
                        <MoveDownLeftIcon className='size-3.5 shrink-0' />
                      ) : (
                        <MoveUpRightIcon className='size-3.5 shrink-0' />
                      )}
                      ${transaction.amount}
                    </span>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          <motion.div
            animate={{
              rotateX: [-4, 4, -4],
              rotateZ: [-4, 4, -4]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className='relative z-1 flex w-40 origin-top justify-center'
          >
            <div className='bg-border absolute bottom-0 left-7.5 h-20 w-0.5 -translate-y-24'>
              <span className='bg-border absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 translate-y-full rounded-full' />
            </div>
            <div className='bg-border absolute right-7.5 bottom-0 h-20 w-0.5 -translate-y-24'>
              <span className='bg-border absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 translate-y-full rounded-full' />
            </div>
            <div className='bg-card relative z-1 grid size-30 place-content-center rounded-full'>
              <img
                src='/images/happy.webp'
                alt='Happy Face'
                className={cn(
                  'absolute top-1/2 left-1/2 size-22.5 -translate-x-1/2 -translate-y-1/2 transition-all duration-350 ease-in-out',
                  {
                    'rotate-y-180 opacity-0!': transactions[current % transactions.length].type === 'debit'
                  }
                )}
              />
              <img
                src='/images/sad.webp'
                alt='Sad Face'
                className={cn(
                  'absolute top-1/2 left-1/2 size-22.5 -translate-x-1/2 -translate-y-1/2 transition-all duration-350 ease-in-out',
                  {
                    'rotate-y-180 opacity-0!': transactions[current % transactions.length].type === 'credit'
                  }
                )}
              />
            </div>
          </motion.div>
        </div>

        <div className='absolute inset-x-0 bottom-0 flex h-30 items-start justify-center'>
          <div className='relative flex size-200 flex-col items-center justify-center'>
            <Orbiting duration={54} radius={400} path={false} className='animate-orbiting'>
              {Array(3)
                .fill(categories)
                .flat()
                .map((category, index) => (
                  <span
                    key={index}
                    className='bg-card text-muted-foreground flex min-w-25 justify-center rounded-full px-3 py-2 text-xs font-light shadow-xl'
                  >
                    {category}
                  </span>
                ))}
            </Orbiting>
          </div>
          <div className='from-muted pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t to-transparent' />
        </div>
      </MotionPreset>

      <CardContent className='flex flex-col gap-4 md:items-center'>
        <MotionPreset
          component='h3'
          fade
          blur
          slide={{ direction: 'down', offset: 15 }}
          delay={0.3}
          transition={{ duration: 0.5 }}
          className='text-xl font-semibold md:text-center md:text-2xl'
        >
          Know exactly where your money goes
        </MotionPreset>
        <MotionPreset
          component='p'
          fade
          blur
          slide={{ direction: 'down', offset: 15 }}
          delay={0.45}
          transition={{ duration: 0.5 }}
          className='text-muted-foreground text-base md:text-center md:text-lg'
        >
          Categorize your expenses and monitor your spending habits to make smarter decisions and stay within your
          budget.
        </MotionPreset>
      </CardContent>
    </Card>
  )
}

export default UpdatedBalanceCard
