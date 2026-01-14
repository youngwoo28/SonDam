"use client"

import { useState } from "react"
import { Search, Sparkles, Bot, Users, User, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import HeroSection from "@/components/hero-section"
import FeatureSection from "@/components/feature-section"
import LandingFeatureSection from "@/components/landing-feature-section"
import DictionaryPage from "@/components/dictionary-page"

import TranslatorPage from "@/components/translator-page"
import AvatarPage from "@/components/avatar-page"
import CommunityPage from "@/components/community-page"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function SonDamPage() {
  const [activeTab, setActiveTab] = useState<"home" | "dictionary" | "translator" | "avatar" | "community">("home")
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const navigateTo = (tab: "dictionary" | "translator" | "avatar" | "community") => {
    setActiveTab(tab)
  }

  const scrollToDictionary = () => {
    // Legacy support or can be repurposed
  }

  // Define content based on activeTab - Modified for One-Page Landing
  const renderContent = () => {
    if (activeTab === "home") {
      return (
        <div className="space-y-0">
          <HeroSection onNavigate={navigateTo} onScrollToDictionary={scrollToDictionary} />
          {/* FeatureSection removed as per user request to avoid redundancy with Hero buttons */}
          <LandingFeatureSection onNavigate={navigateTo} />

          {/* Footer Section */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="container px-4 mx-auto text-center space-y-6">
              <div className="flex justify-center items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">S</div>
                <span className="text-xl font-bold tracking-tight">SonDam</span>
              </div>
              <p className="text-gray-400 max-w-md mx-auto">
                누구나 쉽게 수어를 배울 수 있는 세상을 만듭니다.
              </p>
              <div className="text-sm text-gray-500 pt-8 border-t border-gray-800">
                © 2024 SonDam. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      )
    }

    // Functional Interface Views (App Mode)
    if (activeTab === "dictionary") {
      return (
        <div className="pt-20 container mx-auto px-4 pb-20">
          <DictionaryPage />
        </div>
      )
    }
    if (activeTab === "translator") return <TranslatorPage />
    if (activeTab === "avatar") return <AvatarPage />
    if (activeTab === "community") return <CommunityPage />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-border flex items-center px-4 justify-between transition-all duration-300">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">S</div>
          <span className="text-xl font-bold tracking-tight text-primary">SonDam</span>
        </div>

        {/* Desktop Nav - Anchors to sections */}
        {/* Desktop Nav - Smart Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant={activeTab === "dictionary" ? "default" : "ghost"}
            onClick={() => {
              if (activeTab === "home") {
                const element = document.getElementById('landing-dictionary')
                if (element) {
                  const offset = 64
                  const elementPosition = element.getBoundingClientRect().top
                  window.scrollTo({ top: elementPosition + window.pageYOffset - offset, behavior: 'smooth' })
                }
              } else {
                setActiveTab("dictionary")
              }
            }}
            className="rounded-full px-5"
          >
            수어 사전
          </Button>
          <Button
            variant={activeTab === "translator" ? "default" : "ghost"}
            onClick={() => {
              if (activeTab === "home") {
                const element = document.getElementById('landing-translator')
                if (element) {
                  const offset = 64
                  const elementPosition = element.getBoundingClientRect().top
                  window.scrollTo({ top: elementPosition + window.pageYOffset - offset, behavior: 'smooth' })
                }
              } else {
                setActiveTab("translator")
              }
            }}
            className="rounded-full px-5"
          >
            AI 번역
          </Button>
          <Button
            variant={activeTab === "avatar" ? "default" : "ghost"}
            onClick={() => {
              if (activeTab === "home") {
                const element = document.getElementById('landing-avatar')
                if (element) {
                  const offset = 64
                  const elementPosition = element.getBoundingClientRect().top
                  window.scrollTo({ top: elementPosition + window.pageYOffset - offset, behavior: 'smooth' })
                }
              } else {
                setActiveTab("avatar")
              }
            }}
            className="rounded-full px-5"
          >
            아바타
          </Button>
          <Button
            variant={activeTab === "community" ? "default" : "ghost"}
            onClick={() => {
              if (activeTab === "home") {
                const element = document.getElementById('landing-community')
                if (element) {
                  const offset = 64
                  const elementPosition = element.getBoundingClientRect().top
                  window.scrollTo({ top: elementPosition + window.pageYOffset - offset, behavior: 'smooth' })
                }
              } else {
                setActiveTab("community")
              }
            }}
            className="rounded-full px-5"
          >
            커뮤니티
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => router.push("/login")} className="rounded-full">로그인</Button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden">
        {renderContent()}
      </main>

      {/* Mobile Nav - Hidden for Landing Page Concept as it might clutter, but keeping structure if needed */}

    </div>
  )
}
