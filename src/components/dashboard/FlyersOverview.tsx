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

interface Flyer {
  _id: string;
  title: string;
  description?: string;
  coverImage?: string;
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
  createdBy: {
    firstName: string;
    lastName: string;
    fullName: string;
  };
}

interface FlyersOverviewProps {
  data: unknown;
}

const FlyersOverview: React.FC<FlyersOverviewProps> = ({ data }) => {
  const [flyersArray, setFlyersArray] = useState<Flyer[]>([]);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    totalFlyers: 0,
    publishedFlyers: 0,
    draftFlyers: 0,
    activeFlyers: 0,
  });

  const isDataWithFlyers = (v: unknown): v is { data: { flyers: Flyer[] } } =>
    typeof v === "object" &&
    v !== null &&
    "data" in v &&
    typeof (v as { data: unknown }).data === "object" &&
    (v as { data: unknown }).data !== null &&
    "flyers" in (v as { data: Record<string, unknown> }).data &&
    Array.isArray((v as { data: { flyers: unknown } }).data.flyers);

  const isFlyersProp = (v: unknown): v is { flyers: Flyer[] } =>
    typeof v === "object" &&
    v !== null &&
    "flyers" in v &&
    Array.isArray((v as { flyers: unknown }).flyers);

  const isDataArray = (v: unknown): v is { data: Flyer[] } =>
    typeof v === "object" &&
    v !== null &&
    "data" in v &&
    Array.isArray((v as { data: unknown }).data);

  useEffect(() => {
    // Handle different possible data structures
    let flyersArray: Flyer[] = [];

    if (Array.isArray(data)) {
      flyersArray = data;
    } else if (isDataWithFlyers(data)) {
      flyersArray = data.data.flyers;
    } else if (isFlyersProp(data)) {
      flyersArray = data.flyers;
    } else if (isDataArray(data)) {
      flyersArray = data.data;
    }

    setFlyersArray(flyersArray);

    // Calculate analytics
    const totalFlyers = flyersArray.length;
    const publishedFlyers = flyersArray.filter((f) => f.isPublished).length;
    const draftFlyers = flyersArray.filter((f) => !f.isPublished).length;
    const activeFlyers = flyersArray.filter((f) => f.isActive).length;

    setAnalytics({
      totalFlyers,
      publishedFlyers,
      draftFlyers,
      activeFlyers,
    });
  }, [data]);

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
        setFlyersArray((prev) =>
          prev.map((flyer) =>
            flyer._id === flyerId
              ? { ...flyer, isPublished: !currentStatus }
              : flyer
          )
        );

        // You can add a success toast notification here
        console.log(
          `Flyer ${currentStatus ? "unpublished" : "published"} successfully`
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

  // Prepare data for chart
  const statusData = [
    { name: "Published", value: analytics.publishedFlyers },
    { name: "Draft", value: analytics.draftFlyers },
  ].filter((item) => item.value > 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Simple Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-800">
              {analytics.totalFlyers}
            </div>
            <div className="text-sm text-blue-600">Fletushka Totale</div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800">
              {analytics.publishedFlyers}
            </div>
            <div className="text-sm text-green-600">E Publikuar</div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-800">
              {analytics.draftFlyers}
            </div>
            <div className="text-sm text-yellow-600">Skicë</div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-800">
              {analytics.activeFlyers}
            </div>
            <div className="text-sm text-purple-600">Aktive</div>
          </div>
        </div>
      </div>

      {/* Simple Status Chart */}
      {statusData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h5 className="text-lg font-semibold text-gray-900 mb-4">
            Statusi i Fletushkës
          </h5>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Flyers List */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-semibold text-gray-900">
            Fletushka të Fundit
          </h5>
          <Link
            href="/flyers"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Shiko të Gjitha →
          </Link>
        </div>

        {flyersArray.length > 0 ? (
          <div className="space-y-3">
            {flyersArray.slice(0, 5).map((flyer) => (
              <div
                key={flyer._id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      {flyer.totalProducts}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {flyer.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {flyer.category?.name} • {flyer.brand?.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      Krijuar nga {flyer.createdBy.fullName} •{" "}
                      {formatDate(flyer.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status Badge */}
                  <div
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      flyer.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {flyer.isPublished ? "Published" : "Draft"}
                  </div>

                  {/* Publish/Unpublish Button */}
                  <button
                    onClick={() =>
                      handlePublishToggle(flyer._id, flyer.isPublished)
                    }
                    disabled={publishing === flyer._id}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      flyer.isPublished
                        ? "bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-yellow-400"
                        : "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-400"
                    }`}
                  >
                    {publishing === flyer._id ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : flyer.isPublished ? (
                      "Unpublish"
                    ) : (
                      "Publish"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm mb-3">Asnjë fletushkë ende</p>
            <Link
              href="/flyers/create"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Krijo fletushkën tënde të parë
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlyersOverview;
