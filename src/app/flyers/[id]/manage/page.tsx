"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import { submitWithUpload, getImageUrl } from "@/lib/uploadUtils";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  shifra: string;
  details: string;
  category: {
    _id: string;
    name: string;
  };
  brand: {
    _id: string;
    name: string;
  };
  pageNumber: number;
}

interface Flyer {
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
  publishDate?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

export default function ManageFlyerPage() {
  const params = useParams();
  const router = useRouter();
  const flyerId = params.id as string;
  const [flyer, setFlyer] = useState<Flyer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const [activating, setActivating] = useState(false);
  const [activateMessage, setActivateMessage] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    image: "",
    shifra: "",
    details: "",
    category: "",
    brand: "",
    pageNumber: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (flyerId) {
      fetchFlyerData();
      fetchCategoriesAndBrands();
    }
  }, [flyerId]);

  const fetchFlyerData = async () => {
    try {
      setLoading(true);
      const [flyerResponse, productsResponse] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product-flyers/${flyerId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product-flyers/${flyerId}/products`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
      ]);

      const flyerData = await flyerResponse.json();
      const productsData = await productsResponse.json();

      if (flyerResponse.ok && productsResponse.ok) {
        setFlyer(flyerData.data.flyer);
        const sortedProducts = productsData.data.products.sort(
          (a: Product, b: Product) => a.pageNumber - b.pageNumber
        );
        setProducts(sortedProducts);
      }
    } catch (error) {
      console.error("Error fetching flyer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndBrands = async () => {
    try {
      const [categoriesResponse, brandsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brands`),
      ]);

      const categoriesData = await categoriesResponse.json();
      const brandsData = await brandsResponse.json();

      if (categoriesResponse.ok) {
        setCategories(categoriesData.data.categories || []);
      }
      if (brandsResponse.ok) {
        setBrands(brandsData.data.brands || []);
      }
    } catch (error) {
      console.error("Error fetching categories and brands:", error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newProduct.name.trim() ||
      !newProduct.price ||
      !newProduct.category ||
      !newProduct.brand
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        return;
      }

      // Prepare data for upload
      const uploadData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity) || 0,
        pageNumber: parseInt(newProduct.pageNumber) || products.length + 1,
        ...(imageFile && { image: imageFile }),
      };

      const response = await submitWithUpload(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product-flyers/${flyerId}/products`,
        uploadData,
        token,
        "POST"
      );

      if (response.ok) {
        setShowAddProductModal(false);
        setNewProduct({
          name: "",
          description: "",
          price: "",
          quantity: "",
          image: "",
          shifra: "",
          details: "",
          category: "",
          brand: "",
          pageNumber: "",
        });
        setImageFile(null);
        fetchFlyerData(); // Refresh the data
      } else {
        const data = await response.json();
        alert(data.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        fetchFlyerData(); // Refresh the data
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const handlePublishToggle = async () => {
    if (!flyer) return;

    try {
      setPublishing(true);
      setPublishMessage("");

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
            isPublished: !flyer.isPublished,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Update the local flyer state
        setFlyer((prev) =>
          prev ? { ...prev, isPublished: !prev.isPublished } : null
        );
        setPublishMessage(result.message);

        // Clear message after 3 seconds
        setTimeout(() => setPublishMessage(""), 3000);
      } else {
        setPublishMessage(`Error: ${result.message}`);
        // Clear error message after 5 seconds
        setTimeout(() => setPublishMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      setPublishMessage("Error: Failed to update publish status");
      // Clear error message after 5 seconds
      setTimeout(() => setPublishMessage(""), 5000);
    } finally {
      setPublishing(false);
    }
  };

  const handleActivateToggle = async () => {
    if (!flyer) return;

    try {
      setActivating(true);
      setActivateMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product-flyers/${flyerId}/activate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !flyer.isActive,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Update the local flyer state
        setFlyer((prev) =>
          prev ? { ...prev, isActive: !prev.isActive } : null
        );
        setActivateMessage(result.message);

        // Clear message after 3 seconds
        setTimeout(() => setActivateMessage(""), 3000);
      } else {
        setActivateMessage(`Error: ${result.message}`);
        // Clear error message after 5 seconds
        setTimeout(() => setActivateMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error toggling activation status:", error);
      setActivateMessage("Error: Failed to update activation status");
      // Clear error message after 5 seconds
      setTimeout(() => setActivateMessage(""), 5000);
    } finally {
      setActivating(false);
    }
  };

  // Check if flyer can be published
  const canPublish = () => {
    if (!flyer) return { canPublish: false, reason: "Flyer not loaded" };
    if (!flyer.isActive)
      return { canPublish: false, reason: "Flyer must be active to publish" };
    if (products.length === 0)
      return {
        canPublish: false,
        reason: "Flyer must have products to publish",
      };
    if (!flyer.coverImage)
      return {
        canPublish: false,
        reason: "Flyer must have a cover image to publish",
      };
    return { canPublish: true, reason: "" };
  };

  const publishStatus = canPublish();

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!flyer) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Flyer not found
            </h2>
            <button
              onClick={() => router.push("/flyers")}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Back to Flyers
            </button>
          </div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/flyers"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Menaxho Fletushkën
                  </h1>
                  <p className="text-gray-600 mt-2">{flyer.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Activation Toggle Button */}
                <button
                  onClick={handleActivateToggle}
                  disabled={activating}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    flyer.isActive
                      ? "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-400"
                      : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-400"
                  }`}
                >
                  {activating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : flyer.isActive ? (
                    "Deactivate"
                  ) : (
                    "Activate"
                  )}
                </button>

                {/* Publish/Unpublish Button */}
                <button
                  onClick={handlePublishToggle}
                  disabled={publishing || !publishStatus.canPublish}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    flyer.isPublished
                      ? "bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-yellow-400"
                      : "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-400"
                  } ${
                    !publishStatus.canPublish
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  title={!publishStatus.canPublish ? publishStatus.reason : ""}
                >
                  {publishing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : flyer.isPublished ? (
                    "Unpublish"
                  ) : (
                    "Publish"
                  )}
                </button>

                {/* Status Badge */}
                <div
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    flyer.isPublished
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {flyer.isPublished ? "Published" : "Draft"}
                </div>

                <Link
                  href={`/flyers/${flyerId}`}
                  className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  View Flyer
                </Link>
              </div>
            </div>

            {/* Status Messages */}
            {(publishMessage || activateMessage) && (
              <div className="mt-4 space-y-2">
                {publishMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      publishMessage.includes("Error")
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-green-100 text-green-800 border border-green-200"
                    }`}
                  >
                    {publishMessage}
                  </div>
                )}
                {activateMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      activateMessage.includes("Error")
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-green-100 text-green-800 border border-green-200"
                    }`}
                  >
                    {activateMessage}
                  </div>
                )}
              </div>
            )}

            {/* Publishing Requirements */}
            {!publishStatus.canPublish && !flyer.isPublished && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      Publishing Requirements
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>To publish this flyer, ensure:</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        {!flyer.isActive && <li>Flyer is active</li>}
                        {products.length === 0 && (
                          <li>Flyer contains products</li>
                        )}
                        {!flyer.coverImage && <li>Flyer has a cover image</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Flyer Status Overview */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Flyer Status Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Publishing Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Publishing Status:
                    </span>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          flyer.isPublished ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-medium ${
                          flyer.isPublished ? "text-green-700" : "text-gray-700"
                        }`}
                      >
                        {flyer.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Active Status:
                    </span>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          flyer.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-medium ${
                          flyer.isActive ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {flyer.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {flyer.publishDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Published Date:
                      </span>
                      <span className="text-sm text-gray-900">
                        {new Date(flyer.publishDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Requirements Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Has Cover Image:
                    </span>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          flyer.coverImage ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-medium ${
                          flyer.coverImage ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {flyer.coverImage ? "Po" : "Jo"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Has Products:</span>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          products.length > 0 ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-medium ${
                          products.length > 0
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {products.length > 0 ? `Po (${products.length})` : "Jo"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Can Publish:</span>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          publishStatus.canPublish
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-medium ${
                          publishStatus.canPublish
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {publishStatus.canPublish ? "Po" : "Jo"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Required Message */}
              {!publishStatus.canPublish && !flyer.isPublished && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-blue-700">
                      Veprimi i Kërkuar: {publishStatus.reason}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {!publishStatus.canPublish && !flyer.isPublished && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h4 className="text-sm font-medium text-indigo-900 mb-3">
                    Quick Actions to Publish
                  </h4>
                  <div className="space-y-2">
                    {!flyer.isActive && (
                      <button
                        onClick={handleActivateToggle}
                        disabled={activating}
                        className="w-full flex items-center justify-between p-3 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-indigo-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-indigo-700">
                            Activate Flyer
                          </span>
                        </div>
                        <span className="text-xs text-indigo-600">
                          Required
                        </span>
                      </button>
                    )}

                    {products.length === 0 && (
                      <button
                        onClick={() => setShowAddProductModal(true)}
                        className="w-full flex items-center justify-between p-3 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-indigo-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-indigo-700">
                            Shto Produkte
                          </span>
                        </div>
                        <span className="text-xs text-indigo-600">
                          Required
                        </span>
                      </button>
                    )}

                    {!flyer.coverImage && (
                      <div className="w-full flex items-center justify-between p-3 bg-indigo-100 border border-indigo-300 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-indigo-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-indigo-700">
                            Add Cover Image
                          </span>
                        </div>
                        <span className="text-xs text-indigo-600">
                          Required
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-indigo-200">
                    <p className="text-xs text-indigo-600">
                      Complete all required actions above to enable publishing
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {products.length}
                </div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {flyer.category.name}
                </div>
                <div className="text-sm text-gray-600">Kategoria</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {flyer.brand.name}
                </div>
                <div className="text-sm text-gray-600">Marka</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    flyer.isPublished ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {flyer.isPublished ? "Published" : "Draft"}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    flyer.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {flyer.isActive ? "Active" : "Inactive"}
                </div>
                <div className="text-sm text-gray-600">Active Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2 inline"
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
              Shto Produkt
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Asnjë produkt ende
              </h3>
              <p className="text-gray-600 mb-6">
                Add your first product to get started
              </p>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Shto Produkt
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    {product.image ? (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    {!product.image && (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <svg
                            className="w-12 h-12 mx-auto mb-2"
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
                          <span className="text-sm font-medium">
                            Asnjë Imazh
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Page {product.pageNumber}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-600">
                          ${product.price}
                        </div>
                        <div className="text-xs text-gray-500">Çmimi</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-900 font-medium">
                          {product.quantity}
                        </div>
                        <div className="text-xs text-gray-500">Sasia</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="flex-1 px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors text-center"
                      >
                        Fshij
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Add New Product
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddProductModal(false);
                      setImageFile(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddProduct} className="px-6 py-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Çmimi *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Përshkrimi
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategoria *
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marka *
                    </label>
                    <select
                      value={newProduct.brand}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, brand: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select brand</option>
                      {brands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sasia
                    </label>
                    <input
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          quantity: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page Number
                    </label>
                    <input
                      type="number"
                      value={newProduct.pageNumber}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          pageNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Code
                    </label>
                    <input
                      type="text"
                      value={newProduct.shifra}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, shifra: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imazhi i Produktit
                  </label>
                  <ImageUpload
                    label=""
                    value={imageFile}
                    onChange={setImageFile}
                    maxSize={5}
                    accept="image/*"
                    helpText="Upload a product image. Supported formats: JPG, PNG, WebP, GIF. Max size: 5MB"
                    className="w-full"
                  />
                  {imageFile && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-green-700">
                          Image selected: {imageFile.name} (
                          {(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Details
                  </label>
                  <textarea
                    value={newProduct.details}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, details: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProductModal(false);
                      setImageFile(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Anulo
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? "Duke shtuar..." : "Shto Produkt"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
