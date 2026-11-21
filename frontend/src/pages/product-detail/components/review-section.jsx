import React from 'react';
import { Card, Badge, Button, Alert } from '../../../components/ui/index.js';
import { Star } from 'lucide-react';

export const ReviewSection = ({
  reviews = [],
  showReviewForm,
  onToggleReviewForm,
  reviewSubmitSuccess,
  children,
}) => {
  return (
    <div className="mt-16 pt-8 border-t border-brand-sand">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif-brand text-xl sm:text-2xl font-bold text-brand-text-display">
            Customer Experiences & Verification
          </h2>
          <p className="text-xs text-brand-text-muted">Real feedback from connoisseurs across India</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onToggleReviewForm}
        >
          {showReviewForm ? 'Cancel Review' : 'Write a Review'}
        </Button>
      </div>

      {showReviewForm && children}

      {reviewSubmitSuccess && (
        <Alert variant="success" className="mb-6">
          Thank you! Your verified review has been published.
        </Alert>
      )}

      {reviews.length === 0 ? (
        <p className="text-xs text-brand-text-subtle">No reviews yet. Be the first to share your experience!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r, i) => (
            <Card key={r._id || i} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${s < r.rating ? 'fill-current text-brand-gold' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                <Badge variant="neutral" size="sm">
                  Verified Buyer
                </Badge>
              </div>
              <h4 className="text-xs font-bold text-brand-text-display">{r.title}</h4>
              <p className="text-xs text-brand-text-muted leading-relaxed">{r.comment}</p>
              {r.images && r.images.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {r.images.map((img, imgIdx) => (
                    <img
                      key={imgIdx}
                      src={img}
                      alt="Review attachment"
                      className="w-12 h-12 object-cover rounded-md border border-brand-sand"
                    />
                  ))}
                </div>
              )}
              <div className="text-[10px] text-brand-text-subtle pt-1">
                {r.author} {r.location ? `· ${r.location}` : ''}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
