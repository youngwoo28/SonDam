"use client"

import { useState, useEffect } from "react"
import { Search, BookOpen, Play } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// 백엔드 데이터 타입 정의
interface WordData {
  id: number
  word: string
  description: string
  category: string
  thumbnailUrl: string
  videoUrl: string
  difficulty: string
  key_point?: string
  context?: string
  related_words?: string[]
}

const categories = ["전체", "일상", "감정", "관계", "장소"]
const difficulties = ["전체", "초급", "중급", "고급"]

// 유튜브 주소 변환 헬퍼 함수
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return ""
  let videoId = ""
  if (url.includes("shorts/")) {
    videoId = url.split("shorts/")[1].split("?")[0]
  } else if (url.includes("v=")) {
    videoId = url.split("v=")[1].split("&")[0]
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0]
  } else if (url.includes("embed/")) {
    return url
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url
}

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedDifficulty, setSelectedDifficulty] = useState("전체")

  const [allWords, setAllWords] = useState<WordData[]>([])
  // filteredWords is now derived, so we don't need searchResults state if we just use filteredWords directly in render
  // But keeping searchResults might be redundant if we use the new filteredWords logic.
  // Let's rely on derived state for simplicity in render.
  const [loading, setLoading] = useState(true)

  const [selectedWord, setSelectedWord] = useState<WordData | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/dictionary")
        const data = await res.json()

        const formattedData = data.words.map((item: any, index: number) => ({
          ...item,
          id: item.id || index + 1,
          description: item.description || "수어 단어", // Default to prevent crash
          category: item.category || "기타",
          difficulty: item.difficulty || "난이도 정보 없음",
          thumbnailUrl: item.thumbnailUrl || "/placeholder.svg",
          videoUrl: item.videoUrl || "",
          key_point: item.key_point || "동작 설명이 준비 중입니다.",
          context: item.context || "일상적인 상황에서 사용합니다.",
          related_words: item.related_words || []
        }))

        setAllWords(formattedData)
      } catch (error) {
        console.error("백엔드 연결 실패:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // New filtering logic based on searchTerm, selectedCategory, selectedDifficulty
  const filteredWords = allWords.filter((item) => {
    const matchesSearch = item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "전체" || item.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "전체" || item.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (loading) return <div className="flex h-screen items-center justify-center animate-pulse">데이터 로딩중...</div>

  return (
    <div id="dictionary-section" className="container mx-auto px-4 py-24 max-w-7xl min-h-screen">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium border border-primary/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Comprehensive KSL Dictionary
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">수어 사전</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          엄선된 한국 수어 단어들을 검색하고 배워보세요.
        </p>

        <div className="max-w-md mx-auto relative mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="단어를 검색해보세요 (예: 사랑, 학교)"
            className="pl-10 h-12 rounded-full border-border/60 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 단어 그리드 - 4 Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredWords.map((word) => (
          <div
            key={word.id}
            className="group bg-white rounded-2xl p-4 shadow-sm border border-border/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => setSelectedWord(word)}
          >
            {/* 썸네일 영역 */}
            <div className="relative aspect-video rounded-xl bg-muted/30 overflow-hidden mb-4 border border-border/20 group-hover:scale-[1.02] transition-transform duration-500">
              {/* Thumbnail Image (only if URL exists) */}
              {word.thumbnailUrl && word.thumbnailUrl !== "" && word.thumbnailUrl !== "/placeholder.svg" ? (
                <img
                  src={word.thumbnailUrl}
                  alt={word.word}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                /* Text Fallback when no thumbnail URL */
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
                  <span className="text-4xl font-black text-primary/20 select-none group-hover:text-primary/30 transition-colors">
                    {word.word}
                  </span>
                </div>
              )}
              {/* Overlay Play Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            {/* 정보 영역 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary bg-secondary/5 px-2 py-1 rounded-md">
                  {/* Mock Category or existing data */}
                  {word.category}
                </span>
                <span className="text-xs text-muted-foreground">0:05</span>
              </div>
              <h3 className="text-lg font-bold text-primary group-hover:text-secondary transition-colors">
                {word.word}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {word.description || "Standard Korean Sign Language definition."}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 🎬 상세 보기 팝업 (Modal) - 보안 우회 적용됨 */}
      <Dialog open={!!selectedWord} onOpenChange={() => setSelectedWord(null)}>
        <DialogContent className="sm:max-w-5xl bg-white p-0 overflow-hidden rounded-2xl h-[85vh] sm:h-auto flex flex-col">
          {selectedWord && (
            <div className="flex flex-col md:flex-row h-full">
              {/* 왼쪽: 영상 영역 (자동 감지) */}
              <div className="w-full md:w-3/5 bg-black flex items-center justify-center relative aspect-video md:aspect-auto">
                {/* 1. MP4 파일인 경우 (국립국어원 등) -> video 태그 사용 */}
                {selectedWord.videoUrl.includes('.mp4') ? (
                  <video
                    key={selectedWord.videoUrl}
                    src={selectedWord.videoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />

                ) : (
                  /* 2. 유튜브 등 외부 링크인 경우 -> iframe 사용 */
                  <iframe
                    className="w-full h-full"
                    src={`${getYouTubeEmbedUrl(selectedWord.videoUrl)}?autoplay=1&mute=0`}
                    title={selectedWord.word}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>

              {/* 오른쪽: 상세 설명 영역 */}
              <div className="w-full md:w-2/5 p-6 md:p-8 overflow-y-auto bg-white flex flex-col h-full">
                <div className="mb-6">
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline" className="text-primary border-primary">{selectedWord.category}</Badge>
                    <Badge variant="secondary">{selectedWord.difficulty}</Badge>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedWord.word}</h2>
                  <p className="text-gray-500 mt-1">{selectedWord.description}</p>
                </div>

                <div className="space-y-6 flex-1">
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <h4 className="font-semibold text-yellow-800 mb-1 flex items-center gap-2">💡 수화 동작 Tip</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedWord.key_point}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">활용 예시</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                      "{selectedWord.context}"
                    </div>
                  </div>

                  {selectedWord.related_words && selectedWord.related_words.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">함께 배우면 좋은 단어</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedWord.related_words.map((word, idx) => (
                          <Badge key={idx} variant="secondary" className="cursor-pointer hover:bg-gray-200">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 md:hidden">
                  <Button className="w-full" onClick={() => setSelectedWord(null)}>닫기</Button>
                </div>
              </div>
            </div>
          )}

          <DialogHeader className="sr-only">
            <DialogTitle>{selectedWord?.word}</DialogTitle>
            <DialogDescription>{selectedWord?.description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Copyright Footer */}
      <footer className="mt-32 py-10 border-t text-center space-y-2">
        <p className="text-muted-foreground text-sm">
          본 콘텐츠의 수어 영상 출처는 <span className="font-semibold text-foreground">국립국어원 한국수어사전</span>입니다.
        </p>
        <p className="text-xs text-muted-foreground/60">
          Creative Commons Attribution-NonCommercial-NoDerivs 2.0 Korea License
        </p>
      </footer>
    </div>
  )
}

