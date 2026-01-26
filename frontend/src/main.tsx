import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { SavedJobsProvider } from './contexts/SavedJobsContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import Layout from './components/Layout/Layout.tsx';
import HomePage from './components/MainLayout/MainContent/HomePage.tsx';
import JobPage from './components/MainLayout/MainContent/JobPage/JobPage.tsx';
import ProfilePage from './components/MainLayout/MainContent/UserProfile/ProfilePage.tsx';
import ApplicationPage from './components/MainLayout/MainContent/ApplicationPage/ApplicationPage.tsx';
import TestPage from './components/TestPageLayout/TestPage.tsx';
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "jobs", element: <JobPage /> },
      { path: "application", element: <ApplicationPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "test", element: <TestPage /> },
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SavedJobsProvider>
        <RouterProvider router={router} />
      </SavedJobsProvider>
    </AuthProvider>
  </StrictMode>
);
