"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../utils/api"

const AdminDashboard = () => {
  useAuth() // Keep the hook call without destructuring
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

 useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/dashboard-stats");
      console.log("Dashboard stats response:", response.data);
      setStats(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      setError("Failed to load dashboard data. Please try again later.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, []);




  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading admin dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Elections Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-primary-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Elections</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats?.totalElections || 0}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/elections" className="font-medium text-primary-600 hover:text-primary-500">
                Manage Elections
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-primary-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Candidates</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats?.totalCandidates || 0}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/candidates" className="font-medium text-primary-600 hover:text-primary-500">
                Manage Candidates
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-primary-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Registered Users</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats?.totalUsers || 0}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/users" className="font-medium text-primary-600 hover:text-primary-500">
                Manage Users
              </Link>
            </div>
          </div>
        </div>
      </div>

     

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Elections Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Elections</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats?.activeElections || 0}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/elections" className="font-medium text-green-600 hover:text-green-500">
                View Active Elections
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-1 lg:col-span-2 bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-4">
            <div className="space-y-6">
              {/* Recent Votes */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Recent Votes</h4>
                {stats?.recentActivity?.votes && stats.recentActivity.votes.length > 0 ? (
                  <ul className="space-y-3">
                    {stats.recentActivity.votes.map((vote, index) => (
                      <li key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            {vote.voter?.firstName || 'Anonymous'} {vote.voter?.lastName || 'User'}
                          </span>{" "}
                          voted in{" "}
                          <span className="text-primary-600">{vote.election?.title || 'Untitled Election'}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(vote.createdAt).toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No recent votes</p>
                )}
              </div>

              {/* Recent Discussions */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Recent Discussions</h4>
                {stats?.recentActivity?.discussions && stats.recentActivity.discussions.length > 0 ? (
                  <ul className="space-y-3">
                    {stats.recentActivity.discussions.map((discussion, index) => (
                      <li key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            {discussion.author?.firstName || 'Anonymous'} {discussion.author?.lastName || 'User'}
                          </span>{" "}
                          started a discussion:{" "}
                          <span className="text-primary-600">{discussion.title}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(discussion.createdAt).toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No recent discussions</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-1 lg:col-span-2 bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <Link to="/admin/elections/create" className="block">
                  <h4 className="text-lg font-medium text-gray-900">Create New Election</h4>
                  <p className="mt-1 text-sm text-gray-500">Set up a new election with positions and voting period</p>
                </Link>
              </div>
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <Link to="/admin/candidates" className="block">
                  <h4 className="text-lg font-medium text-gray-900">Manage Candidates</h4>
                  <p className="mt-1 text-sm text-gray-500">Add or edit candidate information and platforms</p>
                </Link>
              </div>
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <Link to="/admin/users" className="block">
                  <h4 className="text-lg font-medium text-gray-900">Manage Users</h4>
                  <p className="mt-1 text-sm text-gray-500">View and manage registered users</p>
                </Link>
              </div>
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <Link to="/elections" className="block">
                  <h4 className="text-lg font-medium text-gray-900">View Public Elections</h4>
                  <p className="mt-1 text-sm text-gray-500">See elections as they appear to users</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">System Status</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Server Status</span>
                  <span className="text-sm font-medium text-green-500">Online</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Database Status</span>
                  <span className="text-sm font-medium text-green-500">Connected</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Storage Usage</span>
                  <span className="text-sm font-medium text-gray-900">{stats?.storage?.used || "0%"}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: stats?.storage?.percentage || "10%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
