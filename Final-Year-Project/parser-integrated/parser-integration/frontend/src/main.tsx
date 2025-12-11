import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import Layout from './components/Layout/Layout.tsx';
import HomePage from './components/MainLayout/MainContent/HomePage.tsx';
import JobPage from './components/MainLayout/MainContent/JobPage/JobPage.tsx';
import ProfilePage from './components/MainLayout/MainContent/UserProfile/ProfilePage.tsx';
import ApplicationPage from './components/MainLayout/MainContent/ApplicationPage/ApplicationPage.tsx';
import ApplicationListPage from './components/MainLayout/MainContent/ApplicationPage/ApplicationListPage.tsx';
import ApplicationDetailPage from './components/MainLayout/MainContent/ApplicationPage/ApplicationDetailPage.tsx';
import TestPage from './components/TestPageLayout/TestPage.tsx';
import CvOnboarding from './components/Onboarding/CvOnboarding.tsx';

const BACKEND_BASE_URL = "http://localhost:8000";
const APP_BASE_PATH = "/app";

// If someone opens the frontend root directly, push them to the backend landing page.
if (window.location.pathname === "/" || window.location.pathname === "") {
  window.location.href = `${BACKEND_BASE_URL}/`;
}

// Guard: force CV onboarding each session before accessing app pages
if (
  window.location.pathname.startsWith(APP_BASE_PATH) &&
  !window.location.pathname.startsWith(`${APP_BASE_PATH}/onboarding`)
) {
  const cvSessionCompleted = sessionStorage.getItem("cvSessionCompleted") === "true";
  if (!cvSessionCompleted) {
    window.location.replace(`${APP_BASE_PATH}/onboarding`);
  }
}

const router = createBrowserRouter([
  {
    path: APP_BASE_PATH,
    element: <Layout />,
    errorElement: <Navigate to={`${APP_BASE_PATH}/onboarding`} replace />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "jobs", element: <JobPage /> },
      { path: "application", element: <ApplicationListPage /> },
      { path: "application/:id", element: <ApplicationDetailPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "test", element: <TestPage /> },
    ]
  },
  {
    path: `${APP_BASE_PATH}/onboarding`,
    element: <CvOnboarding />
  },
  {
    path: "*",
    element: <Navigate to={`${APP_BASE_PATH}/onboarding`} replace />
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
