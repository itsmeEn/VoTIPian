import axios from 'axios';

// Get all elections
export const getAllElections = async () => {
  try {
    const res = await axios.get('/api/elections');
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Get active elections
export const getActiveElections = async () => {
  try {
    const res = await axios.get('/api/elections/active');
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Get election by ID
export const getElectionById = async (id) => {
  try {
    const res = await axios.get(`/api/elections/${id}`);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Create new election (admin only)
export const createElection = async (electionData) => {
  try {
    const res = await axios.post('/api/elections', electionData);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Update election (admin only)
export const updateElection = async (id, electionData) => {
  try {
    const res = await axios.put(`/api/elections/${id}`, electionData);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Delete election (admin only)
export const deleteElection = async (id) => {
  try {
    const res = await axios.delete(`/api/elections/${id}`);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Get election results
export const getElectionResults = async (id) => {
  try {
    const res = await axios.get(`/api/elections/${id}/results`);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};