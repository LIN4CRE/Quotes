import {
  Compass,
  Heart,
  History,
  Library,
  Radio,
  Search,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  description: string;
}

export const primaryNav: NavItem[] = [
  {
    to: '/',
    label: 'Discover',
    icon: Sparkles,
    end: true,
    description: 'Quote of the day and a random quote',
  },
  { to: '/explore', label: 'Explore', icon: Compass, description: 'Browse by theme and author' },
  { to: '/search', label: 'Search', icon: Search, description: 'Search the whole library' },
  { to: '/favourites', label: 'Favourites', icon: Heart, description: 'Quotes you have saved' },
  {
    to: '/collections',
    label: 'Collections',
    icon: Library,
    description: 'Your own grouped lists',
  },
  { to: '/history', label: 'History', icon: History, description: 'Recently viewed quotes' },
  {
    to: '/advice',
    label: 'Live advice',
    icon: Radio,
    description: 'Tips from the Advice Slip service',
  },
];

export const secondaryNav: NavItem[] = [
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Theme, data and app settings',
  },
];
