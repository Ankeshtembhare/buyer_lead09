import { BuyerForm } from '@/components/forms/buyer-form';
import { createDemoUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function NewBuyerPage() {
  const user = await createDemoUser();

  async function handleSubmit(data: any) {
    'use server';
    
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/buyers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        redirect('/buyers');
      } else {
        throw new Error('Failed to create buyer');
      }
    } catch (error) {
      console.error('Error creating buyer:', error);
      throw error;
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-shadow-white">Add New Lead</h1>
        <p className="mt-2 text-shadow-white">
          Capture a new buyer lead with all the required information
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Lead Information</h2>
        </div>
        <div className="p-6">
          <BuyerForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
