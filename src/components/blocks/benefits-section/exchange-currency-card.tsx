'use client'

import { useEffect, useState } from 'react'

import { motion, AnimatePresence } from 'motion/react'

import { ArrowDownIcon, ArrowUpDown, ArrowUpIcon, CheckIcon, DollarSignIcon, EuroIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { MotionPreset } from '@/components/ui/motion-preset'

import { cn } from '@/lib/utils'

const ExchangeCurrencyCard = () => {
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const processingTimer = setTimeout(() => {
      setIsCompleted(true)
    }, 2800)

    const resetTimer = setTimeout(() => {
      setIsCompleted(false)
    }, 5000)

    return () => {
      clearTimeout(processingTimer)
      clearTimeout(resetTimer)
    }
  }, [isCompleted])

  return (
    <Card className='bg-muted h-full border-0 shadow-none'>
      <MotionPreset
        fade
        blur
        slide={{ direction: 'down', offset: 15 }}
        delay={1.95}
        className='flex min-h-55 flex-col items-center gap-2 px-6'
      >
        <div className='flex items-center justify-center'>
          <motion.div
            className='flex justify-center'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <div className='relative flex items-center justify-center'>
              <motion.div
                className='absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl dark:bg-emerald-500/5'
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  times: [0, 0.5, 1],
                  ease: [0.22, 1, 0.36, 1]
                }}
              />
              <AnimatePresence mode='wait'>
                {!isCompleted ? (
                  <motion.div
                    key='progress'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{
                      opacity: 0,
                      rotate: 360
                    }}
                    transition={{
                      duration: 0.6,
                      ease: 'easeInOut'
                    }}
                    className='bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-full'
                  >
                    <div className='relative z-10'>
                      <motion.div
                        className='absolute inset-0 rounded-full border-2 border-transparent'
                        animate={{
                          rotate: 360,
                          scale: [1, 1.02, 1]
                        }}
                        transition={{
                          rotate: {
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear'
                          },
                          scale: {
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }
                        }}
                      />
                      <ArrowUpDown className='size-5' />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key='completed'
                    initial={{
                      opacity: 0,
                      rotate: -180
                    }}
                    animate={{
                      opacity: 1,
                      rotate: 0
                    }}
                    transition={{
                      duration: 0.6,
                      ease: 'easeInOut'
                    }}
                    className='bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-full'
                  >
                    <CheckIcon className='size-5' strokeWidth={3.5} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
        <div className='flex w-71.75 flex-col'>
          <motion.div
            className='w-full space-y-3 text-center'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <AnimatePresence mode='wait'>
              {isCompleted ? (
                <motion.h2
                  key='completed-title'
                  className='text-muted-foreground text-xs'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  Transfer Completed
                </motion.h2>
              ) : (
                <motion.h2
                  key='progress-title'
                  className='text-muted-foreground text-xs'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  Processing Transaction...
                </motion.h2>
              )}
            </AnimatePresence>
            <div className='mt-4 flex items-center gap-4'>
              <motion.div
                className='relative flex-1'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <motion.div
                  className='relative flex flex-col items-start'
                  initial={{ gap: '12px' }}
                  animate={{
                    gap: isCompleted ? '0px' : '12px'
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.32, 0.72, 0, 1]
                  }}
                >
                  <motion.div
                    className={cn(
                      'bg-card flex w-full justify-between rounded-xl px-3 py-1.5',
                      isCompleted && 'rounded-b-none border-b-0'
                    )}
                    animate={{
                      y: 0,
                      scale: 1
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.32, 0.72, 0, 1]
                    }}
                  >
                    <div className='space-y-1.5'>
                      <motion.span
                        className='text-muted-foreground flex items-center gap-1.5 text-xs'
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                      >
                        <ArrowUpIcon className='size-4' />
                        From
                      </motion.span>
                      <div className='flex flex-col gap-1.5'>
                        <motion.div
                          className='group flex items-center gap-2.5'
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.22, 1, 0.36, 1]
                          }}
                        >
                          <motion.span
                            className='inline-flex size-6 items-center justify-center rounded-md border text-sm font-medium transition-colors duration-300'
                            whileHover={{
                              scale: 1.05
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 10
                            }}
                          >
                            <DollarSignIcon className='size-3' />
                          </motion.span>
                          <AnimatePresence mode='wait'>
                            <motion.span
                              key={isCompleted ? 'completed-amount' : 'processing-amount'}
                              initial={{
                                opacity: isCompleted ? 1 : 0.5
                              }}
                              animate={{
                                opacity: isCompleted ? 1 : 0.5
                              }}
                              exit={{
                                opacity: isCompleted ? 1 : 0.5
                              }}
                              transition={{
                                duration: 0.3,
                                ease: [0.22, 1, 0.36, 1]
                              }}
                            >
                              $800
                            </motion.span>
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </div>

                    <div className='flex flex-col items-end gap-3.5'>
                      <Avatar className='size-5'>
                        <AvatarImage src='/images/avatar/8.webp' alt='John Carter' />
                        <AvatarFallback className='text-xs'>JC</AvatarFallback>
                      </Avatar>
                      <motion.span
                        className='text-muted-foreground text-xs'
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                      >
                        John Carter
                      </motion.span>
                    </div>
                  </motion.div>
                  <motion.div
                    className={cn(
                      'bg-card flex w-full justify-between rounded-xl px-3 py-1.5',
                      isCompleted && 'rounded-t-none border-t-0'
                    )}
                    animate={{
                      y: 0,
                      scale: 1
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.32, 0.72, 0, 1]
                    }}
                  >
                    <div className='space-y-1.5'>
                      <motion.span
                        className='text-muted-foreground flex items-center gap-1.5 text-xs'
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                      >
                        <ArrowDownIcon className='size-4' />
                        To
                      </motion.span>
                      <div className='flex flex-col gap-1.5'>
                        <motion.div
                          className='group flex items-center gap-2.5'
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.22, 1, 0.36, 1]
                          }}
                        >
                          <motion.span
                            className='inline-flex size-6 items-center justify-center rounded-md border text-sm font-medium transition-colors duration-300'
                            whileHover={{
                              scale: 1.05
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 10
                            }}
                          >
                            <EuroIcon className='size-3' />
                          </motion.span>
                          <AnimatePresence mode='wait'>
                            <motion.span
                              key={isCompleted ? 'completed-amount' : 'processing-amount'}
                              initial={{
                                opacity: isCompleted ? 1 : 0.5
                              }}
                              animate={{
                                opacity: isCompleted ? 1 : 0.5
                              }}
                              exit={{
                                opacity: isCompleted ? 1 : 0.5
                              }}
                              transition={{
                                duration: 0.3,
                                ease: [0.22, 1, 0.36, 1]
                              }}
                            >
                              $678
                            </motion.span>
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </div>

                    <div className='flex flex-col items-end gap-3.5'>
                      <Avatar className='size-5'>
                        <AvatarImage src='/images/avatar/11.webp' alt='Dustin porier' />
                        <AvatarFallback className='text-xs'>DP</AvatarFallback>
                      </Avatar>
                      <motion.span
                        className='text-muted-foreground text-xs'
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                      >
                        Dustin porier
                      </motion.span>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </MotionPreset>
      <CardContent className='flex flex-col gap-4 md:items-center'>
        <MotionPreset
          component='h3'
          fade
          blur
          slide={{ direction: 'down', offset: 15 }}
          delay={2.1}
          className='text-xl font-semibold md:text-center md:text-2xl'
        >
          Exchange currency with ease
        </MotionPreset>
        <MotionPreset
          component='p'
          fade
          blur
          slide={{ direction: 'down', offset: 15 }}
          delay={2.25}
          className='text-muted-foreground text-base md:text-center md:text-lg'
        >
          Send and receive money across currencies effortlessly and securely.
        </MotionPreset>
      </CardContent>
    </Card>
  )
}

export default ExchangeCurrencyCard
