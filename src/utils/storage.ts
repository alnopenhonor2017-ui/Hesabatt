// src/utils/storage.ts

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
  price: number; // Selling Price
  purchasePrice?: number; // New: Purchase Price
  barcode?: string; // New: Barcode
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
  productId?: string; // Legacy support
  quantity?: number; // Legacy support
  items?: CartItem[]; // New Cart System
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

// Storage Keys Constants to prevent typos
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

// Default Settings
export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'جنيه سوداني',
  lowStockThreshold: 5,
  banks: [
    { id: '1', name: 'مصرف الراجحي' },
    { id: '2', name: 'البنك الأهلي السعودي' },
    { id: '3', name: 'بنك الرياض' },
    { id: '4', name: 'بنك الإنماء' },
    { id: '5', name: 'بنك البلاد' },
    { id: '6', name: 'البنك الأول' },
    { id: '7', name: 'أخرى' }
  ]
};

// ==========================================
// 2. Global CRUD Functions for LocalStorage
// ==========================================

export const getData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading data for key: ${key}`, error);
    return [];
  }
};

export const saveData = <T extends { id: string }>(key: string, item: T): void => {
  try {
    const currentData = getData<T>(key);
    currentData.push(item);
    localStorage.setItem(key, JSON.stringify(currentData));
  } catch (error) {
    console.error(`Error saving data for key: ${key}`, error);
  }
};

export const updateData = <T extends { id: string }>(key: string, id: string, updatedFields: Partial<T>): void => {
  try {
    const currentData = getData<T>(key);
    const index = currentData.findIndex(item => item.id === id);
    
    if (index !== -1) {
      currentData[index] = { ...currentData[index], ...updatedFields };
      localStorage.setItem(key, JSON.stringify(currentData));
    }
  } catch (error) {
    console.error(`Error updating data for key: ${key}`, error);
  }
};

export const deleteData = <T extends { id: string }>(key: string, id: string): void => {
  try {
    const currentData = getData<T>(key);
    const filteredData = currentData.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filteredData));
  } catch (error) {
    console.error(`Error deleting data for key: ${key}`, error);
  }
};

// Settings Functions
export const getAppSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveAppSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings', error);
  }
};
