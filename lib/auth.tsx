"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "worker" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('smartHealthUser')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('smartHealthUser')
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock admin login
    if (email === "admin@smarthealth.com" && password === "admin123") {
      const userData = {
        id: "1",
        email: "admin@smarthealth.com",
        name: "Health Administrator",
        role: "admin" as UserRole,
      }
      setUser(userData)
      localStorage.setItem('smartHealthUser', JSON.stringify(userData))
      setIsLoading(false)
      return true
    }
    
    // Mock worker login
    if (email === "worker@smarthealth.com" && password === "worker123") {
      const userData = {
        id: "2",
        email: "worker@smarthealth.com",
        name: "Health Worker",
        role: "worker" as UserRole,
      }
      setUser(userData)
      localStorage.setItem('smartHealthUser', JSON.stringify(userData))
      setIsLoading(false)
      return true
    }

    // Mock supervisor login
    if (email === "supervisor@smarthealth.com" && password === "supervisor123") {
      const userData = {
        id: "3",
        email: "supervisor@smarthealth.com",
        name: "Health Supervisor",
        role: "admin" as UserRole, // Supervisor has admin privileges
      }
      setUser(userData)
      localStorage.setItem('smartHealthUser', JSON.stringify(userData))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('smartHealthUser')
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}
