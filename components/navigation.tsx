"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Menu, FileText, BarChart3, AlertTriangle, LogOut, User, Settings, Bell, Wifi, WifiOff, ChevronDown } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Logo, LogoCompact } from "@/components/logo"
import { cn } from "@/lib/utils"

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
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  const handleLogout = onLogout || logout

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

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
      <nav className={cn(
        "hidden lg:flex bg-white/95 backdrop-blur-md border-b border-border transition-all duration-300 sticky top-0 z-50",
        isScrolled ? "shadow-lg" : "shadow-sm"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Logo size="md" className="cursor-pointer" />
              
              {/* Navigation Items */}
              <div className="hidden xl:flex space-x-1">
                {visibleItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    onClick={() => handlePageChange(item.id)}
                    className={cn(
                      "transition-all duration-200 hover:scale-105 relative",
                      currentPage === item.id && "shadow-md"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                    {item.id === "alerts" && (
                      <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                        3
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs text-muted-foreground hidden xl:block">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* User Info */}
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1">
                  <User className="w-3 h-3" />
                  <span className="hidden xl:block">{user?.name}</span>
                  <ChevronDown className="w-3 h-3" />
                </Badge>
              </div>

              {/* Logout Button */}
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden xl:flex">
                <LogOut className="w-4 h-4 mr-2" />
                {t("nav.logout")}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tablet Navigation */}
      <nav className="hidden md:flex lg:hidden bg-white/95 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Badge variant="secondary" className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{user?.name}</span>
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Secondary Navigation Row */}
          <div className="flex space-x-1 pb-2">
            {visibleItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                onClick={() => handlePageChange(item.id)}
                size="sm"
                className="flex-1 transition-all duration-200"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white/95 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <LogoCompact />
            
            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              
              <LanguageSwitcher />
              
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Menu className="w-5 h-5" />
                    {visibleItems.some(item => item.id === "alerts") && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">
                        3
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-8">
                      <Logo size="lg" />
                    </div>

                    {/* User Info */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user?.role === "admin" ? t("login.admin") : t("login.health_worker")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        {isOnline ? (
                          <>
                            <Wifi className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Online</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">Offline</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator className="mb-6" />

                    {/* Navigation Items */}
                    <div className="space-y-2 flex-1">
                      {visibleItems.map((item) => (
                        <Button
                          key={item.id}
                          variant={currentPage === item.id ? "default" : "ghost"}
                          onClick={() => handlePageChange(item.id)}
                          className="w-full justify-start transition-all duration-200 hover:scale-[1.02] h-12"
                        >
                          <item.icon className="w-5 h-5 mr-3" />
                          <span className="text-base">{item.label}</span>
                          {item.id === "alerts" && (
                            <Badge variant="destructive" className="ml-auto px-2 py-0.5 text-xs">
                              3
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>

                    <Separator className="my-6" />

                    {/* Footer Actions */}
                    <div className="space-y-3">
                      <Button variant="outline" onClick={handleLogout} className="w-full h-12">
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="text-base">{t("nav.logout")}</span>
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
