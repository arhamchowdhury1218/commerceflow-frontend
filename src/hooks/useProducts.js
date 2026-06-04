// src/hooks/useProducts.js
//
// deleteProduct no longer uses window.confirm()
// Instead it accepts an optional external confirm function
// passed in from the page that uses useConfirmDialog()

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/products");
      setProducts(res.data.data || res.data);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // confirmFn is passed in from the page — it's the confirm() from useConfirmDialog
  // If not passed, falls back to a simple true (no confirmation)
  const deleteProduct = async (id, confirmFn) => {
    if (confirmFn) {
      const ok = await confirmFn({
        title: "Delete Product",
        description:
          "This will permanently delete the product, all its variants, and stock records. This cannot be undone.",
        confirmText: "Delete Product",
        cancelText: "Keep it",
        type: "danger",
      });
      if (!ok) return;
    }
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (product) => {
    try {
      await api.patch(`/products/${product.id}/status`);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, status: p.status === "active" ? "inactive" : "active" }
            : p,
        ),
      );
    } catch (err) {
      console.error("Toggle status failed:", err);
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    deleteProduct,
    toggleStatus,
  };
}
