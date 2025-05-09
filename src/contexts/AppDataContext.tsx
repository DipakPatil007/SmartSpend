"use client";

import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import type { Category, Transaction, Budget, UserProfile } from '@/lib/types';
import useLocalStorageState from '@/hooks/useLocalStorageState';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

interface AppDataContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (budgetId: string) => void;
  getBudgetByCategory: (categoryId: string) => Budget | undefined;
  userProfile: UserProfile;
  updateUserProfile: (profileData: Partial<UserProfile>) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'User',
  email: 'user@example.com',
  bio: 'Finance enthusiast managing my budget with Smart Spend.',
  avatarUrl: `https://picsum.photos/seed/${uuidv4()}/100/100`, // Generates a consistent placeholder based on a UUID
};


export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useLocalStorageState<Category[]>('categories', DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useLocalStorageState<Transaction[]>('transactions', []);
  const [budgets, setBudgets] = useLocalStorageState<Budget[]>('budgets', []);
  const [userProfile, setUserProfile] = useLocalStorageState<UserProfile>('userProfile', DEFAULT_USER_PROFILE);

  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: uuidv4() }]);
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories(prev => prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    // Also update transactions and budgets that might reference this category
    setTransactions(prev => prev.map(t => t.categoryId === categoryId ? { ...t, categoryId: null } : t));
    setBudgets(prev => prev.filter(b => b.categoryId !== categoryId));
  };
  
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{ ...transaction, id: uuidv4() }, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  const getTransactionsByCategory = (categoryId: string) => {
    return transactions.filter(t => t.categoryId === categoryId);
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    setBudgets(prev => [...prev, { ...budget, id: uuidv4() }]);
  };

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  };

  const deleteBudget = (budgetId: string) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
  };

  const getBudgetByCategory = (categoryId: string) => {
    return budgets.find(b => b.categoryId === categoryId);
  };

  const updateUserProfile = (profileData: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profileData }));
  };

  const contextValue = useMemo(() => ({
    categories, addCategory, updateCategory, deleteCategory,
    transactions, addTransaction, updateTransaction, deleteTransaction, getTransactionsByCategory,
    budgets, addBudget, updateBudget, deleteBudget, getBudgetByCategory,
    userProfile, updateUserProfile,
  }), [categories, transactions, budgets, userProfile]); // eslint-disable-line react-hooks/exhaustive-deps 
  // Note: setFunctions are stable, so they don't need to be in dependencies array for userProfile related functions

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
