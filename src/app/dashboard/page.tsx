"use client";

import CategoriesBrandsOverview from "@/components/dashboard/CategoriesBrandsOverview";
import FlyersOverview from "@/components/dashboard/FlyersOverview";
import MetricsCards from "@/components/dashboard/MetricsCards";
import ProductsAnalytics from "@/components/dashboard/ProductsAnalytics";
import RecentActivity from "@/components/dashboard/RecentActivity";
import UsersOverview from "@/components/dashboard/UsersOverview";
import DashboardLayout from "@/components/DashboardLayout";
import React, { useState, useEffect } from "react";

interface MetricsSummary {
  totalFlyers?: number;
  totalProducts?: number;
  totalUsers?: number;
  totalCategories?: number;
  totalBrands?: number;
  publishedFlyers?: number;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  user: string;
  timestamp: string;
}

interface DashboardData {
  metrics: MetricsSummary | Record<string, unknown>;
  flyers: unknown;
  products: unknown;
  categories: unknown;
  brands: unknown;
  users: unknown;
  recentActivity: ActivityItem[];
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    metrics: {},
    flyers: [],
    products: [],
    categories: [],
    brands: [],
    users: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [
        metricsResponse,
        flyersResponse,
        productsResponse,
        categoriesResponse,
        brandsResponse,
        usersResponse,
      ] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dashboard/metrics`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product-flyers?limit=5`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?limit=10`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brands`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users?limit=10`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      const data = {
        metrics: await metricsResponse.json(),
        flyers: await flyersResponse.json(),
        products: await productsResponse.json(),
        categories: await categoriesResponse.json(),
        brands: await brandsResponse.json(),
        users: await usersResponse.json(),
        recentActivity: [],
      };

      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto p-6 bg-gray-50">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paneli i Fletushkave të Produkteve
          </h1>
          <p className="text-gray-600">
            Pamje e plotë e sistemit tuaj të katalogut të produkteve
          </p>
        </div>

        {/* Key Metrics */}
        <MetricsCards metrics={dashboardData.metrics} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Flyers Overview */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Fletushka të Produkteve
              </h3>
            </div>
            <div className="p-6">
              <FlyersOverview data={dashboardData.flyers} />
            </div>
          </div>

          {/* Products Analytics */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Pamje e Produkteve
              </h3>
            </div>
            <div className="p-6">
              <ProductsAnalytics data={dashboardData.products} />
            </div>
          </div>

          {/* Categories & Brands */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Kategori & Marka
              </h3>
            </div>
            <div className="p-6">
              <CategoriesBrandsOverview
                categories={dashboardData.categories}
                brands={dashboardData.brands}
              />
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Menaxhimi i Përdoruesve
              </h3>
            </div>
            <div className="p-6">
              <UsersOverview data={dashboardData.users} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Aktiviteti i Fundit
            </h3>
          </div>
          <div className="p-6">
            <RecentActivity data={dashboardData.recentActivity} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
