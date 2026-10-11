import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  HelpCircle,
  Truck,
  RotateCcw,
  Coffee,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight,
  Sliders,
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'shipping' | 'returns' | 'brewing' | 'orders';
  question: string;
  answer: string | React.ReactNode;
  tags?: string[];
}

const FAQ_DATA: FAQItem[] = [
  // --- Shipping ---
  {
    id: 'ship-1',
    category: 'shipping',
    question: 'How fast do you roast and ship after an order is placed?',
    answer: (
      <div className="space-y-2">
        <p>
          We roast in artisanal small batches three mornings a week (Monday, Wednesday, and Friday) at our Indiranagar roastery in Bengaluru.
        </p>
        <p>
          Your beans are degassed for 12 hours, packed in nitrogen-flushed foil bags with one-way degassing valves, and dispatched via express air freight the same or next business day.
        </p>
      </div>
    ),
    tags: ['roasting', 'schedule', 'dispatch'],
  },
  {
    id: 'ship-2',
    category: 'shipping',
    question: 'What are the delivery timelines across India?',
    answer: (
      <div className="space-y-2">
        <p>We partner with Blue Dart Express and Delhivery Air for secure, rapid Pan-India transit:</p>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li><strong>Bengaluru & Karnataka:</strong> 24 to 36 hours.</li>
          <li><strong>Tier 1 Metros (Mumbai, Delhi NCR, Chennai, Hyderabad, Pune):</strong> 2 to 3 business days.</li>
          <li><strong>Rest of India:</strong> 3 to 5 business days.</li>
        </ul>
        <p>You will receive SMS and email tracking links the moment your parcel leaves our roastery.</p>
      </div>
    ),
    tags: ['timelines', 'delivery', 'tracking'],
  },
  {
    id: 'ship-3',
    category: 'shipping',
    question: 'What is the shipping cost policy?',
    answer: (
      <p>
        We offer <strong>Free Express Shipping</strong> across all pin codes in India on every order above <strong>₹1,499</strong>. For orders under ₹1,499, a flat shipping fee of <strong>₹99</strong> is applied to cover temperature-controlled express air freight.
      </p>
    ),
    tags: ['fees', 'free shipping', 'cost'],
  },
  {
    id: 'ship-4',
    category: 'shipping',
    question: 'How can I track the live status of my shipment?',
    answer: (
      <p>
        You can track your order at any moment by visiting your{' '}
        <Link to="/profile" className="text-[#C2622D] font-semibold underline hover:text-[#2B1D16]">
          Profile & Orders
        </Link>{' '}
        page or clicking the dedicated tracking link sent to your registered email and SMS. Our Order Status timeline visualizes Confirmed, Roasting, In Transit, and Delivered milestones in real time.
      </p>
    ),
    tags: ['tracking', 'courier', 'status'],
  },

  // --- Returns & Policies ---
  {
    id: 'ret-1',
    category: 'returns',
    question: 'What is your Roaster’s Freshness & Satisfaction Guarantee?',
    answer: (
      <div className="space-y-2">
        <p>
          We stand unconditionally behind our micro-lot roasts. If you receive coffee with a packaging rupture, incorrect roast profile, wrong grind size, or if your bag was damaged during transit, let us know within <strong>48 hours of delivery</strong>.
        </p>
        <p>
          We will immediately dispatch a complimentary fresh replacement bag or issue a complete refund—no cumbersome return shipment required for coffee beans.
        </p>
      </div>
    ),
    tags: ['guarantee', 'replacement', 'freshness'],
  },
  {
    id: 'ret-2',
    category: 'returns',
    question: 'Can whole bean or ground coffee be returned?',
    answer: (
      <p>
        Because freshly roasted coffee is a perishable agricultural food product tailored to your order, we cannot accept physical returns of opened or unopened bags for safety regulations. However, if there is any defect in roast date, seal, or grind calibration, our customer care team will swiftly make it right with a replacement or credit.
      </p>
    ),
    tags: ['food safety', 'returns', 'policy'],
  },
  {
    id: 'ret-3',
    category: 'returns',
    question: 'What is the return policy on brass filters, dabara tumblers, and grinders?',
    answer: (
      <div className="space-y-2">
        <p>
          Brewing hardware, brass dabara sets, and burr grinders carry a <strong>7-day hassle-free replacement or return window</strong>.
        </p>
        <p>
          Items must be unwashed, unused, and in their original archival packaging with all documentation intact. In the rare case of transit breakage or manufacturing blemish, we arrange a pickup and ship a replacement immediately.
        </p>
      </div>
    ),
    tags: ['gear', 'hardware', 'dabara', 'grinder'],
  },
  {
    id: 'ret-4',
    category: 'returns',
    question: 'How long does it take for a refund to reflect in my bank account?',
    answer: (
      <p>
        Once initiated by our support team, refunds are processed within <strong>24 hours</strong>. Depending on your banking partner or UPI provider, funds typically reflect in your account within <strong>3 to 5 business days</strong>.
      </p>
    ),
    tags: ['refund', 'bank', 'payment'],
  },

  // --- Brewing Tips ---
  {
    id: 'brew-1',
    category: 'brewing',
    question: 'How do I brew the perfect traditional South Indian Filter Kaapi?',
    answer: (
      <div className="space-y-3">
        <p>
          For authentic thick decoction with velvet crema, follow our artisanal roastery ratio:
        </p>
        <div className="bg-[#E8DECF]/50 p-4 rounded-lg space-y-1.5 font-sans text-xs border border-[#2B1D16]/10">
          <div><strong>1. Coffee:</strong> 25g - 30g of Kaapi Works Traditional Peaberry Blend (fine-medium grind).</div>
          <div><strong>2. Water:</strong> 100ml fresh filtered water heated to 93°C (just off the boil).</div>
          <div><strong>3. Technique:</strong> Add powder to the upper chamber. Lightly rest the umbrella pressing disc without tamp force. Pour water gently in circles.</div>
          <div><strong>4. Extraction:</strong> Cover lid and allow 12–15 minutes for gravity extraction.</div>
          <div><strong>5. Serving:</strong> Mix 1 part thick first-press decoction with 2 parts frothy boiled whole milk. Sweeten with raw palm jaggery or cane sugar. Froth between the brass dabara and tumbler for aeration!</div>
        </div>
      </div>
    ),
    tags: ['filter coffee', 'kaapi', 'brass filter', 'decoction'],
  },
  {
    id: 'brew-2',
    category: 'brewing',
    question: 'What grind size should I choose for my brewer?',
    answer: (
      <div className="space-y-2">
        <p>We offer five specialized micro-calibrated grind sizes:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded bg-[#FAF6F0] border border-[#2B1D16]/10">
            <strong>Whole Bean:</strong> Grind fresh before extraction for optimum aromatic oils.
          </div>
          <div className="p-2.5 rounded bg-[#FAF6F0] border border-[#2B1D16]/10">
            <strong>South Indian Filter:</strong> Medium-fine sand texture tailored for stainless/brass filter mesh.
          </div>
          <div className="p-2.5 rounded bg-[#FAF6F0] border border-[#2B1D16]/10">
            <strong>Pour-Over / Chemex:</strong> Medium grind resembling kosher sea salt.
          </div>
          <div className="p-2.5 rounded bg-[#FAF6F0] border border-[#2B1D16]/10">
            <strong>French Press / Cold Brew:</strong> Coarse grind like sea salt or coarse sand.
          </div>
          <div className="p-2.5 rounded bg-[#FAF6F0] border border-[#2B1D16]/10">
            <strong>Moka Pot:</strong> Fine-medium grind for pressure basket extraction.
          </div>
          <div className="p-2.5 rounded bg-[#FAF6F0] border border-[#2B1D16]/10">
            <strong>Espresso:</strong> Fine table salt texture for 9-bar pump machines.
          </div>
        </div>
      </div>
    ),
    tags: ['grind size', 'french press', 'pourover', 'espresso'],
  },
  {
    id: 'brew-3',
    category: 'brewing',
    question: 'How should I store single-origin beans to preserve peak aroma?',
    answer: (
      <div className="space-y-2">
        <p>
          Coffee has four enemies: <strong>Oxygen, Heat, Moisture, and Direct Sunlight</strong>.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li>Keep your beans inside our nitrogen-flushed pouch and firmly reseal the zip-lock.</li>
          <li>Store the pouch in a cool, dark kitchen cupboard or pantry (optimal temperature 18°C–24°C).</li>
          <li><strong>Never store whole beans in the refrigerator or freezer</strong>—condensation introduces moisture into the bean structure and degrades subtle floral & fruity notes.</li>
        </ul>
      </div>
    ),
    tags: ['storage', 'freshness', 'shelf life'],
  },
  {
    id: 'brew-4',
    category: 'brewing',
    question: 'What is the peak flavor window after the roast date?',
    answer: (
      <p>
        Freshly roasted beans release natural CO₂ gas (degassing). We recommend resting whole beans for <strong>4 to 7 days</strong> post roast date before opening the bag. Single-origin Arabica exhibits peak tasting complexity between <strong>day 7 and day 28</strong>. Sealed bags retain exceptional vibrancy for up to 3 months.
      </p>
    ),
    tags: ['degassing', 'roast date', 'shelf life'],
  },

  // --- Orders & Sourcing ---
  {
    id: 'ord-1',
    category: 'orders',
    question: 'Where do your coffees come from and what is Direct Trade?',
    answer: (
      <p>
        Every lot is 100% estate-traceable. We partner directly with historic high-altitude family estates in Chikmagalur (Bababudangiri, Mullayanagiri), Coorg, and indigenous tribal cooperatives in the Araku Valley. By bypassing intermediary auction houses, we pay our farmers premiums 35% to 60% above fair-trade floor rates, ensuring sustainable shade-canopy biodiversity.
      </p>
    ),
    tags: ['estates', 'direct trade', 'chikmagalur', 'araku'],
  },
  {
    id: 'ord-2',
    category: 'orders',
    question: 'Can I add a gift message or order customized coffee boxes?',
    answer: (
      <p>
        Yes! When purchasing discovery sets or estate coffees, you can add a personalized gift message during checkout or email us directly at <strong>care@kaapiworks.in</strong> immediately after placing your order. We hand-write cards on textured parchment paper with wax seal accents.
      </p>
    ),
    tags: ['gifts', 'custom', 'notes'],
  },
];

export const FAQPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as any) || 'all';

  const [activeCategory, setActiveCategory] = useState<'all' | 'shipping' | 'returns' | 'brewing' | 'orders'>(
    ['all', 'shipping', 'returns', 'brewing', 'orders'].includes(initialCategory) ? initialCategory : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(['ship-1', 'ret-1', 'brew-1']);

  // Sync category param if url changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ['all', 'shipping', 'returns', 'brewing', 'orders'].includes(cat)) {
      setActiveCategory(cat as any);
    }
  }, [searchParams]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCategoryChange = (cat: 'all' | 'shipping' | 'returns' | 'brewing' | 'orders') => {
    setActiveCategory(cat);
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const expandAll = () => {
    setOpenIds(filteredFAQs.map((f) => f.id));
  };

  const collapseAll = () => {
    setOpenIds([]);
  };

  // Filtered list based on category and search query
  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const questionMatch = item.question.toLowerCase().includes(q);
      const tagMatch = item.tags?.some((t) => t.toLowerCase().includes(q));
      return questionMatch || tagMatch;
    });
  }, [activeCategory, searchQuery]);

  const categories = [
    { id: 'all', label: 'All Topics', icon: HelpCircle, count: FAQ_DATA.length },
    {
      id: 'shipping',
      label: 'Shipping & Delivery',
      icon: Truck,
      count: FAQ_DATA.filter((f) => f.category === 'shipping').length,
    },
    {
      id: 'returns',
      label: 'Returns & Freshness Guarantee',
      icon: RotateCcw,
      count: FAQ_DATA.filter((f) => f.category === 'returns').length,
    },
    {
      id: 'brewing',
      label: 'Brewing & Grind Tips',
      icon: Coffee,
      count: FAQ_DATA.filter((f) => f.category === 'brewing').length,
    },
    {
      id: 'orders',
      label: 'Origins & Orders',
      icon: Sparkles,
      count: FAQ_DATA.filter((f) => f.category === 'orders').length,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4EDE3] py-10 sm:py-16 text-[#2B1D16]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#2B1D16]/60 mb-6 font-medium">
          <Link to="/" className="hover:text-[#C2622D] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#2B1D16] font-semibold">Frequently Asked Questions</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2622D]/15 text-[#C2622D] text-xs font-semibold tracking-wider uppercase mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Customer Knowledge Base</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B1D16]">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#2B1D16]/75 leading-relaxed">
            Everything you need to know about our micro-lot roast schedule, express Pan-India air shipping, freshness guarantee, and brewing masterclasses.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-10">
          <Search className="w-5 h-5 text-[#2B1D16]/40 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords: grind size, free shipping, brass filter, tracking..."
            className="w-full bg-[#FAF6F0] border border-[#2B1D16]/20 rounded-xl py-3 pl-12 pr-4 text-sm text-[#2B1D16] placeholder:text-[#2B1D16]/45 focus:outline-none focus:border-[#C2622D] focus:ring-1 focus:ring-[#C2622D]/30 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-xs text-[#2B1D16]/50 hover:text-[#2B1D16] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Topic Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2B1D16] text-[#FAF6F0] shadow-sm'
                    : 'bg-[#FAF6F0] border border-[#2B1D16]/15 text-[#2B1D16]/75 hover:bg-[#FAF6F0]/90 hover:text-[#2B1D16]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C2622D]' : 'text-[#2B1D16]/50'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                    isActive ? 'bg-[#FAF6F0]/20 text-[#FAF6F0]' : 'bg-[#2B1D16]/10 text-[#2B1D16]/70'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Bar (Count + Expand/Collapse) */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2B1D16]/10 text-xs text-[#2B1D16]/60">
          <span>
            Showing <strong className="text-[#2B1D16]">{filteredFAQs.length}</strong> questions
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={expandAll}
              className="hover:text-[#C2622D] transition-colors cursor-pointer font-medium"
            >
              Expand All
            </button>
            <span>·</span>
            <button
              onClick={collapseAll}
              className="hover:text-[#C2622D] transition-colors cursor-pointer font-medium"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* FAQ Accordion List */}
        {filteredFAQs.length === 0 ? (
          <div className="py-16 text-center bg-[#FAF6F0] border border-[#2B1D16]/10 rounded-2xl p-8">
            <HelpCircle className="w-10 h-10 text-[#C2622D] mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#2B1D16]">
              No questions matched your search
            </h3>
            <p className="text-xs text-[#2B1D16]/70 max-w-sm mx-auto mt-1 mb-4">
              Try searching with another keyword or explore one of the main categories above.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-4 py-2 rounded-md bg-[#2B1D16] text-[#FAF6F0] text-xs font-semibold hover:bg-[#C2622D] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3.5 mb-14">
            {filteredFAQs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-[#FAF6F0] border-[#2B1D16]/25 shadow-xs'
                      : 'bg-[#FAF6F0]/70 border-[#2B1D16]/10 hover:border-[#2B1D16]/20'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full py-4 px-5 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isOpen ? 'bg-[#C2622D]' : 'bg-[#2B1D16]/20'
                        }`}
                      />
                      <span className="font-serif text-base sm:text-lg font-bold text-[#2B1D16] leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    <div className="shrink-0 text-[#2B1D16]/50 mt-1">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#C2622D]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 hover:text-[#2B1D16]" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-[#2B1D16]/80 leading-relaxed border-t border-[#2B1D16]/5 animate-in fade-in duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Resource Guides / Cheat Sheets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#FAF6F0] border border-[#2B1D16]/10 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#2F4A3A]/15 text-[#2F4A3A] flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#2B1D16]">
                Express Pan-India Air
              </h4>
              <p className="text-xs text-[#2B1D16]/70 leading-relaxed">
                Free shipping on orders above ₹1,499. Temperature-monitored parcel handling with tracking across all pin codes.
              </p>
            </div>
            <Link
              to="/products"
              className="mt-4 text-xs font-semibold text-[#C2622D] hover:underline inline-flex items-center gap-1"
            >
              <span>Shop Micro-Lots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#FAF6F0] border border-[#2B1D16]/10 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#C2622D]/15 text-[#C2622D] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#2B1D16]">
                Roaster’s Freshness Promise
              </h4>
              <p className="text-xs text-[#2B1D16]/70 leading-relaxed">
                Damaged seal or incorrect grind? We dispatch an immediate replacement bag with zero questions asked within 48 hours.
              </p>
            </div>
            <a
              href="mailto:care@kaapiworks.in"
              className="mt-4 text-xs font-semibold text-[#C2622D] hover:underline inline-flex items-center gap-1"
            >
              <span>Contact Care Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="bg-[#FAF6F0] border border-[#2B1D16]/10 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-[#2B1D16]/10 text-[#2B1D16] flex items-center justify-center">
                <Coffee className="w-5 h-5 text-[#C2622D]" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#2B1D16]">
                Grind Calibration & Advice
              </h4>
              <p className="text-xs text-[#2B1D16]/70 leading-relaxed">
                Chat directly with our AI Roaster Master in the bottom right corner for custom grind recommendations tailored to your brewing device.
              </p>
            </div>
            <Link
              to="/products?category=brewing-gear"
              className="mt-4 text-xs font-semibold text-[#C2622D] hover:underline inline-flex items-center gap-1"
            >
              <span>Explore Brewing Gear</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Still Need Help? Contact Card */}
        <div className="bg-[#2B1D16] text-[#FAF6F0] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-serif text-xl sm:text-2xl font-bold">
              Still have questions about your coffee?
            </h3>
            <p className="text-xs sm:text-sm text-[#FAF6F0]/75 max-w-lg">
              Our roasters and brewing concierge team in Indiranagar are happy to help calibrate your decoctions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="mailto:care@kaapiworks.in"
              className="px-5 py-2.5 rounded-lg bg-[#C2622D] hover:bg-[#d66f36] text-[#FAF6F0] text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>care@kaapiworks.in</span>
            </a>
            <a
              href="tel:+918049201892"
              className="px-4 py-2.5 rounded-lg border border-[#FAF6F0]/20 hover:bg-[#FAF6F0]/10 text-[#FAF6F0] text-xs font-medium flex items-center gap-2 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#C2622D]" />
              <span>+91 (80) 4920-1892</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
