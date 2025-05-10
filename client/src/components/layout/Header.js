"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                VoTIPian
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/elections"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Elections
              </Link>
              <Link
                to="/candidates"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Candidates
              </Link>
              <Link
                to="/discussions"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Discussions
              </Link>
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="ml-3 relative flex items-center space-x-4">
                {user.isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="bg-primary-100 text-primary-800 px-3 py-1 rounded-md text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="text-gray-500 hover:text-gray-700">
                  {user.firstName} {user.lastName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${mobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${mobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${mobileMenuOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/dashboard"
            className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/elections"
            className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Elections
          </Link>
          <Link
            to="/candidates"
            className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Candidates
          </Link>
          <Link
            to="/discussions"
            className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Discussions
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {user ? (
            <div className="space-y-1">
              {user.isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="block pl-3 pr-4 py-2 border-l-4 border-primary-400 text-primary-700 bg-primary-50 hover:bg-primary-100 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                to="/profile"
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                to="/login"
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
