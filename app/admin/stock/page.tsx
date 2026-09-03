import type { Metadata } from "next";
import {
  StockEditor,
  type StockProduct,
} from "@/components/admin/stock-editor";
import { getBrandName, getCategoryName, PRODUCTS } from "@/lib/catalog";

export const metadata: Metadata = { title: "Stock" };

export default function AdminStockPage() {
  const products: StockProduct[] = PRODUCTS.map((product) => ({
    slug: product.slug,
    name: product.name,
    brand: getBrandName(product.brand),
    category: getCategoryName(product.category),
    colourway: product.colourway.name,
    sizes: product.sizes.map((size) => ({
      label: size.label,
      inStock: size.inStock,
    })),
  }));

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">
      <StockEditor initialProducts={products} />
    </div>
  );
}
