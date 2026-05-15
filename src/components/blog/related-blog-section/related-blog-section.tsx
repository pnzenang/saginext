import { ArrowUpRightIcon, CalendarDaysIcon } from 'lucide-react'

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { SecondarySwipeButton } from '@/components/ui/swipe-button'
import { Card, CardContent } from '@/components/ui/card'
import type { PostMetadata } from '@/lib/posts'

import LogoVector from '@/assets/svg/logo-vector'

const RelatedBlogSection = ({ posts }: { posts: PostMetadata[] }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:space-y-16 lg:px-8'>
        {/* Header */}
        <div className='space-y-4'>
          <Badge className='border-primary text-primary px-3 py-1 text-sm [&>svg]:size-6' variant='outline'>
            <LogoVector className='animation-duration-[2s] size-6 animate-spin' /> TRENDING
          </Badge>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Related Post</h2>
          <p className='text-muted-foreground text-base md:text-xl'>
            Expand your knowledge with these helpful reads on managing money smarter.
          </p>
        </div>

        {/* Blog Grid */}
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className='group h-full overflow-hidden pt-0 shadow-none transition-all duration-300'>
                <div className='overflow-hidden'>
                  <img
                    src={post.image}
                    alt={post.title}
                    className='aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                </div>
                <CardContent className='space-y-3.5'>
                  <div className='flex items-center justify-between gap-1.5'>
                    <div className='text-muted-foreground flex items-center gap-1.5'>
                      <CalendarDaysIcon className='size-4.5' />
                      <span className='text-sm'>
                        {new Date(post.publishedAt ?? '').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: '2-digit'
                        })}
                      </span>
                    </div>
                    <Badge className='bg-primary/10 text-primary rounded-full text-sm'>{post.category}</Badge>
                  </div>

                  <h3 className='line-clamp-2 text-lg font-medium md:text-xl'>{post.title}</h3>
                  <p className='text-muted-foreground line-clamp-2'>{post.description}</p>
                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-sm font-medium'>{post.author?.name}</p>
                    <SecondarySwipeButton
                      size='icon'
                      className='group-hover:bg-primary hover:bg-primary group-hover:text-primary-foreground hover:text-primary-foreground cursor-pointer rounded-full'
                    >
                      <ArrowUpRightIcon className='size-4' />
                      <span className='sr-only'>Read more: {post.title}</span>
                    </SecondarySwipeButton>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RelatedBlogSection
