import React, { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw, ArrowUpDown } from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { CardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/Pagination';

export const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Read URL query parameters
  const currentCategory = searchParams.get('category') || 'all';
  const currentRoast = searchParams.get('roastLevel') || 'all';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Local state for debounced search input
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Load categories once
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    }
    fetchCategories();
  }, []);

  // Sync search input when URL changes
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== currentSearch) {
        const nextParams = new URLSearchParams(searchParams);
        if (searchInput.trim()) {
          nextParams.set('search', searchInput.trim());
        } else {
          nextParams.delete('search');
        }
        nextParams.set('page', '1');
        startTransition(() => {
          setSearchParams(nextParams);
        });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, currentSearch, searchParams, setSearchParams]);

  // Fetch products from API whenever query params change
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await api.getProducts({
          search: currentSearch,
          category: currentCategory,
          roastLevel: currentRoast,
          sort: currentSort,
          page: currentPage,
          limit: 12,
        });
        setProducts(res.data);
        setTotalProducts(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      } catch (err: any) {
        console.error('Products fetch error', err);
        setErrorMessage(err.message || 'Failed to load roasts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentCategory, currentRoast, currentSort, currentSearch, currentPage]);

  const updateParam = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === 'all' || !value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="bg-[#F4EDE3] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col gap-2 mb-8 border-b border-[#2B1D16]/10 pb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C2622D]">
            Single-Origin Roastery & Equipment
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1D16]">
              All Specialty Roasts & Gear
            </h1>
            <span className="text-xs font-medium text-[#2B1D16]/70 tabular-nums">
              Showing {products.length} of {totalProducts} products
            </span>
          </div>
        </div>

        {/* Filter Bar & Controls */}
        <div className="flex flex-col gap-5 mb-8 bg-[#FAF6F0] p-5 rounded-xl border border-[#2B1D16]/10 shadow-xs">
          {/* Top Filter Row: Category Segmented Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => updateParam('category', 'all')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                currentCategory === 'all'
                  ? 'bg-[#2B1D16] text-[#FAF6F0] shadow-xs'
                  : 'text-[#2B1D16]/75 hover:bg-[#2B1D16]/5'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => updateParam('category', cat.slug)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  currentCategory === cat.slug
                    ? 'bg-[#2B1D16] text-[#FAF6F0] shadow-xs'
                    : 'text-[#2B1D16]/75 hover:bg-[#2B1D16]/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Bottom Filter Row: Search, Roast Level, and Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-[#2B1D16]/8 items-center">
            {/* Search */}
            <div className="sm:col-span-5 relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search Araku, Chikmagalur, Brass Filter, Burr..."
                className="w-full bg-[#F4EDE3] border border-[#2B1D16]/20 rounded-lg py-2 pl-9 pr-3 text-xs text-[#2B1D16] focus:outline-none focus:border-[#C2622D]"
              />
              <Search className="w-4 h-4 text-[#2B1D16]/40 absolute left-3 top-2.5" />
            </div>

            {/* Roast Level filter */}
            <div className="sm:col-span-3">
              <select
                value={currentRoast}
                onChange={(e) => updateParam('roastLevel', e.target.value)}
                className="w-full bg-[#F4EDE3] border border-[#2B1D16]/20 rounded-lg py-2 px-3 text-xs text-[#2B1D16] focus:outline-none focus:border-[#C2622D] cursor-pointer"
                aria-label="Filter by roast level"
              >
                <option value="all">Roast: All Profiles</option>
                <option value="light">Light Roast</option>
                <option value="medium">Medium Roast</option>
                <option value="dark">Dark Roast</option>
              </select>
            </div>

            {/* Sort Dropdown Filter */}
            <div className="sm:col-span-3 relative">
              <div className="relative flex items-center">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#C2622D] absolute left-3 pointer-events-none" />
                <select
                  value={currentSort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="w-full bg-[#F4EDE3] border border-[#2B1D16]/20 rounded-lg py-2 pl-8 pr-3 text-xs font-medium text-[#2B1D16] focus:outline-none focus:border-[#C2622D] cursor-pointer"
                  aria-label="Sort products by price and recency"
                >
                  <option value="recency">Recency (Newest First)</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Reset */}
            <div className="sm:col-span-1 flex justify-end">
              <button
                onClick={resetFilters}
                title="Reset filters"
                className="p-2 text-[#2B1D16]/60 hover:text-[#2B1D16] hover:bg-[#2B1D16]/5 rounded-lg transition-colors cursor-pointer"
                aria-label="Reset all search filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {errorMessage && (
          <div className="p-4 mb-6 rounded-lg bg-red-100 border border-red-300 text-red-800 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <EmptyState
            title="No matching roasts or gear found"
            description="We couldn't find any products matching your current filters. Try resetting your search query or choosing another category."
            actionText="Reset All Filters"
            onAction={resetFilters}
          />
        ) : (
          /* Product Grid */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Server-side Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                const nextParams = new URLSearchParams(searchParams);
                nextParams.set('page', page.toString());
                setSearchParams(nextParams);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};
