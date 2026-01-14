"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"

export default function CameraTest() {
    const [isActive, setIsActive] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const startCamera = async () => {
        try {
            console.log('🎥 Requesting camera...')
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 640, height: 480 },
                audio: false
            })

            console.log('✅ Camera stream obtained:', stream)

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                streamRef.current = stream
                setIsActive(true)
                console.log('✅ Video element updated')
            }
        } catch (error) {
            console.error('❌ Camera error:', error)
            alert(`카메라 오류: ${error}`)
        }
    }

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setIsActive(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
            <div className="max-w-2xl w-full space-y-4">
                <h1 className="text-2xl font-bold">카메라 테스트</h1>

                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex gap-4">
                    {!isActive ? (
                        <Button onClick={startCamera}>카메라 시작</Button>
                    ) : (
                        <Button onClick={stopCamera} variant="destructive">카메라 중지</Button>
                    )}
                </div>

                <div className="text-sm text-gray-600">
                    <p>F12를 눌러 콘솔을 확인하세요</p>
                </div>
            </div>
        </div>
    )
}
