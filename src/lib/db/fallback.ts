// Fallback database operations when the main database is not available
import { type Buyer, type NewBuyer, type NewBuyerHistory } from './schema';

// In-memory fallback for when database is not available
const fallbackData: {
  buyers: Buyer[];
  history: NewBuyerHistory[];
} = {
  buyers: [],
  history: [],
};

export const fallbackDb = {
  buyers: {
    insert: (data: NewBuyer) => {
      const buyer: Buyer = {
        ...data,
        email: data.email || null,
        bhk: data.bhk || null,
        budgetMin: data.budgetMin || null,
        budgetMax: data.budgetMax || null,
        notes: data.notes || null,
        tags: data.tags || null,
        status: data.status || 'New',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fallbackData.buyers.push(buyer);
      return Promise.resolve([buyer]);
    },
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => ({
            offset: () => Promise.resolve(fallbackData.buyers),
          }),
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([]),
        }),
      }),
    }),
    delete: () => ({
      where: () => ({
        returning: () => Promise.resolve([]),
      }),
    }),
  },
  buyerHistory: {
    insert: (data: NewBuyerHistory) => {
      fallbackData.history.push(data);
      return Promise.resolve([data]);
    },
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(fallbackData.history),
      }),
    }),
  },
};

// Check if we should use fallback
export function shouldUseFallback(): boolean {
  return !process.env.DATABASE_URL || process.env.DATABASE_URL === 'file:local.db';
}
