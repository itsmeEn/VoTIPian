"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import api from "../../utils/api"

const CreateCandidate = () => {
  const navigate = useNavigate()
  const [elections, setElections] = useState([])
  const [positions, setPositions] = useState([])
  const [selectedElection, setSelectedElection] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setError(null);
        const response = await api.get("/elections");
        setElections(response.data);
      } catch (error) {
        console.error("Error fetching elections:", error);
        setError(error.response?.data?.msg || "Failed to load elections");
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  useEffect(() => {
    const fetchPositions = async () => {
      if (!selectedElection) {
        setPositions([]);
        return;
      }

      try {
        setError(null);
        const response = await api.get(`/elections/${selectedElection}/positions`);
        console.log('Positions response:', response.data);
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid positions data');
        }
        
        if (response.data.length > 0) {
          console.log('Found positions:', response.data);
          const formattedPositions = response.data.map(pos => ({
            ...pos,
            name: pos.title || pos.name || 'Unnamed Position'
          }));
          setPositions(formattedPositions);
        } else {
          console.log('No positions found');
          setPositions([]);
          setError('No positions available for this election');
        }
      } catch (error) {
        console.error("Error fetching positions:", error);
        setError(error.response?.data?.msg || "Failed to load positions");
      }
    };

    fetchPositions();
  }, [selectedElection]);

  const initialValues = {
    name: "",
    department: "",
    election: "",
    position: "",
    platform: "",
    partyList: ""
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    department: Yup.string().required("Department is required"),
    election: Yup.string().required("Election is required"),
    position: Yup.string().required("Position is required"),
    platform: Yup.string().required("Platform is required"),
    partyList: Yup.string().required("Party List is required")
  });

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);

    try {
      await api.post("/candidates", values);
      navigate("/admin/candidates");
    } catch (error) {
      console.error("Error creating candidate:", error);
      setError(error.response?.data?.msg || "Failed to create candidate");
      setSubmitting(false);
    }
  };

  const handleElectionChange = (e, setFieldValue) => {
    const electionId = e.target.value;
    setSelectedElection(electionId);
    setFieldValue("election", electionId);
    setFieldValue("position", "");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link to="/admin/candidates" className="text-primary-600 hover:text-primary-700">
          ← Back to Manage Candidates
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Add New Candidate</h1>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1">
                    <Field
                      type="text"
                      name="name"
                      id="name"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Candidate's full name"
                    />
                    <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <div className="mt-1">
                    <Field
                      type="text"
                      name="department"
                      id="department"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Candidate's department"
                    />
                    <ErrorMessage name="department" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="election" className="block text-sm font-medium text-gray-700">
                    Election
                  </label>
                  <div className="mt-1">
                    <Field
                      as="select"
                      name="election"
                      id="election"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      onChange={(e) => handleElectionChange(e, setFieldValue)}
                    >
                      <option value="">Select an election</option>
                      {elections.map((election) => (
                        <option key={election._id} value={election._id}>
                          {election.title}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="election" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <div className="mt-1">
                    <Field
                      as="select"
                      name="position"
                      id="position"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      disabled={!selectedElection}
                    >
                      <option value="">Select a position</option>
                      {positions && positions.length > 0 ? (
                        positions.map((position) => (
                          <option key={position._id} value={position._id}>
                            {position.name || position.title || 'Unnamed Position'}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No positions available</option>
                      )}
                    </Field>
                    <ErrorMessage name="position" component="div" className="mt-1 text-sm text-red-600" />
                    {!selectedElection && (
                      <p className="mt-1 text-sm text-gray-500">Please select an election first</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
                    Platform
                  </label>
                  <div className="mt-1">
                    <Field
                      as="textarea"
                      name="platform"
                      id="platform"
                      rows={6}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Candidate's platform and goals"
                    />
                    <ErrorMessage name="platform" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="partyList" className="block text-sm font-medium text-gray-700">
                    Party List
                  </label>
                  <div className="mt-1">
                    <Field
                      type="text"
                      name="partyList"
                      id="partyList"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Candidate's party list"
                    />
                    <ErrorMessage name="partyList" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 flex justify-end">
                  <Link
                    to="/admin/candidates"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {submitting ? "Adding..." : "Add Candidate"}
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

export default CreateCandidate;
