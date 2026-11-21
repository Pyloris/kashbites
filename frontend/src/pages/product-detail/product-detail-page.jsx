import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useGetProductByIdQuery } from '../../services/products.api.js';
import {
  useGetReviewsQuery,
  useSubmitReviewMutation,
} from '../../services/reviews.api.js';
import {
  ProductGallery,
  ProductInfo,
  ReviewSection,
  ReviewForm,
} from './components/index.js';
import {
  CertificateModal,
  PackagingVideoModal,
} from '../../components/custom/index.js';
import { Button } from '../../components/ui/index.js';
import { ChevronLeft } from 'lucide-react';

const ProductDetailContent = ({ product, onBack }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(
    product.netWeights?.[0]?.weight || '500g'
  );
  const [quantity, setQuantity] = useState(1);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  const { data: reviews = [] } = useGetReviewsQuery(product._id);
  const [submitReviewMutation] = useSubmitReviewMutation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product._id]);

  const handleReviewSubmit = async (reviewData) => {
    try {
      const res = await submitReviewMutation({
        productId: product._id,
        ...reviewData,
      }).unwrap();
      if (res) {
        setReviewSubmitSuccess(true);
        setShowReviewForm(false);
        setTimeout(() => setReviewSubmitSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const avgRating =
    reviews.length > 0
      ? Number(
          (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        )
      : Number(product.rating || 5);

  return (
    <div className="bg-brand-canvas min-h-screen pb-16">
      <div className="bg-white border-b border-brand-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="xs"
            onClick={onBack}
            leftIcon={<ChevronLeft className="w-4 h-4 text-brand-emerald" />}
            className="!px-0 font-bold"
          >
            Back to Harvest
          </Button>
          <span className="text-[11px] font-semibold text-brand-text-subtle uppercase tracking-wider">
            {product.category} · 2026 Batch
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-6">
            <ProductGallery
              product={product}
              selectedImageIndex={selectedImageIndex}
              onSelectImage={setSelectedImageIndex}
              onOpenCert={() => setIsCertModalOpen(true)}
              onOpenVideo={() => setIsVideoModalOpen(true)}
            />
          </div>

          <div className="lg:col-span-6">
            <ProductInfo
              product={product}
              selectedWeight={selectedWeight}
              onSelectWeight={setSelectedWeight}
              quantity={quantity}
              onQuantityChange={setQuantity}
              avgRating={avgRating}
              reviewsCount={reviews.length}
            />
          </div>
        </div>

        <ReviewSection
          reviews={reviews}
          showReviewForm={showReviewForm}
          onToggleReviewForm={() => setShowReviewForm(!showReviewForm)}
          reviewSubmitSuccess={reviewSubmitSuccess}
        >
          <ReviewForm onSubmitReview={handleReviewSubmit} />
        </ReviewSection>
      </div>

      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certificate={product.certificate}
        productName={product.name}
      />

      <PackagingVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        packagingVideo={product.packagingVideo}
        productName={product.name}
      />
    </div>
  );
};

export const ProductDetailPage = ({ initialProduct, onBack }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};

  const { data: fetchedProduct, isLoading: isProductQueryLoading } =
    useGetProductByIdQuery(id, {
      skip: !id || Boolean(initialProduct),
    });

  const product = initialProduct || fetchedProduct || null;
  const isLoadingProduct = !initialProduct && isProductQueryLoading;

  const handleBack = onBack || outletContext.onBack || (() => navigate(-1));

  if (isLoadingProduct) {
    return (
      <div className="bg-brand-canvas min-h-[60vh] flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-brand-emerald border-t-brand-gold animate-spin"></div>
          <p className="text-sm font-semibold text-brand-emerald">
            Loading Kashmir Valley Harvest...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-brand-canvas min-h-[60vh] flex items-center justify-center py-20 px-4">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-2xl border border-brand-sand">
          <h2 className="font-serif-brand text-2xl font-bold text-brand-text-display">
            Product Not Found
          </h2>
          <p className="text-xs text-brand-text-muted">
            The requested Kashmiri dry fruit is currently unavailable.
          </p>
          <Button variant="primary" size="sm" onClick={handleBack}>
            Back to All Dry Fruits
          </Button>
        </div>
      </div>
    );
  }

  return <ProductDetailContent product={product} onBack={handleBack} />;
};

export default ProductDetailPage;
