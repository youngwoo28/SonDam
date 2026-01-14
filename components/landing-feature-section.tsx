"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

interface LandingFeatureSectionProps {
    onNavigate: (tab: "dictionary" | "translator" | "avatar" | "community") => void
}

export default function LandingFeatureSection({ onNavigate }: LandingFeatureSectionProps) {
    return (
        <div className="flex flex-col space-y-32 py-24">

            {/* Section A: Dictionary (Text Left / Image Right) */}
            <section id="landing-dictionary" className="container px-4 mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24">
                <div className="flex-1 space-y-6 text-left">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide mb-2">
                        수어 사전
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                        한 번 검색으로<br />평생 기억하세요
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                        방대한 한국 수어 데이터베이스에서 원하는 단어를 쉽고 빠르게 찾아보세요.
                        정확한 동작 영상과 함께 의미를 학습할 수 있습니다.
                    </p>
                    <div className="pt-4">
                        <Button
                            size="lg"
                            onClick={() => onNavigate("dictionary")}
                            className="h-14 px-8 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            사전 체험하기
                        </Button>
                    </div>
                </div>
                <div className="flex-1 w-full relative">
                    <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-2xl border border-border/20 group bg-white">
                        <Image
                            src="/hero-image.png"
                            alt="Dictionary UI"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Soft Glare overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                    </div>
                    {/* Decorative Blob */}
                    <div className="absolute -z-10 -bottom-10 -right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                </div>
            </section>


            {/* Section B: AI Translation (Image Left / Text Right) */}
            <section id="landing-translator" className="container px-4 mx-auto flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-24 bg-gray-50/50 py-24 rounded-[3rem]">
                <div className="flex-1 w-full relative">
                    <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-2xl border border-border/20 group bg-white p-8">
                        <Image
                            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80"
                            alt="AI Translation"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="absolute -z-10 -top-10 -left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
                </div>
                <div className="flex-1 space-y-6 text-left">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold tracking-wide mb-2">
                        AI 실시간 번역
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                        당신의 손이<br />언어가 됩니다
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                        카메라에 손을 비추기만 하세요.
                        AI가 실시간으로 수어를 인식하여 텍스트로 통역해드립니다.
                        소통의 장벽을 허물어보세요.
                    </p>
                    <div className="pt-4">
                        <Button
                            size="lg"
                            variant="secondary"
                            onClick={() => onNavigate("translator")}
                            className="h-14 px-8 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-white"
                        >
                            AI 번역 시작하기
                        </Button>
                    </div>
                </div>
            </section>


            {/* Section C: 3D Avatar (Text Left / Image Right) */}
            <section id="landing-avatar" className="container px-4 mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24">
                <div className="flex-1 space-y-6 text-left">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold tracking-wide mb-2">
                        3D 아바타
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                        3D 튜터와 함께하는<br />생생한 학습
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                        평면적인 영상으로는 알기 힘든 손동작의 각도.
                        360도 회전 가능한 3D 아바타 튜터가 정확한 손 모양을 알려드립니다.
                    </p>
                    <div className="pt-4">
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => onNavigate("avatar")}
                            className="h-14 px-8 rounded-full text-lg border-2 hover:bg-muted transition-all duration-300"
                        >
                            아바타 만나보기
                        </Button>
                    </div>
                </div>
                <div className="flex-1 w-full relative">
                    <div className="relative aspect-square w-full max-w-[500px] mx-auto rounded-full bg-gradient-to-br from-pink-100 to-orange-100 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-8 border-white group">
                        <Image
                            src="/3d-avatar-sign-language.jpg"
                            alt="3D Avatar Character"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    </div>
                    <div className="absolute -z-10 bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[50%] bg-gradient-to-t from-gray-100 to-transparent blur-3xl" />
                </div>
            </section>

            {/* Section D: Community (Image Left / Text Right) */}
            <section id="landing-community" className="container px-4 mx-auto flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-24 bg-primary/5 py-24 rounded-[3rem]">
                <div className="flex-1 w-full relative">
                    <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-2xl border border-border/20 group">
                        <Image
                            src="/mockups/community-ui.png"
                            alt="Community UI"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>
                <div className="flex-1 space-y-6 text-left">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-border text-primary text-sm font-semibold tracking-wide mb-2">
                        커뮤니티
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                        함께 배우고<br />성장하는 공간
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                        혼자 배우기 어렵다면 커뮤니티에서 함께하세요.
                        질문하고 답하며 서로의 성장을 돕는 따뜻한 소통의 장이 열려있습니다.
                    </p>
                    <div className="pt-4">
                        <Button
                            size="lg"
                            onClick={() => onNavigate("community")}
                            className="h-14 px-8 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            커뮤니티 참여하기
                        </Button>
                    </div>
                </div>
            </section>

        </div>
    )
}
