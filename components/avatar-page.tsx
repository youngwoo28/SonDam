"use client"

import { useState, useEffect } from "react"
import { Bot, Play, Settings, Download, Zap, Palette, Sliders, FileText, RefreshCw, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import AvatarViewer from "./avatar-viewer" // Import the viewer

// Hardcoded demo data for "안녕하세요" (excerpt of frames for testing)
const DEMO_DATA = [
  // Frame 1
  [
    [0.437, 0.939, 0.000], [0.458, 0.942, -0.003], [0.477, 0.961, -0.006], [0.490, 0.975, -0.008],
    [0.502, 0.977, -0.011], [0.473, 0.986, -0.006], [0.480, 1.016, -0.010], [0.482, 1.033, -0.013],
    [0.484, 1.045, -0.014], [0.460, 0.994, -0.007], [0.467, 1.025, -0.009], [0.470, 1.041, -0.010],
    [0.471, 1.052, -0.010], [0.448, 0.998, -0.008], [0.454, 1.028, -0.009], [0.456, 1.043, -0.008],
    [0.458, 1.055, -0.007], [0.437, 1.000, -0.009], [0.441, 1.024, -0.009], [0.443, 1.038, -0.007],
    [0.445, 1.048, -0.005]
  ],
  // Frame 2
  [
    [0.574, 0.927, 0.000], [0.558, 0.943, 0.001], [0.549, 0.972, 0.001], [0.546, 0.996, 0.000],
    [0.547, 1.015, 0.000], [0.548, 0.985, -0.001], [0.546, 1.022, -0.005], [0.547, 1.031, -0.007],
    [0.547, 1.033, -0.008], [0.560, 0.990, -0.004], [0.558, 1.026, -0.006], [0.559, 1.030, -0.007],
    [0.560, 1.027, -0.007], [0.572, 0.993, -0.006], [0.570, 1.027, -0.007], [0.571, 1.029, -0.006],
    [0.573, 1.024, -0.005], [0.584, 0.994, -0.009], [0.582, 1.023, -0.008], [0.582, 1.027, -0.006],
    [0.585, 1.024, -0.004]
  ],
  // Frame 3
  [
    [0.463, 0.852, 0.000], [0.484, 0.847, -0.001], [0.506, 0.854, -0.003], [0.521, 0.858, -0.006],
    [0.532, 0.850, -0.009], [0.510, 0.865, -0.006], [0.525, 0.886, -0.013], [0.528, 0.896, -0.017],
    [0.530, 0.904, -0.019], [0.500, 0.877, -0.010], [0.515, 0.898, -0.015], [0.520, 0.910, -0.018],
    [0.524, 0.920, -0.020], [0.487, 0.887, -0.013], [0.499, 0.908, -0.019], [0.506, 0.920, -0.021],
    [0.512, 0.931, -0.023], [0.471, 0.897, -0.017], [0.478, 0.917, -0.022], [0.482, 0.930, -0.023],
    [0.486, 0.943, -0.023]
  ],
  // Repeat frames to simulate animation loop for demo
  [
    [0.437, 0.939, 0.000], [0.458, 0.942, -0.003], [0.477, 0.961, -0.006], [0.490, 0.975, -0.008],
    [0.502, 0.977, -0.011], [0.473, 0.986, -0.006], [0.480, 1.016, -0.010], [0.482, 1.033, -0.013],
    [0.484, 1.045, -0.014], [0.460, 0.994, -0.007], [0.467, 1.025, -0.009], [0.470, 1.041, -0.010],
    [0.471, 1.052, -0.010], [0.448, 0.998, -0.008], [0.454, 1.028, -0.009], [0.456, 1.043, -0.008],
    [0.458, 1.055, -0.007], [0.437, 1.000, -0.009], [0.441, 1.024, -0.009], [0.443, 1.038, -0.007],
    [0.445, 1.048, -0.005]
  ],
]

export default function AvatarPage() {
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [speed, setSpeed] = useState([0.4])
  const [showBackground, setShowBackground] = useState(true)
  const [inputText, setInputText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)

  // Avatar Animation State
  const [landmarkData, setLandmarkData] = useState<any[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  const avatars = [
    { id: 0, name: "기본 아바타", description: "친근하고 밝은 느낌", color: "from-primary to-chart-1" },
    { id: 1, name: "전문가 아바타", description: "전문적이고 신뢰감 있는", color: "from-chart-2 to-chart-3" },
    { id: 2, name: "귀여운 아바타", description: "아이들이 좋아하는 스타일", color: "from-chart-4 to-chart-5" },
  ]

  const handleTextToSign = async () => {
    if (!inputText.trim()) return

    setIsTranslating(true)
    setIsPlaying(false)
    setLandmarkData([])

    try {
      // DEMO: Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Trigger playing state with DEMO data
      setLandmarkData(DEMO_DATA)
      setIsPlaying(true)
    } catch (e) {
      console.error(e)
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6 sm:pt-24 sm:pb-8 lg:pt-28 lg:pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chart-3/10 border border-chart-3/20 mb-2">
            <Bot className="w-4 h-4 text-chart-3" />
            <span className="text-sm font-semibold text-chart-3">수화 아바타</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
            <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              3D 아바타가 수화를 시연해요
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            원하는 문장을 입력하면 아바타가 수어로 표현해 줍니다
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Avatar Preview & Input */}
          <div className="lg:col-span-2 space-y-6">

            {/* Input Card */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  수어로 변환할 문장 입력
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="안녕하세요, 만나서 반갑습니다."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[100px] text-base resize-none rounded-xl border-2"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleTextToSign}
                    disabled={!inputText.trim() || isTranslating}
                    className="gap-2 rounded-xl"
                  >
                    {isTranslating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        변환 중...
                      </>
                    ) : (
                      <>
                        수어로 변환 및 시연
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-secondary/30 to-secondary/10 relative">
                  {/* 3D Avatar Viewer */}
                  <AvatarViewer
                    landmarks_data={landmarkData}
                    isPlaying={isPlaying}
                    speed={speed[0]}
                    showBackground={showBackground}
                    avatarId={selectedAvatar}
                  />

                  {/* Overlay for 'No Data' or 'Loading' - Only show when not playing */}
                  {!isPlaying && !isTranslating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                      <div className="text-center p-6 bg-background/80 rounded-xl shadow-lg backdrop-blur-md">
                        <Bot className="w-12 h-12 mx-auto mb-2 text-chart-3" />
                        <p className="font-semibold">문장을 입력하고 변환 버튼을 눌러주세요</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Control Panel */}
            <Card className="mt-6 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary" />
                  아바타 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">재생 속도</Label>
                  <div className="flex items-center gap-4">
                    <Slider value={speed} onValueChange={setSpeed} min={0.5} max={2} step={0.1} className="flex-1" />
                    <span className="text-sm font-mono w-12 text-right">{speed[0].toFixed(1)}x</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">배경 표시</Label>
                    <p className="text-sm text-muted-foreground">아바타 뒤 배경을 표시합니다</p>
                  </div>
                  <Switch checked={showBackground} onCheckedChange={setShowBackground} />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="outline" className="gap-2 rounded-xl h-11 bg-transparent">
                    <Settings className="w-4 h-4" />
                    고급 설정
                  </Button>
                  <Button variant="outline" className="gap-2 rounded-xl h-11 bg-transparent">
                    <Download className="w-4 h-4" />
                    영상 저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">아바타 선택</h3>
            <div className="space-y-3">
              {avatars.map((avatar) => (
                <Card
                  key={avatar.id}
                  className={`cursor - pointer transition - all duration - 300 hover: shadow - lg ${selectedAvatar === avatar.id ? "border-2 border-primary shadow-xl" : "border"
                    } `}
                  onClick={() => setSelectedAvatar(avatar.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w - 16 h - 16 rounded - xl bg - gradient - to - br ${avatar.color} flex items - center justify - center shadow - lg`}
                      >
                        <Bot className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">{avatar.name}</h4>
                        <p className="text-sm text-muted-foreground">{avatar.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features */}
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-chart-1/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-primary" />
                  주요 기능
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Play className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">실시간 재생</p>
                    <p className="text-xs text-muted-foreground">자연스러운 동작으로 표현</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sliders className="w-4 h-4 text-chart-2" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">속도 조절</p>
                    <p className="text-xs text-muted-foreground">학습 수준에 맞게 조정</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-chart-4/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Palette className="w-4 h-4 text-chart-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">다양한 스타일</p>
                    <p className="text-xs text-muted-foreground">취향에 맞는 아바타 선택</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
