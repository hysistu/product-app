import React from "react";

interface MetricsCardsProps {
  metrics: {
    totalFlyers?: number;
    totalProducts?: number;
    totalUsers?: number;
    totalCategories?: number;
    totalBrands?: number;
    publishedFlyers?: number;
  };
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const metricItems = [
    {
      icon: "📋",
      value: metrics.totalFlyers || 0,
      label: "Fletushka Totale",
      color: "bg-blue-500",
    },
    {
      icon: "🛠️",
      value: metrics.totalProducts || 0,
      label: "Produkte Totale",
      color: "bg-green-500",
    },
    {
      icon: "👥",
      value: metrics.totalUsers || 0,
      label: "Përdorues Total",
      color: "bg-purple-500",
    },
    {
      icon: "📁",
      value: metrics.totalCategories || 0,
      label: "Kategori",
      color: "bg-yellow-500",
    },
    {
      icon: "🏷️",
      value: metrics.totalBrands || 0,
      label: "Marka",
      color: "bg-pink-500",
    },
    {
      icon: "📈",
      value: metrics.publishedFlyers || 0,
      label: "Fletushka të Publikuara",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {metricItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
          <div
            className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}
          >
            <span className="text-white text-xl">{item.icon}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {item.value.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
