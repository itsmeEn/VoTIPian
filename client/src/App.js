import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

// Import pages
import Login from "./pages/Login"
import Register from "./pages/Register"
import VerifyEmail from "./pages/VerifyEmail"
import Dashboard from "./pages/Dashboard"
import Elections from "./pages/Elections"
import ElectionDetails from "./pages/ElectionDetails"
import VotingPage from "./pages/VotingPage"
import ElectionResults from "./pages/ElectionResults"
import Candidates from "./pages/Candidates"
import CandidateProfile from "./pages/CandidateProfile"
import Discussions from "./pages/Discussions"
import DiscussionDetails from "./pages/DiscussionDetails"
import CreateDiscussion from "./pages/CreateDiscussion"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"

// Import admin pages
import AdminDashboard from "./pages/admin/AdminDashboard"
import ManageElections from "./pages/admin/ManageElections"
import CreateElection from "./pages/admin/CreateElection"
import EditElection from "./pages/admin/EditElection"
import ManageCandidates from "./pages/admin/ManageCandidates"
import CreateCandidate from "./pages/admin/CreateCandidate"
import EditCandidate from "./pages/admin/EditCandidate"
import ManageUsers from "./pages/admin/ManageUsers"

// Import components
import Header from "./components/layout/Header"
import Footer from "./components/layout/Footer"
import ProtectedRoute from "./components/routing/ProtectedRoute"
import AdminRoute from "./components/routing/AdminRoute"

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthProvider>
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/elections" element={<Elections />} />
            <Route path="/elections/:id" element={<ElectionDetails />} />
            <Route path="/elections/:id/results" element={<ElectionResults />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/candidates/:id" element={<CandidateProfile />} />
            <Route path="/discussions" element={<Discussions />} />
            <Route path="/discussions/:id" element={<DiscussionDetails />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/voting/:id"
              element={
                <ProtectedRoute>
                  <VotingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discussions/create"
              element={
                <ProtectedRoute>
                  <CreateDiscussion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/elections"
              element={
                <AdminRoute>
                  <ManageElections />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/elections/create"
              element={
                <AdminRoute>
                  <CreateElection />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/elections/:id/edit"
              element={
                <AdminRoute>
                  <EditElection />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/candidates"
              element={
                <AdminRoute>
                  <ManageCandidates />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/candidates/create"
              element={
                <AdminRoute>
                  <CreateCandidate />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/candidates/:id/edit"
              element={
                <AdminRoute>
                  <EditCandidate />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <ManageUsers />
                </AdminRoute>
              }
            />

            {/* Fallback routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </div>
  )
}

export default App
