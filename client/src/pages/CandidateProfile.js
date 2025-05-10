"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"

const CandidateProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCandidateProfile = async () => {
      try {
        const response = await fetch(`/api/candidates/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch candidate profile")
        }

        const candidateData = await response.json()
        setCandidate(candidateData)
      } catch (error) {
        console.error("Error:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCandidateProfile()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading candidate profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col">
        <p className="text-lg text-red-600 mb-4">Error: {error}</p>
        <button onClick={() => navigate("/candidates")} className="text-primary-600 hover:text-primary-700">
          Back to Candidates
        </button>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col">
        <p className="text-lg mb-4">Candidate not found</p>
        <button onClick={() => navigate("/candidates")} className="text-primary-600 hover:text-primary-700">
          Back to Candidates
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/candidates" className="text-primary-600 hover:text-primary-700">
          ← Back to Candidates
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
          <div className="flex items-center mt-1">
            <p className="text-gray-600 mr-4">{candidate.department}</p>
            {candidate.position && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {candidate.position.title}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {candidate.election && (
            <div className="mb-6 bg-gray-50 p-4 rounded-md">
              <h2 className="text-sm font-medium text-gray-500">Election</h2>
              <div className="flex items-center justify-between mt-1">
                <p className="text-lg font-semibold">{candidate.election.title}</p>
                <Link
                  to={`/elections/${candidate.election._id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View Election
                </Link>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Platform</h2>
            <div className="prose max-w-none text-gray-700">
              {candidate.platform.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {candidate.experience && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Experience</h2>
              <div className="prose max-w-none text-gray-700">
                {candidate.experience.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {candidate.achievements && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Achievements</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {candidate.achievements.split("\n").map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}

          {candidate.election && candidate.position && (
            <div className="mt-8 flex justify-center">
              <Link
                to={`/voting/${candidate.election._id}`}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium"
              >
                Go to Voting Page
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CandidateProfile
