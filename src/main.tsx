import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import DashboardPage from './pages/alex/DashboardPage'
import MorningPage from './pages/alex/MorningPage'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/alex/dashboard" replace /> },
  { path: '/alex/dashboard', element: <DashboardPage /> },
  { path: '/alex/morning', element: <MorningPage /> },
])

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

