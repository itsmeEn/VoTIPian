import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaVoteYea, FaUsers, FaComments } from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              VoTIPsian: TIP's Voting System
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
              A secure and transparent platform for student council elections at the Technological Institute of the Philippines.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-lg"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn bg-primary-500 text-white hover:bg-primary-400 border border-white px-6 py-3 rounded-md font-medium text-lg"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Key Features</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              VoTIPian provides a comprehensive platform for managing student council elections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center p-4 bg-primary-100 rounded-full text-primary-600 mb-4">
                <FaVoteYea className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Voting</h3>
              <p className="text-gray-600">
                Cast your vote securely with our authenticated voting system. One student, one vote.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center p-4 bg-primary-100 rounded-full text-primary-600 mb-4">
                <FaUsers className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Candidate Profiles</h3>
              <p className="text-gray-600">
                Learn about candidates' platforms, qualifications, and visions for the student body.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center p-4 bg-primary-100 rounded-full text-primary-600 mb-4">
                <FaComments className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Discussion Forums</h3>
              <p className="text-gray-600">
                Engage with candidates and fellow students through moderated discussion threads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Participating in student council elections has never been easier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-600 text-white text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Register</h3>
              <p className="text-gray-600">
                Create an account using your TIP email address.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-600 text-white text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Browse Candidates</h3>
              <p className="text-gray-600">
                Explore candidate profiles and platforms.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-600 text-white text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Participate</h3>
              <p className="text-gray-600">
                Join discussions and ask questions.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-600 text-white text-xl font-bold mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Vote</h3>
              <p className="text-gray-600">
                Cast your vote securely during the election period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join VoTIPian today and be part of the democratic process at TIP.
          </p>
          {isAuthenticated ? (
            <Link
              to="/elections"
              className="btn bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-lg"
            >
              View Current Elections
            </Link>
          ) : (
            <Link
              to="/register"
              className="btn bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-lg"
            >
              Register Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;