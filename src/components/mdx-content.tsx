import type { JSX } from 'react'

import Link from 'next/link'

import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote-client/rsc'

const components: MDXRemoteProps['components'] = {
  h1: ({ children }) => <h1 className='text-3xl font-bold'>{children}</h1>,
  h2: ({ children }) => <h2 className='mt-8 text-2xl font-semibold'>{children}</h2>,
  h3: ({ children }) => <h3 className='mt-6 text-2xl font-semibold md:mt-10 lg:mt-16'>{children}</h3>,
  h4: ({ children }) => <h4 className='text-xl font-semibold'>{children}</h4>,
  h5: ({ children }) => <h5 className='text-xl font-medium'>{children}</h5>,
  p: ({ children }) => <p className='text-muted-foreground flex flex-wrap gap-6 leading-relaxed'>{children}</p>,
  ul: ({ children }) => <ul className='-mt-3 ml-6 list-disc space-y-1'>{children}</ul>,
  ol: ({ children }) => <ol className='ml-6 list-decimal space-y-2'>{children}</ol>,
  li: ({ children }) => <li className='text-muted-foreground leading-relaxed'>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className='bg-muted border-primary my-6 border-l-4 px-6 py-4 text-xl font-medium *:leading-normal'>
      {children}
    </blockquote>
  ),
  code: ({ children }) => <code className='bg-muted rounded px-1.5 py-0.5 font-mono text-sm'>{children}</code>,
  pre: ({ children }) => <pre className='bg-muted overflow-x-auto rounded-lg p-4'>{children}</pre>,
  strong: ({ children }) => <strong className='text-foreground font-semibold'>{children}</strong>,
  a: ({ children, href }) => (
    <Link href={href} className='text-primary font-medium hover:underline'>
      {children}
    </Link>
  ),
  hr: () => <hr className='border-border my-8' />,
  img: ({ src, alt }) => <img src={src} alt={alt} className='inline-block rounded-lg' />
}

const MDXContent = (props: JSX.IntrinsicAttributes & MDXRemoteProps) => {
  return <MDXRemote {...props} components={{ ...components, ...(props.components || {}) }} />
}

export default MDXContent
