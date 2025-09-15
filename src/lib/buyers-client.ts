// Client-side buyer utilities that use API calls instead of direct database access

export interface Buyer {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  source: string;
  status: string;
  notes?: string;
  tags: string[];
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuyerWithHistory extends Buyer {
  history?: Array<{
    id: string;
    changedAt: Date;
    changedBy: string;
    diff: Record<string, unknown>;
  }>;
}

export interface PaginatedBuyers {
  buyers: Buyer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Client-side API calls
export async function getBuyerById(id: string): Promise<BuyerWithHistory | null> {
  try {
    const response = await fetch(`/api/buyers/${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return null;
  }
}

export async function updateBuyer(id: string, data: unknown, updatedAt: Date): Promise<Buyer | null> {
  try {
    const response = await fetch(`/api/buyers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data, updatedAt }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Record has been modified. Please refresh and try again.');
      }
      throw new Error('Failed to update buyer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating buyer:', error);
    throw error;
  }
}

export async function deleteBuyer(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/buyers/${id}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting buyer:', error);
    return false;
  }
}
