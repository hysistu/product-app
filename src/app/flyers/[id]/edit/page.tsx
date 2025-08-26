"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { productFlyerAPI, categoryAPI, brandAPI } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { Resolver } from "react-hook-form";

const flyerSchema = yup.object({
  title: yup
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title cannot exceed 100 characters")
    .required("Title is required"),
  description: yup
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  coverImage: yup.string().required("Cover image is required"),
  category: yup.string().required("Category is required"),
  brand: yup.string().required("Brand is required"),
  publishDate: yup.date().optional(),
  expiryDate: yup.date().optional(),
});

type FlyerFormData = yup.InferType<typeof flyerSchema>;

interface Flyer {
  title: string;
  description?: string;
  coverImage: string;
  category: { _id: string };
  brand: { _id: string };
  publishDate?: string;
  expiryDate?: string;
}

type ApiError = {
  response?: { data?: { message?: string } };
};

export default function EditFlyerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [flyerLoading, setFlyerLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [error, setError] = useState("");
  const [flyer, setFlyer] = useState<Flyer | null>(null);
  const [categories, setCategories] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [brands, setBrands] = useState<Array<{ _id: string; name: string }>>(
    []
  );
  const router = useRouter();
  const params = useParams();
  const flyerId = params.id as string;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FlyerFormData>({
    resolver: yupResolver(flyerSchema) as Resolver<FlyerFormData>,
  });

  const fetchFlyer = useCallback(async () => {
    try {
      setFlyerLoading(true);
      const response = await productFlyerAPI.getFlyerById(flyerId);
      const flyerData: Flyer = response.data.data.flyer;
      setFlyer(flyerData);

      // Set form values
      setValue("title", flyerData.title);
      setValue("description", flyerData.description || "");
      setValue("coverImage", flyerData.coverImage);
      setValue("category", flyerData.category._id);
      setValue("brand", flyerData.brand._id);

      if (flyerData.publishDate) {
        setValue("publishDate", new Date(flyerData.publishDate));
      }
      if (flyerData.expiryDate) {
        setValue("expiryDate", new Date(flyerData.expiryDate));
      }
    } catch (error: unknown) {
      const message =
        (error as ApiError)?.response?.data?.message || "Failed to fetch flyer";
      setError(message);
    } finally {
      setFlyerLoading(false);
    }
  }, [flyerId, setValue]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoryAPI.getCategories();
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      setBrandsLoading(true);
      const response = await brandAPI.getActiveBrands();
      setBrands(response.data.data.brands || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setBrandsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (flyerId) {
      fetchFlyer();
      fetchCategories();
      fetchBrands();
    }
  }, [flyerId, fetchFlyer, fetchCategories, fetchBrands]);

  const onSubmit = async (data: FlyerFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Convert Date objects to ISO strings for the API
      const apiData = {
        ...data,
        publishDate: data.publishDate
          ? data.publishDate.toISOString()
          : undefined,
        expiryDate: data.expiryDate ? data.expiryDate.toISOString() : undefined,
      };

      await productFlyerAPI.updateFlyer(flyerId, apiData);
      router.push(`/flyers/${flyerId}`);
    } catch (err: unknown) {
      const message =
        (err as ApiError)?.response?.data?.message || "Failed to update flyer";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (flyerLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!flyer) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Flyer not found
            </h2>
            <Link
              href="/flyers"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Back to Flyers
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Product Flyer
                </h1>
                <p className="text-sm text-gray-600">
                  Update flyer information and settings
                </p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/flyers/${flyerId}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  View Flyer
                </Link>
                <Link
                  href="/flyers"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Back to Flyers
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Flyer Title *
                        </label>
                        <input
                          {...register("title")}
                          type="text"
                          id="title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="Enter flyer title"
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.title.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Description
                        </label>
                        <textarea
                          {...register("description")}
                          id="description"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="Enter flyer description (optional)"
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.description.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="coverImage"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Cover Image URL *
                        </label>
                        <input
                          {...register("coverImage")}
                          type="text"
                          id="coverImage"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="https://example.com/cover-image.jpg"
                        />
                        {errors.coverImage && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.coverImage.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category and Brand */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Category and Brand
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="category"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Category *
                        </label>
                        <select
                          {...register("category")}
                          id="category"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        >
                          <option value="">
                            {categoriesLoading
                              ? "Loading categories..."
                              : "Select a category"}
                          </option>
                          {!categoriesLoading &&
                            categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))}
                        </select>
                        {errors.category && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.category.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="brand"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Brand *
                        </label>
                        <select
                          {...register("brand")}
                          id="brand"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        >
                          <option value="">
                            {brandsLoading
                              ? "Loading brands..."
                              : "Select a brand"}
                          </option>
                          {!brandsLoading &&
                            brands.map((brand) => (
                              <option key={brand._id} value={brand._id}>
                                {brand.name}
                              </option>
                            ))}
                        </select>
                        {errors.brand && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.brand.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Publishing Dates */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Publishing Dates (Optional)
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="publishDate"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Publish Date
                        </label>
                        <input
                          {...register("publishDate")}
                          type="datetime-local"
                          id="publishDate"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                        {errors.publishDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.publishDate.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="expiryDate"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Expiry Date
                        </label>
                        <input
                          {...register("expiryDate")}
                          type="datetime-local"
                          id="expiryDate"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                        {errors.expiryDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.expiryDate.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => reset()}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating Flyer...
                        </div>
                      ) : (
                        "Update Flyer"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
