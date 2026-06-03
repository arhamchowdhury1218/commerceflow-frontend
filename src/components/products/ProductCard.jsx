// src/components/products/ProductCard.jsx
//
// Displays one product as a card with:
// - Product image gallery (if images exist)
// - Product name, price, status badge
// - Stock summary across all variants
// - Expandable variants section showing each variant's stock level
// - Activate/deactivate and delete actions
//
// Props:
//   product        → full product object from Laravel API (with variants and inventory)
//   index          → position in the list, used to stagger the entrance animation
//   onDelete       → function called when seller confirms deletion
//   onToggleStatus → function called to switch between active and inactive

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StockBadge from "./StockBadge";
import ProductImageGallery from "./ProductImageGallery";
// ProductImageGallery handles all image display logic:
// - 0 images → shows placeholder
// - 1 image  → shows single image with zoom
// - 2+ images → shows main image + thumbnails + lightbox

export default function ProductCard({
  product,
  index,
  onDelete,
  onToggleStatus,
}) {
  // expanded controls whether the variants table is visible or hidden
  // starts collapsed to keep the list compact
  const [expanded, setExpanded] = useState(false);

  // ── STOCK CALCULATIONS ──────────────────────────────────────────────────
  // These are derived from the variants array — calculated fresh on each render
  // No need to store in state because they depend only on product.variants

  // Add up stock across ALL variants to show total inventory for this product
  const totalStock =
    product.variants?.reduce(
      (sum, v) => sum + (v.inventory?.quantity || 0),
      0,
    ) || 0;

  // Count how many variants are running low (above 0 but at or below threshold)
  // Used to show the amber "low stock" warning in the header
  const lowStockCount =
    product.variants?.filter((v) => {
      const qty = v.inventory?.quantity || 0;
      const threshold = v.inventory?.low_stock_threshold || 5;
      return qty > 0 && qty <= threshold;
    }).length || 0;

  // Count how many variants are completely out of stock
  // Used to show the red "out of stock" warning in the header
  const outOfStockCount =
    product.variants?.filter((v) => (v.inventory?.quantity || 0) === 0)
      .length || 0;

  return (
    <motion.div
      // Entrance animation — each card slides up and fades in
      // delay increases with index so cards appear one after another (stagger effect)
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
    >
      <Card
        className={`overflow-hidden transition-shadow hover:shadow-md
        ${product.status === "inactive" ? "opacity-60" : ""}`}
      >
        {/* opacity-60 on inactive products gives a visual "greyed out" look
            so sellers can quickly identify which products are not selling */}

        {/* ── PRODUCT IMAGE GALLERY ──────────────────────────────────────────
            Only render the gallery section if the product has at least 1 image
            If no images exist the card starts directly with the product info
            This keeps the card compact for products without photos */}
        {product.images && product.images.length > 0 && (
          <div className="p-3 pb-0">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              // productName is passed for alt text accessibility
            />
          </div>
        )}

        {/* ── PRODUCT HEADER ─────────────────────────────────────────────── */}
        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            {/* LEFT SIDE — product name, price, description, stock warnings */}
            <div className="flex-1 min-w-0">
              {/* min-w-0 prevents the flex child from overflowing its container
                  without it, long product names would break the layout */}

              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm md:text-base truncate">
                  {product.name}
                </h3>

                {/* Active/Inactive status badge
                    Green = selling, Gray = paused/hidden from orders */}
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

              {/* Base price — the fallback price when a variant has no specific price */}
              <p className="text-sm text-muted-foreground mt-0.5">
                Base price: ৳{Number(product.base_price).toLocaleString()}
              </p>

              {/* Description — truncated to one line to save space
                  line-clamp-1 adds "..." if text is longer than one line */}
              {product.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {product.description}
                </p>
              )}
            </div>

            {/* RIGHT SIDE — action buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Activate/Deactivate toggle
                  hidden on mobile (hidden sm:flex) to save space
                  sellers can still toggle from the expanded variants view */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 hidden sm:flex"
                onClick={() => onToggleStatus(product)}
              >
                {product.status === "active" ? "Deactivate" : "Activate"}
              </Button>

              {/* Delete button — red on hover to signal destructive action */}
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

          {/* ── STOCK SUMMARY ROW ───────────────────────────────────────────
              Quick overview of stock health without needing to expand
              Only show warnings when there is actually a problem */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {product.variants?.length || 0} variant
              {product.variants?.length !== 1 ? "s" : ""}
              {/* Correct pluralization: "1 variant" vs "3 variants" */}
            </span>

            <span className="text-xs text-muted-foreground">
              {totalStock} total stock
            </span>

            {/* Only show out-of-stock warning when at least 1 variant is empty */}
            {outOfStockCount > 0 && (
              <span className="text-xs text-red-500 font-medium">
                {outOfStockCount} out of stock
              </span>
            )}

            {/* Only show low-stock warning when at least 1 variant is running low */}
            {lowStockCount > 0 && (
              <span className="text-xs text-amber-500 font-medium">
                {lowStockCount} low stock
              </span>
            )}
          </div>
        </div>

        {/* ── EXPAND/COLLAPSE TOGGLE ──────────────────────────────────────
            Full-width button at the bottom of the card header
            bg-muted/30 gives a subtle background to visually separate it
            from the main card content */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 md:px-5
                     py-2.5 border-t border-border bg-muted/30
                     hover:bg-muted/60 transition-colors text-xs
                     font-medium text-muted-foreground"
        >
          <span>{expanded ? "Hide" : "Show"} variants</span>
          {/* Toggle icon shows chevron up when expanded, down when collapsed */}
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {/* ── VARIANTS TABLE ──────────────────────────────────────────────
            AnimatePresence allows the exit animation to complete
            before the element is removed from the DOM
            height: 0 → auto creates a smooth expand/collapse */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              // overflow-hidden is essential — without it content
              // would be visible outside the animated height bounds
            >
              <div className="divide-y divide-border">
                {/* Column headers row */}
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

                {/* One row per variant
                    variant.id is used as the key — more stable than array index
                    because React uses keys to track which rows changed */}
                {product.variants?.map((variant) => (
                  <div
                    key={variant.id}
                    className="grid grid-cols-4 px-4 md:px-5 py-3
                               text-sm items-center"
                  >
                    {/* Variant label — combines color and size
                        filter(Boolean) removes empty strings and nulls
                        join(' / ') gives "Red / XL" format
                        Falls back to "Default" if both color and size are empty */}
                    <span className="font-medium">
                      {[variant.color, variant.size]
                        .filter(Boolean)
                        .join(" / ") || "Default"}
                    </span>

                    {/* Variant price — falls back to product base price
                        if this variant has no specific price override */}
                    <span className="tabular-nums">
                      ৳
                      {Number(
                        variant.price || product.base_price,
                      ).toLocaleString()}
                      {/* tabular-nums makes all digits the same width
                          so prices align vertically in the column */}
                    </span>

                    {/* Stock quantity — ?? '—' shows a dash if inventory
                        record doesn't exist yet for this variant */}
                    <span className="tabular-nums font-medium">
                      {variant.inventory?.quantity ?? "—"}
                    </span>

                    {/* StockBadge — green/amber/red pill based on quantity
                        vs the low_stock_threshold for this specific variant */}
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
    </motion.div>
  );
}
