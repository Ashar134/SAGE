import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Applicants from "./pages/Applicants";
import Departments from "./pages/Departments";
import Interviews from "./pages/Interviews";
import Analytics from "./pages/Analytics";
import Kanban from "./pages/Kanban";
import JobPostings from "./pages/JobPostings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applicants" element={<Applicants />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/jobs" element={<JobPostings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
