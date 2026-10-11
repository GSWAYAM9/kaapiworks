import React, { useEffect, useState } from 'react';
import {
  Package,
  Layers,
  AlertTriangle,
  Plus,
  Search,
  Edit2,
  Trash2,
  UploadCloud,
  CheckCircle2,
  X,
  ExternalLink,
  Shield,
  RefreshCw,
  Star,
  MessageSquare,
} from 'lucide-react';
import { Product, Category, AdminStats, Review } from '../types';
import { api } from '../services/api';
import { formatINR, getFallbackImage } from '../utils/formatters';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { TableSkeleton } from '../components/Skeleton';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/Toast';

export const AdminDashboardPage: React.FC = () => {
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'upload' | 'reviews'>('products');
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalCategories: 0,
  });

  // Reviews state for moderation
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Products table state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Product Form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    roastLevel: 'none',
    tastingNotes: '',
    estate: '',
    altitude: '',
    imageUrl: '',
    isFeatured: false,
    isNewArrival: false,
    isRoastOfTheMonth: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category management states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  // Standalone Image upload tab state
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load stats and categories
  const loadInitialData = async () => {
    try {
      const [statsData, catData] = await Promise.all([
        api.getAdminStats(),
        api.getCategories(),
      ]);
      setStats(statsData);
      setCategories(catData);
    } catch (err: any) {
      error(err.message || 'Failed to load initial admin metrics.');
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await api.getProducts({
        search: searchQuery,
        category: categoryFilter,
        page: currentPage,
        limit: 10,
      });
      setProducts(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      error(err.message || 'Failed to fetch products.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryFilter, currentPage]);

  // Open Create/Edit Product
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: typeof product.category === 'object' ? product.category._id : product.category,
        stock: product.stock.toString(),
        roastLevel: product.roastLevel || 'none',
        tastingNotes: product.tastingNotes ? product.tastingNotes.join(', ') : '',
        estate: product.estate || '',
        altitude: product.altitude || '',
        imageUrl: product.images?.[0]?.url || '',
        isFeatured: Boolean(product.isFeatured),
        isNewArrival: Boolean(product.isNewArrival),
        isRoastOfTheMonth: Boolean(product.isRoastOfTheMonth),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: categories[0]?._id || '',
        stock: '15',
        roastLevel: 'none',
        tastingNotes: '',
        estate: '',
        altitude: '',
        imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
        isFeatured: false,
        isNewArrival: true,
        isRoastOfTheMonth: false,
      });
    }
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock, 10),
        roastLevel: formData.roastLevel === 'none' ? null : formData.roastLevel,
        tastingNotes: formData.tastingNotes
          ? formData.tastingNotes.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        estate: formData.estate,
        altitude: formData.altitude,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isRoastOfTheMonth: formData.isRoastOfTheMonth,
        images: [
          {
            url: formData.imageUrl || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
            publicId: `img_${Date.now()}`,
          },
        ],
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct._id, payload);
        success(`Updated "${payload.name}" successfully.`);
      } else {
        await api.createProduct(payload);
        success(`Created "${payload.name}" successfully.`);
      }

      setIsProductModalOpen(false);
      fetchProducts();
      loadInitialData();
    } catch (err: any) {
      error(err.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await api.deleteProduct(productToDelete._id);
      success(`Deleted "${productToDelete.name}".`);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
      loadInitialData();
    } catch (err: any) {
      error(err.message || 'Failed to delete product.');
    }
  };

  // Image Upload handler for Cloudinary
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      error('Only JPEG, PNG, or WebP files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error('File size cannot exceed 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const result = await api.uploadImage(file);
      setUploadedImageUrl(result.url);
      setFormData((prev) => ({ ...prev, imageUrl: result.url }));
      success('Image processed and uploaded to Cloudinary successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setIsUploading(false);
    }
  };

  // Category CRUD
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory._id, {
          name: categoryName.trim(),
          description: categoryDesc.trim(),
        });
        success(`Renamed category to "${categoryName}".`);
      } else {
        await api.createCategory({
          name: categoryName.trim(),
          description: categoryDesc.trim(),
        });
        success(`Created category "${categoryName}".`);
      }
      setIsCategoryModalOpen(false);
      const updatedCats = await api.getCategories();
      setCategories(updatedCats);
      loadInitialData();
    } catch (err: any) {
      error(err.message || 'Failed to save category.');
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      await api.deleteCategory(cat._id);
      success(`Deleted category "${cat.name}".`);
      const updatedCats = await api.getCategories();
      setCategories(updatedCats);
      loadInitialData();
    } catch (err: any) {
      error(err.message || 'Cannot delete category.');
    }
  };

  // Review moderation handlers
  const fetchAllReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const data = await api.getAllReviewsAdmin();
      setAllReviews(data);
    } catch (err: any) {
      error(err.message || 'Failed to fetch reviews.');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchAllReviews();
    }
  }, [activeTab]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to remove this review? This will recompute the aggregate product score.')) {
      return;
    }
    try {
      await api.deleteReviewAdmin(reviewId);
      success('Review removed.');
      fetchAllReviews();
      fetchProducts();
    } catch (err: any) {
      error(err.message || 'Failed to remove review.');
    }
  };

  return (
    <div className="bg-[#F4EDE3] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#2B1D16]/10 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2F4A3A] text-[#FAF6F0] flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C2622D]">
                Administrative Console
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1D16]">
                Storefront & Catalog Management
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchProducts();
                loadInitialData();
              }}
              className="p-2 rounded-lg border border-[#2B1D16]/15 hover:bg-[#2B1D16]/5 text-[#2B1D16] transition-colors cursor-pointer"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Button onClick={() => openProductModal()} variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              <span>Create Product</span>
            </Button>
          </div>
        </div>

        {/* Small Stats Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#FAF6F0] p-5 rounded-xl border border-[#2B1D16]/10 shadow-xs flex flex-col">
            <span className="text-xs uppercase font-semibold text-[#2B1D16]/60">Total Products</span>
            <span className="font-serif text-3xl font-bold tabular-nums text-[#2B1D16] mt-2">
              {stats.totalProducts}
            </span>
            <span className="text-[11px] text-[#2F4A3A] mt-1 font-medium">Active in database</span>
          </div>

          <div className="bg-[#FAF6F0] p-5 rounded-xl border border-[#2B1D16]/10 shadow-xs flex flex-col">
            <span className="text-xs uppercase font-semibold text-[#2B1D16]/60">Categories</span>
            <span className="font-serif text-3xl font-bold tabular-nums text-[#2B1D16] mt-2">
              {stats.totalCategories}
            </span>
            <span className="text-[11px] text-[#2B1D16]/60 mt-1">Beans, Brewers & Mills</span>
          </div>

          <div className="bg-[#FAF6F0] p-5 rounded-xl border border-[#2B1D16]/10 shadow-xs flex flex-col">
            <span className="text-xs uppercase font-semibold text-[#C2622D]">Low Stock Alerts</span>
            <span className="font-serif text-3xl font-bold tabular-nums text-[#C2622D] mt-2">
              {stats.lowStock}
            </span>
            <span className="text-[11px] text-[#C2622D]/80 mt-1 font-medium">≤ 5 units remaining</span>
          </div>

          <div className="bg-[#FAF6F0] p-5 rounded-xl border border-[#2B1D16]/10 shadow-xs flex flex-col">
            <span className="text-xs uppercase font-semibold text-[#2B1D16]/60">Sold Out</span>
            <span className="font-serif text-3xl font-bold tabular-nums text-[#2B1D16] mt-2">
              {stats.outOfStock}
            </span>
            <span className="text-[11px] text-[#2B1D16]/60 mt-1">0 stock remaining</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#2B1D16]/15 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-[#C2622D] text-[#C2622D]'
                : 'border-transparent text-[#2B1D16]/70 hover:text-[#2B1D16]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-[#C2622D] text-[#C2622D]'
                : 'border-transparent text-[#2B1D16]/70 hover:text-[#2B1D16]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-[#C2622D] text-[#C2622D]'
                : 'border-transparent text-[#2B1D16]/70 hover:text-[#2B1D16]'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Cloudinary Direct Test</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS TABLE */}
        {activeTab === 'products' && (
          <div className="flex flex-col gap-4">
            {/* Search and category filters */}
            <div className="flex flex-col sm:flex-row gap-3 bg-[#FAF6F0] p-4 rounded-xl border border-[#2B1D16]/10">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter by product name, estate or tasting notes..."
                  className="w-full bg-[#F4EDE3] border border-[#2B1D16]/20 rounded-lg py-2 pl-9 pr-3 text-xs text-[#2B1D16] focus:outline-none focus:border-[#C2622D]"
                />
                <Search className="w-4 h-4 text-[#2B1D16]/40 absolute left-3 top-2.5" />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#F4EDE3] border border-[#2B1D16]/20 rounded-lg py-2 px-3 text-xs text-[#2B1D16] focus:outline-none focus:border-[#C2622D] cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Table */}
            {isLoadingProducts ? (
              <TableSkeleton rows={8} />
            ) : products.length === 0 ? (
              <div className="bg-[#FAF6F0] p-12 text-center rounded-xl border border-[#2B1D16]/10">
                <p className="text-sm text-[#2B1D16]/70">No products found matching filters.</p>
              </div>
            ) : (
              <div className="bg-[#FAF6F0] rounded-xl border border-[#2B1D16]/10 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F4EDE3] border-b border-[#2B1D16]/10 text-[#2B1D16]/70 font-semibold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Item</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Roast / Estate</th>
                        <th className="py-3.5 px-4 tabular-nums">Price (INR)</th>
                        <th className="py-3.5 px-4 tabular-nums">Stock</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2B1D16]/8">
                      {products.map((p) => {
                        const img = p.images?.[0]?.url || getFallbackImage(p.name);
                        const catName =
                          typeof p.category === 'object' && p.category?.name
                            ? p.category.name
                            : 'General';

                        return (
                          <tr key={p._id} className="hover:bg-[#F4EDE3]/40 transition-colors">
                            {/* Product Info */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={img}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-md object-cover border border-[#2B1D16]/10 shrink-0"
                                />
                                <div className="flex flex-col">
                                  <span className="font-bold text-[#2B1D16] line-clamp-1 max-w-[200px]">
                                    {p.name}
                                  </span>
                                  {p.isRoastOfTheMonth && (
                                    <span className="text-[10px] text-[#C2622D] font-bold uppercase">
                                      ★ Roast of the Month
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4 text-[#2B1D16]/80 font-medium">{catName}</td>

                            {/* Roast */}
                            <td className="py-3 px-4 text-[#2B1D16]/70">
                              {p.roastLevel ? (
                                <span className="capitalize">{p.roastLevel} Roast</span>
                              ) : (
                                <span className="text-[#2B1D16]/40">—</span>
                              )}
                              {p.estate && <span className="block text-[11px] truncate max-w-[120px]">{p.estate}</span>}
                            </td>

                            {/* Price */}
                            <td className="py-3 px-4 font-bold tabular-nums text-[#2B1D16]">
                              {formatINR(p.price)}
                            </td>

                            {/* Stock */}
                            <td className="py-3 px-4">
                              {p.stock === 0 ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2B1D16] text-[#FAF6F0]">
                                  Sold Out
                                </span>
                              ) : p.stock <= 5 ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C2622D] text-[#FAF6F0]">
                                  Low: {p.stock}
                                </span>
                              ) : (
                                <span className="tabular-nums font-semibold text-[#2F4A3A]">
                                  {p.stock} in stock
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openProductModal(p)}
                                  className="p-1.5 rounded text-[#2B1D16]/70 hover:text-[#C2622D] hover:bg-[#2B1D16]/5 transition-colors cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setProductToDelete(p);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="p-1.5 rounded text-[#2B1D16]/70 hover:text-red-600 hover:bg-[#2B1D16]/5 transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-[#2B1D16]/10 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATEGORY MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="bg-[#FAF6F0] rounded-xl border border-[#2B1D16]/10 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2B1D16]/10">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2B1D16]">Store Categories</h3>
                <p className="text-xs text-[#2B1D16]/70">
                  Organize products into distinct roasted bean profiles and brewing equipment sets.
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryName('');
                  setCategoryDesc('');
                  setIsCategoryModalOpen(true);
                }}
                variant="primary"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Category</span>
              </Button>
            </div>

            <div className="divide-y divide-[#2B1D16]/8">
              {categories.map((cat) => (
                <div key={cat._id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#2B1D16]">{cat.name}</h4>
                    <span className="font-mono text-xs text-[#C2622D]">slug: {cat.slug}</span>
                    {cat.description && (
                      <p className="text-xs text-[#2B1D16]/70 mt-0.5">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCategoryName(cat.name);
                        setCategoryDesc(cat.description || '');
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-1.5 text-[#2B1D16]/70 hover:text-[#C2622D] hover:bg-[#2B1D16]/5 rounded transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 text-[#2B1D16]/70 hover:text-red-600 hover:bg-[#2B1D16]/5 rounded transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CLOUDINARY UPLOAD TEST */}
        {activeTab === 'upload' && (
          <div className="bg-[#FAF6F0] rounded-xl border border-[#2B1D16]/10 p-6 shadow-xs max-w-2xl mx-auto">
            <h3 className="font-serif text-lg font-bold text-[#2B1D16] mb-1">
              Cloudinary Image Uploader Test
            </h3>
            <p className="text-xs text-[#2B1D16]/70 mb-6 leading-relaxed">
              Uploads raw image buffers directly to Cloudinary via server-side Multer memory storage. Validates max file size 5MB and JPEG/PNG/WebP formats.
            </p>

            <div className="border-2 border-dashed border-[#2B1D16]/20 rounded-xl p-8 text-center bg-[#F4EDE3]/60 mb-6 flex flex-col items-center">
              <UploadCloud className="w-10 h-10 text-[#C2622D] mb-3" />
              <label className="text-xs font-semibold uppercase tracking-wider text-[#2B1D16] cursor-pointer">
                <span>Select file to upload (JPEG, PNG, WebP)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-[#2B1D16]/60 mt-1">Maximum size: 5MB</span>
              {isUploading && (
                <span className="text-xs font-semibold text-[#C2622D] mt-3 animate-pulse">
                  Uploading to server & Cloudinary...
                </span>
              )}
            </div>

            {uploadedImageUrl && (
              <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#2F4A3A]/30 flex flex-col gap-3">
                <span className="text-xs font-bold text-[#2F4A3A] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully Uploaded & Transformed
                </span>
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded test preview"
                  className="w-full max-h-60 object-contain rounded-lg border border-[#2B1D16]/10 bg-white"
                />
                <input
                  type="text"
                  readOnly
                  value={uploadedImageUrl}
                  className="w-full text-xs font-mono p-2 bg-[#F4EDE3] border border-[#2B1D16]/10 rounded"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? `Edit "${editingProduct.name}"` : 'Create New Product'}
        maxWidth="xl"
      >
        <form onSubmit={handleProductSubmit} className="flex flex-col gap-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Araku Valley Honey Sun-Dried"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#2B1D16]/80 block mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#FAF6F0] border border-[#2B1D16]/20 rounded-lg p-2.5 text-xs text-[#2B1D16] focus:outline-none focus:border-[#C2622D]"
                required
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Price (INR ₹)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g. 680"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Stock Quantity"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="e.g. 24"
              required
            />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#2B1D16]/80 block mb-1">
                Coffee Roast Level (Optional)
              </label>
              <select
                value={formData.roastLevel}
                onChange={(e) => setFormData({ ...formData, roastLevel: e.target.value })}
                className="w-full bg-[#FAF6F0] border border-[#2B1D16]/20 rounded-lg p-2.5 text-xs text-[#2B1D16] focus:outline-none focus:border-[#C2622D]"
              >
                <option value="none">None (Hardware/Accessories)</option>
                <option value="light">Light Roast</option>
                <option value="medium">Medium Roast</option>
                <option value="dark">Dark Roast</option>
              </select>
            </div>
          </div>

          <Input
            label="Tasting Notes (comma-separated)"
            value={formData.tastingNotes}
            onChange={(e) => setFormData({ ...formData, tastingNotes: e.target.value })}
            placeholder="e.g. Wild Honey, Blackberry, Hibiscus"
            hint="For whole bean coffees"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Estate Origin"
              value={formData.estate}
              onChange={(e) => setFormData({ ...formData, estate: e.target.value })}
              placeholder="e.g. Araku Valley, Andhra Pradesh"
            />
            <Input
              label="Altitude"
              value={formData.altitude}
              onChange={(e) => setFormData({ ...formData, altitude: e.target.value })}
              placeholder="e.g. 1,200 - 1,400m"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#2B1D16]/80 block mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Sensory narrative and technical harvest notes..."
              className="w-full bg-[#FAF6F0] border border-[#2B1D16]/20 rounded-lg p-3 text-xs text-[#2B1D16] focus:outline-none focus:border-[#C2622D]"
              required
            />
          </div>

          {/* Image URL & Upload button */}
          <div className="flex flex-col gap-2">
            <Input
              label="Primary Image URL"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              required
            />
            <div className="flex items-center gap-3">
              <label className="text-xs text-[#C2622D] font-semibold cursor-pointer hover:underline flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Or Upload New Image to Cloudinary</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {isUploading && <span className="text-[11px] text-[#2B1D16]/60">Uploading...</span>}
            </div>
          </div>

          {/* Badges / Checkboxes */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#2B1D16]/10 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded text-[#C2622D]"
              />
              <span>Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNewArrival}
                onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                className="rounded text-[#C2622D]"
              />
              <span>New Arrival</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRoastOfTheMonth}
                onChange={(e) => setFormData({ ...formData, isRoastOfTheMonth: e.target.checked })}
                className="rounded text-[#C2622D]"
              />
              <span>Roast of Month</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2B1D16]/10">
            <Button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} variant="primary" size="sm">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Product Deletion"
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-[#2B1D16]/80 leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong>"{productToDelete?.name}"</strong>? This will remove the listing and trigger Cloudinary image cleanup.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button onClick={handleDeleteProduct} variant="danger" size="sm">
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* CREATE / EDIT CATEGORY MODAL */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Rename Category' : 'Create Category'}
        maxWidth="sm"
      >
        <form onSubmit={handleCategorySubmit} className="flex flex-col gap-4">
          <Input
            label="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g. Espresso Machines"
            required
          />
          <Input
            label="Description (Optional)"
            value={categoryDesc}
            onChange={(e) => setCategoryDesc(e.target.value)}
            placeholder="Curated Italian lever and pump machines..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsCategoryModalOpen(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
