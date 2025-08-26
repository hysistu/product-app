import React, { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface UsersOverviewProps {
  data: any;
}

const UsersOverview: React.FC<UsersOverviewProps> = ({ data }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
  });

  useEffect(() => {
    // Handle different possible data structures
    let usersArray: User[] = [];

    if (data && typeof data === "object") {
      if (data.data && Array.isArray(data.data)) {
        usersArray = data.data;
      } else if (Array.isArray(data)) {
        usersArray = data;
      } else if (data.users && Array.isArray(data.users)) {
        usersArray = data.users;
      }
    }

    setUsers(usersArray);

    // Calculate analytics
    const totalUsers = usersArray.length;
    const adminUsers = usersArray.filter((u) => u.role === "admin").length;
    const regularUsers = usersArray.filter((u) => u.role === "user").length;

    setAnalytics({
      totalUsers,
      adminUsers,
      regularUsers,
    });
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Simple Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-800">
              {analytics.totalUsers}
            </div>
            <div className="text-sm text-blue-600">Përdorues Total</div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-800">
              {analytics.adminUsers}
            </div>
            <div className="text-sm text-purple-600">Administratorë</div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800">
              {analytics.regularUsers}
            </div>
            <div className="text-sm text-green-600">Përdorues të Rregullt</div>
          </div>
        </div>
      </div>

      {/* Recent Users List */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-semibold text-gray-900">
            Përdorues të Fundit
          </h5>
          <Link
            href="/users"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Shiko të Gjitha →
          </Link>
        </div>

        {users.length > 0 ? (
          <div className="space-y-3">
            {users.slice(0, 5).map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.role}
                  </span>
                  <Link
                    href={`/users/${user._id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-sm mb-3">Asnjë përdorues ende</p>
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Add users
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersOverview;
