"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock admin login
    if (email === "admin@health.com" && password === "password") {
      setUser({
        id: "1",
        email: "admin@health.com",
        name: "Health Admin",
        role: "admin",
      })
      setIsLoading(false)
      return true
    }
    
    // Mock worker login
    if (email === "worker@health.com" && password === "password") {
      setUser({
        id: "2",
        email: "worker@health.com",
        name: "Health Worker",
        role: "worker",
      })
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}
