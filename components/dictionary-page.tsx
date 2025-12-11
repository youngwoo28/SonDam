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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedDifficulty, setSelectedDifficulty] = useState("전체")
  
  const [allWords, setAllWords] = useState<WordData[]>([]) 
  const [searchResults, setSearchResults] = useState<WordData[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedWord, setSelectedWord] = useState<WordData | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/dictionary")
        const data = await res.json()
        
        const formattedData = data.words.map((item: any) => ({
          ...item,
          thumbnailUrl: item.thumbnailUrl || "/placeholder.svg",
          videoUrl: item.videoUrl || "",
          key_point: item.key_point || "동작 설명이 준비 중입니다.",
          context: item.context || "일상적인 상황에서 사용합니다.",
          related_words: item.related_words || []
        }))

        setAllWords(formattedData)
        setSearchResults(formattedData)
      } catch (error) {
        console.error("백엔드 연결 실패:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterResults(query, selectedCategory, selectedDifficulty)
  }

  const filterResults = (query: string, category: string, difficulty: string) => {
    let results = allWords
    if (query.trim()) {
      results = results.filter((item) =>
          item.word.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      )
    }
    if (category !== "전체") results = results.filter((item) => item.category === category)
    if (difficulty !== "전체") results = results.filter((item) => item.difficulty === difficulty)
    setSearchResults(results)
  }

  if (loading) return <div className="flex h-screen items-center justify-center animate-pulse">데이터 로딩중...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 상단 타이틀 및 검색바 */}
      <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">수화 사전</span>
          </div>
          <h2 className="text-3xl font-bold">소통의 언어를 배워요</h2>
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input 
                placeholder="수화 단어를 검색해보세요..." 
                className="pl-12 h-12 rounded-full border-2 focus-visible:ring-4 shadow-sm" 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
             {categories.map((cat) => (
               <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => { setSelectedCategory(cat); filterResults(searchQuery, cat, selectedDifficulty); }} className="rounded-full">
                 {cat}
               </Button>
             ))}
          </div>
      </div>

      {/* 카드 리스트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {searchResults.map((item) => (
          <Card 
            key={item.id}
            onClick={() => setSelectedWord(item)}
            className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-2 hover:border-primary/50"
          >
            <CardContent className="p-0 relative aspect-video bg-gray-100">
              <img src={item.thumbnailUrl} alt={item.word} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all">
                  <Play className="w-5 h-5 text-primary ml-1" fill="currentColor" />
                </div>
              </div>
              <Badge className="absolute top-2 right-2 backdrop-blur-sm">{item.category}</Badge>
            </CardContent>
            <div className="p-4">
              <h3 className="font-bold text-lg">{item.word}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
            </div>
          </Card>
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
                                 referrerPolicy="no-referrer" // 👈 여기가 핵심입니다!
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
    </div>
  )
}
