import axios from 'axios';

// Cast a vote
export const castVote = async (voteData) => {
  try {
    const res = await axios.post('/api/votes', voteData);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Check if user has voted in an election
export const checkVoteStatus = async (electionId) => {
  try {
    const res = await axios.get(`/api/votes/check/${electionId}`);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Get voting statistics (admin only)
export const getVotingStats = async (electionId) => {
  try {
    const res = await axios.get(`/api/votes/stats/${electionId}`);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};