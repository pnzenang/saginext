import { Button } from '@/components/ui/button';
import { fetchProfile, fetchSingleMember } from '@/utils/actions';
import dayjs from 'dayjs';
import { Pencil, Trash2, Ambulance, ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';

const SingleMemberPage = async ({ params }: { params: { id: string } }) => {
  const profile = await fetchProfile();
  const member = await fetchSingleMember(params.id);
  const {
    createdAt,
    matriculation,
    firstName,
    middleName,
    lastName,
    countryOfBirth,
    dateOfBirth,
    associationCode,
    associationName,
    beneficiary,
    recommendation,
    status,
  } = member;

  return (
    <section className='mt-36   '>
      <div className='mx-auto max-w-screen-xl  py-12 sm:py-14'>
        <h2 className='text-cente  font-semibold tracking-tight text-balance sm:text-5xl py-2'>
          Member Information
        </h2>

        <div className='bg-primary/20 mb- break-inside-avoid rounded-lg border p-2.5 '>
          <div className='from-muted/50 to-background via-background dark:bg-background dark:border-muted-foreground/30 relative  flex-col sm:flex-cols-2 rounded-md border bg-gradient-to-bl px-5 pt-10 pb-3 '>
            <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4'>
              <div className=''>
                <h1 className='text-muted-foreground '>First Name</h1>
                <div className='bg-primary/20 p-3 rounded px-3'>
                  {firstName}
                </div>
              </div>
              <div>
                <h1 className='text-muted-foreground '>middle Name</h1>
                <div className='bg-primary/20 p-3 rounded px-3'>
                  {middleName}
                </div>
              </div>
              <div className=''>
                <h1 className='text-muted-foreground '>Last Name</h1>
                <div className='bg-primary/20 p-3 rounded px-3'>{lastName}</div>
              </div>

              <div className=''>
                <h1 className='text-muted-foreground '>Registration Date</h1>
                <div className='bg-primary/20 p-3 rounded px-3'>
                  {createdAt.toLocaleDateString()}
                </div>
              </div>
              <div>
                <h1 className='text-muted-foreground '>Date of Birth</h1>
                <div className='bg-primary/20 p-3 rounded px-3'>
                  {dateOfBirth}
                </div>
              </div>
              <div className=''>
                <h1 className='text-muted-foreground '>Country of Birth</h1>
                <div className='bg-primary/20 p-3 rounded px-3'>
                  {countryOfBirth}
                </div>
              </div>
            </div>
            <div className='grid md:grid-cols-3 gap-4 mt-4'>
              <div className=''>
                <h1 className='text-muted-foreground '>Association Name</h1>
                <div className='bg-primary/20 p-3 rounded px-3'>
                  {associationName}
                </div>
              </div>
              <div>
                <h1 className='text-muted-foreground '>Association Code</h1>
                <div className='bg-primary/20 p-3 rounded px-3'>
                  {associationCode}
                </div>
              </div>
              <div className=''>
                <h1 className='text-muted-foreground '>Matriculation Number</h1>
                <div className='bg-primary/20 p-3 rounded px-3'>
                  {matriculation}
                </div>
              </div>
            </div>
            <div className='grid md:grid-cols-3 gap-4 mt-4 pb-10'>
              <div className=''>
                <h1 className='text-muted-foreground '>
                  Delegate Recommendation
                </h1>
                <div className='bg-primary/20 p-3 rounded-sm px-3 capitalize'>
                  {recommendation}
                </div>
              </div>
              <div className=''>
                <h1 className='text-muted-foreground '>Member Status</h1>
                <div className='bg-primary/20 p-3 rounded-sm px-3 capitalize'>
                  {status}
                </div>
              </div>
              <div className=''>
                <h1 className='text-muted-foreground  '>
                  Beneficiary full name
                </h1>
                <div className='bg-primary/20 p-3 rounded px-3 capitalize'>
                  {beneficiary}
                </div>
              </div>
            </div>
            {/* <div className='grid md:grid-cols-3 gap-4 mt-4 pb-10'>
              <Button className='bg-blue-500 p-6 rounded-full px-3 hover:bg-blue-800 '>
                <Pencil className='px-1' />
                Edit member information
              </Button>

              <Button className='bg-red-500 p-6 rounded-full px-3 hover:bg-red-800'>
                <Trash2 className='px-1' />
                Remove the member from your group
              </Button>

              <Button className='bg-purple-600 p-6 rounded-full px-3 hover:bg-purple-800'>
                <Ambulance className='p-1' />
                Announce the member death
              </Button>
            </div> */}
          </div>
        </div>
        <Link href='/all-members'>
          <Button className='mt-5 px-10'>
            Back to all-members
            <ArrowRightIcon className='transition-transform duration-200 group-hover:translate-x-0.5' />
          </Button>
        </Link>
      </div>
    </section>
  );
};
export default SingleMemberPage;
