import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get("/auth/profile"),

  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  }) => api.put("/auth/profile", data),

  refreshToken: () => api.post("/auth/refresh"),
};

export const productAPI = {
  // Get all products with pagination and filtering
  getAllProducts: (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    search?: string;
  }) => api.get("/products", { params }),

  // Get product categories
  getCategories: () => api.get("/products/categories"),

  // Get product brands
  getBrands: () => api.get("/products/brands"),

  // Get product by ID
  getProductById: (id: string) => api.get(`/products/${id}`),

  // Create new product
  createProduct: (data: {
    name: string;
    details: string;
    price: number;
    category: string;
    brand?: string;
    quantity: number;
    shifra: string;
    image: string;
    productFlyer?: string;
    pageNumber?: number;
    tags?: string[];
    specifications?: Record<string, unknown>;
  }) => api.post("/products", data),

  // Update product
  updateProduct: (
    id: string,
    data: {
      name?: string;
      details?: string;
      price?: number;
      category?: string;
      brand?: string;
      quantity?: number;
      shifra?: string;
      image?: string;
      productFlyer?: string;
      pageNumber?: number;
      tags?: string[];
      specifications?: Record<string, unknown>;
    }
  ) => api.put(`/products/${id}`, data),

  // Delete product
  deleteProduct: (id: string) => api.delete(`/products/${id}`),

  // Update product quantity
  updateQuantity: (
    id: string,
    data: { quantity: number; operation: "add" | "subtract" | "set" }
  ) => api.patch(`/products/${id}/quantity`, data),

  // Advanced search
  advancedSearch: (params: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    tags?: string;
    page?: number;
    limit?: number;
  }) => api.get("/products/search/advanced", { params }),
};

export const categoryAPI = {
  // Get all categories with pagination and filtering
  getCategories: (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
    isActive?: boolean;
    parentCategory?: string;
  }) => api.get("/categories", { params }),

  // Get categories in tree structure
  getCategoryTree: () => api.get("/categories/tree"),

  // Get root categories (no parent)
  getRootCategories: () => api.get("/categories/root"),

  // Get category by ID
  getCategoryById: (id: string) => api.get(`/categories/${id}`),

  // Create new category
  createCategory: (data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    parentCategory?: string;
  }) => api.post("/categories", data),

  // Update category
  updateCategory: (
    id: string,
    data: {
      name?: string;
      description?: string;
      icon?: string;
      color?: string;
      parentCategory?: string;
    }
  ) => api.put(`/categories/${id}`, data),

  // Delete category
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),

  // Activate/deactivate category
  toggleCategoryStatus: (id: string, isActive: boolean) =>
    api.patch(`/categories/${id}/activate`, { isActive }),

  // Search categories
  searchCategories: (params: { q: string; isActive?: boolean }) =>
    api.get("/categories/search", { params }),
};

export const productFlyerAPI = {
  // Get all flyers with pagination
  getAllFlyers: (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
    isActive?: boolean;
    isPublished?: boolean;
    category?: string;
    brand?: string;
  }) => api.get("/product-flyers", { params }),

  // Get published flyers only
  getPublishedFlyers: (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
    category?: string;
    brand?: string;
  }) => api.get("/product-flyers/published", { params }),

  // Get flyer by ID
  getFlyerById: (id: string) => api.get(`/product-flyers/${id}`),

  // Get products in flyer (paginated)
  getFlyerProducts: (
    id: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ) => api.get(`/product-flyers/${id}/products`, { params }),

  // Get specific product by page number in flyer
  getFlyerProductByPage: (flyerId: string, pageNumber: number) =>
    api.get(`/product-flyers/${flyerId}/products/${pageNumber}`),

  // Create new flyer
  createFlyer: (data: {
    title: string;
    description?: string;
    coverImage: string;
    category: string;
    brand: string;
    publishDate?: string;
    expiryDate?: string;
  }) => api.post("/product-flyers", data),

  // Update flyer
  updateFlyer: (
    id: string,
    data: {
      title?: string;
      description?: string;
      coverImage?: string;
      category?: string;
      brand?: string;
      publishDate?: string;
      expiryDate?: string;
    }
  ) => api.put(`/product-flyers/${id}`, data),

  // Delete flyer
  deleteFlyer: (id: string) => api.delete(`/product-flyers/${id}`),

  // Publish/unpublish flyer
  togglePublishStatus: (id: string, isPublished: boolean) =>
    api.patch(`/product-flyers/${id}/publish`, { isPublished }),

  // Search flyers
  searchFlyers: (params: { q: string; category?: string; brand?: string }) =>
    api.get("/product-flyers/search", { params }),
};

export const brandAPI = {
  // Get all brands with pagination
  getAllBrands: (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
    isActive?: boolean;
    country?: string;
  }) => api.get("/brands", { params }),

  // Get active brands only
  getActiveBrands: (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
    country?: string;
  }) => api.get("/brands/active", { params }),

  // Get all unique countries
  getCountries: () => api.get("/brands/countries"),

  // Get brand by ID
  getBrandById: (id: string) => api.get(`/brands/${id}`),

  // Create new brand
  createBrand: (data: {
    name: string;
    description?: string;
    logo?: string;
    website?: string;
    country?: string;
    founded?: number;
  }) => api.post("/brands", data),

  // Update brand
  updateBrand: (
    id: string,
    data: {
      name?: string;
      description?: string;
      logo?: string;
      website?: string;
      country?: string;
      founded?: number;
    }
  ) => api.put(`/brands/${id}`, data),

  // Delete brand
  deleteBrand: (id: string) => api.delete(`/brands/${id}`),

  // Activate/deactivate brand
  toggleBrandStatus: (id: string, isActive: boolean) =>
    api.patch(`/brands/${id}/activate`, { isActive }),

  // Search brands
  searchBrands: (params: { q: string; country?: string }) =>
    api.get("/brands/search", { params }),
};

export default api;
