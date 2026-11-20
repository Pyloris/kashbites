import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { fetchProductById, fetchReviews, submitReview, uploadMediaApi } from '../../services/api.js';
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
    const [reviews, setReviews] = useState([]);
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
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchReviews(product._id).then(setReviews);
    }, [product._id]);
    const currentWeightObj = product.netWeights.find((w) => w.weight === selectedWeight) || product.netWeights[0];
    const currentPrice = (currentWeightObj?.price || product.price) * quantity;
    const originalPriceCalculated = Math.round(currentPrice * 1.25);
    const handleReviewImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setIsUploadingImage(true);
        const url = await uploadMediaApi(file, 'reviews');
        if (url) {
            setNewReview((prev) => ({ ...prev, images: [...prev.images, url] }));
        }
        setIsUploadingImage(false);
        e.target.value = '';
    };
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.author || !newReview.title || !newReview.comment)
            return;
        const saved = await submitReview({
            productId: product._id,
            ...newReview,
        });
        if (saved) {
            setReviews((prev) => [saved, ...prev]);
            setReviewSubmitSuccess(true);
            setShowReviewForm(false);
            setNewReview({ author: '', location: '', rating: 5, title: '', comment: '', images: [] });
            setTimeout(() => setReviewSubmitSuccess(false), 4000);
        }
    };
    return (<div className="bg-[#FAF7F2] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Back Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#6B7D70] mb-6">
          <button onClick={onBack} className="flex items-center gap-1 hover:text-[#0E331E] font-medium transition-colors">
            <ChevronLeft className="w-4 h-4"/>
            <span>Back to All Dry Fruits</span>
          </button>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-[#0E331E] font-semibold">{product.name}</span>
        </div>

        {/* 2-Column Product Showcase: Pictures Left & Purchase Module Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ================= LEFT COLUMN: PRODUCT PICTURES & MEDIA ================= */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Primary Large Picture View */}
            <div className="relative bg-white rounded-2xl overflow-hidden border border-[#E6DECF] shadow-sm aspect-4/3 sm:aspect-16/10">
              <img src={product.images[selectedImageIndex] || product.images[0]} alt={product.name} className="w-full h-full object-cover transition-all duration-300" referrerPolicy="no-referrer"/>

              {/* Verified Kashmir Origin Watermark Stamp */}
              <div className="absolute top-4 left-4 bg-[#143E26]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md">
                <Leaf className="w-3.5 h-3.5 text-[#DFB248]"/>
                <span>100% Kashmir Origin</span>
              </div>

              {/* Direct Overlaid Video Watch Badge */}
              <button onClick={() => setIsVideoModalOpen(true)} className="absolute bottom-4 right-4 bg-[#0A2416]/90 hover:bg-[#143E26] text-[#DFB248] backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-[#DFB248]/50 shadow-lg transition-all active:scale-95">
                <PlayCircle className="w-4 h-4 text-[#DFB248]"/>
                <span>Watch Packaging in Srinagar</span>
              </button>
            </div>

            {/* Thumbnail Row */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {product.images.map((img, idx) => (<button key={idx} onClick={() => setSelectedImageIndex(idx)} className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === idx
                ? 'border-[#C59432] ring-2 ring-[#C59432]/30 scale-95 shadow-xs'
                : 'border-[#E6DECF] opacity-75 hover:opacity-100'}`}>
                  <img src={img} alt={`${product.name} packaging shot ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
                </button>))}

              {/* Quick Video Thumbnail Card */}
              <button onClick={() => setIsVideoModalOpen(true)} className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-[#C59432] bg-[#143E26] text-[#DFB248] flex flex-col items-center justify-center p-2 text-center hover:bg-[#1C5134] transition-colors">
                <PlayCircle className="w-6 h-6 mb-1 text-[#DFB248]"/>
                <span className="text-[10px] font-bold uppercase leading-tight">Packaging Video</span>
              </button>
            </div>

            {/* Trust Assurance Cards Below Pictures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div onClick={() => setIsCertModalOpen(true)} className="p-4 rounded-xl bg-white border border-[#E6DECF] hover:border-[#C59432] shadow-xs cursor-pointer transition-all flex items-start gap-3 group">
                <div className="p-2.5 rounded-lg bg-[#EAF2EC] text-[#143E26] group-hover:bg-[#143E26] group-hover:text-white transition-colors">
                  <Award className="w-5 h-5"/>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0E331E] group-hover:text-[#C59432] transition-colors">
                    Certificate of Verification
                  </h4>
                  <p className="text-[11px] text-[#637568] mt-0.5">
                    Lab tested by Kashmir Agri-Testing Lab: 99.8% purity & zero aflatoxins.
                  </p>
                  <span className="text-[11px] font-semibold text-[#143E26] underline mt-1 inline-block">
                    View Official Certificate →
                  </span>
                </div>
              </div>

              <div onClick={() => setIsVideoModalOpen(true)} className="p-4 rounded-xl bg-white border border-[#E6DECF] hover:border-[#C59432] shadow-xs cursor-pointer transition-all flex items-start gap-3 group">
                <div className="p-2.5 rounded-lg bg-[#FAF0D6] text-[#9E6D0E] group-hover:bg-[#9E6D0E] group-hover:text-white transition-colors">
                  <PlayCircle className="w-5 h-5"/>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0E331E] group-hover:text-[#C59432] transition-colors">
                    Srinagar Packaging Video
                  </h4>
                  <p className="text-[11px] text-[#637568] mt-0.5">
                    Watch our nitrogen-flushed, airtight cold-packing line in Sanat Nagar.
                  </p>
                  <span className="text-[11px] font-semibold text-[#143E26] underline mt-1 inline-block">
                    Play 45-Sec Process Video →
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: CONTIGUOUS PURCHASE MODULE ================= */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#E6DECF] shadow-xs sticky top-28">
            
            {/* Provenance Kicker */}
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#C59432] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5"/>
              <span>100% Kashmir Origin · Handpicked</span>
            </div>

            {/* Product Title */}
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#0E331E] mb-2 leading-tight">
              {product.name}
            </h1>

            {/* Tagline */}
            <p className="text-xs sm:text-sm text-[#5B6E60] mb-4">
              {product.tagline}
            </p>

            {/* Ratings & Verification Ribbon */}
            <div className="flex items-center gap-4 pb-4 border-b border-[#EFE8DC] mb-5">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex text-[#C59432]">
                  {[...Array(5)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-[#C59432]"/>))}
                </div>
                <span className="font-bold text-[#0E331E]">{product.rating}</span>
                <span className="text-[#7A8E7F]">({product.reviewCount} customer reviews)</span>
              </div>

              <span className="text-xs text-[#2D7A46] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5"/> Certified Authentic
              </span>
            </div>

            {/* Pricing Matrix */}
            <div className="mb-6">
              <span className="text-xs text-[#7A8E7F] block mb-1">Total Price:</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#0E331E] font-mono tabular-nums">
                  ₹{currentPrice}
                </span>
                <span className="text-base text-[#8C9C90] line-through font-mono tabular-nums">
                  ₹{originalPriceCalculated}
                </span>
                <span className="text-xs font-bold bg-[#EAF2EC] text-[#2D7A46] px-2 py-0.5 rounded">
                  25% OFF
                </span>
              </div>
              <span className="text-[11px] text-[#7A8E7F] block mt-1">
                Inclusive of all taxes · Free Air Express Delivery over ₹999
              </span>
            </div>

            {/* Pack Size / Net Weight Selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#2F4435]">
                  Select Net Weight / Pack Size:
                </label>
                <span className="text-xs text-[#C59432] font-semibold">
                  Selected: {selectedWeight}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {product.netWeights.map((w) => (<button key={w.weight} onClick={() => setSelectedWeight(w.weight)} className={`py-2.5 px-3 rounded-xl border text-xs text-center transition-all ${selectedWeight === w.weight
                ? 'border-[#143E26] bg-[#143E26] text-white font-bold shadow-xs'
                : 'border-[#E6DECF] bg-[#FAF7F2] text-[#293E2F] hover:bg-[#F2EBE0]'}`}>
                    <span className="block font-semibold">{w.weight}</span>
                    <span className="text-[11px] opacity-90 font-mono">₹{w.price}</span>
                  </button>))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-[#2F4435] block mb-2">
                Quantity:
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#D5CABB] rounded-lg bg-[#FAF7F2] overflow-hidden">
                  <button onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} className="px-3 py-2 text-sm font-bold text-[#143E26] hover:bg-[#EBE2D3] transition-colors">
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-bold font-mono text-[#0E331E]">
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity((prev) => prev + 1)} className="px-3 py-2 text-sm font-bold text-[#143E26] hover:bg-[#EBE2D3] transition-colors">
                    +
                  </button>
                </div>
                <span className="text-xs text-[#5C6E61]">
                  Total net weight: <strong>{parseInt(selectedWeight) * quantity || selectedWeight}</strong>
                </span>
              </div>
            </div>

            {/* CTA Buttons: Add to Cart and Buy Now */}
            <div className="space-y-3 mb-6">
              <button onClick={() => addToCart(product, selectedWeight, quantity)} className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#143E26] hover:bg-[#0D2D1B] text-[#FAF7F2] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-98">
                <ShoppingBag className="w-4 h-4 text-[#DFB248]"/>
                <span>Add to Cart · ₹{currentPrice}</span>
              </button>

              <button onClick={() => buyNow(product, selectedWeight, quantity)} className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#C59432] hover:bg-[#D4A33E] text-[#0A2416] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98">
                <Zap className="w-4 h-4 text-[#0A2416]"/>
                <span>Buy Now · Cash on Delivery / UPI</span>
              </button>
            </div>

            {/* Verification & Trust Badges Strip */}
            <div className="pt-4 border-t border-[#EFE8DC] space-y-2.5 text-xs text-[#526356]">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#143E26] shrink-0"/>
                <span>Air Express Delivery across India in 2–4 business days</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#143E26] shrink-0"/>
                <span>Zero chemical bleaching guarantee with 100% money-back assurance</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#143E26] shrink-0"/>
                <span>Hassle-free 7-day freshness return guarantee</span>
              </div>
            </div>

          </div>

        </div>

        {/* ================= LOWER SECTIONS: STORY, NUTRITION & REVIEWS ================= */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Detailed Story & Nutritional Profile */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E6DECF]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C59432] block mb-1">
                Harvest Provenance
              </span>
              <h3 className="font-serif-brand text-2xl font-bold text-[#0E331E] mb-3">
                About this Kashmiri Crop
              </h3>
              <p className="text-sm text-[#3E5244] leading-relaxed mb-4">
                {product.description}
              </p>

              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DEC8] flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C59432] shrink-0 mt-0.5"/>
                <div className="text-xs text-[#4F6354]">
                  <strong className="text-[#0E331E] block font-semibold mb-0.5">
                    Orchard Sourcing Location: {product.certificate.originDistrict}
                  </strong>
                  Hand-harvested by local farmer families, shade-dried on mountain racks, and transported immediately to our temperature-regulated facility in Srinagar.
                </div>
              </div>
            </div>

            {/* Nutrition Facts Table */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E6DECF]">
              <h3 className="font-serif-brand text-xl font-bold text-[#0E331E] mb-4">
                Nutritional Breakdown (Per 100g)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8]">
                  <span className="text-[#7A8E7F] block">Calories</span>
                  <span className="font-mono font-bold text-[#143E26] text-sm">{product.nutrition.calories}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8]">
                  <span className="text-[#7A8E7F] block">Protein</span>
                  <span className="font-mono font-bold text-[#143E26] text-sm">{product.nutrition.protein}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8]">
                  <span className="text-[#7A8E7F] block">Healthy Fats</span>
                  <span className="font-mono font-bold text-[#143E26] text-sm">{product.nutrition.healthyFats}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8]">
                  <span className="text-[#7A8E7F] block">Dietary Fiber</span>
                  <span className="font-mono font-bold text-[#143E26] text-sm">{product.nutrition.fiber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews & Feedback */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#E6DECF]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif-brand text-xl font-bold text-[#0E331E]">
                  Customer Reviews
                </h3>
                <span className="text-xs text-[#7A8E7F]">
                  Verified buyers & feedback
                </span>
              </div>

              <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#EAF2EC] text-[#143E26] hover:bg-[#D9E7DC] transition-colors">
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            </div>

            {/* Write Review Form */}
            {showReviewForm && (<form onSubmit={handleReviewSubmit} className="mb-6 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#143E26]">
                  Share Your Experience
                </h4>
                <div>
                  <input type="text" required placeholder="Your Full Name" value={newReview.author} onChange={(e) => setNewReview({ ...newReview, author: e.target.value })} className="w-full text-xs p-2 rounded-lg border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"/>
                </div>
                <div>
                  <input type="text" placeholder="City (e.g. Mumbai, Delhi, Srinagar)" value={newReview.location} onChange={(e) => setNewReview({ ...newReview, location: e.target.value })} className="w-full text-xs p-2 rounded-lg border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"/>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#526356]">Rating:</span>
                  <select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })} className="text-xs p-1.5 rounded-lg border border-[#D5CABB] bg-white font-medium">
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                    <option value={3}>⭐⭐⭐ (3/5)</option>
                  </select>
                </div>
                <div>
                  <input type="text" required placeholder="Review Title (e.g. Outstanding sweetness & aroma)" value={newReview.title} onChange={(e) => setNewReview({ ...newReview, title: e.target.value })} className="w-full text-xs p-2 rounded-lg border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"/>
                </div>
                <div>
                  <textarea required rows={3} placeholder="Write your honest comments about taste, packaging, and freshness..." value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} className="w-full text-xs p-2 rounded-lg border border-[#D5CABB] bg-white outline-none focus:border-[#143E26]"></textarea>
                </div>

                {/* Upload Review Photos to MinIO */}
                <div>
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#143E26] bg-white border border-[#D5CABB] hover:border-[#143E26] px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                    <Camera className="w-3.5 h-3.5 text-[#C59432]"/>
                    <span>{isUploadingImage ? 'Uploading to MinIO...' : 'Add Product Photo'}</span>
                    <input type="file" accept="image/*" onChange={handleReviewImageUpload} disabled={isUploadingImage} className="hidden"/>
                  </label>

                  {newReview.images.length > 0 && (<div className="flex flex-wrap gap-2 mt-2">
                      {newReview.images.map((imgUrl, idx) => (<div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#C59432]">
                          <img src={imgUrl} alt="Review upload" className="w-full h-full object-cover"/>
                          <button type="button" onClick={() => setNewReview((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== idx),
                    }))} className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5">
                            <X className="w-3 h-3"/>
                          </button>
                        </div>))}
                    </div>)}
                </div>

                <button type="submit" disabled={isUploadingImage} className="w-full py-2 bg-[#143E26] hover:bg-[#0D2D1B] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                  Submit Verified Review
                </button>
              </form>)}

            {reviewSubmitSuccess && (<div className="mb-4 p-3 rounded-lg bg-[#EAF2EC] text-[#2D7A46] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4"/>
                <span>Thank you! Your verified review has been posted.</span>
              </div>)}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (<p className="text-xs text-[#7A8E7F] py-4 text-center">
                  Loading reviews...
                </p>) : (reviews.map((rev) => (<div key={rev._id} className="pb-4 border-b border-[#EFE8DC] last:border-none">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#0E331E]">{rev.author}</span>
                      <span className="text-[11px] text-[#8C9C90]">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs mb-1.5">
                      <div className="flex text-[#C59432]">
                        {[...Array(rev.rating)].map((_, i) => (<Star key={i} className="w-3 h-3 fill-[#C59432]"/>))}
                      </div>
                      <span className="text-[10px] text-[#2D7A46] bg-[#EAF2EC] px-1.5 py-0.2 rounded font-semibold">
                        Verified Purchase · {rev.location}
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-[#143E26] mb-1">{rev.title}</h5>
                    <p className="text-xs text-[#526356] leading-relaxed">{rev.comment}</p>
                    {rev.images && rev.images.length > 0 && (<div className="flex flex-wrap gap-2 mt-2.5">
                        {rev.images.map((imgUrl, idx) => (<img key={idx} src={imgUrl} alt={`${rev.author} review photo ${idx + 1}`} className="w-16 h-16 rounded-lg object-cover border border-[#E6DECF]" referrerPolicy="no-referrer"/>))}
                      </div>)}
                  </div>)))}
            </div>
          </div>

        </div>

      </div>

      {/* Modals for Verification & Video */}
      <CertificateModal product={product} isOpen={isCertModalOpen} onClose={() => setIsCertModalOpen(false)}/>

      <PackagingVideoModal product={product} isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)}/>
    </div>);
};

export const ProductDetailPage = ({ product: initialProduct, onBack, onSelectProduct }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};

  const [product, setProduct] = useState(initialProduct || null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(!initialProduct);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      return;
    }
    if (id) {
      setIsLoadingProduct(true);
      fetchProductById(id).then((p) => {
        setProduct(p);
        setIsLoadingProduct(false);
      });
    }
  }, [id, initialProduct]);

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
