"use client"

import Image from "next/image"

const FEATURES = [
    {
        title: "수어 사전",
        description: "가장 정확한 한국어 수어 데이터베이스",
        image: "/features/dict-icon.png",
        delay: 0.1,
        tab: "dictionary" as const
    },
    {
        title: "AI 실시간 번역",
        description: "카메라로 수어를 인식하여 텍스트로 변환",
        image: "/features/trans-icon.png",
        delay: 0.2,
        tab: "translator" as const
    },
    {
        title: "3D 아바타",
        description: "정교한 3D 아바타가 알려주는 수어 동작",
        image: "/features/avatar-icon.png",
        delay: 0.3,
        tab: "avatar" as const
    },
    {
        title: "커뮤니티",
        description: "함께 배우고 소통하는 수어 학습 공간",
        image: "/features/comm-icon.png",
        delay: 0.4,
        tab: "community" as const
    }
]

interface FeatureSectionProps {
    onNavigate: (tab: "dictionary" | "translator" | "avatar" | "community") => void
    onScrollToDictionary?: () => void
}

export default function FeatureSection({ onNavigate, onScrollToDictionary }: FeatureSectionProps) {
    return (
        <section className="py-24 bg-white">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
                        손담의 핵심 기능
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        누구나 쉽게 수어를 배울 수 있도록 돕는 특별한 기능들을 만나보세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {FEATURES.map((feature, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                // Scroll to the specific landing section with offset for fixed header
                                const sectionId = `landing-${feature.tab === "translator" ? "translator" : feature.tab === "avatar" ? "avatar" : feature.tab === "community" ? "community" : "dictionary"}`;
                                const element = document.getElementById(sectionId);
                                if (element) {
                                    const headerOffset = 80; // Fixed header height + padding
                                    const elementPosition = element.getBoundingClientRect().top;
                                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                                    window.scrollTo({
                                        top: offsetPosition,
                                        behavior: "smooth"
                                    });
                                }
                            }}
                            className="group relative flex flex-col items-center text-center p-6 rounded-3xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 transition-all duration-300 hover:shadow-2xl cursor-pointer"
                        >
                            <div className="relative w-48 h-48 mb-6 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-2">
                                {/* Image Container with Hover Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <Image
                                    src={feature.image}
                                    alt={feature.title}
                                    fill
                                    className="object-contain drop-shadow-sm"
                                />
                            </div>

                            <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors duration-300">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
