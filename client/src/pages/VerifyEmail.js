import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
        setStatus('success');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        console.error('Verification error:', error);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {status === 'verifying' && (
              <div className="text-center">
                <p className="text-gray-700">Verifying your email address...</p>
              </div>
            )}
            {status === 'success' && (
              <div className="text-center">
                <p className="text-green-600 font-semibold">
                  Your email has been verified successfully!
                </p>
                <p className="mt-2 text-gray-600">
                  Redirecting you to login page...
                </p>
              </div>
            )}
            {status === 'error' && (
              <div className="text-center">
                <p className="text-red-600 font-semibold">
                  Failed to verify your email address.
                </p>
                <p className="mt-2 text-gray-600">
                  The verification link may be invalid or expired.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
