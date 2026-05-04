import { redirect } from 'next/navigation';

export default async function CampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  redirect(id ? `/explore/${id}` : '/explore');
}
