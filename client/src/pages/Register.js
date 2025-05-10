"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [registerError, setRegisterError] = useState("")
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const departments = [
    { value: "CEA", label: "College of Engineering and Architecture" },
    { value: "CCS", label: "College of Computer Studies" },
    { value: "CBA", label: "College of Business Administration" },
    { value: "CEDU", label: "College of Education" },
    { value: "CACS", label: "College of Arts and Sciences" },
  ]

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    department: "",
    password: "",
    confirmPassword: "",
  }

  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required")
      .matches(/@tip\.edu\.ph$/, "Please use your TIP email address"),
    studentId: Yup.string().required("Student ID is required"),
    department: Yup.string().required("Department is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  })

  const handleSubmit = async (values, { setSubmitting }) => {
    setRegisterError("")
    try {
      const response = await register(values)
      if (response.requiresVerification) {
        setRegistrationSuccess(true)
      }
    } catch (error) {
      setRegisterError(error.message || "Registration failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {registrationSuccess ? (
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <h3 className="text-lg font-medium text-green-600 mb-4">Registration Successful!</h3>
              <p className="text-gray-600 mb-4">
                Please check your email to verify your account. You will need to verify your email before you can log in.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Login
              </button>
            </div>
          </div>
        ) : (
          <>
            {registerError && (
              <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">{registerError}</span>
              </div>
            )}

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
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
                        autoComplete="given-name"
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
                        autoComplete="family-name"
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
                      autoComplete="email"
                      placeholder="example@tip.edu.ph"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
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
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <ErrorMessage name="studentId" component="div" className="mt-1 text-sm text-red-600" />
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
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="">Select your department</option>
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="department" component="div" className="mt-1 text-sm text-red-600" />
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
                      autoComplete="new-password"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Register
