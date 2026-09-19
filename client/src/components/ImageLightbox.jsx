import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl, handleImageError, DEFAULT_LISTING_IMAGE } from '../utils/imageUtils';

const ImageLightbox = ({ images = [], currentIndex = 0, isOpen, onClose, onPrev, onNext }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Top Bar Controls */}
      <div
        className="absolute top-4 inset-x-4 flex items-center justify-between z-10 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm font-medium text-white/80 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
          {currentIndex + 1} / {images.length}
        </span>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition focus:outline-none"
          aria-label="Close Lightbox"
        >
          <X size={22} />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative max-w-5xl max-h-[85vh] w-full p-4 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={getImageUrl(currentImage.url)}
          alt="Expanded listing photo"
          onError={(e) => handleImageError(e, DEFAULT_LISTING_IMAGE)}
          className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-200"
        />

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={onPrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition shadow-lg focus:outline-none"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={onNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition shadow-lg focus:outline-none"
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {/* Thumbnail Bar at bottom */}
      {images.length > 1 && (
        <div
          className="absolute bottom-6 inset-x-0 flex justify-center gap-2 px-4 overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                const diff = idx - currentIndex;
                if (diff > 0) {
                  for (let i = 0; i < diff; i++) onNext();
                } else if (diff < 0) {
                  for (let i = 0; i < Math.abs(diff); i++) onPrev();
                }
              }}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                idx === currentIndex ? 'border-brand-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={getImageUrl(img.url)}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
