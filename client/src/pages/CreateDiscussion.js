"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"

const CreateDiscussion = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    relatedTo: "",
    onModel: "Election"
  })

  useEffect(() => {
    // Redirect if not logged in
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    const fetchElections = async () => {
      try {
        const response = await api.get("/elections");
        setElections(response.data)
      } catch (error) {
        console.error("Error fetching elections:", error)
        setError(error.message || "Failed to load elections. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchElections()
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Clear relatedTo when category is General
      ...(name === 'category' && value === 'General' && { relatedTo: '', onModel: '' }),
      // Set onModel when category changes to Election or Candidate
      ...(name === 'category' && value !== 'General' && { onModel: value })
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category
      }

      // Only include relatedTo and onModel if category is not General
      if (formData.category !== 'General' && formData.relatedTo) {
        payload.relatedTo = formData.relatedTo;
        payload.onModel = formData.onModel;
      }

      const response = await api.post("/discussions", payload);
      navigate(`/discussions/${response.data._id}`)
    } catch (error) {
      console.error("Error creating discussion:", error)
      setError(error.message || "Failed to create discussion")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link to="/discussions" className="text-primary-600 hover:text-primary-700">
          ← Back to Discussions
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Start a New Discussion</h1>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter a descriptive title"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="mt-1">
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="General">General</option>
                  <option value="Election">Election</option>
                  <option value="Candidate">Candidate</option>
                </select>
              </div>
            </div>

            {formData.category !== 'General' && (
              <div>
                <label htmlFor="relatedTo" className="block text-sm font-medium text-gray-700">
                  Related {formData.category}
                </label>
                <div className="mt-1">
                  <select
                    id="relatedTo"
                    name="relatedTo"
                    value={formData.relatedTo}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Select {formData.category}</option>
                    {elections.map((election) => (
                      <option key={election._id} value={election._id}>
                        {election.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <div className="mt-1">
                <textarea
                  id="content"
                  name="content"
                  rows="10"
                  required
                  value={formData.content}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Share your thoughts, questions, or ideas..."
                ></textarea>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                You can use plain text. Be clear and respectful in your discussion.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Discussion"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateDiscussion
