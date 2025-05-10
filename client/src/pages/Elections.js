"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../utils/api"

const Elections = () => {
  const [elections, setElections] = useState([])
  const [status, setStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await api.get(`/elections${status !== 'all' ? `?status=${status}` : ''}`);
        setElections(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching elections:", error);
        setError(error.message || "Failed to load elections");
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, [status]);

  const getStatusBadge = (election) => {
    const now = new Date()
    const startDate = new Date(election.startDate)
    const endDate = new Date(election.endDate)

    if (now < startDate) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Upcoming</span>
    } else if (now > endDate) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Completed</span>
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading elections...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Elections</h1>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setStatus("all")}
            className={`px-4 py-2 rounded-md ${status === "all" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("active")}
            className={`px-4 py-2 rounded-md ${status === "active" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Active
          </button>
          <button
            onClick={() => setStatus("upcoming")}
            className={`px-4 py-2 rounded-md ${status === "upcoming" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setStatus("completed")}
            className={`px-4 py-2 rounded-md ${status === "completed" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Completed
          </button>
        </div>
      </div>

      {elections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election) => (
            <div key={election._id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold mb-2">{election.title}</h2>
                  {getStatusBadge(election)}
                </div>
                <p className="text-gray-600 mb-4">
                  {election.description ? 
                    election.description.length > 100 
                      ? `${election.description.substring(0, 100)}...` 
                      : election.description
                    : 'No description available'}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <div>
                      <p>Start Date:</p>
                      <p className="font-medium text-gray-900">{new Date(election.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p>End Date:</p>
                      <p className="font-medium text-gray-900">{new Date(election.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Link
                    to={`/elections/${election._id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Details
                  </Link>

                  {new Date() > new Date(election.startDate) && new Date() < new Date(election.endDate) && (
                    <Link
                      to={`/voting/${election._id}`}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Vote Now
                    </Link>
                  )}

                  {new Date() > new Date(election.endDate) && (
                    <Link
                      to={`/elections/${election._id}/results`}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      View Results
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No elections found for the selected filter.</p>
        </div>
      )}
    </div>
  )
}

export default Elections
