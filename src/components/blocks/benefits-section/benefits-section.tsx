import LogoVector from '@/assets/svg/logo-vector'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { MotionPreset } from '@/components/ui/motion-preset'

import AccountingOfTransaction from '@/components/blocks/benefits-section/accounting-of-transaction'
import type { TransactionRow } from '@/components/blocks/benefits-section/accounting-of-transaction'
import ExchangeCurrencyCard from '@/components/blocks/benefits-section/exchange-currency-card'
import UpdatedBalanceCard from '@/components/blocks/benefits-section/updated-balanced-card'
import type { TransactionItem } from '@/components/blocks/benefits-section/updated-balanced-card'

const BenefitsSection = ({
  accountTransactions,
  transactions,
  spendingCategories
}: {
  accountTransactions: TransactionRow[]
  transactions: TransactionItem[]
  spendingCategories: string[]
}) => {
  return (
    <section id='benefits' className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
          <MotionPreset fade slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }}>
            <Badge className='border-primary text-primary px-3 py-1 text-sm uppercase [&>svg]:size-6' variant='outline'>
              <LogoVector className='animation-duration-[2s] size-6 animate-spin' /> Benefits
            </Badge>
          </MotionPreset>

          <MotionPreset
            component='h2'
            className='text-2xl font-semibold md:text-3xl lg:text-4xl'
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.2}
            transition={{ duration: 0.7 }}
          >
            Key Benefits of Using Our App
          </MotionPreset>

          <MotionPreset
            component='p'
            className='text-muted-foreground text-lg md:text-xl'
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.4}
            transition={{ duration: 0.7 }}
          >
            Enjoy effortless money management with tools designed to help you spend wisely
          </MotionPreset>
        </div>
        {/* Grid Section */}
        <div className='space-y-6'>
          {/* Grid Row 1 */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Card 1 */}
            <MotionPreset fade blur slide={{ direction: 'down', offset: 15 }} transition={{ duration: 0.5 }}>
              <UpdatedBalanceCard balance={21432} transactions={transactions} categories={spendingCategories} />
            </MotionPreset>

            {/* Card 2 */}
            <MotionPreset
              fade
              blur
              slide={{ direction: 'down', offset: 15 }}
              delay={0.6}
              transition={{ duration: 0.5 }}
            >
              <AccountingOfTransaction transactions={accountTransactions} />
            </MotionPreset>
          </div>

          {/* Grid Row 2 */}
          <div className='grid gap-6 xl:grid-cols-5'>
            {/* Card 3 - Beautiful and Clean UI */}
            <MotionPreset
              fade
              blur
              slide={{ direction: 'down', offset: 15 }}
              delay={1.2}
              transition={{ duration: 0.5 }}
              className='min-h-140 sm:min-h-130 md:min-h-97.5 xl:col-span-3'
            >
              <Card className='group bg-muted relative h-full overflow-hidden border-0 shadow-none'>
                <CardContent className='flex h-full items-center justify-between gap-6 max-md:flex-col'>
                  <div className='flex flex-col gap-4 md:max-w-70.25'>
                    <MotionPreset
                      component='h3'
                      fade
                      blur
                      slide={{ direction: 'down', offset: 15 }}
                      delay={1.35}
                      className='text-2xl font-semibold md:text-3xl lg:text-4xl'
                    >
                      Beautiful and Clean UI
                    </MotionPreset>
                    <MotionPreset
                      component='p'
                      fade
                      blur
                      slide={{ direction: 'down', offset: 15 }}
                      delay={1.5}
                      className='text-muted-foreground text-base md:text-lg'
                    >
                      A sleek and intuitive interface, so you can navigate your finances effortlessly and you can save
                      time & money every day.
                    </MotionPreset>
                  </div>

                  <MotionPreset
                    fade
                    blur
                    slide={{ direction: 'down', offset: 15 }}
                    delay={1.65}
                    className='relative size-full'
                  >
                    <img
                      src='/images/clean-ui-mobile.webp'
                      alt='Mobile image'
                      className='absolute -bottom-6 h-86.25 transition-transform duration-300 group-hover:scale-105 max-md:left-1/2 max-md:-translate-x-1/2 md:right-10 dark:hidden'
                    />
                    <img
                      src='/images/clean-ui-mobile-dark.webp'
                      alt='Mobile image dark'
                      className='absolute -bottom-6 hidden h-86.25 transition-transform duration-300 group-hover:scale-105 max-md:left-1/2 max-md:-translate-x-1/2 md:right-10 dark:block'
                    />
                  </MotionPreset>
                </CardContent>
              </Card>
            </MotionPreset>

            {/* Card 4 - Exchange Currency */}
            <MotionPreset
              fade
              blur
              slide={{ direction: 'down', offset: 15 }}
              delay={1.8}
              transition={{ duration: 0.5 }}
              className='xl:col-span-2'
            >
              <ExchangeCurrencyCard />
            </MotionPreset>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BenefitsSection
