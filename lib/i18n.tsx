"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

export type Language = "en" | "as"

interface Translations {
  [key: string]: {
    [lang in Language]: string
  }
}

const translations: Translations = {
  // Navigation
  "nav.dashboard": {
    en: "Dashboard",
    as: "ড্যাশবোর্ড",
  },
  "nav.submit_report": {
    en: "Submit Report",
    as: "প্রতিবেদন জমা দিন",
  },
  "nav.alerts": {
    en: "Alerts",
    as: "সতর্কতা",
  },
  "nav.logout": {
    en: "Logout",
    as: "লগআউট",
  },

  // Login Form
  "login.title": {
    en: "Smart Health",
    as: "স্মার্ট স্বাস্থ্য",
  },
  "login.subtitle": {
    en: "Monitor community health and water quality",
    as: "সম্প্রদায়ের স্বাস্থ্য এবং পানির গুণমান পর্যবেক্ষণ করুন",
  },
  "login.email": {
    en: "Email",
    as: "ইমেইল",
  },
  "login.password": {
    en: "Password",
    as: "পাসওয়ার্ড",
  },
  "login.signin": {
    en: "Sign In",
    as: "সাইন ইন",
  },
  "login.signing_in": {
    en: "Signing in...",
    as: "সাইন ইন করা হচ্ছে...",
  },
  "login.demo_accounts": {
    en: "Demo Accounts:",
    as: "ডেমো অ্যাকাউন্ট:",
  },
  "login.health_worker": {
    en: "Health Worker",
    as: "স্বাস্থ্যকর্মী",
  },
  "login.admin": {
    en: "Admin",
    as: "প্রশাসক",
  },

  // Report Form
  "report.title": {
    en: "Submit Health Report",
    as: "স্বাস্থ্য প্রতিবেদন জমা দিন",
  },
  "report.subtitle": {
    en: "Record patient symptoms and water quality data for community health monitoring",
    as: "সম্প্রদায়ের স্বাস্থ্য পর্যবেক্ষণের জন্য রোগীর লক্ষণ এবং পানির গুণমানের তথ্য রেকর্ড করুন",
  },
  "report.patient_info": {
    en: "Patient Information",
    as: "রোগীর তথ্য",
  },
  "report.patient_name": {
    en: "Patient Name",
    as: "রোগীর নাম",
  },
  "report.age": {
    en: "Age",
    as: "বয়স",
  },
  "report.village": {
    en: "Village/Location",
    as: "গ্রাম/অবস্থান",
  },
  "report.water_quality": {
    en: "Water Quality",
    as: "পানির গুণমান",
  },
  "report.turbidity": {
    en: "Turbidity (NTU)",
    as: "ঘোলাত্ব (NTU)",
  },
  "report.ph_level": {
    en: "pH Level",
    as: "pH মাত্রা",
  },
  "report.contamination": {
    en: "Contamination Level",
    as: "দূষণের মাত্রা",
  },
  "report.symptoms": {
    en: "Symptoms Checklist",
    as: "লক্ষণের তালিকা",
  },
  "report.additional_notes": {
    en: "Additional Notes",
    as: "অতিরিক্ত মন্তব্য",
  },
  "report.submit": {
    en: "Submit Health Report",
    as: "স্বাস্থ্য প্রতিবেদন জমা দিন",
  },
  "report.submitting": {
    en: "Submitting Report...",
    as: "প্রতিবেদন জমা দেওয়া হচ্ছে...",
  },
  "report.success": {
    en: "Report Submitted Successfully!",
    as: "প্রতিবেদন সফলভাবে জমা দেওয়া হয়েছে!",
  },
  "report.offline_saved": {
    en: "Report Saved Offline!",
    as: "প্রতিবেদন অফলাইনে সংরক্ষিত!",
  },

  // Symptoms
  "symptom.diarrhea": {
    en: "Diarrhea",
    as: "ডায়রিয়া",
  },
  "symptom.fever": {
    en: "Fever",
    as: "জ্বর",
  },
  "symptom.vomiting": {
    en: "Vomiting",
    as: "বমি",
  },
  "symptom.jaundice": {
    en: "Jaundice",
    as: "জন্ডিস",
  },
  "symptom.abdominal_pain": {
    en: "Abdominal Pain",
    as: "পেটে ব্যথা",
  },
  "symptom.nausea": {
    en: "Nausea",
    as: "বমি বমি ভাব",
  },
  "symptom.headache": {
    en: "Headache",
    as: "মাথাব্যথা",
  },
  "symptom.dehydration": {
    en: "Dehydration",
    as: "পানিশূন্যতা",
  },
  "symptom.fatigue": {
    en: "Fatigue",
    as: "ক্লান্তি",
  },
  "symptom.loss_of_appetite": {
    en: "Loss of Appetite",
    as: "ক্ষুধামন্দা",
  },

  // Contamination Levels
  "contamination.low": {
    en: "Low",
    as: "কম",
  },
  "contamination.medium": {
    en: "Medium",
    as: "মাঝারি",
  },
  "contamination.high": {
    en: "High",
    as: "উচ্চ",
  },

  // Dashboard
  "dashboard.title": {
    en: "Health Dashboard",
    as: "স্বাস্থ্য ড্যাশবোর্ড",
  },
  "dashboard.subtitle": {
    en: "Monitor community health trends and water quality",
    as: "সম্প্রদায়ের স্বাস্থ্যের প্রবণতা এবং পানির গুণমান পর্যবেক্ষণ করুন",
  },
  "dashboard.total_reports": {
    en: "Total Reports",
    as: "মোট প্রতিবেদন",
  },
  "dashboard.villages_monitored": {
    en: "Villages Monitored",
    as: "পর্যবেক্ষিত গ্রাম",
  },
  "dashboard.high_risk_areas": {
    en: "High Risk Areas",
    as: "উচ্চ ঝুঁকিপূর্ণ এলাকা",
  },
  "dashboard.water_quality": {
    en: "Water Quality",
    as: "পানির গুণমান",
  },

  // Alerts
  "alerts.title": {
    en: "Health Alerts",
    as: "স্বাস্থ্য সতর্কতা",
  },
  "alerts.subtitle": {
    en: "Monitor and respond to health emergencies",
    as: "স্বাস্থ্য জরুরি অবস্থা পর্যবেক্ষণ এবং প্রতিক্রিয়া",
  },
  "alerts.active_alerts": {
    en: "Active Alerts",
    as: "সক্রিয় সতর্কতা",
  },
  "alerts.acknowledge": {
    en: "Acknowledge",
    as: "স্বীকার করুন",
  },
  "alerts.resolve": {
    en: "Resolve",
    as: "সমাধান করুন",
  },

  // Offline
  "offline.online": {
    en: "Online",
    as: "অনলাইন",
  },
  "offline.offline": {
    en: "Offline",
    as: "অফলাইন",
  },
  "offline.syncing": {
    en: "Syncing...",
    as: "সিঙ্ক করা হচ্ছে...",
  },
  "offline.pending": {
    en: "pending",
    as: "অপেক্ষমাণ",
  },
  "offline.sync_now": {
    en: "Sync Now",
    as: "এখনই সিঙ্ক করুন",
  },

  // Common
  "common.close": {
    en: "Close",
    as: "বন্ধ করুন",
  },
  "common.save": {
    en: "Save",
    as: "সংরক্ষণ করুন",
  },
  "common.cancel": {
    en: "Cancel",
    as: "বাতিল করুন",
  },
  "common.loading": {
    en: "Loading...",
    as: "লোড হচ্ছে...",
  },
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem("smart-health-language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "as")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("smart-health-language", lang)
  }

  const t = (key: string): string => {
    const translation = translations[key]
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`)
      return key
    }
    return translation[language] || translation.en || key
  }

  return <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>{children}</I18nContext.Provider>
}
