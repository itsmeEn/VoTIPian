"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import api from "../utils/api"

const ElectionResults = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchResults = async () => {
      if (!id) {
        setError("Invalid election ID");
        setLoading(false);
        return;
      }

      try {
        // Fetch election details
        const electionResponse = await api.get(`/elections/${id}`);
        const electionData = electionResponse.data;
        setElection(electionData);

        // Check if election has ended
        const now = new Date();
        const endDate = new Date(electionData.endDate);
        if (now < endDate) {
          throw new Error("Results are not available until the election has ended");
        }

        // Fetch results
        const resultsResponse = await api.get(`/elections/${id}/results`);
        setResults(resultsResponse.data);
        setError(null);
      } catch (error) {
        console.error("Error:", error);
        setError(error.response?.data?.msg || error.message || "Failed to fetch election results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading election results...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col">
        <p className="text-lg text-red-600 mb-4">Error: {error}</p>
        <button onClick={() => navigate(`/elections/${id}`)} className="text-primary-600 hover:text-primary-700">
          Back to Election Details
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to={`/elections/${id}`} className="text-primary-600 hover:text-primary-700">
          ← Back to Election Details
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Election Results</h1>
          <p className="text-gray-600 mt-1">{election.title}</p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Election Period</h3>
                <p className="mt-1 text-lg font-semibold">
                  {new Date(election.startDate).toLocaleDateString()} -{" "}
                  {new Date(election.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500">Total Votes Cast</h3>
                <p className="mt-1 text-lg font-semibold">{results.totalVotes || 0}</p>
              </div>
            </div>
          </div>

          {results.positions && results.positions.length > 0 ? (
            <div className="space-y-8">
              {results.positions.map((position) => (
                <div key={position._id} className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h2 className="text-lg font-medium">{position.name}</h2>
                  </div>

                  <div className="p-4">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span>Candidates</span>
                        <span>Votes</span>
                      </div>

                      {position.candidates.map((candidate) => {
                        // Find the candidate with the highest votes
                        const maxVotes = Math.max(...position.candidates.map(c => c.voteCount));
                        const isWinner = candidate.voteCount === maxVotes && candidate.voteCount > 0;
                        const votePercentage = position.totalVotes
                          ? Math.round((candidate.voteCount / position.totalVotes) * 100)
                          : 0

                        return (
                          <div
                            key={candidate._id}
                            className={`border-b last:border-b-0 py-3 ${isWinner ? "bg-green-50" : ""}`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center">
                                <span className="font-medium">{candidate.name}</span>
                                {isWinner && (
                                  <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    Winner
                                  </span>
                                )}
                              </div>
                              <span className="font-medium">
                                {candidate.voteCount} ({votePercentage}%)
                              </span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${isWinner ? "bg-green-600" : "bg-primary-600"}`}
                                style={{ width: `${votePercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="text-sm text-gray-500 mt-2">
                      Total votes for this position: {position.totalVotes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No results available for this election yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ElectionResults
