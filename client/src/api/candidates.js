import axios from 'axios';

// Get all candidates
export const getAllCandidates = async (electionId = null) => {
  try {
    const url = electionId 
      ? `/api/candidates?election=${electionId}` 
      : '/api/candidates';
    
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Get candidate by ID
export const getCandidateById = async (id) => {
  try {
    const res = await axios.get(`/api/candidates/${id}`);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Register as a candidate
export const registerAsCandidate = async (candidateData) => {
  try {
    const res = await axios.post('/api/candidates', candidateData);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Update candidate profile
export const updateCandidate = async (id, candidateData) => {
  try {
    const res = await axios.put(`/api/candidates/${id}`, candidateData);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Withdraw candidacy
export const withdrawCandidacy = async (id) => {
  try {
    const res = await axios.delete(`/api/candidates/${id}`);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Get candidates by election
export const getCandidatesByElection = async (electionId) => {
  try {
    const res = await axios.get(`/api/candidates/election/${electionId}`);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};