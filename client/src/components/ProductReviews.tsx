import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, MessageSquarePlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Review, ReviewSummary } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';
import { useToast } from './Toast';

interface ProductReviewsProps {
  productId: string;
  productName: string;
  onReviewAdded?: () => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName,
  onReviewAdded,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({
    reviews: [],
    averageRating: 0,
    reviewCount: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  // New review form
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const data = await api.getProductReviews(productId);
      setReviewSummary(data);
    } catch (err: any) {
      console.error('Failed to load reviews', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const hasUserReviewed = Boolean(
    user && reviewSummary.reviews.some((r) => r.user === user.id || r.user === user._id)
  );

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 3) {
      error('Please write at least 3 characters in your review.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createProductReview(productId, {
        rating,
        comment: comment.trim(),
      });
      success('Your review has been published. Thank you!');
      setComment('');
      setRating(5);
      await fetchReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (err: any) {
      error(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (score: number, max: number = 5, size: string = 'w-4 h-4') => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={`${size} ${
              i < score ? 'text-[#C2622D] fill-[#C2622D]' : 'text-[#2B1D16]/20'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div id="reviews" className="bg-[#FAF6F0] rounded-2xl border border-[#2B1D16]/10 p-6 sm:p-10 shadow-xs mt-12 scroll-mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#2B1D16]/10 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C2622D]">
            Community Cupping Notes
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1D16] mt-1">
            Verified Customer Reviews
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {renderStars(Math.round(reviewSummary.averageRating), 5, 'w-5 h-5')}
          <span className="font-serif text-2xl font-bold tabular-nums text-[#2B1D16]">
            {reviewSummary.averageRating.toFixed(1)}
          </span>
          <span className="text-xs text-[#2B1D16]/60">
            ({reviewSummary.reviewCount} {reviewSummary.reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Rating breakdown & Review submission form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Star distribution bars */}
          <div className="p-5 rounded-xl bg-[#F4EDE3] border border-[#2B1D16]/10 flex flex-col gap-2.5">
            <h3 className="font-serif text-sm font-bold text-[#2B1D16] mb-1">
              Rating Distribution
            </h3>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewSummary.distribution[star] || 0;
              const percent =
                reviewSummary.reviewCount > 0
                  ? Math.round((count / reviewSummary.reviewCount) * 100)
                  : 0;

              return (
                <div key={star} className="flex items-center gap-3 text-xs text-[#2B1D16]/75">
                  <span className="w-12 font-medium flex items-center gap-1">
                    <span>{star}</span>
                    <Star className="w-3 h-3 text-[#C2622D] fill-[#C2622D]" />
                  </span>
                  <div className="flex-1 h-2 bg-[#2B1D16]/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C2622D] rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right tabular-nums text-[11px] font-mono">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Submission Form */}
          <div className="p-5 rounded-xl bg-[#F4EDE3] border border-[#2B1D16]/10 flex flex-col gap-3">
            <h3 className="font-serif text-base font-bold text-[#2B1D16] flex items-center gap-1.5">
              <MessageSquarePlus className="w-4 h-4 text-[#C2622D]" />
              <span>Share Your Tasting Experience</span>
            </h3>

            {!isAuthenticated ? (
              <div className="py-4 text-center flex flex-col items-center gap-3">
                <p className="text-xs text-[#2B1D16]/75 leading-relaxed">
                  Sign in to leave a verified sensory review for <strong>{productName}</strong>.
                </p>
                <Link to="/login">
                  <Button variant="primary" size="sm">
                    Sign in to Review
                  </Button>
                </Link>
              </div>
            ) : hasUserReviewed ? (
              <div className="py-4 text-center flex flex-col items-center gap-1 text-xs text-[#2F4A3A]">
                <CheckCircle2 className="w-6 h-6 text-[#2F4A3A] mb-1" />
                <span className="font-bold">Thank you for reviewing this roast!</span>
                <span className="text-[#2B1D16]/60">Your cupping notes are visible below.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#2B1D16]/70 block mb-1.5">
                    Your Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-[#2B1D16]/20 hover:scale-110 transition-transform cursor-pointer"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'text-[#C2622D] fill-[#C2622D]'
                              : 'text-[#2B1D16]/20'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#2B1D16] ml-2">
                      {hoverRating || rating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#2B1D16]/70 block mb-1">
                    Cupping Notes & Comments
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe aroma, acidity, mouthfeel, or brewing method used (e.g. South Indian filter, AeroPress)..."
                    className="w-full bg-[#FAF6F0] border border-[#2B1D16]/20 rounded-lg p-3 text-xs text-[#2B1D16] focus:outline-none focus:border-[#C2622D]"
                    required
                    maxLength={1000}
                  />
                  <div className="flex justify-between text-[10px] text-[#2B1D16]/50 mt-1">
                    <span>Minimum 3 characters</span>
                    <span>{comment.length} / 1000</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  variant="primary"
                  size="sm"
                  className="w-full mt-1"
                >
                  Submit Verified Review
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Review list */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-[#C2622D] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviewSummary.reviews.length === 0 ? (
            <div className="py-12 text-center bg-[#F4EDE3]/60 rounded-xl border border-dashed border-[#2B1D16]/15 p-8">
              <p className="font-serif text-lg font-bold text-[#2B1D16] mb-1">
                Be the first to review this roast
              </p>
              <p className="text-xs text-[#2B1D16]/65 max-w-sm mx-auto">
                Brew a fresh cup and share your tasting notes with the Kaapi Works community.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviewSummary.reviews.map((rev) => {
                const dateStr = new Date(rev.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div
                    key={rev._id}
                    className="p-5 rounded-xl bg-[#F4EDE3] border border-[#2B1D16]/10 flex flex-col gap-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-sm font-bold text-[#2B1D16]">
                          {rev.userName}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#2F4A3A] bg-[#2F4A3A]/10 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#2B1D16]/50">{dateStr}</span>
                    </div>

                    {renderStars(rev.rating, 5, 'w-3.5 h-3.5')}

                    <p className="text-xs text-[#2B1D16]/80 leading-relaxed pt-1">
                      {rev.comment}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
