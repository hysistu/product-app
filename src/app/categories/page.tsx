"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ImageUpload from "@/components/ImageUpload";
import { submitWithUpload, getImageUrl } from "@/lib/uploadUtils";

interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  parentCategory?: string;
  isActive: boolean;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentCategory: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a category name");
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
        ...formData,
        icon: iconFile,
      };

      const response = await submitWithUpload(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`,
        uploadData,
        token,
        "POST"
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Category created successfully:", result);
        setShowAddModal(false);
        setFormData({
          name: "",
          description: "",
          parentCategory: "",
        });
        setIconFile(null);
        fetchCategories(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to create category: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category");
    } finally {
      setSubmitting(false);
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

  const toggleCategoryStatus = async (
    categoryId: string,
    currentStatus: boolean
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${categoryId}/activate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      if (response.ok) {
        fetchCategories(); // Refresh the list
      } else {
        alert("Failed to update category status");
      }
    } catch (error) {
      console.error("Error updating category status:", error);
      alert("Failed to update category status");
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchCategories(); // Refresh the list
      } else {
        alert("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
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
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Kategori</h1>
                  <p className="text-sm text-gray-600">
                    Organizoni produktet tuaja në kategori
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
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
                  Add Category
                </button>
              </div>
            </div>
          </header>

          {/* Categories Grid */}
          <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {categories.length === 0 ? (
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Asnjë kategori ende
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by adding your first category
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Category
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    {/* Icon */}
                    <div className="p-6 text-center">
                      {category.icon ? (
                        <>
                          <img
                            src={getImageUrl(category.icon)}
                            alt={category.name}
                            className="w-16 h-16 mx-auto rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          />
                          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center hidden">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-4 text-center">
                          {category.description}
                        </p>
                      )}

                      {/* Parent Category */}
                      {category.parentCategory && (
                        <div className="text-center mb-4">
                          <span className="text-xs text-gray-500">Parent:</span>
                          <div className="text-sm font-medium text-gray-700">
                            {categories.find(
                              (c) => c._id === category.parentCategory
                            )?.name || "Unknown"}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            toggleCategoryStatus(
                              category._id,
                              category.isActive
                            )
                          }
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            category.isActive
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          {category.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => deleteCategory(category._id)}
                          className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Add Category Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Add New Category
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                  {/* Icon Upload */}
                  <ImageUpload
                    label="Category Icon"
                    value={iconFile}
                    onChange={setIconFile}
                    maxSize={1}
                    helpText="Upload an icon for your category. Supported formats: JPG, PNG, WebP, GIF. Max size: 1MB"
                  />

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter category name"
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
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter category description (optional)"
                    />
                  </div>

                  {/* Parent Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Parent Category
                    </label>
                    <select
                      name="parentCategory"
                      value={formData.parentCategory}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Asnjë kategori mëmë</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Creating..." : "Create Category"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
