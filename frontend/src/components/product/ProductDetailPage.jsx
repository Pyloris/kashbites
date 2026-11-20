import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useGetProductByIdQuery } from '../../services/products.api.js';
import { useGetReviewsQuery, useSubmitReviewMutation } from '../../services/reviews.api.js';
import { useUploadMediaMutation } from '../../services/media.api.js';
import { CertificateModal } from '../modals/CertificateModal.jsx';
import { PackagingVideoModal } from '../modals/PackagingVideoModal.jsx';
import { Star, ShoppingBag, Zap, ShieldCheck, PlayCircle, Award, CheckCircle2, ChevronLeft, Truck, RotateCcw, Sparkles, MapPin, Leaf, Camera, X, } from 'lucide-react';

const ProductDetailContent = ({ product, onBack, onSelectProduct }) => {
    const { addToCart, buyNow } = useCart();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedWeight, setSelectedWeight] = useState(product.netWeights[0]?.weight || '500g');
    const [quantity, setQuantity] = useState(1);
    const [isCertModalOpen, setIsCertModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({
        author: '',
        location: '',
        rating: 5,
        title: '',
        comment: '',
        images: [],
    });
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

    const { data: reviews = [] } = useGetReviewsQuery(product._id);
    const [submitReviewMutation] = useSubmitReviewMutation();
    const [uploadMediaMutation] = useUploadMediaMutation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [product._id]);

    const currentWeightObj = product.netWeights.find((w) => w.weight === selectedWeight) || product.netWeights[0];
    const currentPrice = (currentWeightObj?.price || product.price) * quantity;
    const originalPriceCalculated = Math.round(currentPrice * 1.25);

    const handleReviewImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setIsUploadingImage(true);
        try {
            const url = await uploadMediaMutation({ file, folder: 'reviews' }).unwrap();
            if (url) {
                setNewReview((prev) => ({ ...prev, images: [...prev.images, url] }));
            }
        } catch (err) {
            console.error('Error uploading media:', err);
        } finally {
            setIsUploadingImage(false);
            e.target.value = '';
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.author || !newReview.title || !newReview.comment)
            return;
        try {
            const res = await submitReviewMutation({
                productId: product._id,
                author: newReview.author,
                location: newReview.location || 'Kashmir Lover',
                rating: newReview.rating,
                title: newReview.title,
                comment: newReview.comment,
                images: newReview.images,
            }).unwrap();
            if (res) {
                setReviewSubmitSuccess(true);
                setNewReview({
                    author: '',
                    location: '',
                    rating: 5,
                    title: '',
                    comment: '',
                    images: [],
                });
                setShowReviewForm(false);
                setTimeout(() => setReviewSubmitSuccess(false), 5000);
            }
        } catch (err) {
            console.error('Error submitting review:', err);
        }
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : product.rating;

    return (
        <div className="bg-[#FAF7F2] min-h-screen pb-16">
            {/* Top Bar / Breadcrumb */}
            <div className="bg-white border-b border-[#E8DEC8]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#143E26] hover:text-[#C59432] transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Harvest
                    </button>
                    <span className="text-[11px] font-semibold text-[#8B988E] uppercase tracking-wider">
                        {product.category} · 2026 Batch
                    </span>
                </div>
            </div>

            {/* Main Product Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* LEFT COLUMN: Gallery */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-[#E8DEC8] shadow-sm">
                            <img src={product.images[selectedImageIndex] || product.primaryImage} alt={product.name} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-[#143E26]/90 backdrop-blur-xs text-[#FAF7F2] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-[#C59432]">
                                {product.origin}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {product.images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${selectedImageIndex === idx ? 'border-[#143E26] shadow-md scale-102' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Action Modals Links */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => setIsCertModalOpen(true)}
                                className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-[#F2ECE1] border border-[#C59432]/60 rounded-xl text-xs font-bold text-[#143E26] transition-colors shadow-2xs"
                            >
                                <ShieldCheck className="w-4 h-4 text-[#C59432]" />
                                View Lab Purity Certificate
                            </button>
                            <button
                                onClick={() => setIsVideoModalOpen(true)}
                                className="flex items-center justify-center gap-2 p-3 bg-[#143E26] hover:bg-[#0E331E] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                            >
                                <PlayCircle className="w-4 h-4 text-[#DFB248]" />
                                Watch Packaging Video
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Details & Purchase */}
                    <div className="lg:col-span-6 space-y-6">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-[#C59432] block mb-1">
                                {product.tagline}
                            </span>
                            <h1 className="font-serif-brand text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0E331E] leading-tight">
                                {product.name}
                            </h1>
                            <p className="text-xs text-[#526356] mt-1">{product.subtitle}</p>

                            <div className="flex items-center gap-3 mt-3">
                                <div className="flex items-center gap-1 bg-[#143E26] text-white px-2 py-0.5 rounded-md text-xs font-bold">
                                    <span>{avgRating}</span>
                                    <Star className="w-3 h-3 fill-current text-[#DFB248]" />
                                </div>
                                <span className="text-xs text-[#526356]">
                                    ({reviews.length} certified customer reviews)
                                </span>
                            </div>
                        </div>

                        {/* Price Card */}
                        <div className="p-4 bg-white rounded-xl border border-[#E8DEC8] flex items-baseline justify-between shadow-2xs">
                            <div>
                                <span className="text-xs text-[#526356] block">Harvest Direct Price:</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-[#143E26]">₹{currentPrice}</span>
                                    <span className="text-sm line-through text-[#8B988E]">₹{originalPriceCalculated}</span>
                                    <span className="text-xs font-bold text-[#C59432] bg-[#F7F3EA] px-2 py-0.5 rounded">
                                        Save ₹{originalPriceCalculated - currentPrice}
                                    </span>
                                </div>
                            </div>
                            <span className="text-[10px] text-[#526356] text-right">
                                Taxes Included<br />
                                Free Delivery over ₹999
                            </span>
                        </div>

                        {/* Weight Variants */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-[#143E26] block mb-2">
                                Select Nitrogen-Sealed Net Weight:
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {product.netWeights.map((nw) => (
                                    <button
                                        key={nw.weight}
                                        onClick={() => setSelectedWeight(nw.weight)}
                                        className={`p-3 rounded-xl border-2 text-center transition-all ${selectedWeight === nw.weight ? 'border-[#143E26] bg-[#143E26]/5 text-[#143E26] font-bold shadow-2xs' : 'border-[#E8DEC8] bg-white text-[#526356] hover:border-[#C59432]'}`}
                                    >
                                        <span className="block text-sm">{nw.weight}</span>
                                        <span className="block text-xs text-[#C59432]">₹{nw.price}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity & CTA Buttons */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center border border-[#E8DEC8] rounded-xl bg-white overflow-hidden">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="px-3 py-2.5 text-[#143E26] hover:bg-[#F2ECE1] font-bold text-sm"
                                    >
                                        -
                                    </button>
                                    <span className="px-3 py-2 text-xs font-bold text-[#143E26] min-w-8 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity((q) => q + 1)}
                                        className="px-3 py-2.5 text-[#143E26] hover:bg-[#F2ECE1] font-bold text-sm"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={() => addToCart(product, selectedWeight, quantity)}
                                    className="flex-1 bg-white hover:bg-[#F2ECE1] text-[#143E26] border-2 border-[#143E26] py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    Add to Harvest Box
                                </button>
                            </div>

                            <button
                                onClick={() => buyNow(product, selectedWeight, quantity)}
                                className="w-full bg-[#143E26] hover:bg-[#0E331E] text-[#FAF7F2] py-3 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                                <Zap className="w-4 h-4 text-[#DFB248] fill-current" />
                                Instant Express Checkout (COD Available)
                            </button>
                        </div>

                        {/* Key Trust Notes */}
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E8DEC8]">
                            <div className="flex items-center gap-2 text-xs text-[#526356]">
                                <Truck className="w-4 h-4 text-[#C59432] shrink-0" />
                                <span>Express 2-3 Day Air Delivery</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#526356]">
                                <RotateCcw className="w-4 h-4 text-[#C59432] shrink-0" />
                                <span>100% Purity Replacement Guarantee</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="pt-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#143E26] mb-1">
                                Valley Heritage & Nutrition
                            </h3>
                            <p className="text-xs text-[#526356] leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <div className="mt-16 pt-8 border-t border-[#E8DEC8]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-serif-brand text-xl sm:text-2xl font-bold text-[#0E331E]">
                                Customer Experiences & Verification
                            </h2>
                            <p className="text-xs text-[#526356]">Real feedback from connoisseurs across India</p>
                        </div>

                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="px-4 py-2 bg-[#143E26] text-white text-xs font-bold rounded-xl hover:bg-[#0E331E] transition-colors"
                        >
                            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                        </button>
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                        <form onSubmit={handleReviewSubmit} className="mb-8 p-6 bg-white rounded-2xl border border-[#E8DEC8] space-y-4 max-w-xl">
                            <h3 className="font-serif-brand text-base font-bold text-[#143E26]">Share Your Tasting Note</h3>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-[#526356] block mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newReview.author}
                                        onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2]"
                                        placeholder="Owais Ahmad"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-[#526356] block mb-1">City / Location</label>
                                    <input
                                        type="text"
                                        value={newReview.location}
                                        onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2]"
                                        placeholder="Srinagar / Delhi"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-[#526356] block mb-1">Rating (1 to 5 Stars)</label>
                                <select
                                    value={newReview.rating}
                                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2]"
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Exceptional Kashmir Origin</option>
                                    <option value="4">⭐⭐⭐⭐ 4 Stars - Very Crisp and Fresh</option>
                                    <option value="3">⭐⭐⭐ 3 Stars - Average Quality</option>
                                    <option value="2">⭐⭐ 2 Stars - Below Expectation</option>
                                    <option value="1">⭐ 1 Star - Unsatisfactory</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-[#526356] block mb-1">Review Headline</label>
                                <input
                                    type="text"
                                    required
                                    value={newReview.title}
                                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2]"
                                    placeholder="Crisp kernels with fragrant natural oil..."
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-[#526356] block mb-1">Review Details</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF7F2]"
                                    placeholder="Explain the texture, freshness, aroma, and packaging experience..."
                                />
                            </div>

                            {/* Image Upload for Review */}
                            <div>
                                <label className="text-[11px] font-bold text-[#526356] block mb-1">Attach Unboxing / Product Photos</label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 px-3 py-2 bg-[#F2ECE1] hover:bg-[#E8DEC8] text-[#143E26] rounded-lg text-xs font-semibold cursor-pointer border border-[#C59432]/40">
                                        <Camera className="w-4 h-4 text-[#C59432]" />
                                        <span>{isUploadingImage ? 'Uploading to MinIO...' : 'Upload Image'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleReviewImageUpload}
                                            disabled={isUploadingImage}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="text-[10px] text-[#8B988E]">Optional photos of nitrogen pouch</span>
                                </div>

                                {newReview.images.length > 0 && (
                                    <div className="flex gap-2 mt-2">
                                        {newReview.images.map((img, i) => (
                                            <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#C59432]">
                                                <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#143E26] hover:bg-[#0E331E] text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                            >
                                Submit Certified Review
                            </button>
                        </form>
                    )}

                    {reviewSubmitSuccess && (
                        <div className="mb-6 p-4 bg-[#EAF2EC] border border-[#143E26] text-[#143E26] rounded-xl text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#143E26]" />
                            Thank you! Your verified review has been published.
                        </div>
                    )}

                    {/* Review Cards Grid */}
                    {reviews.length === 0 ? (
                        <p className="text-xs text-[#8B988E]">No reviews yet. Be the first to share your experience!</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reviews.map((r, i) => (
                                <div key={r._id || i} className="p-4 bg-white rounded-xl border border-[#E8DEC8] space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, s) => (
                                                <Star
                                                    key={s}
                                                    className={`w-3 h-3 ${s < r.rating ? 'fill-current text-[#DFB248]' : 'text-gray-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-[#8B988E]">Verified Harvest Buyer</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-[#0E331E]">{r.title}</h4>
                                    <p className="text-xs text-[#526356] leading-relaxed">{r.comment}</p>
                                    {r.images && r.images.length > 0 && (
                                        <div className="flex gap-2 pt-1">
                                            {r.images.map((img, imgIdx) => (
                                                <img key={imgIdx} src={img} alt="Review attachment" className="w-12 h-12 object-cover rounded-md border border-[#E8DEC8]" />
                                            ))}
                                        </div>
                                    )}
                                    <div className="text-[10px] text-[#8B988E] pt-1">
                                        {r.author} {r.location ? `· ${r.location}` : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
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

export const ProductDetailPage = ({ initialProduct, onBack, onSelectProduct, }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};

  const { data: fetchedProduct, isLoading: isProductQueryLoading } = useGetProductByIdQuery(id, {
    skip: !id || Boolean(initialProduct),
  });

  const product = initialProduct || fetchedProduct || null;
  const isLoadingProduct = !initialProduct && isProductQueryLoading;

  const handleBack = onBack || outletContext.onBack || (() => navigate(-1));
  const handleSelectProduct = onSelectProduct || outletContext.onSelectProduct || ((newId) => navigate(`/product/${newId}`));

  if (isLoadingProduct) {
    return (
      <div className="bg-[#FAF7F2] min-h-[60vh] flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-[#143E26] border-t-[#DFB248] animate-spin"></div>
          <p className="text-sm font-semibold text-[#143E26]">Loading Kashmir Valley Harvest...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#FAF7F2] min-h-[60vh] flex items-center justify-center py-20 px-4">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-2xl border border-[#E8DEC8]">
          <h2 className="font-serif-brand text-2xl font-bold text-[#0E331E]">Product Not Found</h2>
          <p className="text-xs text-[#526356]">The requested Kashmiri dry fruit is currently unavailable.</p>
          <button onClick={handleBack} className="px-5 py-2.5 rounded-lg bg-[#143E26] text-white text-xs font-semibold cursor-pointer">
            Back to All Dry Fruits
          </button>
        </div>
      </div>
    );
  }

  return <ProductDetailContent product={product} onBack={handleBack} onSelectProduct={handleSelectProduct} />;
};
