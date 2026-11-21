import React, { useState } from 'react';
import { Card, Input, Select, Button } from '../../../components/ui/index.js';
import { Camera } from 'lucide-react';
import { useUploadMediaMutation } from '../../../services/media.api.js';

export const ReviewForm = ({ onSubmitReview }) => {
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [uploadMediaMutation] = useUploadMediaMutation();

  const handleReviewImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const url = await uploadMediaMutation({ file, folder: 'reviews' }).unwrap();
      if (url) {
        setImages((prev) => [...prev, url]);
      }
    } catch (err) {
      console.error('Error uploading media:', err);
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!author || !title || !comment) return;
    onSubmitReview({
      author,
      location: location || 'Kashmir Lover',
      rating,
      title,
      comment,
      images,
    });
  };

  return (
    <Card className="mb-8 p-6 space-y-4 max-w-xl">
      <h3 className="font-serif-brand text-base font-bold text-brand-emerald">
        Share Your Tasting Note
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Your Name"
            type="text"
            required
            placeholder="Owais Ahmad"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <Input
            label="City / Location"
            type="text"
            placeholder="Srinagar / Delhi"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <Select
          label="Rating (1 to 5 Stars)"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          options={[
            { value: 5, label: '⭐⭐⭐⭐⭐ 5 Stars - Exceptional Kashmir Origin' },
            { value: 4, label: '⭐⭐⭐⭐ 4 Stars - Very Crisp and Fresh' },
            { value: 3, label: '⭐⭐⭐ 3 Stars - Average Quality' },
            { value: 2, label: '⭐⭐ 2 Stars - Below Expectation' },
            { value: 1, label: '⭐ 1 Star - Unsatisfactory' },
          ]}
        />

        <Input
          label="Review Headline"
          type="text"
          required
          placeholder="Crisp kernels with fragrant natural oil..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div>
          <label className="text-[11px] font-bold text-brand-text-muted block mb-1">
            Review Details
          </label>
          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-brand-sand bg-brand-canvas focus:outline-none focus:border-brand-emerald"
            placeholder="Explain the texture, freshness, aroma, and packaging experience..."
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-brand-text-muted block mb-1">
            Attach Unboxing / Product Photos
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-2 bg-brand-canvas hover:bg-brand-sand-subtle text-brand-emerald rounded-lg text-xs font-semibold cursor-pointer border border-brand-gold/40">
              <Camera className="w-4 h-4 text-brand-gold" />
              <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleReviewImageUpload}
                disabled={isUploadingImage}
                className="hidden"
              />
            </label>
            <span className="text-[10px] text-brand-text-subtle">Optional photos of nitrogen pouch</span>
          </div>

          {images.length > 0 && (
            <div className="flex gap-2 mt-2">
              {images.map((img, i) => (
                <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-brand-gold">
                  <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" variant="primary" size="md" className="w-full">
          Submit Certified Review
        </Button>
      </form>
    </Card>
  );
};

export default ReviewForm;
