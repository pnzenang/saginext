'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingContainer = () => {
  return (
    <div>
      <LoadingMember />
    </div>
  );
};

const LoadingMember = () => {
  return (
    <Card>
      <CardContent className='p-4 grid gap-20 '>
        <Skeleton className='h-12 w-full mb-2' />
        <Skeleton className='h-12 w-full mb-2' />
        <Skeleton className='h-12 w-full mb-2' />
        <Skeleton className='h-12 w-full mb-2' />
        <Skeleton className='h-12 w-full mb-2' />
        <Skeleton className='h-12 w-full mb-2' />
        <Skeleton className='h-12 w-full mb-2' />
        <Skeleton className='h-12 w-full mb-2' />
        <Skeleton className='h-12 w-full mb-2' />
        <Skeleton className='h-12 w-full mb-2' />
        <Skeleton className='h-12 w-full mb-2' />
      </CardContent>
    </Card>
  );
};

export default LoadingContainer;
