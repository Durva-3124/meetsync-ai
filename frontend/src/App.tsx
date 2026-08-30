import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import LoginPage from "@/routes/login"
import RegisterPage from "@/routes/register"
import DashboardPage from "@/routes/dashboard"
import MeetingDetailPage from "@/routes/meeting-detail"
import ReviewEditorPage from "@/routes/review-editor"
import SettingsPage from "@/routes/settings"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppShell } from "@/components/layout/AppShell"
import { Toaster } from "@/components/ui/sonner"

const queryClient = new QueryClient()

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/meetings/:id", element: <MeetingDetailPage /> },
          { path: "/meetings/:id/review", element: <ReviewEditorPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  )
}