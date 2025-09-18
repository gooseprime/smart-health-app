"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Users, 
  Globe, 
  Heart, 
  Droplets,
  Shield,
  AlertTriangle,
  Star,
  Download,
  Share
} from "lucide-react"

interface EducationalModule {
  id: string
  title: string
  description: string
  category: 'hygiene' | 'water-safety' | 'disease-prevention' | 'emergency-response'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in minutes
  languages: string[]
  completionRate: number
  isCompleted: boolean
  content: {
    videos: number
    articles: number
    quizzes: number
    activities: number
  }
  targetAudience: string[]
  lastUpdated: string
}

const defaultModules: EducationalModule[] = [
  {
    id: 'hygiene-basics',
    title: 'Basic Hygiene Practices',
    description: 'Learn essential hygiene practices to prevent water-borne diseases',
    category: 'hygiene',
    difficulty: 'beginner',
    duration: 15,
    languages: ['English', 'Hindi', 'Assamese', 'Bengali'],
    completionRate: 85,
    isCompleted: false,
    content: {
      videos: 3,
      articles: 2,
      quizzes: 1,
      activities: 2
    },
    targetAudience: ['Community Members', 'Health Workers', 'Children'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'water-safety',
    title: 'Water Safety and Purification',
    description: 'Understanding water contamination and purification methods',
    category: 'water-safety',
    difficulty: 'intermediate',
    duration: 25,
    languages: ['English', 'Hindi', 'Assamese', 'Bengali', 'Garo'],
    completionRate: 72,
    isCompleted: false,
    content: {
      videos: 4,
      articles: 3,
      quizzes: 2,
      activities: 3
    },
    targetAudience: ['Community Members', 'Health Workers', 'Village Leaders'],
    lastUpdated: '2024-01-10'
  },
  {
    id: 'disease-prevention',
    title: 'Disease Prevention Strategies',
    description: 'Comprehensive guide to preventing water-borne diseases',
    category: 'disease-prevention',
    difficulty: 'advanced',
    duration: 35,
    languages: ['English', 'Hindi', 'Assamese', 'Bengali', 'Khasi', 'Garo'],
    completionRate: 68,
    isCompleted: false,
    content: {
      videos: 5,
      articles: 4,
      quizzes: 3,
      activities: 4
    },
    targetAudience: ['Health Workers', 'Supervisors', 'Medical Staff'],
    lastUpdated: '2024-01-12'
  },
  {
    id: 'emergency-response',
    title: 'Emergency Response Protocols',
    description: 'How to respond during disease outbreaks and emergencies',
    category: 'emergency-response',
    difficulty: 'advanced',
    duration: 30,
    languages: ['English', 'Hindi', 'Assamese', 'Bengali'],
    completionRate: 45,
    isCompleted: false,
    content: {
      videos: 4,
      articles: 3,
      quizzes: 2,
      activities: 3
    },
    targetAudience: ['Health Workers', 'Supervisors', 'Emergency Responders'],
    lastUpdated: '2024-01-08'
  }
]

const categoryIcons = {
  'hygiene': Heart,
  'water-safety': Droplets,
  'disease-prevention': Shield,
  'emergency-response': AlertTriangle
}

const categoryColors = {
  'hygiene': 'bg-pink-100 text-pink-800',
  'water-safety': 'bg-blue-100 text-blue-800',
  'disease-prevention': 'bg-green-100 text-green-800',
  'emergency-response': 'bg-red-100 text-red-800'
}

const difficultyColors = {
  'beginner': 'bg-green-100 text-green-800',
  'intermediate': 'bg-yellow-100 text-yellow-800',
  'advanced': 'bg-red-100 text-red-800'
}

export function EducationalModules() {
  const [modules, setModules] = useState<EducationalModule[]>(defaultModules)
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  const availableLanguages = ['English', 'Hindi', 'Assamese', 'Bengali', 'Khasi', 'Garo', 'Mizo', 'Manipuri']
  
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'hygiene', label: 'Hygiene' },
    { value: 'water-safety', label: 'Water Safety' },
    { value: 'disease-prevention', label: 'Disease Prevention' },
    { value: 'emergency-response', label: 'Emergency Response' }
  ]

  const filteredModules = modules.filter(module => {
    const categoryMatch = selectedCategory === 'all' || module.category === selectedCategory
    const languageMatch = module.languages.includes(selectedLanguage)
    return categoryMatch && languageMatch
  })

  const startModule = (moduleId: string) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, isCompleted: false }
        : module
    ))
    // Here you would typically navigate to the module content
    console.log(`Starting module: ${moduleId}`)
  }

  const completeModule = (moduleId: string) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, isCompleted: true, completionRate: 100 }
        : module
    ))
  }

  const downloadModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (module) {
      // Create downloadable content
      const content = {
        title: module.title,
        description: module.description,
        content: module.content,
        targetAudience: module.targetAudience,
        lastUpdated: module.lastUpdated
      }
      
      const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${module.title.replace(/\s+/g, '-').toLowerCase()}-module.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Educational Modules</h2>
          <p className="text-gray-600 mt-2">
            Interactive learning modules for health awareness and disease prevention
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium">Multilingual Support</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            {availableLanguages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => {
          const CategoryIcon = categoryIcons[module.category]
          return (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${categoryColors[module.category]}`}>
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={difficultyColors[module.difficulty]}>
                          {module.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {module.duration} min
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {module.isCompleted && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>
                <CardDescription className="mt-2">
                  {module.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{module.completionRate}%</span>
                  </div>
                  <Progress value={module.completionRate} className="h-2" />
                </div>

                {/* Content Overview */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <Play className="w-4 h-4 text-blue-500" />
                    <span>{module.content.videos} videos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4 text-green-500" />
                    <span>{module.content.articles} articles</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    <span>{module.content.quizzes} quizzes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span>{module.content.activities} activities</span>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <div className="text-sm font-medium mb-1">Available Languages:</div>
                  <div className="flex flex-wrap gap-1">
                    {module.languages.map(lang => (
                      <Badge 
                        key={lang} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <div className="text-sm font-medium mb-1">Target Audience:</div>
                  <div className="flex flex-wrap gap-1">
                    {module.targetAudience.map(audience => (
                      <Badge 
                        key={audience} 
                        variant="outline" 
                        className="text-xs"
                      >
                        {audience}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    onClick={() => startModule(module.id)}
                    className="flex-1"
                    disabled={module.isCompleted}
                  >
                    {module.isCompleted ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Module
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadModule(module.id)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                {/* Last Updated */}
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Last updated: {new Date(module.lastUpdated).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>Learning Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{modules.length}</div>
              <div className="text-sm text-gray-600">Total Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {modules.filter(m => m.isCompleted).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(modules.reduce((acc, m) => acc + m.completionRate, 0) / modules.length)}%
              </div>
              <div className="text-sm text-gray-600">Average Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {availableLanguages.length}
              </div>
              <div className="text-sm text-gray-600">Languages</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
