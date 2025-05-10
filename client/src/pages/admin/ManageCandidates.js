"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../utils/api"

const ManageCandidates = () => {
  const [candidates, setCandidates] = useState([])
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeElection, setActiveElection] = useState("all")
  const [filter, setFilter] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);

        // Fetch all elections
        const electionsResponse = await api.get("/elections");
        setElections(electionsResponse.data);

        // Fetch candidates based on filter
        const candidatesUrl = activeElection === "all" 
          ? "/candidates" 
          : `/candidates/election/${activeElection}`;

        const candidatesResponse = await api.get(candidatesUrl);
        setCandidates(candidatesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.response?.data?.msg || "Failed to load elections");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeElection]);

  const handleElectionChange = (electionId) => {
    setActiveElection(electionId);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
  };

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(filter) ||
      (candidate.position && candidate.position.title.toLowerCase().includes(filter))
  );

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/candidates/${id}`);
      setCandidates(candidates.filter((candidate) => candidate._id !== id));
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert(error.response?.data?.msg || "Failed to delete candidate");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading candidates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Candidates</h1>
        <Link
          to="/admin/candidates/create"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New Candidate
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="election-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Election
          </label>
          <select
            id="election-filter"
            value={activeElection}
            onChange={(e) => handleElectionChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="all">All Elections</option>
            {elections.map((election) => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Candidates
          </label>
          <input
            type="text"
            id="search"
            value={filter}
            onChange={handleFilterChange}
            placeholder="Search by name or position..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      {filteredCandidates.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Candidate
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Position
                </th>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                    <div className="text-sm text-gray-500">{candidate.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {candidate.position ? candidate.position.title : "No position assigned"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {candidate.election ? candidate.election.title : "No election assigned"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link to={`/candidates/${candidate._id}`} className="text-primary-600 hover:text-primary-900">
                        View
                      </Link>
                      <Link
                        to={`/admin/candidates/${candidate._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteCandidate(candidate._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No candidates found for the selected filter.</p>
          <Link
            to="/admin/candidates/create"
            className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
          >
            Add your first candidate
          </Link>
        </div>
      )}
    </div>
  );
};

export default ManageCandidates;
