"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, Heart, FileText, BarChart3, AlertTriangle, LogOut, User, Settings } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"

interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
  onLogout?: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: any
  adminOnly?: boolean
  healthWorkerOnly?: boolean
}

export function Navigation({ currentPage, onPageChange, onLogout }: NavigationProps) {
  const { user, logout } = useAuth()
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = onLogout || logout

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: t("nav.dashboard"), icon: BarChart3, adminOnly: true },
    { id: "report", label: t("nav.submit_report"), icon: FileText, healthWorkerOnly: true },
    { id: "alerts", label: t("nav.alerts"), icon: AlertTriangle, adminOnly: true },
    { id: "admin-settings", label: "Admin Settings", icon: Settings, adminOnly: true },
  ]

  const visibleItems = menuItems.filter((item) => {
    if (item.adminOnly) return user?.role === "admin"
    if (item.healthWorkerOnly) return user?.role === "health_worker"
    return true
  })

  const handlePageChange = (page: string) => {
    onPageChange(page)
    setIsOpen(false)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Heart className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold text-primary">{t("login.title")}</span>
              </div>

              <div className="flex space-x-1">
                {visibleItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    onClick={() => handlePageChange(item.id)}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Badge variant="secondary" className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{user?.name}</span>
                <span className="text-xs">
                  ({user?.role === "admin" ? t("login.admin") : t("login.health_worker")})
                </span>
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                {t("nav.logout")}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-b border-border shadow-sm">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-primary">{t("login.title")}</span>
            </div>

            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center space-x-2 mb-8">
                      <Heart className="w-8 h-8 text-primary" />
                      <span className="text-xl font-bold text-primary">{t("login.title")}</span>
                    </div>

                    <div className="space-y-2 flex-1">
                      {visibleItems.map((item) => (
                        <Button
                          key={item.id}
                          variant={currentPage === item.id ? "default" : "ghost"}
                          onClick={() => handlePageChange(item.id)}
                          className="w-full justify-start transition-all duration-200 hover:scale-[1.02]"
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Button>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>
                          {user?.name} ({user?.role === "admin" ? t("login.admin") : t("login.health_worker")})
                        </span>
                      </div>
                      <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent">
                        <LogOut className="w-4 h-4 mr-2" />
                        {t("nav.logout")}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
