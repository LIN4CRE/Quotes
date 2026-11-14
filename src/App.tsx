import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppShell } from '@/components/layout/AppShell';
import { Skeleton } from '@/components/ui/Skeleton';

const Discover = lazy(() => import('@/pages/Discover'));
const Explore = lazy(() => import('@/pages/Explore'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const AuthorPage = lazy(() => import('@/pages/AuthorPage'));
const QuoteDetail = lazy(() => import('@/pages/QuoteDetail'));
const RandomQuote = lazy(() => import('@/pages/RandomQuote'));
const Favourites = lazy(() => import('@/pages/Favourites'));
const Collections = lazy(() => import('@/pages/Collections'));
const CollectionDetail = lazy(() => import('@/pages/CollectionDetail'));
const FeaturedCollection = lazy(() => import('@/pages/FeaturedCollection'));
const HistoryPage = lazy(() => import('@/pages/History'));
const Advice = lazy(() => import('@/pages/Advice'));
const Settings = lazy(() => import('@/pages/Settings'));
const About = lazy(() => import('@/pages/About'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageFallback() {
  return (
    <div className="animate-fade-in space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page…</span>
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-2/3 max-w-sm" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
      <Skeleton className="h-56 w-full rounded-3xl" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Discover />} />
            <Route path="explore" element={<Explore />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="category/:categoryId" element={<CategoryPage />} />
            <Route path="author/:authorId" element={<AuthorPage />} />
            <Route path="quote/:quoteId" element={<QuoteDetail />} />
            <Route path="random" element={<RandomQuote />} />
            <Route path="favourites" element={<Favourites />} />
            <Route path="collections" element={<Collections />} />
            <Route path="collections/:collectionId" element={<CollectionDetail />} />
            <Route path="featured/:collectionId" element={<FeaturedCollection />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="advice" element={<Advice />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
