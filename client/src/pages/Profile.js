"use client"

import { Link } from 'react-router-dom'

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

const Profile = () => {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [updateError, setUpdateError] = useState("")
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [userVotes, setUserVotes] = useState([])
  const [userDiscussions, setUserDiscussions] = useState([])
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(true)

  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    department: Yup.string().required("Department is required"),
    currentPassword: Yup.string().when('newPassword', {
      is: (val) => val && val.length > 0,
      then: () => Yup.string().required("Current password is required to set a new password"),
      otherwise: () => Yup.string()
    }),
    newPassword: Yup.string().min(6, "Password must be at least 6 characters"),
    confirmNewPassword: Yup.string().when('newPassword', {
      is: (val) => val && val.length > 0,
      then: () => Yup.string()
        .required('Please confirm your new password')
        .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
      otherwise: () => Yup.string()
    })
  })

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/login")
      return
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch user's votes
        const votesResponse = await fetch("${process.env.REACT_APP_BACKEND_URL}/api/users/votes", {
          headers
        });
        if (!votesResponse.ok) {
          throw new Error('Failed to fetch voting history');
        }
        const votesData = await votesResponse.json();
        setUserVotes(votesData);

        // Fetch user's discussions
        const discussionsResponse = await fetch("${process.env.REACT_APP_BACKEND_URL}/api/users/discussions", {
          headers
        });
        if (!discussionsResponse.ok) {
          throw new Error('Failed to fetch discussions');
        }
        const discussionsData = await discussionsResponse.json();
        setUserDiscussions(discussionsData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData()
  }, [user, navigate])

  const handleSubmit = async (values, { setSubmitting }) => {
    setUpdateError("")
    setUpdateSuccess(false)

    try {
      const success = await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        department: values.department,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      if (success) {
        setUpdateSuccess(true)
      }
    } catch (error) {
      setUpdateError(error.message || "Failed to update profile. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading profile data...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Please log in to view your profile</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("voting")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "voting"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Voting History
            </button>
            <button
              onClick={() => setActiveTab("discussions")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "discussions"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Discussions
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "profile" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Edit Profile</h2>
            <p className="mt-1 text-sm text-gray-500">Update your personal information and password</p>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {updateError && (
              <div
                className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">{updateError}</span>
              </div>
            )}

            {updateSuccess && (
              <div
                className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">Your profile has been updated successfully!</span>
              </div>
            )}

            <Formik
              initialValues={{
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                studentId: user.studentId || "",
                department: user.department || "",
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <div className="mt-1">
                        <Field
                          id="firstName"
                          name="firstName"
                          type="text"
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <div className="mt-1">
                        <Field
                          id="lastName"
                          name="lastName"
                          type="text"
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1">
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        disabled
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                      Student ID
                    </label>
                    <div className="mt-1">
                      <Field
                        id="studentId"
                        name="studentId"
                        type="text"
                        disabled
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Student ID cannot be changed</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <div className="mt-1">
                      <Field
                        as="select"
                        id="department"
                        name="department"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Select your department</option>
                        <option value="CCS">College of Computer Studies</option>
            <option value="CEA">College of Engineering and Architecture</option>
            <option value="CBA">College of Business Administration</option>
            <option value="CEDU">College of Education</option>
            <option value="CACS">College of Arts and Sciences</option>
                      </Field>
                      <ErrorMessage name="department" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                    <p className="mt-1 text-sm text-gray-500">Leave blank if you don't want to change your password</p>
                  </div>

                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <div className="mt-1">
                      <Field
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                      <ErrorMessage name="currentPassword" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="mt-1">
                      <Field
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                      <ErrorMessage name="newPassword" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="mt-1">
                      <Field
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        type="password"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                      <ErrorMessage name="confirmNewPassword" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Logout
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {activeTab === "voting" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">My Voting History</h2>
            <p className="mt-1 text-sm text-gray-500">Elections you have participated in</p>
          </div>

          <div className="border-t border-gray-200">
            {userVotes.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {userVotes.map((vote) => (
                  <li key={vote._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{vote.election.title}</h3>
                        <p className="text-sm text-gray-500">Voted on: {formatDate(vote.createdAt)}</p>
                      </div>
                      <Link
                        to={`/elections/${vote.election._id}/results`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Results
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">You haven't voted in any elections yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "discussions" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">My Discussions</h2>
            <p className="mt-1 text-sm text-gray-500">Discussions you have created</p>
          </div>

          <div className="border-t border-gray-200">
            {userDiscussions.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {userDiscussions.map((discussion) => (
                  <li key={discussion._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{discussion.title}</h3>
                        <p className="text-sm text-gray-500">
                          Posted on: {formatDate(discussion.createdAt)} • {discussion.commentCount} comments
                        </p>
                      </div>
                      <Link
                        to={`/discussions/${discussion._id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Discussion
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">You haven't created any discussions yet.</p>
                <Link
                  to="/discussions/create"
                  className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
                >
                  Start a new discussion
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
