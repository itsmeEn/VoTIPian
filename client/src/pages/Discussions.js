"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Discussions = () => {
  const { user } = useAuth()
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await fetch(`/api/discussions?filter=${filter}`)
        const data = await response.json()
        setDiscussions(data)
      } catch (error) {
        console.error("Error fetching discussions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDiscussions()
  }, [filter])

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading discussions...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Discussion Forum</h1>
        {user && (
          <Link
            to="/discussions/create"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Start New Discussion
          </Link>
        )}
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md ${filter === "all" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            All Topics
          </button>
          <button
            onClick={() => setFilter("elections")}
            className={`px-4 py-2 rounded-md ${filter === "elections" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Elections
          </button>
          <button
            onClick={() => setFilter("candidates")}
            className={`px-4 py-2 rounded-md ${filter === "candidates" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Candidates
          </button>
          <button
            onClick={() => setFilter("general")}
            className={`px-4 py-2 rounded-md ${filter === "general" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            General
          </button>
        </div>
      </div>

      {discussions.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {discussions.map((discussion) => (
              <li key={discussion._id}>
                <Link to={`/discussions/${discussion._id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-primary-600 truncate">{discussion.title}</h2>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {discussion.category}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          By {discussion.author ? `${discussion.author.firstName} ${discussion.author.lastName}` : "Anonymous"}
                        </p>
                        {discussion.relatedElection && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Election: {discussion.relatedElection.title}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>Posted on {formatDate(discussion.createdAt)}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">{discussion.content.substring(0, 200)}...</p>
                    </div>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span className="mr-4">{discussion.commentCount} comments</span>
                      <span>{discussion.viewCount} views</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No discussions found for the selected filter.</p>
          {user && (
            <Link
              to="/discussions/create"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
            >
              Start the first discussion
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default Discussions
