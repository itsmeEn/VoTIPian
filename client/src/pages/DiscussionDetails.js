"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"

const DiscussionDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [discussion, setDiscussion] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDiscussionDetails = async () => {
      try {
        const discussionResponse = await api.get(`/discussions/${id}`);
        setDiscussion(discussionResponse.data);
        
        // Comments are part of the discussion document
        setComments(discussionResponse.data.comments || []);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message || "Failed to fetch discussion details");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussionDetails();
  }, [id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post(`/discussions/${id}/comments`, {
        content: newComment
      });
      
      // The API returns all comments, so we update the state with the full list
      setComments(response.data);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      setError(error.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading discussion...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col">
        <p className="text-lg text-red-600 mb-4">Error: {error}</p>
        <button onClick={() => navigate("/discussions")} className="text-primary-600 hover:text-primary-700">
          Back to Discussions
        </button>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col">
        <p className="text-lg mb-4">Discussion not found</p>
        <button onClick={() => navigate("/discussions")} className="text-primary-600 hover:text-primary-700">
          Back to Discussions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link to="/discussions" className="text-primary-600 hover:text-primary-700">
          ← Back to Discussions
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-900">{discussion.title}</h1>
            <div className="text-sm text-gray-500">{formatDate(discussion.createdAt)}</div>
          </div>
          <div className="mt-2">
            <div className="text-sm text-gray-500">
              Posted by {discussion.author?.firstName} {discussion.author?.lastName || "Anonymous"}
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {discussion.content.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700">
              {paragraph}
            </p>
          ))}

          {discussion.category !== "General" && discussion.relatedTo && (
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Related {discussion.category}</h3>
              <div className="flex items-center justify-between mt-1">
                <p className="font-medium">{discussion.relatedTo.title || "Loading..."}</p>
                <Link
                  to={`/${discussion.category.toLowerCase()}s/${discussion.relatedTo._id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View {discussion.category}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Comments ({comments.length})</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="text-sm font-medium text-gray-900">
                    {comment.user?.firstName} {comment.user?.lastName || "Anonymous"}
                  </div>
                  <div className="text-sm text-gray-500">{formatDate(comment.createdAt)}</div>
                </div>
                <div className="mt-2 text-gray-700">
                  {comment.content.split("\n").map((paragraph, index) => (
                    <p key={index} className="mb-2">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">Be the first to comment on this discussion.</div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Leave a Comment</h2>
        </div>

        <div className="p-6">
          {user ? (
            <form onSubmit={handleSubmitComment}>
              <div className="mb-4">
                <label htmlFor="comment" className="sr-only">
                  Comment
                </label>
                <textarea
                  id="comment"
                  rows="4"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">You need to be logged in to comment.</p>
              <Link
                to="/login"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Log In to Comment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetails;
