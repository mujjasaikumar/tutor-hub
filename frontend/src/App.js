import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import useAuthStore from "@/store/authStore";

// Pages
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminBatches from "@/pages/admin/Batches";
import AdminStudents from "@/pages/admin/Students";
import AdminPayments from "@/pages/admin/Payments";
import AdminTutors from "@/pages/admin/Tutors";
import AdminEnquiries from "@/pages/admin/Enquiries";
import AdminInvites from "@/pages/admin/Invites";
import AdminSchedule from "@/pages/admin/Schedule";
import TutorDashboard from "@/pages/tutor/Dashboard";
import TutorClasses from "@/pages/tutor/Classes";
import TutorMaterials from "@/pages/tutor/Materials";
import StudentDashboard from "@/pages/student/Dashboard";
import StudentClasses from "@/pages/student/Classes";
import StudentMaterials from "@/pages/student/Materials";
import StudentHomework from "@/pages/student/Homework";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Redirect root based on role
  const getRootRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === "tutor") return <Navigate to="/tutor/dashboard" replace />;
    if (user?.role === "student") return <Navigate to="/student/dashboard" replace />;
    
    return <Navigate to="/login" replace />;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={getRootRedirect()} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/batches"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminBatches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tutors"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminTutors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enquiries"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminEnquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/invites"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminInvites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schedule"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSchedule />
              </ProtectedRoute>
            }
          />

          {/* Tutor Routes */}
          <Route
            path="/tutor/dashboard"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <TutorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/classes"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <TutorClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/materials"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <TutorMaterials />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/classes"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/materials"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentMaterials />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/homework"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentHomework />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
