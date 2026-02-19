'use client';

import { allMembersAction, getAllMembersAction } from '@/utils/actions';
import { useQuery } from '@tanstack/react-query';
import { Member } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from './ui/table';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

import { RiMore2Fill, RiCrossFill } from 'react-icons/ri';
import { ArrowBigRight, Ambulance } from 'lucide-react';
import { Button } from './ui/button';
import dayjs from 'dayjs';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { FaPencil, FaRegEye, FaRegTrashCan } from 'react-icons/fa6';

const MemberList = () => {
  const searchParams = useSearchParams();
  const searchCode = searchParams.get('searchCode') || '';
  const searchFirstName = searchParams.get('searchFirstName') || '';
  const searchLastName = searchParams.get('searchLastName') || '';
  const delegateRecommendation =
    searchParams.get('delegateRecommendation') || 'all';
  const memberStatus = searchParams.get('memberStatus') || 'all';

  const pageNumber = Number(searchParams.get('page')) || 1;

  const { data, isPending } = useQuery({
    queryKey: [
      'members',
      searchCode,
      searchFirstName,
      searchLastName,
      delegateRecommendation,
      pageNumber,
      memberStatus,
    ],
    queryFn: () =>
      getAllMembersAction({
        searchCode,
        searchFirstName,
        searchLastName,
        delegateRecommendation,
        memberStatus,
        page: pageNumber,
      }),
  });

  const members = data?.members || [];

  if (isPending) return <h2 className='text-xl'>Please wait...</h2>;
  if (members.length < 1)
    return <h2 className='text-xl'>No Members found...</h2>;

  return (
    <>
      {/* button container  */}
      <div className='flex items-center justify-between mb-8'>
        <h2 className='text-xl font-semibold capitalize '>
          {members.length} job{members.length > 1 && 's'} found
        </h2>

        {/* {totalPages < 2 ? null : (
          <ComplexButtonContainer currentPage={page} totalPages={totalPages} />
        )} */}
      </div>
      <Separator className='h-1 bg-primary' />
      <Table className='bg- '>
        <TableHeader className='bg-primary '>
          <TableRow className=''>
            {/* <TableHead className='border-b-2 font-bold'>Code</TableHead> */}
            <TableHead className='border-b-2 font-bold'>
              Matriculation
            </TableHead>

            <TableHead className='border-b-2 font-bold'>First Name</TableHead>
            <TableHead className='border-b-2 font-bold'>Last Name</TableHead>
            <TableHead className='border-b-2 font-bold'>Longevity</TableHead>
            <TableHead className='border-b-2 font-bold'>
              Recommendation
            </TableHead>
            <TableHead className='border-b-2 font-bold'>
              Member Status
            </TableHead>
            <TableHead className='border-b-2 font-bold'>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className='bg-muted '>
          {members.map((member) => {
            const {
              associationCode,
              matriculation,
              firstName,
              createdAt,
              lastName,
              recommendation,
              status,
            } = member;
            const memberId = member.id;
            const time = dayjs(Date.now());
            const tod = dayjs(createdAt.toString());
            const longevity = time.diff(tod, 'days');

            const colors = {
              pending: 'bg-yellow-500',
              vested: 'bg-green-500',
            };

            return (
              <TableRow
                key={matriculation}
                className='bg-primary/50 rounded hover:bg-primary hover:text-white h-16'
              >
                {/* <TableCell>{associationCode}</TableCell> */}
                <TableCell>{matriculation}</TableCell>
                <TableCell>{firstName}</TableCell>
                <TableCell>{lastName}</TableCell>
                <TableCell>
                  {Intl.NumberFormat('en-US').format(longevity)} day(s)
                </TableCell>
                <TableCell>{recommendation}</TableCell>
                <TableCell>
                  <Badge
                    className={`rounded-xl w-20 px-4 ${
                      status === 'pending' ? colors.pending : colors.vested
                    }`}
                  >
                    {status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          className='w-8 h-8 p-0 hover:bg-primary hover:text-white'
                        >
                          <RiMore2Fill className='w-6 h-6' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align='center'
                        className='w-80 border-2 text-xs border-primary '
                      >
                        <Link href={`/all-members/${member.id}`}>
                          <DropdownMenuItem className='flex  gap-2 text-xs sm:h-10'>
                            <FaRegEye />
                            More information about {firstName.charAt(0)}.{}{' '}
                            {lastName}
                          </DropdownMenuItem>
                        </Link>

                        <DropdownMenuSeparator />
                        <Link href={`/all-members/${member.id}/edit`}>
                          <DropdownMenuItem className='flex  gap-2 text-blue-500 text-xs sm:h-10'>
                            <FaPencil />
                            Edit {firstName.charAt(0)}. {lastName} information
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <Link href={`/all-members/${member.id}/delete`}>
                          <DropdownMenuItem className='flex  gap-2 text-red-500 text-xs sm:h-10'>
                            <FaRegTrashCan />
                            Remove {firstName.charAt(0)}. {lastName} from the
                            group.
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <Link
                          href={`/all-members/${member.id}/death-announcement`}
                        >
                          <DropdownMenuItem className='flex  gap-2 text-purple-500 text-xs  sm:h-10'>
                            <RiCrossFill />
                            Post {firstName} {lastName}'s death
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
export default MemberList;
