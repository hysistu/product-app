import React, { useState, useEffect } from "react";
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

interface Category {
  _id: string;
  name: string;
  description?: string;
  productCount?: number;
}

interface Brand {
  _id: string;
  name: string;
  description?: string;
  yearFounded?: number;
  productCount?: number;
}

interface CategoriesBrandsOverviewProps {
  categories: any;
  brands: any;
}

const CategoriesBrandsOverview: React.FC<CategoriesBrandsOverviewProps> = ({
  categories,
  brands,
}) => {
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [brandsList, setBrandsList] = useState<Brand[]>([]);

  useEffect(() => {
    // Handle different possible data structures for categories
    let categoriesArray: Category[] = [];
    if (categories && typeof categories === "object") {
      if (categories.data && Array.isArray(categories.data)) {
        categoriesArray = categories.data;
      } else if (Array.isArray(categories)) {
        categoriesArray = categories;
      } else if (
        categories.categories &&
        Array.isArray(categories.categories)
      ) {
        categoriesArray = categories.categories;
      }
    }
    setCategoriesList(categoriesArray);

    // Handle different possible data structures for brands
    let brandsArray: Brand[] = [];
    if (brands && typeof brands === "object") {
      if (brands.data && Array.isArray(brands.data)) {
        brandsArray = brands.data;
      } else if (Array.isArray(brands)) {
        brandsArray = brands;
      } else if (brands.brands && Array.isArray(brands.brands)) {
        brandsArray = brands.brands;
      }
    }
    setBrandsList(brandsArray);
  }, [categories, brands]);

  // Prepare data for charts
  const categoryChartData = categoriesList.slice(0, 5).map((category) => ({
    name: category.name,
    products: category.productCount || 0,
  }));

  const brandChartData = brandsList.slice(0, 5).map((brand) => ({
    name: brand.name,
    products: brand.productCount || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-semibold text-gray-900">Kategori</h5>
          <Link
            href="/categories"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Shiko të Gjitha →
          </Link>
        </div>

        {categoryChartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis stroke="#6b7280" fontSize={10} />
                <Tooltip />
                <Bar dataKey="products" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {categoriesList.slice(0, 3).map((category) => (
                <div
                  key={category._id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📁</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {category.name}
                    </div>
                    {category.description && (
                      <div className="text-xs text-gray-500">
                        {category.description}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {category.productCount || 0} produkte
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <div className="text-2xl mb-2">📁</div>
            <p className="text-sm mb-2">Asnjë kategori ende</p>
            <Link
              href="/categories"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Shto kategori
            </Link>
          </div>
        )}
      </div>

      {/* Brands Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-semibold text-gray-900">Marka</h5>
          <Link
            href="/brands"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Shiko të Gjitha →
          </Link>
        </div>

        {brandChartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={brandChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis stroke="#6b7280" fontSize={10} />
                <Tooltip />
                <Bar dataKey="products" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {brandsList.slice(0, 3).map((brand) => (
                <div
                  key={brand._id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">🏷️</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {brand.name}
                    </div>
                    {brand.description && (
                      <div className="text-xs text-gray-500">
                        {brand.description}
                      </div>
                    )}
                    {brand.yearFounded && (
                      <div className="text-xs text-gray-400">
                        Founded: {brand.yearFounded}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {brand.productCount || 0} products
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <div className="text-2xl mb-2">🏷️</div>
            <p className="text-sm mb-2">Asnjë markë ende</p>
            <Link
              href="/brands"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Shto marka
            </Link>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-800">
              {categoriesList.length}
            </div>
            <div className="text-sm text-blue-600">Kategori</div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-center">
            <div className="text-xl font-bold text-green-800">
              {brandsList.length}
            </div>
            <div className="text-sm text-green-600">Marka</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesBrandsOverview;
