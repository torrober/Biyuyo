import { get, set, del } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

export const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return (await get(name)) || null;
    } catch (error) {
      console.error('IndexedDB getItem error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await set(name, value);
    } catch (error) {
      console.error('IndexedDB setItem error:', error);
      throw error;
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await del(name);
    } catch (error) {
      console.error('IndexedDB removeItem error:', error);
      throw error;
    }
  },
};

// Función para migrar datos de localStorage a IndexedDB
export const migrateFromLocalStorage = async (storeName: string) => {
  try {
    const oldData = localStorage.getItem(storeName);
    if (oldData) {
      console.log(`Migrando datos de localStorage a IndexedDB: ${storeName}`);
      await set(storeName, oldData);
      localStorage.removeItem(storeName);
      console.log(`Migración completada: ${storeName}`);
    }
  } catch (error) {
    console.error(`Error migrando ${storeName}:`, error);
  }
};
