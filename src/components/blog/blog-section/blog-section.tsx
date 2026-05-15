'use client'

import { useState } from 'react'

import { ArrowUpRightIcon, CalendarDaysIcon, SearchIcon } from 'lucide-react'

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SecondarySwipeButton } from '@/components/ui/swipe-button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PostMetadata } from '@/lib/posts'

import { MotionPreset } from '@/components/ui/motion-preset'

const BlogGrid = ({
  posts,
  onCategoryClick
}: {
  posts: PostMetadata[]
  onCategoryClick: (category: string) => void
}) => {
  return (
    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {posts.map((post, index) => (
        <Card
          key={`${post.slug} ${index}`}
          className='group h-full overflow-hidden pt-0 shadow-none transition-all duration-300'
        >
          <Link href={`/blog/${post.slug}`} className='block overflow-hidden'>
            <img
              src={post.image}
              alt={post.title}
              className='aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105'
            />
          </Link>
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
              <Badge
                className='bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer rounded-full text-sm transition-colors'
                onClick={() => onCategoryClick(post.category!)}
              >
                {post.category}
              </Badge>
            </div>

            <Link href={`/blog/${post.slug}`} className='block'>
              <h3 className='line-clamp-2 text-lg font-medium transition-colors md:text-xl'>{post.title}</h3>
            </Link>
            <p className='text-muted-foreground line-clamp-2'>{post.description}</p>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-sm font-medium'>{post.author?.name}</p>
              <SecondarySwipeButton
                size='icon'
                className='group-hover:bg-primary hover:bg-primary group-hover:text-primary-foreground hover:text-primary-foreground rounded-full'
                asChild
              >
                <Link href={`/blog/${post.slug}`}>
                  <ArrowUpRightIcon className='size-4' />
                  <span className='sr-only'>Read more: {post.title}</span>
                </Link>
              </SecondarySwipeButton>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const BlogSection = ({ posts }: { posts: PostMetadata[] }) => {
  const [selectedTab, setSelectedTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filterCategories = Array.from(new Set(posts.map(post => post.category))).filter(Boolean) as string[]
  const categories = ['All', ...filterCategories]

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
  }

  const filteredPosts = posts.filter(post => {
    // Category filter
    const matchesCategory = selectedTab === 'All' || post.category === selectedTab

    // Search filter
    if (!searchQuery) return matchesCategory

    const query = searchQuery.toLowerCase()

    const matchesSearch =
      post.title?.toLowerCase().includes(query) ||
      post.description?.toLowerCase().includes(query) ||
      post.author?.name.toLowerCase().includes(query) ||
      post.category?.toLowerCase().includes(query)

    return matchesCategory && matchesSearch
  })

  return (
    <section className='pb-8 sm:pb-16 lg:pb-24'>
      <div className='mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-16 lg:px-8'>
        {/* Tabs and Search */}
        <MotionPreset
          fade
          slide={{ direction: 'down', offset: 50 }}
          delay={0.4}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Tabs value={selectedTab} onValueChange={handleTabChange} className='gap-10 sm:gap-12 lg:gap-16'>
            <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
              <ScrollArea className='bg-muted w-full rounded-full md:w-auto'>
                <TabsList className='h-auto! gap-1 p-1'>
                  {categories.map(category => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className='hover:bg-primary/10 dark:data-[state=active]:bg-background dark:data-[state=active]:border-background text-foreground h-8 cursor-pointer rounded-full px-4 text-base sm:min-w-30'
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation='horizontal' />
              </ScrollArea>

              <div className='relative max-md:w-full'>
                <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                  <SearchIcon className='size-4' />
                  <span className='sr-only'>Search</span>
                </div>
                <Input
                  type='search'
                  placeholder='Search articles...'
                  className='peer h-10 rounded-full px-9 lg:w-72 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Tabs Content */}
            {categories.map((category, index) => (
              <TabsContent key={index} value={category}>
                {filteredPosts.length > 0 ? (
                  <BlogGrid posts={filteredPosts} onCategoryClick={handleTabChange} />
                ) : (
                  <div className='text-muted-foreground flex min-h-100 flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center'>
                    <SearchIcon className='size-12 opacity-50' />
                    <div className='space-y-2'>
                      <h3 className='text-foreground text-lg font-medium'>No posts found</h3>
                      <p className='text-sm'>
                        {searchQuery
                          ? `No results in "${category}" for "${searchQuery}".`
                          : `No posts in "${category}" category yet.`}
                      </p>
                    </div>
                    {searchQuery && (
                      <Button variant='outline' size='sm' onClick={() => setSearchQuery('')}>
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </MotionPreset>
      </div>
    </section>
  )
}

export default BlogSection
