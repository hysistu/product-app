import React, { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/uploadUtils";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  shifra: string;
  category: {
    name: string;
  };
}

interface ProductsAnalyticsProps {
  data: unknown;
}

const ProductsAnalytics: React.FC<ProductsAnalyticsProps> = ({ data }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    avgPrice: 0,
    priceRanges: {
      low: 0,
      medium: 0,
      high: 0,
    },
  });

  const isDataWithProducts = (
    v: unknown
  ): v is { data: { products: Product[] } } =>
    typeof v === "object" &&
    v !== null &&
    "data" in v &&
    typeof (v as { data: unknown }).data === "object" &&
    (v as { data: unknown }).data !== null &&
    "products" in (v as { data: Record<string, unknown> }).data &&
    Array.isArray((v as { data: { products: unknown } }).data.products);

  const isProductsProp = (v: unknown): v is { products: Product[] } =>
    typeof v === "object" &&
    v !== null &&
    "products" in v &&
    Array.isArray((v as { products: unknown }).products);

  const isDataArray = (v: unknown): v is { data: Product[] } =>
    typeof v === "object" &&
    v !== null &&
    "data" in v &&
    Array.isArray((v as { data: unknown }).data);

  useEffect(() => {
    // Handle different possible data structures
    let productsArray: Product[] = [];

    if (Array.isArray(data)) {
      productsArray = data;
    } else if (isDataWithProducts(data)) {
      productsArray = data.data.products;
    } else if (isProductsProp(data)) {
      productsArray = data.products;
    } else if (isDataArray(data)) {
      productsArray = data.data;
    }

    setProducts(productsArray);

    // Calculate analytics
    const totalProducts = productsArray.length;
    const avgPrice =
      totalProducts > 0
        ? productsArray.reduce((sum, p) => sum + p.price, 0) / totalProducts
        : 0;
    const priceRanges = {
      low: productsArray.filter((p) => p.price < 50).length,
      medium: productsArray.filter((p) => p.price >= 50 && p.price < 200)
        .length,
      high: productsArray.filter((p) => p.price >= 200).length,
    };

    setAnalytics({
      totalProducts,
      avgPrice: Number(avgPrice.toFixed(2)),
      priceRanges,
    });
  }, [data]);

  // Prepare data for chart
  const priceRangeData = [
    { name: "€0-50", value: analytics.priceRanges.low },
    { name: "€50-200", value: analytics.priceRanges.medium },
    { name: "€200+", value: analytics.priceRanges.high },
  ];

  return (
    <div className="space-y-6">
      {/* Simple Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-800">
              {analytics.totalProducts}
            </div>
            <div className="text-sm text-blue-600">Produkte Totale</div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800">
              €{analytics.avgPrice}
            </div>
            <div className="text-sm text-green-600">Çmimi Mesatar</div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-semibold text-gray-900">
            Produkte të Fundit
          </h5>
          <Link
            href="/products"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Shiko të Gjitha →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="space-y-3">
            {products.slice(0, 5).map((product) => (
              <div
                key={product._id}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {product.image ? (
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                {!product.image && (
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-500">{product.shifra}</div>
                </div>
                <div className="font-bold text-green-600">€{product.price}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-3xl mb-2">🛠️</div>
            <p className="text-sm mb-3">Asnjë produkt ende</p>
            <Link
              href="/products/create"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Shto produktin tënd të parë
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsAnalytics;
