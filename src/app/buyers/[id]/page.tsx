import { notFound } from 'next/navigation';
import { getBuyerWithHistory } from '@/lib/buyers';
import { createDemoUser } from '@/lib/auth-server';
import { BuyerDetailView } from '@/components/buyers/buyer-detail-view';

interface BuyerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BuyerDetailPage({ params }: BuyerDetailPageProps) {
  const user = await createDemoUser();
  const { id } = await params;
  const buyer = await getBuyerWithHistory(id, user.id);

  if (!buyer) {
    notFound();
  }

  return <BuyerDetailView buyer={buyer} />;
}
