import React from "react";

interface Activity {
  id: string;
  type: string;
  message: string;
  user: string;
  timestamp: string;
}

interface RecentActivityProps {
  data: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ data }) => {
  // Mock data if no real data is provided
  const activities =
    data && data.length > 0
      ? data
      : [
          {
            id: "1",
            type: "product",
            message: "Produkt i ri u shtua",
            user: "Admin",
            timestamp: "2 hours ago",
          },
          {
            id: "2",
            type: "flyer",
            message: "Fletushka u publikua",
            user: "Manager",
            timestamp: "4 hours ago",
          },
          {
            id: "3",
            type: "user",
            message: "Përdorues i ri u regjistrua",
            user: "System",
            timestamp: "6 hours ago",
          },
          {
            id: "4",
            type: "category",
            message: "Kategoria u përditësua",
            user: "Admin",
            timestamp: "1 day ago",
          },
        ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "product":
        return "🛠️";
      case "flyer":
        return "📋";
      case "user":
        return "👤";
      case "category":
        return "📁";
      default:
        return "📝";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "product":
        return "bg-blue-100 text-blue-600";
      case "flyer":
        return "bg-green-100 text-green-600";
      case "user":
        return "bg-purple-100 text-purple-600";
      case "category":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div
            className={`w-8 h-8 ${getActivityColor(
              activity.type
            )} rounded-lg flex items-center justify-center flex-shrink-0`}
          >
            <span className="text-sm">{getActivityIcon(activity.type)}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 font-medium">
              {activity.message}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-blue-600 font-medium">
                {activity.user}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {activity.timestamp}
              </span>
            </div>
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">📝</div>
          <p className="text-sm">Asnjë aktivitet i fundit</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
