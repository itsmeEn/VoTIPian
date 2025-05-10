"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Dashboard = () => {
  const { user } = useAuth()
  const [activeElections, setActiveElections] = useState([])
  const [upcomingElections, setUpcomingElections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch active and upcoming elections
    const fetchElections = async () => {
      try {
        const response = await fetch("/api/elections/active")
        const activeData = await response.json()
        setActiveElections(activeData)

        const upcomingResponse = await fetch("/api/elections/upcoming")
        const upcomingData = await upcomingResponse.json()
        setUpcomingElections(upcomingData)
      } catch (error) {
        console.error("Error fetching elections:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchElections()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
        <p className="text-gray-600">Your one-stop platform for student council elections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Active Elections</h2>
          {activeElections.length > 0 ? (
            <ul className="space-y-4">
              {activeElections.map((election) => (
                <li key={election._id} className="border-b pb-3">
                  <h3 className="font-medium">{election.title}</h3>
                  <p className="text-sm text-gray-500">Ends: {new Date(election.endDate).toLocaleDateString()}</p>
                  <div className="mt-2">
                    <Link
                      to={`/elections/${election._id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No active elections at the moment.</p>
          )}
          <div className="mt-4">
            <Link to="/elections" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View All Elections
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Elections</h2>
          {upcomingElections.length > 0 ? (
            <ul className="space-y-4">
              {upcomingElections.map((election) => (
                <li key={election._id} className="border-b pb-3">
                  <h3 className="font-medium">{election.title}</h3>
                  <p className="text-sm text-gray-500">Starts: {new Date(election.startDate).toLocaleDateString()}</p>
                  <div className="mt-2">
                    <Link
                      to={`/elections/${election._id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No upcoming elections scheduled.</p>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Candidates</h2>
          <p className="text-gray-600 mb-4">View candidate profiles and platforms</p>
          <Link to="/candidates" className="text-primary-600 hover:text-primary-700 font-medium">
            Browse Candidates →
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Discussions</h2>
          <p className="text-gray-600 mb-4">Join conversations about campus issues</p>
          <Link to="/discussions" className="text-primary-600 hover:text-primary-700 font-medium">
            View Discussions →
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">My Profile</h2>
          <p className="text-gray-600 mb-4">View or update your profile information</p>
          <Link to="/profile" className="text-primary-600 hover:text-primary-700 font-medium">
            View Profile →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
