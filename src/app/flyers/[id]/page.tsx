"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import HTMLFlipBook from "react-pageflip";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { getImageUrl } from "@/lib/uploadUtils";

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
}

// Full Screen Product Modal Component
const ProductModal = ({
  product,
  isOpen,
  onClose,
  getImageUrl,
}: {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  getImageUrl: (imagePath: string) => string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-3xl w-full h-full max-w-none max-h-none overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 bg-white rounded-full p-3 shadow-xl hover:bg-gray-100 transition-colors border border-gray-200"
        >
          <svg
            className="w-8 h-8 text-gray-600"
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

        {/* Product Content */}
        <div className="p-8 md:p-12">
          {/* Header with Product Code */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-bold text-2xl rounded-full shadow-xl mb-6">
              {product.shifra}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {product.name}
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-start">
            {/* Left Side - Large Product Image */}
            <div className="relative">
              <div className="bg-gray-100 rounded-3xl p-8">
                {product.image ? (
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-auto rounded-2xl object-cover shadow-2xl"
                    style={{ minHeight: "256px" }}
                    onError={(e) => {
                      console.log(
                        `Modal image failed to load: ${getImageUrl(
                          product.image
                        )}`
                      );
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.log(
                        `Modal image loaded successfully: ${getImageUrl(
                          product.image
                        )}`
                      );
                      console.log(
                        `Modal image dimensions: ${target.naturalWidth}x${target.naturalHeight}`
                      );
                    }}
                  />
                ) : null}
                {!product.image && (
                  <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-2xl">
                    <div className="text-center text-gray-500">
                      <svg
                        className="w-16 h-16 mx-auto mb-4"
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
                      <span className="text-lg font-medium">
                        Asnjë Imazh Produkti
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* BEST PRICE Badge */}
              <div className="absolute -top-4 -left-4 bg-red-500 text-white px-8 py-4 rounded-full font-bold text-2xl shadow-2xl transform -rotate-12">
                BEST PRICE
              </div>
            </div>

            {/* Right Side - Product Details */}
            <div className="space-y-12">
              {/* Price Display */}
              <div className="text-center xl:text-left">
                <div className="text-7xl md:text-8xl font-bold text-orange-500 mb-4">
                  ${product.price}
                </div>
                <div className="text-2xl md:text-3xl text-gray-600">
                  Çmimi i Ofertës së Veçantë
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <div className="text-lg text-gray-500 mb-3">Kategoria</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {product.category.name}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <div className="text-lg text-gray-500 mb-3">Marka</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {product.brand.name}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <div className="text-lg text-gray-500 mb-3">
                      Sasia e Disponueshme
                    </div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {product.quantity} njësi
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <div className="text-lg text-gray-500 mb-3">
                      Kodi i Produktit
                    </div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {product.shifra}
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                {product.details && (
                  <div>
                    <h3 className="text-3xl font-semibold text-gray-900 mb-6">
                      Detajet e Produktit
                    </h3>
                    <div className="bg-gray-50 p-8 rounded-2xl">
                      <p className="text-gray-700 text-xl leading-relaxed">
                        {product.details}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Call to Action */}
              <div className="text-center xl:text-left space-y-6">
                <div className="text-2xl md:text-3xl text-gray-600">
                  <strong>Interested in this product?</strong>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center xl:justify-start">
                  <button className="px-12 py-6 bg-orange-500 text-white font-bold text-2xl rounded-2xl hover:bg-orange-600 transition-colors shadow-2xl">
                    Contact Sales Team
                  </button>
                  <button className="px-12 py-6 border-4 border-orange-500 text-orange-500 font-bold text-2xl rounded-2xl hover:bg-orange-50 transition-colors">
                    Request Quote
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Information */}
          <div className="mt-16 pt-12 border-t-2 border-gray-200 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-lg text-gray-600">
              <div>
                <div className="font-semibold text-gray-900 mb-2 text-xl">
                  Product Code
                </div>
                <div className="text-lg">{product.shifra}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-2 text-xl">
                  Category
                </div>
                <div className="text-lg">{product.category.name}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-2 text-xl">
                  Brand
                </div>
                <div className="text-lg">{product.brand.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Product Page Component
const ProductPage = React.forwardRef(
  (
    props: {
      product: Product;
      pageNumber: number;
      onImageClick: (product: Product) => void;
      getImageUrl: (imagePath: string) => string;
    },
    ref: any
  ) => {
    const handlePageClick = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is on or inside the image container
      if (target.closest(".product-image-container") || target.closest("img")) {
        e.stopPropagation();
        e.preventDefault();
        props.onImageClick(props.product);
      }
    };

    return (
      <div className="product-page" ref={ref} onClick={handlePageClick}>
        <div className="relative bg-white rounded-3xl border-8 border-orange-400 p-6 mx-auto w-full h-full flex flex-col">
          {/* Shifra Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex">
            <div className="bg-orange-500 text-white px-4 py-1 rounded-full font-bold text-sm shadow-lg">
              {props.product.shifra}
            </div>
          </div>

          {/* BEST PRICE Badge */}
          <div className="absolute -top-3 -left-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg transform -rotate-12">
            BEST PRICE
          </div>

          {/* Product Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start flex-1">
            {/* Left Side - Product Image (Clickable) */}
            <div className="relative">
              <div
                className="bg-gray-100 rounded-xl p-3 cursor-pointer hover:bg-gray-200 transition-colors group product-image-container"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  props.onImageClick(props.product);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  props.onImageClick(props.product);
                }}
              >
                {props.product.image ? (
                  <div className="relative">
                    <img
                      src={props.getImageUrl(props.product.image)}
                      alt={props.product.name}
                      className="w-full h-48 rounded-lg object-cover group-hover:scale-100 transition-transform duration-200 pointer-events-none border border-gray-200"
                      style={{ minHeight: "192px" }}
                      onError={(e) => {
                        console.log(
                          `Image failed to load: ${props.getImageUrl(
                            props.product.image
                          )}`
                        );
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.log(
                          `Image loaded successfully: ${props.getImageUrl(
                            props.product.image
                          )}`
                        );
                        console.log(
                          `Image dimensions: ${target.naturalWidth}x${target.naturalHeight}`
                        );
                        console.log(
                          `Image display: ${target.style.display}, visibility: ${target.style.visibility}`
                        );
                      }}
                    />

                    {/* Full URL debug - remove this later */}
                    <div className="absolute bottom-0 left-0 bg-blue-600 bg-opacity-75 text-white text-xs p-1 rounded max-w-full truncate">
                      {props.getImageUrl(props.product.image)}
                    </div>
                  </div>
                ) : null}
                {!props.product.image && (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
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
                      <span className="text-xs font-medium">Asnjë Imazh</span>
                    </div>
                  </div>
                )}
                {/* Click indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Click to view full screen
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Product Details */}
            <div className="space-y-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
                  {props.product.name}
                </h2>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {props.product.description}
                </p>
              </div>

              {/* Product Info Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Kategoria</div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {props.product.category.name}
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Marka</div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {props.product.brand.name}
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Sasia</div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {props.product.quantity}
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Kodi</div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {props.product.shifra}
                  </div>
                </div>
              </div>

              {/* Product Details - Compact */}
              {props.product.details && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Detajet
                  </h3>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-gray-700 text-xs line-clamp-3">
                      {props.product.details}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Badge */}
          <div className="absolute -bottom-3 -right-3 bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
            ${props.product.price}
          </div>

          {/* Product Code and Quantity Info Below - Compact */}
          <div className="mt-3 text-center space-y-1 text-xs text-gray-600">
            <div>Kodi i Produktit: {props.product.shifra}</div>
            <div>E Disponueshme: {props.product.quantity} njësi</div>
          </div>
        </div>
      </div>
    );
  }
);

ProductPage.displayName = "ProductPage";

export default function FlyerDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const flyerId = params.id as string;
  const bookRef = useRef<any>(null);
  const [flyer, setFlyer] = useState<Flyer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Import getImageUrl from uploadUtils to avoid CORS issues

  useEffect(() => {
    if (flyerId) {
      fetchFlyerProducts();
    }
  }, [flyerId]);

  const fetchFlyerProducts = async () => {
    try {
      setLoading(true);

      // Fetch flyer data
      const flyerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product-flyers/${flyerId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const flyerData = await flyerResponse.json();
      console.log("Flyer response:", flyerResponse.status, flyerData);

      if (flyerResponse.ok) {
        console.log("Setting flyer:", flyerData.data.flyer);
        setFlyer(flyerData.data.flyer);

        // Try to fetch products, but don't fail if this endpoint doesn't exist
        try {
          const productsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product-flyers/${flyerId}/products`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            console.log(
              "Products response:",
              productsResponse.status,
              productsData
            );

            if (productsData.data && productsData.data.products) {
              const sortedProducts = productsData.data.products.sort(
                (a: Product, b: Product) => a.pageNumber - b.pageNumber
              );
              console.log("Setting products:", sortedProducts);
              console.log("First product image:", sortedProducts[0]?.image);
              setProducts(sortedProducts);
            } else if (productsData.data && Array.isArray(productsData.data)) {
              // Handle case where products are directly in data array
              const sortedProducts = productsData.data.sort(
                (a: Product, b: Product) => a.pageNumber - b.pageNumber
              );
              console.log("Setting products from data array:", sortedProducts);
              console.log("First product image:", sortedProducts[0]?.image);
              setProducts(sortedProducts);
            } else {
              console.log("No products data, setting empty array");
              setProducts([]);
            }
          } else {
            console.log("Products endpoint not available, setting empty array");
            setProducts([]);
          }
        } catch (productsError) {
          console.log(
            "Products fetch failed, setting empty array:",
            productsError
          );
          setProducts([]);
        }
      } else {
        console.error(
          "Flyer response not ok:",
          flyerResponse.status,
          flyerData
        );
      }
    } catch (error) {
      console.error("Error fetching flyer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  const goToNextPage = () => {
    if (bookRef.current && currentPage < products.length - 1) {
      bookRef.current.pageFlip().flipNext("top");
    }
  };

  const goToPrevPage = () => {
    if (bookRef.current && currentPage > 0) {
      bookRef.current.pageFlip().flipPrev("top");
    }
  };

  const goToPage = (pageNum: number) => {
    if (bookRef.current && pageNum >= 0 && pageNum < products.length) {
      bookRef.current.pageFlip().flip(pageNum, "top");
    }
  };

  const handleImageClick = (product: Product) => {
    console.log("Image clicked:", product.name); // Debug log
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Handle click events on the flipbook to prevent interference
  const handleFlipbookClick = (e: React.MouseEvent) => {
    // Check if the clicked element is an image or its container
    const target = e.target as HTMLElement;
    if (target.closest(".product-image-container")) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handlePublishToggle = async () => {
    if (!flyer) return;

    try {
      setPublishing(true);
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

      if (response.ok) {
        const result = await response.json();
        // Update the local flyer state with the new published status
        setFlyer((prev) =>
          prev ? { ...prev, isPublished: !prev.isPublished } : null
        );

        // Show success message (you can add a toast notification here)
        console.log(result.message);
      } else {
        const error = await response.json();
        console.error("Failed to toggle publish status:", error.message);
        // You can add error handling here (show error message to user)
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      // You can add error handling here (show error message to user)
    } finally {
      setPublishing(false);
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
              Kthehu te Fletushkat
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <>
      <ProtectedRoute>
        <DashboardLayout showSidebar={false}>
          {/* Compact Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/flyers")}
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
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {flyer.title}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {flyer.category?.name || "N/A"} •{" "}
                    {flyer.brand?.name || "N/A"} • {flyer.totalProducts || 0}{" "}
                    products
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Publish/Unpublish Button */}
                <button
                  onClick={handlePublishToggle}
                  disabled={publishing}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    flyer.isPublished
                      ? "bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-yellow-400"
                      : "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-400"
                  }`}
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
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    flyer.isPublished
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {flyer.isPublished ? "Published" : "Draft"}
                </div>

                <Link
                  href={`/flyers/${flyerId}/manage`}
                  className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Menaxho Fletushkën
                </Link>
              </div>
            </div>
          </div>

          {/* Page Navigation - Only show when there are products */}
          {products.length > 0 && (
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage <= 0}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage + 1} of {products.length}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage >= products.length - 1}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>

                {/* Page Jump */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={products.length}
                    value={currentPage + 1}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= products.length) {
                        goToPage(page - 1);
                      }
                    }}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Full Screen Product Flip Book */}
          <div className="flex-1 flex justify-center items-center p-4">
            {products.length > 0 ? (
              <HTMLFlipBook
                width={900}
                height={700}
                size="stretch"
                minWidth={600}
                maxWidth={1200}
                minHeight={400}
                maxHeight={900}
                showCover={false}
                flippingTime={1000}
                usePortrait={true}
                startZIndex={0}
                autoSize={true}
                maxShadowOpacity={0.5}
                mobileScrollSupport={true}
                swipeDistance={30}
                clickEventForward={true}
                useMouseEvents={true}
                renderOnlyPageLengthChange={false}
                onFlip={onFlip}
                ref={bookRef}
                className="product-flipbook"
                style={{}}
                startPage={0}
                drawShadow={true}
                showPageCorners={false}
                disableFlipByClick={false}
              >
                {products.map((product, index) => (
                  <ProductPage
                    key={product._id}
                    product={product}
                    pageNumber={index + 1}
                    onImageClick={handleImageClick}
                    getImageUrl={getImageUrl}
                  />
                ))}
              </HTMLFlipBook>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-16 h-16 text-gray-400"
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Asnjë Produkt i Shtuar Ende
                </h3>
                <p className="text-gray-600 mb-6">
                  This flyer doesn't have any products yet. Add products to
                  start building your catalog.
                </p>
                <Link
                  href={`/flyers/${flyerId}/manage`}
                  className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
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
                  Add Products
                </Link>
              </div>
            )}
          </div>

          <style jsx global>{`
            .product-page {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 1rem;
            }

            .product-flipbook {
              width: 100% !important;
              height: 100% !important;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              overflow: hidden;
            }

            .product-page .demoPage {
              background: transparent;
              border: none;
              box-shadow: none;
            }

            /* Ensure product image container can receive clicks */
            .product-image-container {
              position: relative;
              z-index: 10;
              pointer-events: auto !important;
            }

            .product-image-container * {
              pointer-events: none;
            }

            .product-image-container:hover {
              z-index: 20;
            }

            /* Custom scrollbar for the flipbook */
            .product-flipbook ::-webkit-scrollbar {
              width: 8px;
            }

            .product-flipbook ::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 4px;
            }

            .product-flipbook ::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 4px;
            }

            .product-flipbook ::-webkit-scrollbar-thumb:hover {
              background: #a8a8a8;
            }
          `}</style>
        </DashboardLayout>
      </ProtectedRoute>

      {/* Full Screen Product Modal - Rendered outside ProtectedRoute */}
      {selectedProduct && isModalOpen && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={closeModal}
          getImageUrl={getImageUrl}
        />
      )}
    </>
  );
}
