"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ImageUpload from "@/components/ImageUpload";
import { submitWithUpload } from "@/lib/uploadUtils";

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface Brand {
  _id: string;
  name: string;
}

export default function CreateFlyerPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    brand: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brands/active`
      );
      if (response.ok) {
        const data = await response.json();
        setBrands(data.data.brands || []);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a flyer title");
      return;
    }

    if (!formData.category) {
      alert("Please select a category");
      return;
    }

    if (!formData.brand) {
      alert("Please select a brand");
      return;
    }

    if (!coverImageFile) {
      alert("Please select a cover image");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Prepare data for upload
      const uploadData = {
        ...formData,
        coverImage: coverImageFile,
      };

      const response = await submitWithUpload(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product-flyers`,
        uploadData,
        token,
        "POST"
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Flyer created successfully:", result);
        router.push("/flyers");
      } else {
        const error = await response.json();
        alert(`Failed to create flyer: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating flyer:", error);
      alert("Failed to create flyer");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Create New Flyer
                  </h1>
                  <p className="text-sm text-gray-600">
                    Create a new product flyer for your catalog
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => router.push("/flyers")}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                  >
                    Back to Flyers
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cover Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Image
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <ImageUpload
                        label=""
                        value={coverImageFile}
                        onChange={setCoverImageFile}
                        required
                        maxSize={5}
                        accept="image/*"
                        helpText="Upload a high-quality cover image for your flyer. Supported formats: JPG, PNG, WebP, GIF. Max size: 5MB"
                        className="w-full"
                      />
                      {coverImageFile && (
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
                              Image selected: {coverImageFile.name} (
                              {(coverImageFile.size / 1024 / 1024).toFixed(2)}{" "}
                              MB)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Flyer Title
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter flyer title"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter flyer description (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Category
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Brand */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Brand
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          required
                        >
                          <option value="">Select a brand</option>
                          {brands.map((brand) => (
                            <option key={brand._id} value={brand._id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3 pt-6">
                      <button
                        type="button"
                        onClick={() => router.push("/flyers")}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Creating..." : "Create Flyer"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </main>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
