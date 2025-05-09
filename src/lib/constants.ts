import type { Category } from './types';
import type { LucideIcon } from 'lucide-react';
import {
  ShoppingCart, Home, Car, Utensils, Heart, Plane, Briefcase, BookOpen, Gift, Wrench, DollarSign, BarChart2, Building, Activity, Shirt, Coffee, Tv, Dumbbell, Pill
} from 'lucide-react';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'Utensils' },
  { id: 'transport', name: 'Transportation', icon: 'Car' },
  { id: 'housing', name: 'Housing', icon: 'Home' },
  { id: 'utilities', name: 'Utilities', icon: 'Wrench' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingCart' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Tv' },
  { id: 'health', name: 'Health & Wellness', icon: 'Heart' },
  { id: 'personal_care', name: 'Personal Care', icon: 'Shirt' }, // Placeholder, could be Droplet
  { id: 'education', name: 'Education', icon: 'BookOpen' },
  { id: 'gifts', name: 'Gifts & Donations', icon: 'Gift' },
  { id: 'travel', name: 'Travel', icon: 'Plane' },
  { id: 'groceries', name: 'Groceries', icon: 'ShoppingCart' }, // Differentiate from general shopping
  { id: 'subscriptions', name: 'Subscriptions', icon: 'Activity' }, // Placeholder for recurring payments
  { id: 'other', name: 'Other', icon: 'DollarSign' },
];

export const AVAILABLE_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Home', icon: Home },
  { name: 'Car', icon: Car },
  { name: 'Utensils', icon: Utensils },
  { name: 'Heart', icon: Heart },
  { name: 'Plane', icon: Plane },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Gift', icon: Gift },
  { name: 'Wrench', icon: Wrench },
  { name: 'DollarSign', icon: DollarSign },
  { name: 'BarChart2', icon: BarChart2 },
  { name: 'Building', icon: Building },
  { name: 'Activity', icon: Activity },
  { name: 'Shirt', icon: Shirt },
  { name: 'Coffee', icon: Coffee },
  { name: 'Tv', icon: Tv },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Pill', icon: Pill },
];

export const getIconComponent = (iconName: string): LucideIcon | null => {
  const foundIcon = AVAILABLE_ICONS.find(icon => icon.name === iconName);
  return foundIcon ? foundIcon.icon : DollarSign; // Default to DollarSign if not found
};
