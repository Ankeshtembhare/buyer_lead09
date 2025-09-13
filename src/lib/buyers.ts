import { db, buyers, buyerHistory, type Buyer, type NewBuyer, type NewBuyerHistory } from '@/lib/db';
import { eq, and, like, desc, asc, sql, count } from 'drizzle-orm';
import { createBuyerSchema, updateBuyerSchema, type SearchFilters } from '@/lib/validations';
import { v4 as uuidv4 } from 'uuid';

export interface BuyerWithHistory extends Buyer {
  history?: Array<{
    id: string;
    changedAt: Date;
    changedBy: string;
    diff: Record<string, any>;
  }>;
}

export interface PaginatedBuyers {
  buyers: Buyer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Check if buyer already exists (by phone or email)
export async function checkDuplicateBuyer(data: any, ownerId: string): Promise<Buyer | null> {
  const { phone, email } = data;
  
  // Check by phone first (required field)
  const existingByPhone = await db
    .select()
    .from(buyers)
    .where(and(eq(buyers.phone, phone), eq(buyers.ownerId, ownerId)))
    .limit(1);
  
  if (existingByPhone.length > 0) {
    return existingByPhone[0];
  }
  
  // If email is provided, also check by email
  if (email && email.trim() !== '') {
    const existingByEmail = await db
      .select()
      .from(buyers)
      .where(and(eq(buyers.email, email), eq(buyers.ownerId, ownerId)))
      .limit(1);
    
    if (existingByEmail.length > 0) {
      return existingByEmail[0];
    }
  }
  
  return null;
}

// Create a new buyer
export async function createBuyer(data: any, ownerId: string): Promise<Buyer> {
  const validatedData = createBuyerSchema.parse(data);
  
  // Check for duplicates first
  const existingBuyer = await checkDuplicateBuyer(validatedData, ownerId);
  if (existingBuyer) {
    throw new Error(`Duplicate buyer found: ${existingBuyer.fullName} (Phone: ${existingBuyer.phone})`);
  }
  
  const buyerData: NewBuyer = {
    id: uuidv4(),
    ...validatedData,
    tags: JSON.stringify(validatedData.tags || []),
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [buyer] = await db.insert(buyers).values(buyerData).returning();

  // Create history entry
  const historyEntry: NewBuyerHistory = {
    id: uuidv4(),
    buyerId: buyer.id,
    changedBy: ownerId,
    changedAt: new Date(),
    diff: JSON.stringify({ action: 'created', fields: Object.keys(validatedData) }),
  };

  await db.insert(buyerHistory).values(historyEntry);

  return buyer;
}

// Get buyer by ID
export async function getBuyerById(id: string, userId: string): Promise<Buyer | null> {
  const [buyer] = await db
    .select()
    .from(buyers)
    .where(and(eq(buyers.id, id), eq(buyers.ownerId, userId)))
    .limit(1);

  return buyer || null;
}

// Get buyer with history
export async function getBuyerWithHistory(id: string, userId: string): Promise<BuyerWithHistory | null> {
  const buyer = await getBuyerById(id, userId);
  
  if (!buyer) {
    return null;
  }

  const history = await db
    .select()
    .from(buyerHistory)
    .where(eq(buyerHistory.buyerId, id))
    .orderBy(desc(buyerHistory.changedAt))
    .limit(5);

  return {
    ...buyer,
    tags: buyer.tags ? JSON.parse(buyer.tags) : [],
    history: history.map(h => ({
      id: h.id,
      changedAt: h.changedAt,
      changedBy: h.changedBy,
      diff: JSON.parse(h.diff),
    })),
  };
}

// Update buyer
export async function updateBuyer(id: string, data: any, userId: string): Promise<Buyer | null> {
  // Get current buyer to compare changes
  const currentBuyer = await getBuyerById(id, userId);
  
  if (!currentBuyer) {
    return null;
  }

  const validatedData = updateBuyerSchema.parse({ ...data, id });
  
  // Check for concurrent updates
  if (validatedData.updatedAt && currentBuyer.updatedAt && 
      validatedData.updatedAt < currentBuyer.updatedAt) {
    throw new Error('Record has been modified. Please refresh and try again.');
  }

  const updateData: Partial<NewBuyer> = {
    ...validatedData,
    tags: validatedData.tags ? JSON.stringify(validatedData.tags) : undefined,
    updatedAt: new Date(),
  };

  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key as keyof NewBuyer] === undefined) {
      delete updateData[key as keyof NewBuyer];
    }
  });

  const [updatedBuyer] = await db
    .update(buyers)
    .set(updateData)
    .where(and(eq(buyers.id, id), eq(buyers.ownerId, userId)))
    .returning();

  // Track changes for history
  const changes: Record<string, any> = {};
  Object.keys(validatedData).forEach(key => {
    if (key !== 'id' && key !== 'updatedAt' && 
        currentBuyer[key as keyof Buyer] !== validatedData[key as keyof typeof validatedData]) {
      changes[key] = {
        from: currentBuyer[key as keyof Buyer],
        to: validatedData[key as keyof typeof validatedData],
      };
    }
  });

  if (Object.keys(changes).length > 0) {
    const historyEntry: NewBuyerHistory = {
      id: uuidv4(),
      buyerId: id,
      changedBy: userId,
      changedAt: new Date(),
      diff: JSON.stringify({ action: 'updated', changes }),
    };

    await db.insert(buyerHistory).values(historyEntry);
  }

  return updatedBuyer;
}

// Delete buyer
export async function deleteBuyer(id: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(buyers)
    .where(and(eq(buyers.id, id), eq(buyers.ownerId, userId)));

  return result.changes > 0;
}

// Search and filter buyers
export async function searchBuyers(filters: SearchFilters, userId: string): Promise<PaginatedBuyers> {
  const { search, city, propertyType, status, timeline, page, limit, sortBy, sortOrder } = filters;
  
  let whereConditions = [eq(buyers.ownerId, userId)];

  // Add search condition
  if (search) {
    whereConditions.push(
      sql`(${buyers.fullName} LIKE ${`%${search}%`} OR 
           ${buyers.email} LIKE ${`%${search}%`} OR 
           ${buyers.phone} LIKE ${`%${search}%`} OR
           ${buyers.notes} LIKE ${`%${search}%`})`
    );
  }

  // Add filter conditions
  if (city) whereConditions.push(eq(buyers.city, city));
  if (propertyType) whereConditions.push(eq(buyers.propertyType, propertyType));
  if (status) whereConditions.push(eq(buyers.status, status));
  if (timeline) whereConditions.push(eq(buyers.timeline, timeline));

  const whereClause = and(...whereConditions);

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(buyers)
    .where(whereClause);

  // Get buyers with pagination
  const orderBy = sortOrder === 'asc' ? asc(buyers[sortBy]) : desc(buyers[sortBy]);
  
  const buyersList = await db
    .select()
    .from(buyers)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset((page - 1) * limit);

  return {
    buyers: buyersList.map(buyer => ({
      ...buyer,
      tags: buyer.tags ? JSON.parse(buyer.tags) : [],
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Get all buyers for export (respects filters)
export async function getAllBuyersForExport(filters: Omit<SearchFilters, 'page' | 'limit'>, userId: string): Promise<Buyer[]> {
  const { search, city, propertyType, status, timeline, sortBy, sortOrder } = filters;
  
  let whereConditions = [eq(buyers.ownerId, userId)];

  if (search) {
    whereConditions.push(
      sql`(${buyers.fullName} LIKE ${`%${search}%`} OR 
           ${buyers.email} LIKE ${`%${search}%`} OR 
           ${buyers.phone} LIKE ${`%${search}%`} OR
           ${buyers.notes} LIKE ${`%${search}%`})`
    );
  }

  if (city) whereConditions.push(eq(buyers.city, city));
  if (propertyType) whereConditions.push(eq(buyers.propertyType, propertyType));
  if (status) whereConditions.push(eq(buyers.status, status));
  if (timeline) whereConditions.push(eq(buyers.timeline, timeline));

  const whereClause = and(...whereConditions);
  const orderBy = sortOrder === 'asc' ? asc(buyers[sortBy]) : desc(buyers[sortBy]);

  const buyersList = await db
    .select()
    .from(buyers)
    .where(whereClause)
    .orderBy(orderBy);

  return buyersList.map(buyer => ({
    ...buyer,
    tags: buyer.tags ? JSON.parse(buyer.tags) : [],
  }));
}
