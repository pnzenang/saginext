import FAQ from '@/components/shadcn-studio/blocks/faq-component-19/faq-component-19'

const faqItems = [
  {
    question: 'What is this app, and how can it help me?',
    answer:
      'This app helps you track your daily expenses, set budgets, and manage your finances more effectively. It provides you with the tools you need to understand your spending patterns.'
  },
  {
    question: 'Is there a free trial available?',
    answer:
      'Yes, we offer a 14-day free trial that gives you full access to all premium features. No credit card required to start your trial, and you can cancel anytime during the trial period.'
  },
  {
    question: 'Which payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment gateway.'
  },
  {
    question: 'How does the app keep my financial data secure?',
    answer:
      'We use bank-level 256-bit SSL encryption to protect your data. Your financial information is stored on secure servers and we never share your personal data with third parties without your explicit consent.'
  },
  {
    question: 'I need help with the app. How can I contact support?',
    answer:
      'You can reach our support team 24/7 through live chat, email at support@example.com, or by submitting a ticket through the app. We typically respond within 2-4 hours during business days.'
  }
]

const FAQPage = () => {
  return <FAQ faqItems={faqItems} />
}

export default FAQPage
