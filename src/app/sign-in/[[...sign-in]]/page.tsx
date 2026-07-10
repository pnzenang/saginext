import { ClerkLoaded, ClerkLoading, SignIn } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

const authAppearance = {
  elements: {
    cardBox: 'shadow-none',
    header:
      "gap-4 before:mx-auto before:block before:h-20 before:w-20 before:bg-[url('/images/sagi-logo.svg')] before:bg-contain before:bg-center before:bg-no-repeat before:content-['']",
    rootBox: 'mx-auto'
  }
}

const AuthLogo = () => (
  <Link href='/' aria-label='SAGI home' className='block'>
    <Image
      src='/images/sagi-logo.svg'
      alt='SAGI logo'
      width={112}
      height={112}
      priority
      className='mx-auto h-20 w-auto'
    />
  </Link>
)

const AuthLoadingCard = () => {
  return (
    <div className='bg-background w-full max-w-md rounded-lg border p-8 shadow-sm'>
      <div className='space-y-6'>
        <div className='space-y-4'>
          <AuthLogo />
          <div className='space-y-2'>
            <div className='bg-muted mx-auto h-7 w-36 animate-pulse rounded-md' />
            <div className='bg-muted mx-auto h-4 w-64 max-w-full animate-pulse rounded-md' />
          </div>
        </div>
        <div className='space-y-3'>
          <div className='bg-muted h-10 w-full animate-pulse rounded-md' />
          <div className='bg-muted h-10 w-full animate-pulse rounded-md' />
          <div className='bg-muted h-10 w-full animate-pulse rounded-md' />
        </div>
      </div>
    </div>
  )
}

const SignInPage = () => {
  return (
    <section className='bg-muted flex min-h-dvh items-center justify-center px-4 py-10'>
      <ClerkLoading>
        <AuthLoadingCard />
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn forceRedirectUrl='/all-members' signUpUrl='/sign-up' appearance={authAppearance} />
      </ClerkLoaded>
    </section>
  )
}

export default SignInPage
