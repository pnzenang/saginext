import SearchForm from '@/components/SearchForm';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { fetchProfile, getAllMembersAction } from '@/utils/actions';
import MemberList from '@/components/MemberList';

async function AllMembersPage() {
  const profile = await fetchProfile();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['jobs', '', 'all', 1],
    queryFn: () => getAllMembersAction({}),
  });
  return (
    <section className='pt-36'>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SearchForm />
        <MemberList />
      </HydrationBoundary>
    </section>
  );
}

export default AllMembersPage;
