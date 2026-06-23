import { SignIn } from '@clerk/nextjs'

const SignInPage = () => {
  return (
    <section className='bg-muted flex min-h-dvh items-center justify-center px-4 py-10'>
      <SignIn
        forceRedirectUrl='/profile/create'
        signUpUrl='/sign-up'
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            cardBox: 'shadow-none'
          }
        }}
      />
    </section>
  )
}

export default SignInPage
