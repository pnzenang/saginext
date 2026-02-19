import Link from 'next/link';
// import { LuAlignLeft } from 'react-icons/lu';
import { FaAlignLeft } from 'react-icons/fa6';
import { Button } from '../ui/button';
import UserIcon from './UserIcon';
import { links } from '@/utils/links';
import SignOutLink from './SignOutLink';
import { SignedOut, SignedIn, SignInButton, SignUpButton } from '@clerk/nextjs';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { auth, getAuth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// const { userId } = auth();

// const isAdmin = userId === process.env.ADMIN_CLERK_ID;

const LinksDropDropdown = async () => {
  const { userId } = auth();
  const isAdmin = userId === process.env.ADMIN_CLERK_ID;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='default'
          className='flex gap-4 max-w-[100px] px-1'
        >
          <SignedOut>
            <FaAlignLeft className='w-6 h-6 p-1' />
          </SignedOut>
          <SignedIn>
            <FaAlignLeft className='w-6 h-6 text-primary p-1' />
          </SignedIn>
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-52' align='start' sideOffset={10}>
        <SignedOut>
          <DropdownMenuItem>
            <SignInButton mode='modal'>
              <button className='w-full text-left'>Login</button>
            </SignInButton>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <SignUpButton mode='modal'>
              <button className='w-full text-left'>Register</button>
            </SignUpButton>
          </DropdownMenuItem>
        </SignedOut>
        <SignedIn>
          {links.map((link) => {
            if (link.label === 'all members admin' && !isAdmin) return null;
            if (link.label === 'all users' && !isAdmin) return null;
            return (
              <DropdownMenuItem key={link.href}>
                <Link href={link.href} className='capitalize w-full'>
                  {link.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <SignOutLink />
          </DropdownMenuItem>
        </SignedIn>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default LinksDropDropdown;
