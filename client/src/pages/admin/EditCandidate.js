import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const EditCandidate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await axios.get(`/api/candidates/${id}`);
        setCandidate(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching candidate');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    position: Yup.string().required('Position is required'),
    platform: Yup.string().required('Platform is required'),
    partyList: Yup.string().required('Party List is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.put(`/api/candidates/${id}`, values);
      navigate('/admin/candidates');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating candidate');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center mt-8">{error}</div>;
  }

  if (!candidate) {
    return <div className="text-center mt-8">Candidate not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Candidate</h1>
      <Formik
        initialValues={{
          name: candidate.name,
          position: candidate.position,
          platform: candidate.platform,
          partyList: candidate.partyList,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Field
                type="text"
                name="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <Field
                type="text"
                name="position"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <ErrorMessage name="position" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
                Platform
              </label>
              <Field
                as="textarea"
                name="platform"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <ErrorMessage name="platform" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <div>
              <label htmlFor="partyList" className="block text-sm font-medium text-gray-700">
                Party List
              </label>
              <Field
                type="text"
                name="partyList"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <ErrorMessage name="partyList" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/candidates')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditCandidate;