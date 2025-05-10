"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../utils/api"

const ManageElections = () => {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setError(null)
        let endpoint = "/elections"
        if (filter === "active") {
          endpoint = "/elections/active"
        } else if (filter === "upcoming") {
          endpoint = "/elections/upcoming"
        } else if (filter === "completed") {
          endpoint = "/elections/completed"
        }
        const response = await api.get(endpoint)
        setElections(response.data)
      } catch (error) {
        console.error("Error fetching elections:", error)
        setError(error.msg || "Failed to fetch elections")
      } finally {
        setLoading(false)
      }
    }

    fetchElections()
  }, [filter])

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

  const handleDeleteElection = async (id) => {
    if (!window.confirm("Are you sure you want to delete this election? This action cannot be undone.")) {
      return
    }

    try {
      await api.delete(`/elections/${id}`)
      setElections(elections.filter((election) => election._id !== id))
    } catch (error) {
      console.error("Error deleting election:", error)
      alert(error.msg || "Failed to delete election")
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
        <p className="text-lg text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Elections</h1>
        <Link
          to="/admin/elections/create"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Create New Election
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md ${filter === "all" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded-md ${filter === "active" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 rounded-md ${filter === "upcoming" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-md ${filter === "completed" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Completed
          </button>
        </div>
      </div>

      {elections.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Election
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date Range
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Votes
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {elections.map((election) => (
                <tr key={election._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{election.title}</div>
                    <div className="text-sm text-gray-500">{election.positions?.length || 0} Positions</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(election)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(election.startDate).toLocaleDateString()} -{" "}
                      {new Date(election.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{election.voteCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link to={`/elections/${election._id}`} className="text-primary-600 hover:text-primary-900">
                        View
                      </Link>
                      <Link
                        to={`/admin/elections/${election._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      {new Date() < new Date(election.startDate) && (
                        <button
                          onClick={() => handleDeleteElection(election._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                      <Link to={`/elections/${election._id}/results`} className="text-green-600 hover:text-green-900">
                        Results
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No elections found for the selected filter.</p>
          <Link
            to="/admin/elections/create"
            className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
          >
            Create your first election
          </Link>
        </div>
      )}
    </div>
  )
}

export default ManageElections
