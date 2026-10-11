import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { FAQPage } from './pages/FAQPage';
import { CoffeeChatbot } from './components/CoffeeChatbot';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-[#F4EDE3] text-[#2B1D16]">
                <Navbar />
                <CartDrawer />
                <CoffeeChatbot />

                <main className="flex-1">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/products" element={<ProductListingPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Authenticated user routes */}
                    <Route
                      path="/wishlist"
                      element={
                        <ProtectedRoute>
                          <WishlistPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                  <Route
                    path="/orders/:id"
                    element={
                      <ProtectedRoute>
                        <OrderDetailPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin-only route */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboardPage />
                      </AdminRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route
                    path="*"
                    element={
                      <div className="py-24 text-center px-4">
                        <span className="font-mono text-xs uppercase font-bold text-[#C2622D]">
                          Error 404
                        </span>
                        <h1 className="font-serif text-3xl font-bold mt-1 mb-3">
                          Page Not Found
                        </h1>
                        <p className="text-sm text-[#2B1D16]/70 max-w-sm mx-auto mb-6">
                          The roast or page you're searching for seems to have drifted away like morning coffee steam.
                        </p>
                        <a
                          href="/"
                          className="inline-block px-5 py-2.5 bg-[#2B1D16] text-[#FAF6F0] rounded-lg text-sm font-semibold hover:bg-[#C2622D] transition-colors"
                        >
                          Return Home
                        </a>
                      </div>
                    }
                  />
                </Routes>
              </main>

              <Footer />
            </div>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </ToastProvider>
  );
}
