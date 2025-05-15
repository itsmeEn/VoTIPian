import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState('');
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  // Check if user was redirected from registration
  const registeredSuccess = new URLSearchParams(location.search).get('registered') === 'true';

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    //  .matches(/@tip\.edu\.ph$/, 'Please use your TIP email address'),
    password: Yup.string().required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoginError('');
    setResendSuccess(false);
    try {
      const response = await login(values);
      if (response.requiresVerification) {
        setUnverifiedEmail(response.email);
        setLoginError(response.msg || 'Please verify your email before logging in');
      } else if (response.success) {
        navigate('/dashboard');
      } else {
        setLoginError(response.msg || 'Login failed. Please try again.');
      }
    } catch (error) {
      setLoginError(error.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    setResendSuccess(false);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      const data = await response.json();

      if (response.ok) {
        setResendSuccess(true);
        setLoginError('');
      } else {
        setLoginError(data.msg || 'Failed to resend verification email');
      }
    } catch (error) {
      setLoginError('Failed to resend verification email');
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {registeredSuccess && (
          <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">Your account has been created. Please sign in.</span>
          </div>
        )}

        {loginError && (
          <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{loginError}</span>
            {unverifiedEmail && (
              <div className="mt-2">
                <button
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="text-red-700 underline hover:text-red-800 disabled:opacity-50"
                >
                  {isResendingVerification ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            )}
          </div>
        )}
        {resendSuccess && (
          <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">Verification email sent! Please check your inbox.</span>
          </div>
        )}

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Login;
