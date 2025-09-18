"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Loader2, 
  Heart, 
  Shield, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Users, 
  Activity,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { LanguageSwitcher } from "@/components/language-switcher"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await login(email, password)
    if (!success) {
      setError('Invalid credentials. Try the demo accounts below.')
    }
  }

  const quickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail)
    setPassword(userPassword)
    setError("")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Smart Health Monitor</span>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your health dashboard</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Secure Login</span>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Accounts */}
              <div className="mt-6">
                <Separator className="my-4" />
                <div className="text-center mb-4">
                  <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Demo Accounts
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => quickLogin('admin@smarthealth.com', 'admin123')}
                    className="w-full h-auto p-3 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-gray-900">Administrator</div>
                        <div className="text-sm text-gray-600">Full system access</div>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => quickLogin('worker@smarthealth.com', 'worker123')}
                    className="w-full h-auto p-3 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-gray-900">Health Worker</div>
                        <div className="text-sm text-gray-600">Report submission & viewing</div>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => quickLogin('supervisor@smarthealth.com', 'supervisor123')}
                    className="w-full h-auto p-3 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-gray-900">Supervisor</div>
                        <div className="text-sm text-gray-600">Village management & oversight</div>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Secure health monitoring for your community
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}