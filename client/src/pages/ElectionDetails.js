"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"

const ElectionDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [election, setElection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    const fetchElectionDetails = async () => {
      try {
        // Get election details
        const electionResponse = await api.get(`/elections/${id}`);
        console.log('Election response:', electionResponse.data);
        
        if (!electionResponse.data) {
          throw new Error('No election data received');
        }

        setElection(electionResponse.data);
        
        // Check if user has voted only if they're logged in
        if (user) {
          try {
            const voteResponse = await api.get(`/votes/check/${id}`);
            setHasVoted(voteResponse.data.hasVoted);
          } catch (voteError) {
            console.error("Error checking vote status:", voteError);
            // Don't set the main error state for vote check failures
          }
        }
      } catch (error) {
        console.error("Error fetching election:", error);
        setError(error.response?.data?.msg || error.message || "Failed to fetch election details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchElectionDetails();
    } else {
      setError("Invalid election ID");
      setLoading(false);
    }
  }, [id, user]);

  const getElectionStatus = () => {
    const now = new Date()
    const startDate = new Date(election.startDate)
    const endDate = new Date(election.endDate)

    if (now < startDate) {
      return { status: "Upcoming", color: "bg-blue-100 text-blue-800" }
    } else if (now > endDate) {
      return { status: "Completed", color: "bg-gray-100 text-gray-800" }
    } else {
      return { status: "Active", color: "bg-green-100 text-green-800" }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading election details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col">
        <p className="text-lg text-red-600 mb-4">Error: {error}</p>
        <button onClick={() => navigate("/elections")} className="text-primary-600 hover:text-primary-700">
          Back to Elections
        </button>
      </div>
    )
  }

  if (!election) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col">
        <p className="text-lg mb-4">Election not found</p>
        <button onClick={() => navigate("/elections")} className="text-primary-600 hover:text-primary-700">
          Back to Elections
        </button>
      </div>
    )
  }

  const electionStatus = getElectionStatus()
  const isActive = electionStatus.status === "Active"
  const canVote = isActive && user && !hasVoted

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/elections" className="text-primary-600 hover:text-primary-700">
          ← Back to Elections
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{election.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${electionStatus.color}`}>
              {electionStatus.status}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="prose max-w-none mb-8">
            <p>{election.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
              <p className="mt-1 text-lg font-semibold">{new Date(election.startDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">{new Date(election.startDate).toLocaleTimeString()}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">End Date</h3>
              <p className="mt-1 text-lg font-semibold">{new Date(election.endDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">{new Date(election.endDate).toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Positions</h2>

            {Array.isArray(election.positions) && election.positions.length > 0 ? (
              <div className="space-y-6">
                {election.positions.map((position) => (
                  <div key={position._id || position.name} className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h3 className="text-lg font-medium">{position.name || position.title}</h3>
                      <p className="text-sm text-gray-500">{position.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No positions available for this election.</p>
            )}
          </div>

          <div className="flex justify-center">
            {canVote ? (
              <Link
                to={`/voting/${election._id}`}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium"
              >
                Vote Now
              </Link>
            ) : hasVoted ? (
              <div className="text-center">
                <p className="text-green-600 font-medium mb-2">You've already voted in this election</p>
                {electionStatus.status === "Completed" && (
                  <Link
                    to={`/elections/${election._id}/results`}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium"
                  >
                    View Results
                  </Link>
                )}
              </div>
            ) : electionStatus.status === "Completed" ? (
              <Link
                to={`/elections/${election._id}/results`}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium"
              >
                View Results
              </Link>
            ) : (
              <p className="text-gray-500">{!isActive ? "Voting has not started yet" : "Please log in to vote"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ElectionDetails
