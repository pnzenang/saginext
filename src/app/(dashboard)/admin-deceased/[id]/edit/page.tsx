import { redirect } from 'next/navigation'

const AdminDeceasedEditPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  redirect(`/admin-all-deceased/${id}/edit`)
}

export default AdminDeceasedEditPage
