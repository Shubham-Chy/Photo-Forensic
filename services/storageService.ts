
import { ForensicResult } from "../types";

const STORAGE_KEY = 'forensic_archive_v1';

export const saveResult = (result: Omit<ForensicResult, 'id' | 'timestamp'>) => {
  const current = getArchive();
  const newItem: ForensicResult = {
    ...result,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...current]));
  return newItem;
};

export const getArchive = (): ForensicResult[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearArchive = () => {
  localStorage.removeItem(STORAGE_KEY);
};
