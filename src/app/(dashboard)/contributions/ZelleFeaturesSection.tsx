import { Mail, ReceiptText, Smartphone, Zap } from 'lucide-react'

const zelleFeatures = [
  {
    description: 'Money is usually available within minutes when both sides are enrolled with Zelle.',
    icon: Zap,
    title: 'Fast transfer'
  },
  {
    description: 'Use the Zelle option inside your bank or credit union app, online portal, or transfer menu.',
    icon: Smartphone,
    title: 'Use your bank app'
  },
  {
    description: 'Send SAGI payments to info@sagiusa.org after selecting payment to a business.',
    icon: Mail,
    title: 'SAGI email'
  }
] as const

type ZelleFeaturesSectionProps = {
  associationCode: string
}

const ZelleFeaturesSection = ({ associationCode }: ZelleFeaturesSectionProps) => (
  <>
    {zelleFeatures.map(feature => {
      const isSagiEmailFeature = feature.title === 'SAGI email'

      return (
        <div key={feature.title} className='bg-primary/5 rounded-lg p-3 ring-1 ring-primary/15'>
          <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
            <feature.icon className='size-4' aria-hidden='true' />
          </span>
          <p className='text-primary mt-2 text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
            {feature.title}
          </p>
          <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
            {isSagiEmailFeature ? (
              <>
                Send SAGI payments to{' '}
                <span className='font-bold text-green-700 dark:text-green-300'>info@sagiusa.org</span> after selecting
                payment to a business.
              </>
            ) : (
              feature.description
            )}
          </p>
        </div>
      )
    })}

    <div className='bg-primary/5 rounded-lg p-3 ring-1 ring-primary/15'>
      <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
        <ReceiptText className='size-4' aria-hidden='true' />
      </span>
      <p className='text-primary mt-2 text-base leading-tight font-semibold sm:text-lg lg:text-xl'>4-letter memo</p>
      <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
        Add <span className='font-bold text-green-700 dark:text-green-300'>SAGI-{associationCode}</span> in the memo so
        your payment can be matched to your association.
      </p>
    </div>
  </>
)

export default ZelleFeaturesSection
