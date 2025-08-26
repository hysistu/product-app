"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ImageUpload from "@/components/ImageUpload";
import { submitWithUpload, getImageUrl } from "@/lib/uploadUtils";

interface Brand {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  country?: string;
  founded?: number;
  isActive: boolean;
  createdAt: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    country: "",
    founded: "",
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brands`
      );
      if (response.ok) {
        const data = await response.json();
        setBrands(data.data.brands || []);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form data before validation:", formData);
    console.log("Logo file:", logoFile);

    if (!formData.name.trim()) {
      alert("Please enter a brand name");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        return;
      }

      // Ensure we have the latest form data
      const currentFormData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
        country: formData.country.trim(),
        founded: formData.founded.trim(),
      };

      // Prepare data for upload
      const uploadData = {
        ...currentFormData,
        logo: logoFile,
        ...(currentFormData.founded && {
          founded: Number(currentFormData.founded),
        }),
      };

      console.log("Form data being sent:", uploadData);

      const response = await submitWithUpload(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brands`,
        uploadData,
        token,
        "POST"
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Brand created successfully:", result);
        setShowAddModal(false);
        setFormData({
          name: "",
          description: "",
          website: "",
          country: "",
          founded: "",
        });
        setLogoFile(null);
        fetchBrands(); // Refresh the list
      } else {
        const error = await response.json();
        console.error("Backend error:", error);
        console.error("Error details:", error.details);
        if (
          error &&
          typeof error === "object" &&
          "details" in error &&
          Array.isArray((error as { details?: unknown }).details)
        ) {
          const details = (
            error as {
              details?: Array<{
                field?: string;
                message?: string;
                value?: unknown;
              }>;
            }
          ).details;
          details?.forEach((detail) => {
            console.error(
              `Field: ${detail.field}, Message: ${
                detail.message
              }, Value: ${String(detail.value)}`
            );
          });
        }
        alert(`Failed to create brand: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating brand:", error);
      alert("Failed to create brand");
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

  const toggleBrandStatus = async (brandId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brands/${brandId}/activate`,
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
        fetchBrands(); // Refresh the list
      } else {
        alert("Failed to update brand status");
      }
    } catch (error) {
      console.error("Error updating brand status:", error);
      alert("Failed to update brand status");
    }
  };

  const deleteBrand = async (brandId: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brands/${brandId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchBrands(); // Refresh the list
      } else {
        alert("Failed to delete brand");
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      alert("Failed to delete brand");
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
                  <h1 className="text-2xl font-bold text-gray-900">Marka</h1>
                  <p className="text-sm text-gray-600">
                    Menaxho markat tuaja të produkteve dhe prodhuesit
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
                  Add Brand
                </button>
              </div>
            </div>
          </header>

          {/* Brands Grid */}
          <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {brands.length === 0 ? (
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Asnjë markë ende
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by adding your first brand
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Brand
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brands.map((brand) => (
                  <div
                    key={brand._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    {/* Logo */}
                    <div className="p-6 text-center">
                      {brand.logo ? (
                        <>
                          <img
                            src={getImageUrl(brand.logo)}
                            alt={brand.name}
                            className="w-20 h-20 mx-auto rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          />
                          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-lg flex items-center justify-center hidden">
                            <svg
                              className="w-10 h-10 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-10 h-10 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                        {brand.name}
                      </h3>
                      {brand.description && (
                        <p className="text-gray-600 text-sm mb-4 text-center">
                          {brand.description}
                        </p>
                      )}

                      {/* Details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        {brand.website && (
                          <div className="flex items-center">
                            <span className="font-medium w-16">Website:</span>
                            <a
                              href={brand.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-600 hover:text-orange-700 truncate"
                            >
                              {brand.website}
                            </a>
                          </div>
                        )}
                        {brand.country && (
                          <div className="flex items-center">
                            <span className="font-medium w-16">Country:</span>
                            <span>{brand.country}</span>
                          </div>
                        )}
                        {brand.founded && (
                          <div className="flex items-center">
                            <span className="font-medium w-16">Founded:</span>
                            <span>{brand.founded}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex space-x-2">
                        <button
                          onClick={() =>
                            toggleBrandStatus(brand._id, brand.isActive)
                          }
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            brand.isActive
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          {brand.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => deleteBrand(brand._id)}
                          className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            brand.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {brand.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Add Brand Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Add New Brand
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                  {/* Logo Upload */}
                  <ImageUpload
                    label="Brand Logo"
                    value={logoFile}
                    onChange={setLogoFile}
                    maxSize={2}
                    helpText="Upload a logo for your brand. Supported formats: JPG, PNG, WebP, GIF. Max size: 2MB"
                  />

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Brand Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter brand name"
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
                      placeholder="Enter brand description (optional)"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter country"
                    />
                  </div>

                  {/* Founded Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Founded Year
                    </label>
                    <input
                      type="number"
                      name="founded"
                      value={formData.founded}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g., 1990"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
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
                      {submitting ? "Creating..." : "Create Brand"}
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
