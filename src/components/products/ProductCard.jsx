// src/components/products/ProductCard.jsx
//
// Product card layout:
//   TOP    → product name, price, status badge, action buttons
//   MIDDLE → product images (thumbnails, click to open fullscreen)
//   BOTTOM → stock info, expand/collapse variants table
//
// Name first so sellers can scan products quickly by name
// Images below the name for visual reference

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StockBadge from "./StockBadge";
import ProductImageGallery from "./ProductImageGallery";
import { Pencil } from "lucide-react";
import EditProductModal from "./EditProductModal";

export default function ProductCard({
  product,
  index,
  onDelete,
  onToggleStatus,
}) {
  const [expanded, setExpanded] = useState(false);

  // ── STOCK CALCULATIONS ────────────────────────────────────────────────
  const totalStock =
    product.variants?.reduce(
      (sum, v) => sum + (v.inventory?.quantity || 0),
      0,
    ) || 0;

  const lowStockCount =
    product.variants?.filter((v) => {
      const qty = v.inventory?.quantity || 0;
      const threshold = v.inventory?.low_stock_threshold || 5;
      return qty > 0 && qty <= threshold;
    }).length || 0;

  const outOfStockCount =
    product.variants?.filter((v) => (v.inventory?.quantity || 0) === 0)
      .length || 0;
  const [showEdit, setShowEdit] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
    >
      <Card
        className={`overflow-hidden transition-shadow hover:shadow-md
          ${product.status === "inactive" ? "opacity-60" : ""}`}
      >
        <div className="p-4 md:p-5 space-y-3">
          {/* ── ROW 1: NAME + ACTIONS ───────────────────────────────────────
              Product name is the first thing the seller reads
              Action buttons sit on the right of the same row */}
          <div className="flex items-start justify-between gap-2">
            {/* Left — name, price, description */}
            <div className="min-w-0 flex-1">
              {/* Name + status badge on same line */}
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm md:text-base truncate">
                  {product.name}
                </h3>
                {/* Active / Inactive pill badge */}
                <span
                  className={`inline-flex items-center px-2 py-0.5
                    rounded-full text-xs font-medium flex-shrink-0
                    ${
                      product.status === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                >
                  {product.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Base price */}
              <p className="text-sm font-semibold text-primary mt-0.5 tabular-nums">
                ৳{Number(product.base_price).toLocaleString()}
              </p>

              {/* Optional description — one line max */}
              {product.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {product.description}
                </p>
              )}
            </div>

            {/* Right — Deactivate/Activate + Delete buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 hidden sm:flex"
                onClick={() => onToggleStatus(product)}
              >
                {product.status === "active" ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1.5 hidden sm:flex"
                onClick={() => setShowEdit(true)}
              >
                <Pencil className="w-3 h-3" /> Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(product.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* ── ROW 2: PRODUCT IMAGES ────────────────────────────────────────
              Images sit below the name — two small square thumbnails
              Clicking either opens the fullscreen lightbox
              If no images uploaded yet, shows a neutral placeholder
              ProductImageGallery handles all image display logic */}
          <ProductImageGallery
            images={product.images || []}
            productName={product.name}
          />

          {/* ── ROW 3: STOCK SUMMARY ─────────────────────────────────────────
              Quick numbers below the image — variants count, total stock,
              and colour-coded warnings for low or out of stock variants */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {product.variants?.length || 0} variant
              {product.variants?.length !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-muted-foreground">
              {totalStock} in stock
            </span>
            {outOfStockCount > 0 && (
              <span className="text-xs text-red-500 font-medium">
                {outOfStockCount} out of stock
              </span>
            )}
            {lowStockCount > 0 && (
              <span className="text-xs text-amber-500 font-medium">
                {lowStockCount} low stock
              </span>
            )}
          </div>
        </div>

        {/* ── EXPAND/COLLAPSE VARIANTS TOGGLE ─────────────────────────────── */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between
                     px-4 md:px-5 py-2.5 border-t border-border
                     bg-muted/30 hover:bg-muted/60 transition-colors
                     text-xs font-medium text-muted-foreground"
        >
          <span>{expanded ? "Hide" : "Show"} variants</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {/* ── VARIANTS TABLE ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="divide-y divide-border">
                {/* Column headers */}
                <div
                  className="grid grid-cols-4 px-4 md:px-5 py-2
                              bg-muted/20 text-xs font-medium
                              text-muted-foreground"
                >
                  <span>Variant</span>
                  <span>Price</span>
                  <span>Stock</span>
                  <span>Status</span>
                </div>

                {/* One row per variant */}
                {product.variants?.map((variant) => (
                  <div
                    key={variant.id}
                    className="grid grid-cols-4 px-4 md:px-5 py-3
                               text-sm items-center"
                  >
                    <span className="font-medium">
                      {[variant.color, variant.size]
                        .filter(Boolean)
                        .join(" / ") || "Default"}
                    </span>
                    <span className="tabular-nums">
                      ৳
                      {Number(
                        variant.price || product.base_price,
                      ).toLocaleString()}
                    </span>
                    <span className="tabular-nums font-medium">
                      {variant.inventory?.quantity ?? "—"}
                    </span>
                    <StockBadge
                      quantity={variant.inventory?.quantity || 0}
                      threshold={variant.inventory?.low_stock_threshold || 5}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      <AnimatePresence>
        {showEdit && (
          <EditProductModal
            product={product}
            onClose={() => setShowEdit(false)}
            onSuccess={() => {
              onSuccess?.();
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
