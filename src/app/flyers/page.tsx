"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { productFlyerAPI } from "@/lib/api";
import { getImageUrl } from "@/lib/uploadUtils";

interface ProductFlyer {
  _id: string;
  title: string;
  description?: string;
  coverImage: string;
  category: {
    _id: string;
    name: string;
  };
  brand: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  isPublished: boolean;
  totalProducts: number;
  createdAt: string;
}

export default function FlyersPage() {
  const [flyers, setFlyers] = useState<ProductFlyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    fetchFlyers();
  }, []);

  const fetchFlyers = async () => {
    try {
      setLoading(true);
      const response = await productFlyerAPI.getAllFlyers();
      setFlyers(response.data.data.flyers || []);
    } catch (error) {
      console.error("Error fetching flyers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFlyers = flyers.filter((flyer) => {
    const matchesSearch =
      flyer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flyer.description &&
        flyer.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      !selectedCategory || flyer.category._id === selectedCategory;
    const matchesBrand = !selectedBrand || flyer.brand._id === selectedBrand;
    const matchesPublished =
      publishedFilter === "all" ||
      (publishedFilter === "published" && flyer.isPublished) ||
      (publishedFilter === "draft" && !flyer.isPublished);

    return matchesSearch && matchesCategory && matchesBrand && matchesPublished;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePublishToggle = async (
    flyerId: string,
    currentStatus: boolean
  ) => {
    try {
      setPublishing(flyerId);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product-flyers/${flyerId}/publish`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isPublished: !currentStatus,
          }),
        }
      );

      if (response.ok) {
        // Update the local state to reflect the change
        setFlyers((prev) =>
          prev.map((flyer) =>
            flyer._id === flyerId
              ? { ...flyer, isPublished: !currentStatus }
              : flyer
          )
        );

        // You can add a success toast notification here
        console.log(
          `Fletushka ${currentStatus ? "u çpublikua" : "u publikua"} me sukses`
        );
      } else {
        const error = await response.json();
        console.error("Failed to toggle publish status:", error.message);
        // You can add error handling here
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      // You can add error handling here
    } finally {
      setPublishing(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Fletushka të Produkteve
                </h1>
                <p className="text-gray-600 mt-2">
                  Menaxho kataloget tuaja të produkteve dhe broshurat
                </p>
              </div>
              <Link
                href="/flyers/create"
                className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Flyer
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Kërko fletushka..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Të Gjitha Kategoritë</option>
                  {Array.from(new Set(flyers.map((f) => f.category._id))).map(
                    (categoryId) => {
                      const category = flyers.find(
                        (f) => f.category._id === categoryId
                      )?.category;
                      return (
                        <option key={categoryId} value={categoryId}>
                          {category?.name}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Të Gjitha Markat</option>
                  {Array.from(new Set(flyers.map((f) => f.brand._id))).map(
                    (brandId) => {
                      const brand = flyers.find(
                        (f) => f.brand._id === brandId
                      )?.brand;
                      return (
                        <option key={brandId} value={brandId}>
                          {brand?.name}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              {/* Published Filter */}
              <div>
                <select
                  value={publishedFilter}
                  onChange={(e) => setPublishedFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">Të Gjitha Statuset</option>
                  <option value="published">E Publikuar</option>
                  <option value="draft">Skicë</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Flyers Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredFlyers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Asnjë fletushkë e gjetur
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first product flyer
              </p>
              <Link
                href="/flyers/create"
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                Create Flyer
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFlyers.map((flyer) => (
                <div
                  key={flyer._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {/* Cover Image */}
                  <div className="relative">
                    {flyer.coverImage ? (
                      <img
                        src={getImageUrl(flyer.coverImage)}
                        alt={flyer.title}
                        className="w-full h-32 object-cover rounded-t-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    {!flyer.coverImage && (
                      <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg flex items-center justify-center">
                        <div className="text-center text-blue-600">
                          <svg
                            className="w-8 h-8 mx-auto mb-2"
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
                          <span className="text-xs font-medium">
                            Asnjë Imazh
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          flyer.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {flyer.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {flyer.title}
                    </h3>
                    {flyer.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {flyer.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {flyer.totalProducts}
                        </div>
                        <div className="text-xs text-gray-500">Products</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-900 font-medium">
                          {flyer.category.name}
                        </div>
                        <div className="text-xs text-gray-500">Category</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        href={`/flyers/${flyer._id}`}
                        className="flex-1 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors text-center"
                      >
                        Shiko
                      </Link>

                      {/* Publish/Unpublish Button */}
                      <button
                        onClick={() =>
                          handlePublishToggle(flyer._id, flyer.isPublished)
                        }
                        disabled={publishing === flyer._id}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          flyer.isPublished
                            ? "bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            : "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        }`}
                      >
                        {publishing === flyer._id ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </div>
                        ) : flyer.isPublished ? (
                          "Çpubliko"
                        ) : (
                          "Publiko"
                        )}
                      </button>

                      <Link
                        href={`/flyers/${flyer._id}/manage`}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-center"
                      >
                        Manage
                      </Link>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                      Created {formatDate(flyer.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
