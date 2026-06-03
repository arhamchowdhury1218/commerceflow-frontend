// Drag and drop image uploader for products
// Supports up to 6 images
// Shows upload progress and preview

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Loader2, ImagePlus, Star } from "lucide-react";
import api from "@/lib/api";

const MAX_IMAGES = 6;

export default function ProductImageUpload({
  productId,
  images = [],
  onImagesChange,
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Handle file selection — from click or drag
  const handleFiles = async (files) => {
    const fileList = Array.from(files);

    if (images.length + fileList.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const invalid = fileList.find((f) => !validTypes.includes(f.type));
    if (invalid) {
      setError("Only JPEG, PNG and WebP images are allowed");
      return;
    }

    const tooBig = fileList.find((f) => f.size > 5 * 1024 * 1024);
    if (tooBig) {
      setError("Each image must be under 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // Upload files one by one
      let currentImages = [...images];

      for (const file of fileList) {
        const formData = new FormData();
        formData.append("image", file);
        // FormData is used for file uploads
        // Regular JSON requests cannot send binary file data

        const res = await api.post(`/products/${productId}/images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          // Override the default JSON content type
          // multipart/form-data is required for file uploads
        });
        currentImages = res.data.images;
      }

      onImagesChange(currentImages);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageUrl) => {
    try {
      const res = await api.delete(`/products/${productId}/images`, {
        data: { image_url: imageUrl },
      });
      onImagesChange(res.data.images);
    } catch (err) {
      setError("Failed to remove image");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Product Images
          <span className="text-muted-foreground font-normal ml-1">
            (up to {MAX_IMAGES})
          </span>
        </label>
        <span className="text-xs text-muted-foreground">
          {images.length}/{MAX_IMAGES}
        </span>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-lg overflow-hidden
                         border border-border group"
            >
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* First image badge */}
              {index === 0 && (
                <div
                  className="absolute top-1 left-1 bg-primary text-primary-foreground
                               text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"
                >
                  <Star className="w-2.5 h-2.5" /> Main
                </div>
              )}
              {/* Delete button — shows on hover */}
              <button
                onClick={() => handleDelete(url)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60
                           text-white rounded-full flex items-center justify-center
                           opacity-0 group-hover:opacity-100 transition-opacity
                           hover:bg-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload area — only show if under limit */}
      {images.length < MAX_IMAGES && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center
            cursor-pointer transition-all duration-200
            ${
              dragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }
            ${uploading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-full bg-primary/10 flex
                              items-center justify-center"
              >
                <ImagePlus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {dragOver ? "Drop images here" : "Click or drag to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  JPEG, PNG, WebP up to 5MB each
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          First image is the main product photo. Drag to reorder coming soon.
        </p>
      )}
    </div>
  );
}
