import type { MetadataRoute } from "next";
import { CATEGORIES, getBrandsInCategory, PRODUCTS } from "@/lib/catalog";
import { SHOP_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/collections/all", "/help", "/cart"].map(
    (path) => ({
      url: `${SHOP_URL}${path}`,
      lastModified: new Date(),
    }),
  );

  const categoryRoutes = CATEGORIES.map((category) => ({
    url: `${SHOP_URL}/collections/${category.slug}`,
    lastModified: new Date(),
  }));

  const brandRoutes = CATEGORIES.flatMap((category) =>
    getBrandsInCategory(category.slug).map((brand) => ({
      url: `${SHOP_URL}/collections/${category.slug}/${brand.slug}`,
      lastModified: new Date(),
    })),
  );

  const productRoutes = PRODUCTS.map((product) => ({
    url: `${SHOP_URL}/products/${product.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes];
}
