"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const Candidates = () => {
  const [candidates, setCandidates] = useState([])
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeElection, setActiveElection] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all elections
        const electionsResponse = await fetch("/api/elections")
        const electionsData = await electionsResponse.json()
        setElections(electionsData)

        // Fetch candidates based on filter
        const candidatesUrl =
          activeElection === "all" ? "/api/candidates" : `/api/elections/${activeElection}/candidates`

        const candidatesResponse = await fetch(candidatesUrl)
        const candidatesData = await candidatesResponse.json()
        setCandidates(candidatesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeElection])

  const handleElectionChange = (electionId) => {
    setActiveElection(electionId)
    setLoading(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading candidates...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Candidates</h1>

      <div className="mb-8">
        <label htmlFor="election-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Election
        </label>
        <select
          id="election-filter"
          value={activeElection}
          onChange={(e) => handleElectionChange(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          <option value="all">All Candidates</option>
          {elections.map((election) => (
            <option key={election._id} value={election._id}>
              {election.title}
            </option>
          ))}
        </select>
      </div>

      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <div key={candidate._id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-1">{candidate.name}</h2>
                <p className="text-sm text-gray-500 mb-2">{candidate.department}</p>

                {candidate.position && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {candidate.position.title}
                    </span>
                    {candidate.election && (
                      <span className="ml-2 text-xs text-gray-500">{candidate.election.title}</span>
                    )}
                  </div>
                )}

                <p className="text-gray-600 mb-4 line-clamp-3">{candidate.platform.substring(0, 150)}...</p>

                <div className="mt-4">
                  <Link
                    to={`/candidates/${candidate._id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No candidates found for the selected filter.</p>
        </div>
      )}
    </div>
  )
}

export default Candidates
