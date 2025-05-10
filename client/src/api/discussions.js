import axios from 'axios';

// Get all discussions
export const getAllDiscussions = async (category = null) => {
  try {
    const url = category 
      ? `/api/discussions?category=${category}` 
      : '/api/discussions';
    
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Get discussion by ID
export const getDiscussionById = async (id) => {
  try {
    const res = await axios.get(`/api/discussions/${id}`);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Create a new discussion
export const createDiscussion = async (discussionData) => {
  try {
    const res = await axios.post('/api/discussions', discussionData);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Update a discussion
export const updateDiscussion = async (id, discussionData) => {
  try {
    const res = await axios.put(`/api/discussions/${id}`, discussionData);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Delete a discussion
export const deleteDiscussion = async (id) => {
  try {
    const res = await axios.delete(`/api/discussions/${id}`);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Add a comment to a discussion
export const addComment = async (discussionId, content) => {
  try {
    const res = await axios.post(`/api/discussions/${discussionId}/comments`, { content });
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Delete a comment
export const deleteComment = async (discussionId, commentId) => {
  try {
    const res = await axios.delete(`/api/discussions/${discussionId}/comments/${commentId}`);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

// Like or unlike a comment
export const toggleLikeComment = async (discussionId, commentId) => {
  try {
    const res = await axios.put(`/api/discussions/${discussionId}/comments/${commentId}/like`);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};