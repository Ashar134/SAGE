import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Applicants from "./pages/Applicants";
import Departments from "./pages/Departments";
import Interviews from "./pages/Interviews";
import PipelineInsights from "./pages/PipelineInsights";
import Kanban from "./pages/Kanban";
import JobPostings from "./pages/JobPostings";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/applicants" element={<Applicants />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/analytics" element={<PipelineInsights />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/jobs" element={<JobPostings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
