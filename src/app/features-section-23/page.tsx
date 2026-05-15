import { ActivityIcon, DatabaseIcon, LightbulbIcon, TrendingUpIcon } from 'lucide-react'

import Features from '@/components/shadcn-studio/blocks/features-section-23/features-section-23'

const initialProcess = [
  {
    id: '1',
    icon: <DatabaseIcon />,
    title: 'Connect Your Data',
    description:
      'Bring all your marketing tools together — from social platforms to analytics dashboards — and centralize your data in one seamless hub.'
  },
  {
    id: '2',
    icon: <ActivityIcon />,
    title: 'Analyze in Real Time',
    description:
      'Monitor performance as it happens with real-time insights that help you identify trends, measure impact, and make quick adjustments.'
  },
  {
    id: '3',
    icon: <LightbulbIcon />,
    title: 'Gain Actionable Insights',
    description:
      'Turn complex metrics into meaningful insights with easy-to-read visuals and reports designed to guide smarter marketing decisions.'
  },
  {
    id: '4',
    icon: <TrendingUpIcon />,
    title: 'Measure and Grow',
    description:
      'Evaluate your results with detailed analytics and performance tracking. Understand what drives success, refine your marketing efforts, and grow with confidence.'
  }
]

const FeaturesPage = () => {
  return <Features features={initialProcess} />
}

export default FeaturesPage
