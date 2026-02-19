'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { DelegateRecommendation, MemberStatus } from '@/utils/types';
import { useDebouncedCallback } from 'use-debounce';
import { useState, useEffect } from 'react';

function SearchForm() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const searchCode = searchParams.get('searchCode') || '';
  const searchFirstName = searchParams.get('searchFirstName') || '';
  const searchLastName = searchParams.get('searchLastName') || '';
  const delegateRecommendation =
    searchParams.get('delegateRecommendation') || 'all';
  const memberStatus = searchParams.get('memberStatus') || 'all';

  const router = useRouter();
  const pathName = usePathname();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchCode = formData.get('searchCode') as string;
    const searchFirstName = formData.get('searchFirstName') as string;
    const searchLastName = formData.get('searchLastName') as string;
    const delegateRecommendation = formData.get(
      'delegateRecommendation'
    ) as string;
    const memberStatus = formData.get('memberStatus') as string;
    console.log(
      searchCode,
      searchFirstName,
      searchLastName,
      delegateRecommendation,
      memberStatus
    );

    let params = new URLSearchParams();
    params.set('searchCode', searchCode);
    params.set('searchFirstName', searchFirstName);
    params.set('searchLastName', searchLastName);
    params.set('delegateRecommendation', delegateRecommendation);
    params.set('memberStatus', memberStatus);

    router.push(`${pathName}?${params.toString()}`);
  };

  return (
    <form
      className='bg-primary mb-16 p-8 grid sm:grid-cols-2 md:grid-cols-3 gap-5 rounded-lg'
      onSubmit={handleSubmit}
    >
      <Input
        type='text'
        placeholder='search code...'
        name='searchCode'
        className='bg-muted uppercase'
        defaultValue={searchCode}
      />
      <Input
        type='text'
        placeholder='search first name...'
        name='searchFirstName'
        className='bg-muted uppercase'
        defaultValue={searchFirstName}
      />
      <Input
        type='text'
        placeholder='search last name...'
        name='searchLastName'
        className='bg-muted uppercase'
        defaultValue={searchLastName}
      />
      <Select
        name='delegateRecommendation'
        defaultValue={delegateRecommendation}
      >
        <SelectTrigger className='bg-muted '>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['all', ...Object.values(DelegateRecommendation)].map(
            (delegateRecommendation) => {
              return (
                <SelectItem
                  key={delegateRecommendation}
                  value={delegateRecommendation}
                >
                  {delegateRecommendation}
                </SelectItem>
              );
            }
          )}
        </SelectContent>
      </Select>
      <Select name='memberStatus' defaultValue={memberStatus}>
        <SelectTrigger className='bg-muted '>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['all', ...Object.values(MemberStatus)].map((memberStatus) => {
            return (
              <SelectItem key={memberStatus} value={memberStatus}>
                {memberStatus}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Button type='submit' className='bg-blue-950 text-white hover:bg-black'>
        Search
      </Button>
    </form>
  );
}
export default SearchForm;
