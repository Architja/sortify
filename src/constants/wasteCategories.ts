import type {  WasteCategory, HazardLevel  } from '../types';

export const WASTE_CATEGORIES: WasteCategory[] = [
  'Plastic',
  'Metal',
  'Glass',
  'Paper',
  'Organic',
  'Rubber',
  'E-Waste',
  'Medical Waste',
  'Mixed Waste',
];

export const HAZARD_LEVELS: HazardLevel[] = [
  'Low',
  'Medium',
  'High',
  'Hazardous',
];

export const CATEGORY_COLORS: Record<WasteCategory, string> = {
  'Plastic': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Metal': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  'Glass': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  'Paper': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Organic': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Rubber': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  'E-Waste': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Medical Waste': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Mixed Waste': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

export const HAZARD_COLORS: Record<HazardLevel, string> = {
  'Low': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'Hazardous': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-500',
};
