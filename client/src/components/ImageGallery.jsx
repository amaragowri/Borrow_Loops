import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { getImageUrl, handleImageError, DEFAULT_LISTING_IMAGE } from '../utils/imageUtils';
import ImageLightbox from './ImageLightbox';

const ImageGallery = ({ images = [], title = 'Listing photo' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const displayImages = images.length > 0 ? images : [{ url: DEFAULT_LISTING_IMAGE, isMain: true }];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const currentImg = displayImages[activeIndex] || displayImages[0];

  return (
    <div className="space-y-3">
      {/* Large Main Image Display */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md group cursor-pointer">
        <img
          src={getImageUrl(currentImg.url)}
          alt={`${title} - Photo ${activeIndex + 1}`}
          onError={(e) => handleImageError(e, DEFAULT_LISTING_IMAGE)}
          onClick={() => setLightboxOpen(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
        />

        {/* Counter Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/70 text-white text-xs font-semibold backdrop-blur-md">
          {activeIndex + 1} / {displayImages.length}
        </div>

        {/* Fullscreen Expand CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
          className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-slate-900/75 hover:bg-slate-900 text-white backdrop-blur-md opacity-90 hover:opacity-100 transition shadow-md"
          aria-label="View Fullscreen"
        >
          <Maximize2 size={16} />
        </button>

        {/* Previous & Next Control Buttons */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition shadow-md"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition shadow-md"
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-[4/3] w-20 sm:w-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                idx === activeIndex
                  ? 'border-brand-500 shadow-md ring-2 ring-brand-500/20 scale-102'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={getImageUrl(img.url)}
                alt=""
                className="w-full h-full object-cover"
              />
              {img.isMain && (
                <span className="absolute bottom-1 left-1 px-1 py-0.2 text-[9px] font-bold bg-brand-600 text-white rounded">
                  Main
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <ImageLightbox
        images={displayImages}
        currentIndex={activeIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
};

export default ImageGallery;
