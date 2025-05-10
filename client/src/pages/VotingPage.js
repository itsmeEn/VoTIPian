"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"

const VotingPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [election, setElection] = useState(null)
  const [selections, setSelections] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [votingClosed, setVotingClosed] = useState(false)

  useEffect(() => {
    if (!id) {
      setError("No election ID provided");
      setLoading(false);
      return;
    }

    // Check authentication status
    if (!user) {
      // Save the current URL to redirect back after login
      localStorage.setItem('redirectUrl', window.location.pathname);
      navigate("/login");
      return;
    }

    if (!user.token) {
      setError("Please log in to access this page");
      setLoading(false);
      return;
    }

    const fetchElectionData = async () => {
      try {
        setError(null);
        console.log('Fetching election data for ID:', id);
        
        // Check if user has already voted
        const votedResponse = await api.get(`/votes/check/${id}`);
        console.log('Vote check response:', votedResponse.data);
        
        if (votedResponse.data.hasVoted) {
          setHasVoted(true);
          setLoading(false);
          return;
        }

        // Get election details
        console.log('Fetching election details...');
        const electionResponse = await api.get(`/elections/${id}`);
        const electionData = electionResponse.data;
        console.log('Election data received:', electionData);
        
        if (!electionData) {
          setError("Election not found");
          setLoading(false);
          return;
        }

        // Check if positions and candidates exist
        if (!electionData.positions || electionData.positions.length === 0) {
          console.log('No positions found in election data');
          setError("No positions available for this election");
          setLoading(false);
          return;
        }

        console.log('Positions found:', electionData.positions);
        
        // Check if each position has candidates
        const positionsWithoutCandidates = electionData.positions.filter(
          position => !position.candidates || position.candidates.length === 0
        );

        if (positionsWithoutCandidates.length > 0) {
          console.log('Positions without candidates:', positionsWithoutCandidates.map(p => p.name));
          setError(
            `The following positions do not have any candidates: ${positionsWithoutCandidates
              .map(p => p.name)
              .join(', ')}`
          );
          setLoading(false);
          return;
        }

        setElection(electionData);

        // Check if voting is still open
        const now = new Date();
        const startDate = new Date(electionData.startDate);
        const endDate = new Date(electionData.endDate);
        
        if (now < startDate) {
          setError("Voting has not started yet");
          setVotingClosed(true);
        } else if (now > endDate) {
          setError("Voting has ended");
          setVotingClosed(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          // Unauthorized - token might be expired
          localStorage.removeItem('token');
          localStorage.setItem('redirectUrl', window.location.pathname);
          navigate('/login');
          return;
        }
        setError(
          error.response?.data?.msg ||
          (error.response?.status === 404 ? "Election not found" : "Failed to fetch election data")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, [id, user, navigate]);

  const handleSelectCandidate = (positionId, candidateId) => {
    setSelections({
      ...selections,
      [positionId]: candidateId,
    });
  };

  const handleSubmitVote = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/votes", {
        electionId: id,
        selections: Object.entries(selections).map(([positionId, candidateId]) => ({
          positionId,
          candidateId,
        })),
      });

      // Vote submitted successfully
      navigate(`/elections/${id}`, { state: { voteSubmitted: true } });
    } catch (error) {
      console.error("Error submitting vote:", error);
      setError(error.response?.data?.msg || "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading election data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Unable to Load Election</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/elections"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors inline-block"
            >
              Back to Elections
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (hasVoted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Already Voted</h1>
          <p className="text-gray-600 mb-6">You have already cast your vote for this election.</p>
          <Link to={`/elections/${id}`} className="text-primary-600 hover:text-primary-700 font-medium">
            Return to Election Details
          </Link>
        </div>
      </div>
    )
  }

  if (votingClosed) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Voting {error?.includes("not started") ? "Not Started" : "Closed"}</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to={`/elections/${id}`} className="text-primary-600 hover:text-primary-700 font-medium">
            Return to Election Details
          </Link>
        </div>
      </div>
    )
  }

  if (!election || !election.positions) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Data</h1>
          <p className="text-gray-600 mb-6">Could not load election data.</p>
          <Link to="/elections" className="text-primary-600 hover:text-primary-700 font-medium">
            Return to Elections
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{election.title}</h1>
        <p className="text-gray-600 mb-6">{election.description}</p>

        <div className="mb-6">
          <p className="text-gray-700">
            Please select one candidate for each position. Your vote is confidential and will be securely recorded
            once you submit your ballot.
          </p>
        </div>

        {election.positions.length > 0 ? (
          <div className="space-y-8">
            {election.positions.map((position) => (
              <div key={position._id} className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h2 className="text-lg font-medium">{position.name}</h2>
                  <p className="text-sm text-gray-500">Select 1 candidate</p>
                </div>

                <div className="divide-y">
                  {position.candidates?.map((candidate) => (
                    <div
                      key={candidate._id}
                      className={`p-4 flex items-center hover:bg-gray-50 cursor-pointer ${
                        selections[position._id] === candidate._id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleSelectCandidate(position._id, candidate._id)}
                    >
                      <div className="mr-3">
                        <input
                          type="radio"
                          name={`position-${position._id}`}
                          id={`candidate-${candidate._id}`}
                          checked={selections[position._id] === candidate._id}
                          onChange={() => handleSelectCandidate(position._id, candidate._id)}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                      </div>
                      <div>
                        <label htmlFor={`candidate-${candidate._id}`} className="font-medium cursor-pointer">
                          {candidate.name}
                        </label>
                        <p className="text-sm text-gray-500">{candidate.department}</p>
                      </div>
                      <div className="ml-auto">
                        <Link
                          to={`/candidates/${candidate._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No positions available for this election.</p>
        )}

        <div className="mt-8 flex flex-col items-center">
          <p className="mb-4 text-gray-600 text-sm">
            By submitting your vote, you confirm that your selections represent your own personal choices.
          </p>
          <button
            onClick={handleSubmitVote}
            disabled={submitting || Object.keys(selections).length !== election.positions.length}
            className={`px-6 py-3 rounded-md font-medium ${
              Object.keys(selections).length === election.positions.length
                ? "bg-primary-600 hover:bg-primary-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Ballot"}
          </button>
          {Object.keys(selections).length !== election.positions.length && (
            <p className="mt-2 text-amber-600 text-sm">
              Please select a candidate for each position before submitting
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default VotingPage
