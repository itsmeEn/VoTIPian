"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik"
import * as Yup from "yup"
import api from "../../utils/api"

const CreateElection = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const initialValues = {
    title: "",
    description: "",
    startDate: "",
    startTime: "08:00",
    endDate: "",
    endTime: "17:00",
    positions: [{ title: "", description: "" }],
  }

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    startDate: Yup.date().required("Start date is required"),
    startTime: Yup.string().required("Start time is required"),
    endDate: Yup.date().required("End date is required").min(Yup.ref("startDate"), "End date must be after start date"),
    endTime: Yup.string().required("End time is required"),
    positions: Yup.array()
      .of(
        Yup.object().shape({
          title: Yup.string().required("Position title is required"),
          description: Yup.string().required("Position description is required"),
        }),
      )
      .min(1, "At least one position is required"),
  })

  const handleSubmit = async (values) => {
    setSubmitting(true)
    setError(null)

    try {
      // Format dates with times
      const startDateTime = new Date(`${values.startDate}T${values.startTime}`)
      const endDateTime = new Date(`${values.endDate}T${values.endTime}`)

      const electionData = {
        title: values.title,
        description: values.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        positions: values.positions,
        status: "active"
      }

      await api.post("/elections", electionData)
      navigate("/admin/elections")
    } catch (error) {
      console.error("Error creating election:", error)
      setError(error.msg || "Failed to create election")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link to="/admin/elections" className="text-primary-600 hover:text-primary-700">
          ← Back to Manage Elections
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Create New Election</h1>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Election Title
                  </label>
                  <div className="mt-1">
                    <Field
                      type="text"
                      name="title"
                      id="title"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="e.g. Student Council Elections 2023"
                    />
                    <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <Field
                      as="textarea"
                      name="description"
                      id="description"
                      rows={4}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Provide details about the election"
                    />
                    <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <div className="mt-1">
                      <Field
                        type="date"
                        name="startDate"
                        id="startDate"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                      <ErrorMessage name="startDate" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <div className="mt-1">
                      <Field
                        type="time"
                        name="startTime"
                        id="startTime"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                      <ErrorMessage name="startTime" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <div className="mt-1">
                      <Field
                        type="date"
                        name="endDate"
                        id="endDate"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                      <ErrorMessage name="endDate" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <div className="mt-1">
                      <Field
                        type="time"
                        name="endTime"
                        id="endTime"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                      <ErrorMessage name="endTime" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Election Positions</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Add the positions that candidates can run for in this election
                  </p>
                </div>

                <FieldArray name="positions">
                  {({ remove, push }) => (
                    <div>
                      {values.positions.length > 0 &&
                        values.positions.map((position, index) => (
                          <div key={index} className="mb-4 p-4 border rounded-md">
                            <div className="flex justify-between mb-2">
                              <h3 className="text-md font-medium">Position {index + 1}</h3>
                              {values.positions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label
                                  htmlFor={`positions.${index}.title`}
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Position Title
                                </label>
                                <div className="mt-1">
                                  <Field
                                    type="text"
                                    name={`positions.${index}.title`}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="e.g. President, Secretary, Treasurer"
                                  />
                                  <ErrorMessage
                                    name={`positions.${index}.title`}
                                    component="div"
                                    className="mt-1 text-sm text-red-600"
                                  />
                                </div>
                              </div>

                              <div>
                                <label
                                  htmlFor={`positions.${index}.description`}
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Position Description
                                </label>
                                <div className="mt-1">
                                  <Field
                                    as="textarea"
                                    name={`positions.${index}.description`}
                                    rows={2}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Describe the responsibilities of this position"
                                  />
                                  <ErrorMessage
                                    name={`positions.${index}.description`}
                                    component="div"
                                    className="mt-1 text-sm text-red-600"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                      <button
                        type="button"
                        onClick={() => push({ title: "", description: "" })}
                        className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Add Position
                      </button>
                    </div>
                  )}
                </FieldArray>

                <div className="pt-6 border-t border-gray-200 flex justify-end">
                  <Link
                    to="/admin/elections"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {submitting ? "Creating..." : "Create Election"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default CreateElection
