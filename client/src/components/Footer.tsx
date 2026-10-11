import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, MapPin, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { NewsletterSignup } from './NewsletterSignup';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2B1D16] text-[#FAF6F0] pt-14 pb-12 border-t border-[#3F2C22]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Signup Component */}
        <div className="mb-14">
          <NewsletterSignup />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#FAF6F0]/10">
          {/* Brand & Ethos */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#C2622D] flex items-center justify-center text-[#FAF6F0]">
                <Coffee className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#FAF6F0]">
                Kaapi Works
              </span>
            </div>
            <p className="text-sm text-[#FAF6F0]/75 leading-relaxed max-w-sm">
              Artisanal single-origin roastery celebrating the historic high-elevation estates of the Western Ghats and Eastern Ghats. We roast exclusively to order in micro-batches.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#FAF6F0]/60 mt-2">
              <MapPin className="w-4 h-4 text-[#C2622D] shrink-0" />
              <span>Roastery: Indiranagar, Bengaluru, Karnataka 560038</span>
            </div>
          </div>

          {/* Sourced Estates */}
          <div className="flex flex-col gap-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#C2622D]">
              Estate Origins
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-[#FAF6F0]/75">
              <li>
                <Link to="/products?search=Chikmagalur" className="hover:text-[#FAF6F0] transition-colors">
                  Chikmagalur (1,350m)
                </Link>
              </li>
              <li>
                <Link to="/products?search=Coorg" className="hover:text-[#FAF6F0] transition-colors">
                  Coorg Peaberry (1,200m)
                </Link>
              </li>
              <li>
                <Link to="/products?search=Araku" className="hover:text-[#FAF6F0] transition-colors">
                  Araku Valley Honey (1,150m)
                </Link>
              </li>
              <li>
                <Link to="/products?search=Wayanad" className="hover:text-[#FAF6F0] transition-colors">
                  Wayanad Malabar AA (1,000m)
                </Link>
              </li>
              <li>
                <Link to="/products?search=Shevaroy" className="hover:text-[#FAF6F0] transition-colors">
                  Shevaroy High-Grown (1,500m)
                </Link>
              </li>
            </ul>
          </div>

          {/* Specialty Gear */}
          <div className="flex flex-col gap-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#C2622D]">
              Brewing Collection
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-[#FAF6F0]/75">
              <li>
                <Link to="/products?category=brewing-gear" className="hover:text-[#FAF6F0] transition-colors">
                  Brass Filter Sets
                </Link>
              </li>
              <li>
                <Link to="/products?category=brewing-gear" className="hover:text-[#FAF6F0] transition-colors">
                  Pour-Over & Kettles
                </Link>
              </li>
              <li>
                <Link to="/products?category=grinders" className="hover:text-[#FAF6F0] transition-colors">
                  Conical Burr Grinders
                </Link>
              </li>
              <li>
                <Link to="/products?category=mugs-accessories" className="hover:text-[#FAF6F0] transition-colors">
                  Dabara Tumblers
                </Link>
              </li>
              <li>
                <Link to="/products?category=gift-sets" className="hover:text-[#FAF6F0] transition-colors">
                  Discovery Gift Boxes
                </Link>
              </li>
            </ul>
          </div>

          {/* Roastery Support */}
          <div className="flex flex-col gap-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#C2622D]">
              Customer Care & FAQ
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-[#FAF6F0]/75">
              <li>
                <Link to="/faq" className="hover:text-[#FAF6F0] text-[#FAF6F0] font-semibold transition-colors flex items-center gap-1">
                  <span>Frequently Asked Questions</span>
                  <ArrowUpRight className="w-3 h-3 text-[#C2622D]" />
                </Link>
              </li>
              <li>
                <Link to="/faq?category=shipping" className="hover:text-[#FAF6F0] transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/faq?category=returns" className="hover:text-[#FAF6F0] transition-colors">
                  Returns & Guarantee
                </Link>
              </li>
              <li>
                <Link to="/faq?category=brewing" className="hover:text-[#FAF6F0] transition-colors">
                  Brewing & Grind Guides
                </Link>
              </li>
              <li className="pt-1 flex items-center gap-1.5 text-[#FAF6F0]/60">
                <Mail className="w-3.5 h-3.5 text-[#C2622D]" />
                <span>care@kaapiworks.in</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#FAF6F0]/60">
                <Phone className="w-3.5 h-3.5 text-[#C2622D]" />
                <span>+91 (80) 4920-1892</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF6F0]/50">
          <p>© {new Date().getFullYear()} Kaapi Works Specialty Roasters Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Direct Trade Verified</span>
            <span>·</span>
            <span>Plastic-Neutral Packaging</span>
            <span>·</span>
            <span>Prices inclusive of GST</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
