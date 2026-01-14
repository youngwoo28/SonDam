"use client"


import { useState } from "react"
import { Sparkles, Bot, Users, Play, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface HeroSectionProps {
    onNavigate: (tab: "translator" | "avatar" | "community") => void
    onScrollToDictionary: () => void
}

const VIDEO_CARDS = [
    { title: "안녕하세요", subtitle: "일상", image: "https://images.unsplash.com/photo-1629904853716-f0bc54eea481?auto=format&fit=crop&w=800&q=80", videoUrl: "https://sondam-videos-2025.s3.ap-northeast-2.amazonaws.com/videos/안녕.mp4" }, // Hello/Waving (Generic updated)
    { title: "사랑해요", subtitle: "감정", image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80", videoUrl: "https://sondam-videos-2025.s3.ap-northeast-2.amazonaws.com/videos/사랑.mp4" },
    { title: "고맙습니다", subtitle: "일상", image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80", videoUrl: "https://sondam-videos-2025.s3.ap-northeast-2.amazonaws.com/videos/감사.mp4" }, // Thanks (Generic updated)
    { title: "도와주세요", subtitle: "긴급", image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=800&q=80", videoUrl: "https://sondam-videos-2025.s3.ap-northeast-2.amazonaws.com/videos/돕다.mp4" }, // Help (Helping hands)
    { title: "행복", subtitle: "감정", image: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=800&q=80", videoUrl: "https://sondam-videos-2025.s3.ap-northeast-2.amazonaws.com/videos/행복.mp4" }, // Happy face (Verified)
    { title: "병원", subtitle: "장소", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80", videoUrl: "https://sondam-videos-2025.s3.ap-northeast-2.amazonaws.com/videos/병원.mp4" }, // Hospital building (Generic best)
]

export default function HeroSection({ onNavigate, onScrollToDictionary }: HeroSectionProps) {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

    return (
        <div className="relative min-h-screen flex flex-col items-center pt-32 overflow-hidden bg-background">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />

            {/* Main Content */}
            <div className="container px-4 text-center z-10 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border shadow-sm text-sm text-secondary font-medium tracking-wide">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                    </span>
                    AI 기술 기반 수어 교육 플랫폼
                </div>

                <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-primary leading-tight">
                    SonDam<span className="text-secondary">.</span>
                </h1>
                <p className="text-2xl md:text-3xl font-medium text-muted-foreground/80">
                    손끝으로 잇는 세상
                </p>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    AI 실시간 번역과 3D 아바타로 누구나 쉽게 수어를 배우고 소통할 수 있습니다.
                </p>


            </div>

            {/* Infinite Rolling Slider (Card Marquee) */}
            <div className="w-full mt-24 mb-20 overflow-hidden mask-linear-gradient">
                <div className="flex gap-6 animate-marquee w-max py-4">
                    {[...VIDEO_CARDS, ...VIDEO_CARDS, ...VIDEO_CARDS].map((card, i) => (
                        <div
                            key={i}
                            onClick={() => setSelectedVideo(card.videoUrl)}
                            className="w-[280px] h-[360px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50 overflow-hidden hover:-translate-y-2 transition-transform duration-300 flex flex-col group cursor-pointer"
                        >
                            <div className="h-[240px] bg-muted/30 relative overflow-hidden group">
                                {/* Image Overlay for Hover Effect */}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300 z-10" />

                                <img
                                    src={card.image}
                                    alt={card.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />

                                <div className="absolute inset-0 flex items-center justify-center text-4xl text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 drop-shadow-lg">
                                    <Play className="w-12 h-12 fill-white" />
                                </div>
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between text-left bg-white">
                                <div>
                                    <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{card.subtitle}</span>
                                    <h3 className="text-2xl font-bold text-primary mt-1">{card.title}</h3>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Video Modal */}
            <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
                <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black border-none">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Sign Language Video</DialogTitle>
                    </DialogHeader>
                    {selectedVideo && (
                        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                            <video
                                src={selectedVideo}
                                controls
                                autoPlay
                                playsInline
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

