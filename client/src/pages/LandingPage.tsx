import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Compass, ShieldCheck, Flame, Coffee, PackageCheck } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { CardSkeleton } from '../components/Skeleton';
import { RoastIndicator } from '../components/RoastIndicator';
import { formatINR, getFallbackImage } from '../utils/formatters';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';

export const LandingPage: React.FC = () => {
  const { addToCart } = useCart();
  const [highlights, setHighlights] = useState<{
    featured: Product[];
    newArrivals: Product[];
    roastOfTheMonth: Product | null;
  }>({ featured: [], newArrivals: [], roastOfTheMonth: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHighlights() {
      try {
        const data = await api.getProductHighlights();
        setHighlights(data);
      } catch (err) {
        console.error('Failed to load highlights', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHighlights();
  }, []);

  const categories = [
    {
      name: 'Whole Bean Coffee',
      slug: 'whole-bean-coffee',
      count: '9 Roasts',
      description: 'Single-origin estate beans from Chikmagalur, Coorg, and Araku.',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Brewing Gear',
      slug: 'brewing-gear',
      count: '7 Brewers',
      description: 'Traditional brass filters, pour-over drippers, and French presses.',
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Precision Grinders',
      slug: 'grinders',
      count: '4 Mills',
      description: 'CNC stainless steel conical burr hand and electric grinders.',
      image: 'https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Mugs & Dabaras',
      slug: 'mugs-accessories',
      count: '4 Vessels',
      description: 'Solid brass Kumbakonam dabaras and studio ceramics.',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Estate Gift Sets',
      slug: 'gift-sets',
      count: '2 Bundles',
      description: 'Curated 4-estate tasting flights and heirlooms.',
      image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const roast = highlights.roastOfTheMonth;

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Asymmetric Hero Section */}
      <section className="relative overflow-hidden bg-[#F4EDE3] border-b border-[#2B1D16]/10 pt-8 pb-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Headline & Ethos */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C2622D]">
                <Compass className="w-4 h-4" />
                <span>Single-Estate Origin · Small Batch Roastery</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#2B1D16] tracking-tight leading-[1.08] text-balance">
                Small Indian Estates. Obsessive Roasts.
              </h1>

              <p className="text-base sm:text-lg text-[#2B1D16]/75 leading-relaxed max-w-xl">
                We source directly from shade-grown estates nestled along the Western Ghats and Araku Valley. Roasted weekly in Bengaluru, ground to your ritual, and dispatched fresh.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/products">
                  <Button variant="primary" size="lg">
                    <span>Explore Roasts & Gear</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>

                <a href="#story">
                  <Button variant="outline" size="lg">
                    Our Estate Story
                  </Button>
                </a>
              </div>

              {/* Trust markers */}
              <div className="pt-6 border-t border-[#2B1D16]/10 grid grid-cols-3 gap-4 text-xs text-[#2B1D16]/70">
                <div>
                  <strong className="block text-sm font-bold text-[#2B1D16] tabular-nums">1,350m+</strong>
                  <span>High Elevation Lots</span>
                </div>
                <div>
                  <strong className="block text-sm font-bold text-[#2B1D16] tabular-nums">48 Hours</strong>
                  <span>Roast to Dispatch</span>
                </div>
                <div>
                  <strong className="block text-sm font-bold text-[#2B1D16] tabular-nums">100%</strong>
                  <span>Direct Trade Sourced</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Showcase Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#2B1D16]/15 shadow-xl bg-[#FAF6F0] aspect-4/3 sm:aspect-1/1">
                <img
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1000&auto=format&fit=crop&q=80"
                  alt="Kaapi Works Specialty Coffee Setup"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B1D16]/80 via-[#2B1D16]/20 to-transparent" />

                {/* Floating highlight badge */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-[#FAF6F0]/95 backdrop-blur-md border border-[#2B1D16]/15 text-[#2B1D16] flex items-center justify-between shadow-lg">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-[#C2622D]">
                      Featured Harvest
                    </span>
                    <strong className="font-serif text-sm font-bold">Chikmagalur Reserve Arabica</strong>
                    <span className="text-xs text-[#2B1D16]/70">Tasting: Dark Chocolate · Almond</span>
                  </div>
                  <Link to="/products?search=Chikmagalur">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2B1D16] text-[#FAF6F0] hover:bg-[#C2622D] transition-colors cursor-pointer">
                      View
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Showcase */}
      <section className="py-16 bg-[#FAF6F0] border-b border-[#2B1D16]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C2622D]">
                Curated Collections
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#2B1D16] mt-1">
                From Estate Green to Morning Cup
              </h2>
            </div>
            <Link
              to="/products"
              className="text-sm font-semibold text-[#2B1D16] hover:text-[#C2622D] flex items-center gap-1 transition-colors"
            >
              <span>View All 26 Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="group flex flex-col bg-[#F4EDE3] border border-[#2B1D16]/10 rounded-xl overflow-hidden hover:border-[#2B1D16]/25 hover:shadow-md transition-all duration-200"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-[#2B1D16]/5">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#2B1D16]/80 text-[#FAF6F0] text-[10px] font-medium backdrop-blur-xs">
                    {cat.count}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#2B1D16] group-hover:text-[#C2622D] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#2B1D16]/70 mt-1 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#C2622D] mt-3 flex items-center gap-1">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Roast of the Month Highlight Banner */}
      {roast && (
        <section className="py-16 bg-[#2B1D16] text-[#FAF6F0] border-b border-[#3F2C22] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Image */}
              <div className="lg:col-span-5">
                <div className="rounded-xl overflow-hidden border border-[#FAF6F0]/15 shadow-2xl aspect-4/3">
                  <img
                    src={roast.images?.[0]?.url || getFallbackImage(roast.name)}
                    alt={roast.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getFallbackImage(roast.name);
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Editorial Description */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#C2622D] text-[#FAF6F0] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    Roast of the Month
                  </span>
                  <span className="text-xs text-[#FAF6F0]/60">October Selection</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF6F0] tracking-tight">
                  {roast.name}
                </h2>

                <p className="text-sm sm:text-base text-[#FAF6F0]/80 leading-relaxed max-w-xl">
                  {roast.description}
                </p>

                {/* Roast Level & Tasting Notes */}
                <div className="py-3 border-y border-[#FAF6F0]/10 flex flex-wrap items-center gap-6 text-xs">
                  <div>
                    <span className="text-[#FAF6F0]/50 block mb-1">Roast Profile</span>
                    <RoastIndicator level={roast.roastLevel} showLabel={true} size="md" />
                  </div>

                  <div>
                    <span className="text-[#FAF6F0]/50 block mb-1">Estate & Altitude</span>
                    <strong className="text-[#FAF6F0]">
                      {roast.estate || 'Araku Valley'} · {roast.altitude || '1,200m'}
                    </strong>
                  </div>

                  {roast.tastingNotes && roast.tastingNotes.length > 0 && (
                    <div>
                      <span className="text-[#FAF6F0]/50 block mb-1">Tasting Notes</span>
                      <strong className="text-[#C2622D]">
                        {roast.tastingNotes.join(' · ')}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Price and CTA */}
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#FAF6F0]/50 uppercase tracking-wider">
                      250g Whole Bean
                    </span>
                    <span className="font-serif text-2xl font-bold tabular-nums text-[#FAF6F0]">
                      {formatINR(roast.price)}
                    </span>
                  </div>

                  <Button
                    onClick={() => addToCart(roast._id, 1, roast)}
                    variant="primary"
                    size="lg"
                    className="shadow-lg"
                  >
                    <span>Add to Coffee Bag</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Roasts Grid */}
      <section className="py-16 bg-[#F4EDE3] border-b border-[#2B1D16]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C2622D]">
                Roaster’s Choice
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#2B1D16] mt-1">
                Featured Specialty Harvests
              </h2>
            </div>
            <Link
              to="/products?category=whole-bean-coffee"
              className="text-sm font-semibold text-[#2B1D16] hover:text-[#C2622D] flex items-center gap-1 transition-colors"
            >
              <span>Explore All Whole Beans</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlights.featured.slice(0, 6).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Farm-To-Cup Story Section */}
      <section id="story" className="py-20 bg-[#FAF6F0] border-b border-[#2B1D16]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C2622D]">
              Direct Sourcing Ethos
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1D16] mt-2 mb-4">
              Honoring India’s Great Coffee Terroirs
            </h2>
            <p className="text-sm sm:text-base text-[#2B1D16]/75 leading-relaxed">
              India is the only country in the world where 100% of coffee is cultivated under a dense two-tier canopy of native shade trees. This slows ripening, concentrates natural fruit sugars, and supports wildlife biodiversity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-[#F4EDE3] border border-[#2B1D16]/10 rounded-xl flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#C2622D] font-bold">01. CHIKMAGALUR</span>
                <h3 className="font-serif text-xl font-bold text-[#2B1D16] mt-1 mb-2">
                  The Historic Cradle
                </h3>
                <p className="text-xs text-[#2B1D16]/70 leading-relaxed">
                  Home to India’s oldest coffee plantations. Elevated at 1,350m amidst cardamom and pepper vines, producing nutty chocolate tones with mild stone fruit sweetness.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#2B1D16]/10 text-xs font-medium text-[#2B1D16]/80">
                1,250 – 1,400m elevation
              </div>
            </div>

            <div className="p-6 bg-[#F4EDE3] border border-[#2B1D16]/10 rounded-xl flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#C2622D] font-bold">02. COORG (KODAGU)</span>
                <h3 className="font-serif text-xl font-bold text-[#2B1D16] mt-1 mb-2">
                  Highland Peaberries
                </h3>
                <p className="text-xs text-[#2B1D16]/70 leading-relaxed">
                  Deep volcanic loam nourished by southwest monsoons. Renowned for round single-seed peaberries that roast evenly, yielding molasses and roasted pecan body.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#2B1D16]/10 text-xs font-medium text-[#2B1D16]/80">
                1,150 – 1,300m elevation
              </div>
            </div>

            <div className="p-6 bg-[#F4EDE3] border border-[#2B1D16]/10 rounded-xl flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#C2622D] font-bold">03. ARAKU VALLEY</span>
                <h3 className="font-serif text-xl font-bold text-[#2B1D16] mt-1 mb-2">
                  Tribal Honey Micro-Lots
                </h3>
                <p className="text-xs text-[#2B1D16]/70 leading-relaxed">
                  Cultivated in red-soil valleys of Andhra Pradesh by indigenous farmers. Natural honey sun-drying infuses high berry sweetness and complex hibiscus florals.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#2B1D16]/10 text-xs font-medium text-[#2B1D16]/80">
                1,100 – 1,300m elevation
              </div>
            </div>

            <div className="p-6 bg-[#F4EDE3] border border-[#2B1D16]/10 rounded-xl flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#C2622D] font-bold">04. WAYANAD & MALABAR</span>
                <h3 className="font-serif text-xl font-bold text-[#2B1D16] mt-1 mb-2">
                  Monsooned Alchemy
                </h3>
                <p className="text-xs text-[#2B1D16]/70 leading-relaxed">
                  Aged for 12 weeks against humid maritime winds on Kerala’s coast. Neutralizes acidity and swells the beans to create an unforgettably velvety, spicy brew.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#2B1D16]/10 text-xs font-medium text-[#2B1D16]/80">
                900 – 1,100m elevation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Guarantee & Features Strip */}
      <section className="py-12 bg-[#F4EDE3] border-b border-[#2B1D16]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#C2622D]/10 text-[#C2622D] flex items-center justify-center shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-[#2B1D16]">Roasted to Order</h4>
                <p className="text-xs text-[#2B1D16]/70 mt-1 leading-relaxed">
                  Every batch is roasted in Bengaluru within 48 hours of your order. Never sitting in warehouses for months.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#C2622D]/10 text-[#C2622D] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-[#2B1D16]">Heavy Solid Brass Gear</h4>
                <p className="text-xs text-[#2B1D16]/70 mt-1 leading-relaxed">
                  Our South Indian filters and dabaras are handcrafted from virgin brass by multi-generational artisans.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#C2622D]/10 text-[#C2622D] flex items-center justify-center shrink-0">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-[#2B1D16]">Pan-India Express Dispatch</h4>
                <p className="text-xs text-[#2B1D16]/70 mt-1 leading-relaxed">
                  Free express shipping on all orders over ₹1,499. Air-sealed valve bags preserve aromatic peak freshness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
