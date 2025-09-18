"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "@/lib/auth"
import { I18nProvider } from "@/lib/i18n"
import { LoginForm } from "@/components/login-form"
import { Navigation } from "@/components/navigation"
import { ReportForm } from "@/components/report-form"
import { Dashboard } from "@/components/dashboard"
import { AlertsPanel } from "@/components/alerts-panel"
import { OfflineIndicator } from "@/components/offline-indicator"
import { Skeleton } from "@/components/ui/skeleton"
// import { createClient } from "@/lib/supabase/client"
// import { useRouter } from "next/navigation"

function AppContent() {
  const { user, isLoading, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState(() => (user?.role === "admin" ? "dashboard" : "report"))

  const handleLogout = () => {
    logout()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return user.role === "admin" ? <Dashboard /> : <ReportForm />
      case "report":
        return <ReportForm />
      case "alerts":
        return user.role === "admin" ? <AlertsPanel /> : <ReportForm />
      default:
        return user.role === "admin" ? <Dashboard /> : <ReportForm />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderPage()}</main>
      <OfflineIndicator />
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </I18nProvider>
  )
}
