"use client"

import { useState } from "react"
import { Users, MessageSquare, Heart, Share2, Plus, TrendingUp, Award, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const posts = [
  {
    id: 1,
    author: "김수화",
    authorInitial: "김",
    timestamp: "2시간 전",
    content: "오늘 배운 '감사합니다' 수화를 연습했어요! 처음엔 어려웠는데 계속 하니 자연스러워지네요 😊",
    likes: 24,
    comments: 5,
    category: "학습일기",
  },
  {
    id: 2,
    author: "이소통",
    authorInitial: "이",
    timestamp: "5시간 전",
    content: "가족 모두가 함께 수화를 배우기 시작했습니다. 소통이 더 풍부해진 느낌이에요!",
    likes: 45,
    comments: 12,
    category: "일상공유",
  },
  {
    id: 3,
    author: "박손담",
    authorInitial: "박",
    timestamp: "1일 전",
    content: "수화 사전에서 '친구' 단어 찾아봤는데 정말 직관적이에요. 손담 덕분에 많이 배우고 있습니다!",
    likes: 67,
    comments: 8,
    category: "후기",
  },
]

const challenges = [
  { id: 1, title: "7일 연속 학습", description: "매일 수화 단어 5개씩 배우기", participants: 234, icon: TrendingUp },
  { id: 2, title: "기초 완성", description: "기본 인사 10개 마스터하기", participants: 567, icon: Award },
  { id: 3, title: "소통 챌린지", description: "수화로 대화 영상 올리기", participants: 123, icon: MessageSquare },
]

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("feed")

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6 sm:pt-24 sm:pb-8 lg:pt-28 lg:pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chart-4/10 border border-chart-4/20 mb-2">
            <Users className="w-4 h-4 text-chart-4" />
            <span className="text-sm font-semibold text-chart-4">커뮤니티</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
            <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              함께 배우고 성장해요
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            수화 학습 경험을 나누고 서로 응원하는 따뜻한 공간입니다
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12 rounded-2xl">
            <TabsTrigger value="feed" className="rounded-xl text-base">
              피드
            </TabsTrigger>
            <TabsTrigger value="challenges" className="rounded-xl text-base">
              챌린지
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-8 space-y-6">
            {/* New Post Button */}
            <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <Button className="w-full gap-2 h-12 rounded-xl text-base" size="lg">
                  <Plus className="w-5 h-5" />
                  새로운 이야기 공유하기
                </Button>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="border shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-chart-1 text-white font-bold">
                            {post.authorInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">{post.author}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.timestamp}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {post.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-base leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4 pt-2 border-t">
                      <Button variant="ghost" size="sm" className="gap-2 rounded-xl h-9">
                        <Heart className="w-4 h-4" />
                        <span className="font-semibold">{post.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2 rounded-xl h-9">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-semibold">{post.comments}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2 rounded-xl h-9 ml-auto">
                        <Share2 className="w-4 h-4" />
                        공유
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="mt-8 space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((challenge) => (
                <Card
                  key={challenge.id}
                  className="border-2 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all duration-300 cursor-pointer group"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-chart-1/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                      <challenge.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{challenge.participants}명 참여</span>
                      </div>
                      <Button size="sm" className="rounded-xl">
                        참여하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Community Stats */}
            <Card className="border-2 bg-gradient-to-br from-primary/5 via-chart-1/5 to-transparent">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-6 text-center">커뮤니티 현황</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-primary">1,234</p>
                    <p className="text-sm text-muted-foreground">활동 회원</p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-chart-2">5,678</p>
                    <p className="text-sm text-muted-foreground">공유된 경험</p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-chart-4">924</p>
                    <p className="text-sm text-muted-foreground">진행 중 챌린지</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
