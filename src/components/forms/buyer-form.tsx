'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBuyerSchema, type CreateBuyerInput } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface BuyerFormProps {
  initialData?: Partial<CreateBuyerInput>;
  onSubmit: (data: CreateBuyerInput) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

const cities = ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'];
const propertyTypes = ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'];
const bhkOptions = ['1', '2', '3', '4', 'Studio'];
const purposes = ['Buy', 'Rent'];
const timelines = ['0-3m', '3-6m', '>6m', 'Exploring'];
const sources = ['Website', 'Referral', 'Walk-in', 'Call', 'Other'];
const statuses = ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'];

export function BuyerForm({ initialData, onSubmit, isLoading, submitLabel = 'Save' }: BuyerFormProps) {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<CreateBuyerInput>({
    resolver: zodResolver(createBuyerSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      city: initialData?.city || 'Chandigarh',
      propertyType: initialData?.propertyType || 'Apartment',
      bhk: initialData?.bhk || '',
      purpose: initialData?.purpose || 'Buy',
      budgetMin: initialData?.budgetMin || undefined,
      budgetMax: initialData?.budgetMax || undefined,
      timeline: initialData?.timeline || '0-3m',
      source: initialData?.source || 'Website',
      status: initialData?.status || 'New',
      notes: initialData?.notes || '',
      tags: tags,
    },
  });

  const watchedPropertyType = watch('propertyType');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setValue('tags', updatedTags);
  };

  const handleFormSubmit = async (data: CreateBuyerInput) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            {...register('fullName')}
            type="text"
            className={cn(
              'mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
              errors.fullName && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            aria-invalid={errors.fullName ? 'true' : 'false'}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          />
          {errors.fullName && (
            <p id="fullName-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            className={cn(
              'mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
              errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone *
          </label>
          <input
            {...register('phone')}
            type="tel"
            className={cn(
              'mt-1 block w-full rounded-md  text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
              errors.phone && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <select
            {...register('city')}
            className="mt-1 block w-full rounded-md  text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
            Property Type *
          </label>
          <select
            {...register('propertyType')}
            className="mt-1 block w-full rounded-md  text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* BHK */}
        {(['Apartment', 'Villa'].includes(watchedPropertyType)) && (
          <div>
            <label htmlFor="bhk" className="block text-sm font-medium text-gray-700">
              BHK *
            </label>
            <select
              {...register('bhk')}
              className={cn(
                'mt-1 block w-full rounded-md  text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
                errors.bhk && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              aria-invalid={errors.bhk ? 'true' : 'false'}
              aria-describedby={errors.bhk ? 'bhk-error' : undefined}
            >
              <option value="">Select BHK</option>
              {bhkOptions.map(bhk => (
                <option key={bhk} value={bhk}>{bhk}</option>
              ))}
            </select>
            {errors.bhk && (
              <p id="bhk-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.bhk.message}
              </p>
            )}
          </div>
        )}

        {/* Purpose */}
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
            Purpose *
          </label>
          <select
            {...register('purpose')}
            className="mt-1 block w-full rounded-md  text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {purposes.map(purpose => (
              <option key={purpose} value={purpose}>{purpose}</option>
            ))}
          </select>
        </div>

        {/* Budget Min */}
        <div>
          <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700">
            Budget Min (INR)
          </label>
          <input
            {...register('budgetMin', { valueAsNumber: true })}
            type="number"
            min="0"
            className={cn(
              'mt-1 block w-full rounded-md  text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
              errors.budgetMin && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            aria-invalid={errors.budgetMin ? 'true' : 'false'}
            aria-describedby={errors.budgetMin ? 'budgetMin-error' : undefined}
          />
          {errors.budgetMin && (
            <p id="budgetMin-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.budgetMin.message}
            </p>
          )}
        </div>

        {/* Budget Max */}
        <div>
          <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700">
            Budget Max (INR)
          </label>
          <input
            {...register('budgetMax', { valueAsNumber: true })}
            type="number"
            min="0"
            className={cn(
              'mt-1 block w-full rounded-md  text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
              errors.budgetMax && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            aria-invalid={errors.budgetMax ? 'true' : 'false'}
            aria-describedby={errors.budgetMax ? 'budgetMax-error' : undefined}
          />
          {errors.budgetMax && (
            <p id="budgetMax-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.budgetMax.message}
            </p>
          )}
        </div>

        {/* Timeline */}
        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">
            Timeline *
          </label>
          <select
            {...register('timeline')}
            className="mt-1 block w-full rounded-md  text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {timelines.map(timeline => (
              <option key={timeline} value={timeline}>{timeline}</option>
            ))}
          </select>
        </div>

        {/* Source */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">
            Source *
          </label>
          <select
            {...register('source')}
            className="mt-1 block w-full rounded-md  text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {sources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status *
          </label>
          <select
            {...register('status')}
            className="mt-1 block w-full rounded-md  text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          {...register('notes')}
          rows={4}
          className={cn(
            'mt-1 block w-full rounded-md  text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
            errors.notes && 'border-red-300 focus:border-red-500 focus:ring-red-500'
          )}
          aria-invalid={errors.notes ? 'true' : 'false'}
          aria-describedby={errors.notes ? 'notes-error' : undefined}
        />
        {errors.notes && (
          <p id="notes-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.notes.message}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center  px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                aria-label={`Remove ${tag} tag`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            className="block w-full rounded-md  text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
