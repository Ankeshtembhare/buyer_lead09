'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BuyerForm } from '@/components/forms/buyer-form';
import { formatCurrency, formatDate } from '@/lib/utils';
import { type BuyerWithHistory, updateBuyer, deleteBuyer } from '@/lib/buyers-client';
import { PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface BuyerDetailViewProps {
  buyer: BuyerWithHistory;
}

export function BuyerDetailView({ buyer }: BuyerDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (data: any) => {
    setIsLoading(true);
    try {
      await updateBuyer(buyer.id, { ...data, updatedAt: buyer.updatedAt }, buyer.updatedAt);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating buyer:', error);
      alert(error instanceof Error ? error.message : 'Failed to update buyer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this buyer?')) return;

    setIsLoading(true);
    try {
      const success = await deleteBuyer(buyer.id);
      if (success) {
        router.push('/buyers');
      } else {
        alert('Failed to delete buyer');
      }
    } catch (error) {
      console.error('Error deleting buyer:', error);
      alert('Failed to delete buyer');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Visited': return 'bg-purple-100 text-purple-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Converted': return 'bg-emerald-100 text-emerald-800';
      case 'Dropped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to view
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Lead</h1>
          <p className="mt-2 text-gray-600">
            Update the lead information
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lead Information</h2>
          </div>
          <div className="p-6">
            <BuyerForm
              initialData={buyer}
              onSubmit={handleUpdate}
              isLoading={isLoading}
              submitLabel="Update Lead"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/buyers"
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to leads
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{buyer.fullName}</h1>
            <p className="mt-2 text-gray-600">Lead Details</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{buyer.fullName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{buyer.email || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{buyer.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">City</dt>
                  <dd className="mt-1 text-sm text-gray-900">{buyer.city}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Property Requirements</h2>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Property Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{buyer.propertyType}</dd>
                </div>
                {buyer.bhk && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">BHK</dt>
                    <dd className="mt-1 text-sm text-gray-900">{buyer.bhk}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                  <dd className="mt-1 text-sm text-gray-900">{buyer.purpose}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Timeline</dt>
                  <dd className="mt-1 text-sm text-gray-900">{buyer.timeline}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Budget</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {buyer.budgetMin && buyer.budgetMax ? (
                      `${formatCurrency(buyer.budgetMin)} - ${formatCurrency(buyer.budgetMax)}`
                    ) : buyer.budgetMin ? (
                      `Min: ${formatCurrency(buyer.budgetMin)}`
                    ) : buyer.budgetMax ? (
                      `Max: ${formatCurrency(buyer.budgetMax)}`
                    ) : (
                      'Not specified'
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {buyer.notes && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Notes</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{buyer.notes}</p>
              </div>
            </div>
          )}

          {buyer.tags && buyer.tags.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Tags</h2>
              </div>
              <div className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {buyer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Lead Status</h2>
            </div>
            <div className="px-6 py-4">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(buyer.status)}`}>
                      {buyer.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Source</dt>
                  <dd className="mt-1 text-sm text-gray-900">{buyer.source}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(buyer.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(buyer.updatedAt)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* History */}
          {buyer.history && buyer.history.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              </div>
              <div className="px-6 py-4">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {buyer.history.map((activity, activityIdx) => (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {activityIdx !== buyer.history!.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                <svg
                                  className="h-4 w-4 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {activity.diff.action === 'created' ? 'Lead created' : 'Lead updated'}
                                </p>
                                {activity.diff.changes && (
                                  <div className="mt-1">
                                    {Object.entries(activity.diff.changes).map(([field, change]: [string, any]) => (
                                      <p key={field} className="text-xs text-gray-600">
                                        {field}: {change.from} → {change.to}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                {formatDate(activity.changedAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
