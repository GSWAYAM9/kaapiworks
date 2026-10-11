import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, Shield, LogOut, Heart, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'All Products', href: '/products' },
    { label: 'Whole Bean', href: '/products?category=whole-bean-coffee' },
    { label: 'Brewing Gear', href: '/products?category=brewing-gear' },
    { label: 'Grinders', href: '/products?category=grinders' },
    { label: 'Our Story', href: '/#story' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F4EDE3]/95 backdrop-blur-md border-b border-[#2B1D16]/10 transition-all">
      {/* Top offer banner */}
      <div className="bg-[#2B1D16] text-[#FAF6F0] text-[11px] font-medium tracking-wider uppercase py-1.5 px-4 text-center">
        <span>Freshly roasted in small batches · Free express shipping across India on orders above ₹1,499</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Brand Wordmark with inline SVG Motif */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-[#2B1D16] group shrink-0 whitespace-nowrap"
            aria-label="Kaapi Works Home"
          >
            {/* Inline SVG Logo Motif: Coffee Cherry Steam */}
            <svg
              className="w-7 h-7 text-[#C2622D] transition-transform duration-300 group-hover:rotate-6"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cup bowl */}
              <path
                d="M6 14C6 21 11 25 18 25C25 25 27 21 27 14H6Z"
                fill="currentColor"
              />
              {/* Handle */}
              <path
                d="M26 16C28 16 30 17 30 19C30 21 28 22 26 22"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Coffee Cherries & Steam Motif */}
              <circle cx="12" cy="7" r="2.5" fill="#2F4A3A" />
              <circle cx="18" cy="5" r="2.5" fill="#C2622D" />
              <path
                d="M13 7C14 6 16 6 17 5"
                stroke="#2B1D16"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M5 27H25"
                stroke="#2B1D16"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#2B1D16] leading-none">
                Kaapi Works
              </span>
              <span className="text-[9px] font-semibold tracking-widest uppercase text-[#C2622D] leading-none mt-1">
                South Indian Specialty
              </span>
            </div>
          </Link>

          {/* Zone 2: Navigation Links (Single-line, unboxed text, subtle hover underlines) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#2B1D16]/80">
            {navLinks.map((link) => {
              const isActive = location.pathname + location.search === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 relative hover:text-[#C2622D] ${
                    isActive ? 'text-[#C2622D] font-semibold' : 'text-[#2B1D16]/85'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C2622D] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Actions (Search, Account, Cart) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-lg text-[#2B1D16]/80 hover:text-[#2B1D16] hover:bg-[#2B1D16]/5 transition-colors cursor-pointer"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Badge/Link if Admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2F4A3A] text-[#FAF6F0] hover:bg-[#23382C] transition-colors whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* User Account Menu */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-2 rounded-lg text-[#2B1D16]/80 hover:text-[#2B1D16] hover:bg-[#2B1D16]/5 transition-colors cursor-pointer"
                    aria-label="User profile options"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden xl:inline text-xs font-medium max-w-[100px] truncate">
                      {user?.name.split(' ')[0]}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#FAF6F0] border border-[#2B1D16]/15 rounded-xl shadow-xl py-2 z-50 text-xs">
                      <div className="px-4 py-2 border-b border-[#2B1D16]/10">
                        <p className="font-semibold text-[#2B1D16] text-sm truncate">{user?.name}</p>
                        <p className="text-[#2B1D16]/60 truncate">{user?.email}</p>
                        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#2B1D16]/5">
                          <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#2B1D16]/5 text-[#2B1D16]">
                            {user?.role}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C2622D]">
                            <Coins className="w-3 h-3" />
                            <span>{user?.beanPoints !== undefined ? user.beanPoints : 150} pts</span>
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-[#2B1D16]/5 text-[#2B1D16]"
                        >
                          <Shield className="w-4 h-4 text-[#2F4A3A]" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-[#2B1D16]/5 text-[#2B1D16]"
                      >
                        <User className="w-4 h-4 text-[#C2622D]" />
                        <span>Profile & Orders</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-[#2B1D16]/5 text-[#2B1D16]"
                      >
                        <Heart className="w-4 h-4 text-[#C2622D]" />
                        <span>Wishlist ({wishlistCount})</span>
                      </Link>

                      <Link
                        to="/cart"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-[#2B1D16]/5 text-[#2B1D16]"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#C2622D]" />
                        <span>View Cart ({itemCount})</span>
                      </Link>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#2B1D16]/5 text-red-600 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-[#2B1D16] border border-[#2B1D16]/20 rounded-lg hover:border-[#2B1D16] hover:bg-[#2B1D16]/5 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Wishlist Trigger */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-lg text-[#2B1D16] hover:bg-[#2B1D16]/5 transition-colors cursor-pointer"
              aria-label={`View wishlist with ${wishlistCount} saved items`}
            >
              <Heart className="w-5 h-5 text-[#2B1D16]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C2622D] text-[#FAF6F0] text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={openDrawer}
              className="relative p-2 rounded-lg text-[#2B1D16] hover:bg-[#2B1D16]/5 transition-colors cursor-pointer"
              aria-label={`Open shopping cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-5 h-5 text-[#2B1D16]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C2622D] text-[#FAF6F0] text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#2B1D16]/80 hover:text-[#2B1D16] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {isSearchOpen && (
          <form
            onSubmit={handleSearchSubmit}
            className="pb-4 animate-in fade-in duration-150"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Araku Honey, Chikmagalur, Brass Filter, Grinder..."
                className="w-full bg-[#FAF6F0] border border-[#2B1D16]/20 rounded-lg py-2.5 pl-10 pr-4 text-sm text-[#2B1D16] focus:outline-none focus:border-[#C2622D]"
                autoFocus
              />
              <Search className="w-4 h-4 text-[#2B1D16]/40 absolute left-3.5 top-3.5" />
            </div>
          </form>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#2B1D16]/10 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 px-3 text-sm font-medium text-[#2B1D16] hover:bg-[#2B1D16]/5 rounded-md"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 text-sm font-medium text-[#2B1D16] hover:bg-[#2B1D16]/5 rounded-md flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#C2622D]" />
                <span>My Wishlist</span>
              </div>
              {wishlistCount > 0 && (
                <span className="bg-[#C2622D] text-[#FAF6F0] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {isAuthenticated && (
              <div className="py-2 px-3 text-xs bg-[#2B1D16]/5 rounded-md flex items-center justify-between text-[#2B1D16]">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#C2622D]" />
                  <span className="font-medium">Bean Points Loyalty</span>
                </div>
                <span className="font-mono font-bold text-[#C2622D]">
                  {user?.beanPoints !== undefined ? user.beanPoints : 150} pts
                </span>
              </div>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 px-3 text-sm font-semibold text-[#2F4A3A] bg-[#2F4A3A]/10 rounded-md flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
