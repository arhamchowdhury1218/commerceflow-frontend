// Image gallery viewer — works on desktop and mobile
// 1 image: just shows the image with zoom on click
// 2+ images: shows main image + thumbnails with swipe

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, Package } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function ProductImageGallery({ images = [], productName = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // No images — show placeholder
  if (!images || images.length === 0) {
    return (
      <div
        className="aspect-square rounded-xl bg-muted/40 border border-border
                      flex flex-col items-center justify-center gap-2"
      >
        <Package className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">No image</p>
      </div>
    );
  }

  const prev = () =>
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  // Format for lightbox
  const slides = images.map((src) => ({ src }));

  return (
    <div className="space-y-2">
      {/* Main image */}
      <div
        className="relative aspect-square rounded-xl overflow-hidden
                      border border-border group bg-muted/20"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={images[activeIndex]}
            alt={`${productName} - image ${activeIndex + 1}`}
            className="w-full h-full object-cover cursor-zoom-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setLightboxOpen(true)}
            // Click opens fullscreen lightbox
          />
        </AnimatePresence>

        {/* Zoom hint */}
        <div
          className="absolute top-2 right-2 bg-black/40 text-white
                        rounded-lg p-1.5 opacity-0 group-hover:opacity-100
                        transition-opacity"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </div>

        {/* Navigation arrows — only show if more than 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2
                         w-7 h-7 bg-black/40 text-white rounded-full
                         flex items-center justify-center
                         opacity-0 group-hover:opacity-100 transition-opacity
                         hover:bg-black/60"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2
                         w-7 h-7 bg-black/40 text-white rounded-full
                         flex items-center justify-center
                         opacity-0 group-hover:opacity-100 transition-opacity
                         hover:bg-black/60"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dot indicators */}
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2
                            flex gap-1"
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all
                    ${i === activeIndex ? "bg-white w-3" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails — only show if 2 or more images */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden
                border-2 transition-all
                ${
                  i === activeIndex
                    ? "border-primary"
                    : "border-border hover:border-primary/50"
                }`}
            >
              <img
                src={url}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox — fullscreen viewer */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={activeIndex}
        on={{ view: ({ index }) => setActiveIndex(index) }}
        // Syncs lightbox navigation with thumbnail navigation
      />
    </div>
  );
}
