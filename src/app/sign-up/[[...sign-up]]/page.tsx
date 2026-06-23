import { SignUp } from '@clerk/nextjs'

const SignUpPage = () => {
  return (
    <section className='bg-muted flex min-h-dvh items-center justify-center px-4 py-10'>
      <SignUp
        forceRedirectUrl='/profile/create'
        signInUrl='/sign-in'
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

export default SignUpPage
