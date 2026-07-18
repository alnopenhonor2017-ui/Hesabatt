import { supabase } from '../lib/supabase';

// ==========================================
// 1. Data Schemas (TypeScript Interfaces)
// ==========================================

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  purchasePrice?: number;
  barcode?: string;
  quantity: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  productId?: string;
  quantity?: number;
  items?: CartItem[];
  totalAmount: number;
  date: string;
  clientName?: string;
  clientPhone?: string;
  paymentMethod?: 'cash' | 'credit' | 'bank';
  bankName?: string;
}

export interface Purchase {
  id: string;
  productId: string;
  supplierId: string;
  quantity: number;
  totalCost: number;
  date: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface Bank {
  id: string;
  name: string;
}

export interface AppSettings {
  currency: string;
  lowStockThreshold: number;
  banks: Bank[];
}

export const STORAGE_KEYS = {
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  SALES: 'sales',
  PURCHASES: 'purchases',
  EXPENSES: 'expenses',
  SUPPLIERS: 'suppliers',
  CLIENTS: 'clients',
  SETTINGS: 'app_settings',
};

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'جنيه سوداني',
  lowStockThreshold: 5,
  banks: [
    { id: generateUUID(), name: 'مصرف الراجحي' },
    { id: generateUUID(), name: 'البنك الأهلي السعودي' },
    { id: generateUUID(), name: 'بنك الرياض' },
    { id: generateUUID(), name: 'بنك الإنماء' },
    { id: generateUUID(), name: 'بنك البلاد' },
    { id: generateUUID(), name: 'البنك الأول' },
    { id: generateUUID(), name: 'أخرى' }
  ]
};

// ==========================================
// 2. Helpers for Case Conversion
// ==========================================

const toSnakeCase = (obj: any) => {
  if (!obj) return obj;
  const result: any = { ...obj };
  const map: Record<string, string> = {
    categoryId: 'category_id',
    purchasePrice: 'purchase_price',
    productId: 'product_id',
    supplierId: 'supplier_id',
    totalCost: 'total_cost',
    totalAmount: 'total_amount',
    clientName: 'client_name',
    clientPhone: 'client_phone',
    paymentMethod: 'payment_method',
    bankName: 'bank_name',
    lowStockThreshold: 'low_stock_threshold',
    createdAt: 'created_at'
  };
  for (const [camel, snake] of Object.entries(map)) {
    if (result[camel] !== undefined) {
      result[snake] = result[camel];
      delete result[camel];
    }
  }
  return result;
};

const toCamelCase = (obj: any) => {
  if (!obj) return obj;
  const result: any = { ...obj };
  const map: Record<string, string> = {
    category_id: 'categoryId',
    purchase_price: 'purchasePrice',
    product_id: 'productId',
    supplier_id: 'supplierId',
    total_cost: 'totalCost',
    total_amount: 'totalAmount',
    client_name: 'clientName',
    client_phone: 'clientPhone',
    payment_method: 'paymentMethod',
    bank_name: 'bankName',
    low_stock_threshold: 'lowStockThreshold',
    created_at: 'createdAt'
  };
  for (const [snake, camel] of Object.entries(map)) {
    if (result[snake] !== undefined) {
      result[camel] = result[snake];
      delete result[snake];
    }
  }
  return result;
};

// ==========================================
// 3. Supabase Async CRUD Functions
// ==========================================

export const getData = async <T>(key: string): Promise<T[]> => {
  const { data, error } = await supabase.from(key).select('*');
  if (error) {
    console.error(`Error fetching ${key}:`, error);
    return [];
  }

  if (key === STORAGE_KEYS.SALES) {
    const { data: itemsData } = await supabase.from('sale_items').select('*');
    return data.map(sale => {
      const saleItems = itemsData?.filter(i => i.sale_id === sale.id) || [];
      return toCamelCase({ ...sale, items: saleItems.map(toCamelCase) });
    }) as any;
  }

  return data.map(toCamelCase) as any;
};

export const saveData = async <T extends { id: string }>(key: string, item: T): Promise<void> => {
  const snakeItem = toSnakeCase(item);
  
  if (key === STORAGE_KEYS.SALES) {
    const items = snakeItem.items;
    delete snakeItem.items;
    
    const { error } = await supabase.from(key).insert(snakeItem);
    if (error) console.error(`Error saving ${key}:`, error);
    
    if (items && items.length > 0) {
      const saleItems = items.map((i: any) => ({
        ...toSnakeCase(i),
        sale_id: item.id,
        id: generateUUID()
      }));
      await supabase.from('sale_items').insert(saleItems);
    }
  } else {
    const { error } = await supabase.from(key).insert(snakeItem);
    if (error) console.error(`Error saving ${key}:`, error);
  }
};

export const updateData = async <T extends { id: string }>(key: string, id: string, updatedFields: Partial<T>): Promise<void> => {
  const snakeFields = toSnakeCase(updatedFields);
  const { error } = await supabase.from(key).update(snakeFields).eq('id', id);
  if (error) console.error(`Error updating ${key}:`, error);
};

export const deleteData = async <T extends { id: string }>(key: string, id: string): Promise<void> => {
  const { error } = await supabase.from(key).delete().eq('id', id);
  if (error) console.error(`Error deleting ${key}:`, error);
};

export const getAppSettings = async (): Promise<AppSettings> => {
  const { data: settingsData } = await supabase.from('app_settings').select('*').eq('id', 1).single();
  const { data: banksData } = await supabase.from('banks').select('*');
  
  const settings = settingsData ? toCamelCase(settingsData) : DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    banks: banksData && banksData.length > 0 ? banksData.map(toCamelCase) : DEFAULT_SETTINGS.banks
  };
};

export const saveAppSettings = async (settings: AppSettings): Promise<void> => {
  const { banks, ...rest } = settings;
  const snakeSettings = toSnakeCase(rest);
  
  await supabase.from('app_settings').upsert({ id: 1, ...snakeSettings });
  
  await supabase.from('banks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (banks.length > 0) {
    await supabase.from('banks').insert(banks.map(b => toSnakeCase(b)));
  }
};
