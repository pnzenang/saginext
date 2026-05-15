import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { ChevronRightIcon, ChevronLeftIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { SecondarySwipeButton } from '@/components/ui/swipe-button'
import MDXContent from '@/components/mdx-content'

import RelatedBlogSection from '@/components/blog/related-blog-section/related-blog-section'
import CTA from '@/components/blocks/cta-section'

import { getPostBySlug, getPosts } from '@/lib/posts'

export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  const post = await getPostBySlug(slug)

  if (!post) {
    return {}
  }

  const { metadata } = post

  return {
    title: `Blog: ${metadata.title}`,
    description: metadata.description,
    keywords: metadata.keywords,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${metadata.slug}`
    }
  }
}

export const dynamicParams = false

const BlogDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const posts = await getPosts()

  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const { metadata, content } = post

  // Sort posts by published date
  const allPosts = posts.sort(
    (a, b) => new Date(a.publishedAt ?? '').getTime() - new Date(b.publishedAt ?? '').getTime()
  )

  // Find the current post index
  const currentPostIndex = allPosts.findIndex(p => p.slug === slug)
  const previousPost = currentPostIndex > 0 ? allPosts[currentPostIndex - 1] : null
  const nextPost = currentPostIndex < allPosts.length - 1 ? allPosts[currentPostIndex + 1] : null

  const sameCategoryPosts = allPosts.filter(p => p.category === metadata.category && p.slug !== slug)
  const otherCategoryPosts = allPosts.filter(p => p.category !== metadata.category && p.slug !== slug)
  const relatedPosts = [...sameCategoryPosts, ...otherCategoryPosts].slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${process.env.NEXT_PUBLIC_APP_URL}#website`,
        name: 'Swipe',
        description:
          'Track expenses, manage budgets, and achieve your financial goals with Swipe - the app that puts you in control of your money.',
        url: `${process.env.NEXT_PUBLIC_APP_URL}`,
        inLanguage: 'en-US'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${process.env.NEXT_PUBLIC_APP_URL}#webpage`,
        name: `Blog: ${metadata.title}`,
        description: metadata.description,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${metadata.slug}`,
        isPartOf: {
          '@id': `${process.env.NEXT_PUBLIC_APP_URL}#website`
        },
        potentialAction: {
          '@type': 'ReadAction',
          target: [`${process.env.NEXT_PUBLIC_APP_URL}/blog/${metadata.slug}`]
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${process.env.NEXT_PUBLIC_APP_URL}`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${process.env.NEXT_PUBLIC_APP_URL}/blog`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: metadata.title,
            item: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${metadata.slug}`
          }
        ]
      }
    ]
  }

  return (
    <>
      <section className='px-4 py-8 sm:px-6 sm:pt-16 lg:px-8 lg:pt-24'>
        <div className='mx-auto w-full max-w-223 space-y-8 md:space-y-16'>
          <div className='space-y-6'>
            <Breadcrumb className='mb-6'>
              <BreadcrumbList className='gap-1 sm:gap-1'>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href='/' className='text-muted-foreground hover:text-foreground'>
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator children='/' />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href='/blog' className='text-muted-foreground hover:text-foreground'>
                      Blog
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator children='/' />
                <BreadcrumbItem>
                  <BreadcrumbPage>{metadata.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className='text-3xl leading-tight font-medium md:text-4xl lg:text-5xl'>{metadata.title}</h1>
          </div>

          <img src={metadata.image} alt={metadata.title} className='w-full rounded-lg object-cover' />

          <article className='prose prose-slate dark:prose-invert max-w-none space-y-4 text-base'>
            <MDXContent source={content} />
          </article>

          {/* Author and Meta Info */}
          <div className='bg-muted flex flex-wrap justify-between gap-6 rounded-md p-4 lg:items-center'>
            <div className='flex items-center gap-2 max-sm:w-full'>
              <Avatar className='size-12'>
                <AvatarImage src={metadata.author?.picture} alt={metadata.author?.name} />
                <AvatarFallback className='bg-primary text-primary-foreground font-semibold'>
                  {metadata.author?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col space-y-1'>
                <span className='text-muted-foreground text-sm'>Written by</span>
                <span className='text-sm font-medium'>{metadata.author?.name}</span>
              </div>
            </div>

            <div className='flex flex-col space-y-1'>
              <span className='text-muted-foreground text-sm'>Read Time</span>
              <span className='text-sm font-medium'>{metadata.readTime} read</span>
            </div>

            <div className='flex flex-col space-y-1'>
              <span className='text-muted-foreground text-sm'>Posted on</span>
              <span className='text-sm font-medium'>
                {new Date(metadata.publishedAt ?? '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className='flex items-center justify-between gap-4'>
            {previousPost ? (
              <SecondarySwipeButton size='lg' asChild>
                <Link href={`/blog/${previousPost.slug}`}>
                  <ChevronLeftIcon className='transition-transform duration-300 group-hover:-translate-x-1' />
                  Previous Post
                </Link>
              </SecondarySwipeButton>
            ) : (
              <SecondarySwipeButton size='lg' disabled>
                <ChevronLeftIcon className='transition-transform duration-300 group-hover:-translate-x-1' />
                Previous Post
              </SecondarySwipeButton>
            )}
            {nextPost ? (
              <SecondarySwipeButton size='lg' asChild>
                <Link href={`/blog/${nextPost.slug}`}>
                  Next Post
                  <ChevronRightIcon className='transition-transform duration-300 group-hover:translate-x-1' />
                </Link>
              </SecondarySwipeButton>
            ) : (
              <SecondarySwipeButton size='lg' disabled>
                Next Post
                <ChevronRightIcon className='transition-transform duration-300 group-hover:translate-x-1' />
              </SecondarySwipeButton>
            )}
          </div>
        </div>
      </section>

      {/* Related Posts Section */}
      <RelatedBlogSection posts={relatedPosts} />

      <CTA />

      {/* Add JSON-LD to your page */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
        }}
      />
    </>
  )
}

export default BlogDetailsPage
