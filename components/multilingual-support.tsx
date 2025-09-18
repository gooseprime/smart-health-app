"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Globe, 
  Languages, 
  Volume2, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Users,
  BookOpen,
  MessageSquare,
  Settings
} from "lucide-react"

interface Language {
  code: string
  name: string
  nativeName: string
  region: string
  isSupported: boolean
  isEnabled: boolean
  translationProgress: number
  lastUpdated: string
  speakers: number
}

interface Translation {
  key: string
  english: string
  translations: Record<string, string>
  category: string
  lastModified: string
}

const supportedLanguages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    region: 'Global',
    isSupported: true,
    isEnabled: true,
    translationProgress: 100,
    lastUpdated: '2024-01-15',
    speakers: 1500000000
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'India',
    isSupported: true,
    isEnabled: true,
    translationProgress: 95,
    lastUpdated: '2024-01-14',
    speakers: 600000000
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    region: 'Assam',
    isSupported: true,
    isEnabled: true,
    translationProgress: 88,
    lastUpdated: '2024-01-12',
    speakers: 15000000
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    region: 'West Bengal, Bangladesh',
    isSupported: true,
    isEnabled: true,
    translationProgress: 92,
    lastUpdated: '2024-01-13',
    speakers: 300000000
  },
  {
    code: 'kha',
    name: 'Khasi',
    nativeName: 'Khasi',
    region: 'Meghalaya',
    isSupported: true,
    isEnabled: false,
    translationProgress: 75,
    lastUpdated: '2024-01-10',
    speakers: 1000000
  },
  {
    code: 'gar',
    name: 'Garo',
    nativeName: 'Garo',
    region: 'Meghalaya',
    isSupported: true,
    isEnabled: false,
    translationProgress: 70,
    lastUpdated: '2024-01-09',
    speakers: 800000
  },
  {
    code: 'mni',
    name: 'Manipuri',
    nativeName: 'মৈতৈলোন্',
    region: 'Manipur',
    isSupported: true,
    isEnabled: false,
    translationProgress: 65,
    lastUpdated: '2024-01-08',
    speakers: 1500000
  },
  {
    code: 'lus',
    name: 'Mizo',
    nativeName: 'Mizo',
    region: 'Mizoram',
    isSupported: true,
    isEnabled: false,
    translationProgress: 60,
    lastUpdated: '2024-01-07',
    speakers: 800000
  }
]

const translationCategories = [
  'General',
  'Health Terms',
  'Symptoms',
  'Alerts',
  'Navigation',
  'Forms',
  'Educational Content',
  'Emergency Messages'
]

export function MultilingualSupport() {
  const [languages, setLanguages] = useState<Language[]>(supportedLanguages)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [translations, setTranslations] = useState<Translation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [autoTranslate, setAutoTranslate] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  useEffect(() => {
    loadTranslations()
  }, [selectedLanguage])

  const loadTranslations = async () => {
    setIsLoading(true)
    try {
      // Mock translation data
      const mockTranslations: Translation[] = [
        {
          key: 'welcome_message',
          english: 'Welcome to Smart Health Monitor',
          translations: {
            'hi': 'स्मार्ट हेल्थ मॉनिटर में आपका स्वागत है',
            'as': 'স্মাৰ্ট হেলথ মনিটৰলৈ আপোনাক স্বাগতম',
            'bn': 'স্মার্ট হেলথ মনিটরে স্বাগতম',
            'kha': 'Smart Health Monitor ka jingbha',
            'gar': 'Smart Health Monitor ka namgipa',
            'mni': 'Smart Health Monitor da leibak',
            'lus': 'Smart Health Monitor a hlimna'
          },
          category: 'General',
          lastModified: '2024-01-15'
        },
        {
          key: 'diarrhea_symptom',
          english: 'Diarrhea',
          translations: {
            'hi': 'दस्त',
            'as': 'পেটৰ অসুখ',
            'bn': 'ডায়রিয়া',
            'kha': 'Ka jingpynshit',
            'gar': 'Ka jingpynshit',
            'mni': 'Diarrhea',
            'lus': 'Diarrhea'
          },
          category: 'Symptoms',
          lastModified: '2024-01-14'
        },
        {
          key: 'water_contamination_alert',
          english: 'Water contamination detected',
          translations: {
            'hi': 'पानी में प्रदूषण का पता चला',
            'as': 'পানীৰ দূষণ ধৰা পৰিছে',
            'bn': 'জলের দূষণ সনাক্ত হয়েছে',
            'kha': 'Ka um ka jingpynshit',
            'gar': 'Ka um ka jingpynshit',
            'mni': 'Turel contamination',
            'lus': 'Tui contamination'
          },
          category: 'Alerts',
          lastModified: '2024-01-13'
        }
      ]
      setTranslations(mockTranslations)
    } catch (error) {
      console.error('Error loading translations:', error)
    }
    setIsLoading(false)
  }

  const toggleLanguage = (languageCode: string) => {
    setLanguages(prev => prev.map(lang => 
      lang.code === languageCode 
        ? { ...lang, isEnabled: !lang.isEnabled }
        : lang
    ))
  }

  const updateTranslation = (key: string, languageCode: string, translation: string) => {
    setTranslations(prev => prev.map(trans => 
      trans.key === key 
        ? {
            ...trans,
            translations: {
              ...trans.translations,
              [languageCode]: translation
            },
            lastModified: new Date().toISOString().split('T')[0]
          }
        : trans
    ))
  }

  const exportTranslations = () => {
    const exportData = {
      languages: languages.filter(lang => lang.isEnabled),
      translations,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `smart-health-translations-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importTranslations = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.languages) setLanguages(data.languages)
          if (data.translations) setTranslations(data.translations)
        } catch (error) {
          console.error('Error importing translations:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  const enabledLanguages = languages.filter(lang => lang.isEnabled)
  const totalSpeakers = enabledLanguages.reduce((sum, lang) => sum + lang.speakers, 0)
  const averageProgress = Math.round(
    enabledLanguages.reduce((sum, lang) => sum + lang.translationProgress, 0) / enabledLanguages.length
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Multilingual Support</h2>
          <p className="text-gray-600 mt-2">
            Manage translations and language support for tribal communities
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Voice Support</span>
            <Switch
              checked={voiceEnabled}
              onCheckedChange={setVoiceEnabled}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Auto Translate</span>
            <Switch
              checked={autoTranslate}
              onCheckedChange={setAutoTranslate}
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Languages className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{enabledLanguages.length}</div>
                <div className="text-sm text-gray-600">Active Languages</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{(totalSpeakers / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-gray-600">Total Speakers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{averageProgress}%</div>
                <div className="text-sm text-gray-600">Avg. Translation</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{translations.length}</div>
                <div className="text-sm text-gray-600">Translation Keys</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Language Management</span>
          </CardTitle>
          <CardDescription>
            Enable or disable languages and manage translation progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languages.map((language) => (
              <div key={language.code} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{language.name}</div>
                    <div className="text-sm text-gray-600">{language.nativeName}</div>
                    <div className="text-xs text-gray-500">{language.region}</div>
                  </div>
                  <Switch
                    checked={language.isEnabled}
                    onCheckedChange={() => toggleLanguage(language.code)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Translation Progress</span>
                    <span>{language.translationProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${language.translationProgress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Speakers: {(language.speakers / 1000000).toFixed(1)}M</span>
                  <Badge variant={language.isEnabled ? "default" : "secondary"}>
                    {language.isEnabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Translation Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Translation Editor</span>
          </CardTitle>
          <CardDescription>
            Edit and manage translations for different languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div>
                <Label htmlFor="language-select">Select Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.filter(lang => lang.isEnabled).map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name} ({lang.nativeName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={exportTranslations}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importTranslations}
                    className="hidden"
                    id="import-translations"
                  />
                  <Button variant="outline" asChild>
                    <label htmlFor="import-translations" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </label>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {translations.map((translation) => (
                <div key={translation.key} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{translation.key}</div>
                      <div className="text-sm text-gray-600">{translation.english}</div>
                      <Badge variant="outline" className="mt-1">
                        {translation.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Modified: {translation.lastModified}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`translation-${translation.key}`}>
                      Translation ({languages.find(l => l.code === selectedLanguage)?.name})
                    </Label>
                    <Input
                      id={`translation-${translation.key}`}
                      value={translation.translations[selectedLanguage] || ''}
                      onChange={(e) => updateTranslation(translation.key, selectedLanguage, e.target.value)}
                      placeholder="Enter translation..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
