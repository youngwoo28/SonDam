'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'

// MediaPipe를 동적으로 로드
const MediaPipeHands = dynamic(
    () => import('@mediapipe/hands').then((mod) => mod.Hands),
    { ssr: false }
)

export default function ContributePage() {
    const [selectedSign, setSelectedSign] = useState('안녕')
    const [isRecording, setIsRecording] = useState(false)
    const [contributionCount, setContributionCount] = useState(0)
    const [status, setStatus] = useState('대기 중')

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const recordedDataRef = useRef<any[]>([])
    const handsRef = useRef<any>(null)

    const signs = [
        '안녕', '감사', '사랑', '도움', '괜찮다',
        '미안', '좋다', '나쁘다', '배고프다', '학생'
    ]

    useEffect(() => {
        // MediaPipe 초기화
        const initializeMediaPipe = async () => {
            if (typeof window === 'undefined') return

            const { Hands } = await import('@mediapipe/hands')
            const { Camera } = await import('@mediapipe/camera_utils')

            const hands = new Hands({
                locateFile: (file: string) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            })

            hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            })

            hands.onResults((results: any) => {
                if (!canvasRef.current || !videoRef.current) return

                const canvas = canvasRef.current
                const ctx = canvas.getContext('2d')
                if (!ctx) return

                canvas.width = videoRef.current.videoWidth
                canvas.height = videoRef.current.videoHeight

                ctx.clearRect(0, 0, canvas.width, canvas.height)

                if (results.multiHandLandmarks) {
                    for (const landmarks of results.multiHandLandmarks) {
                        drawConnectors(ctx, landmarks, canvas.width, canvas.height)
                        drawLandmarks(ctx, landmarks, canvas.width, canvas.height)
                    }

                    // 녹화 중이면 데이터 저장
                    if (isRecording && results.multiHandLandmarks.length > 0) {
                        const frameData: any = { hands: [] }

                        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                            const landmarksArray = results.multiHandLandmarks[i].map((p: any) => [p.x, p.y, p.z])
                            frameData.hands.push(landmarksArray)
                        }

                        recordedDataRef.current.push(frameData)
                    }
                }
            })

            handsRef.current = hands

            // 카메라 시작
            if (videoRef.current) {
                const camera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        if (videoRef.current) {
                            await hands.send({ image: videoRef.current })
                        }
                    },
                    width: 640,
                    height: 480
                })
                camera.start()
            }
        }

        initializeMediaPipe()
    }, [isRecording])

    const drawConnectors = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
        ]

        ctx.strokeStyle = '#00FF00'
        ctx.lineWidth = 2

        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start]
            const endPoint = landmarks[end]
            ctx.beginPath()
            ctx.moveTo(startPoint.x * width, startPoint.y * height)
            ctx.lineTo(endPoint.x * width, endPoint.y * height)
            ctx.stroke()
        })
    }

    const drawLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
        landmarks.forEach((landmark: any) => {
            ctx.fillStyle = '#FF0000'
            ctx.beginPath()
            ctx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI)
            ctx.fill()
        })
    }

    const handleRecord = async () => {
        setIsRecording(true)
        recordedDataRef.current = []
        setStatus(`"${selectedSign}" 녹화 중... (3초)`)

        setTimeout(async () => {
            setIsRecording(false)

            if (recordedDataRef.current.length > 0) {
                // 서버로 전송
                try {
                    const response = await fetch('http://172.16.101.26:8000/api/contribute', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sign: selectedSign,
                            landmarks: recordedDataRef.current
                        })
                    })

                    if (response.ok) {
                        const data = await response.json()
                        setContributionCount(prev => prev + 1)
                        setStatus(`✅ ${data.message} (${recordedDataRef.current.length} 프레임)`)
                    } else {
                        setStatus('❌ 저장 실패. 다시 시도해주세요.')
                    }
                } catch (error) {
                    console.error('Contribution error:', error)
                    setStatus('❌ 서버 연결 실패')
                }
            } else {
                setStatus('❌ 손이 감지되지 않았습니다. 다시 시도하세요.')
            }
        }, 3000)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
                    <h1 className="text-4xl font-bold text-center mb-4">
                        🙏 정확도 개선에 참여하기
                    </h1>
                    <p className="text-center text-gray-600 mb-8">
                        AI 모델 학습을 위한 수어 데이터를 기여해주세요. 여러분의 참여로 SonDam이 더 정확해집니다!
                    </p>

                    {/* 수어 선택 */}
                    <div className="mb-8">
                        <label className="block text-lg font-semibold mb-3">수어 선택:</label>
                        <select
                            value={selectedSign}
                            onChange={(e) => setSelectedSign(e.target.value)}
                            className="w-full p-4 border-2 border-purple-300 rounded-lg text-lg focus:outline-none focus:border-purple-500"
                        >
                            {signs.map(sign => (
                                <option key={sign} value={sign}>{sign}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* 참고 영상 */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4">👀 참고 영상</h3>
                            <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video">
                                <video
                                    src={`https://sondam-videos-2025.s3.ap-northeast-2.amazonaws.com/videos/${selectedSign}.mp4`}
                                    controls
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                ☝️ 위 영상을 보고 오른쪽에서 따라해주세요
                            </p>
                        </div>

                        {/* 녹화 영역 */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4">📹 녹화하기</h3>

                            {/* 카메라 권한 안내 */}
                            <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-sm text-yellow-800">
                                    💡 <strong>카메라 권한 필요:</strong> 브라우저에서 카메라 접근을 허용해주세요!
                                </p>
                            </div>
                            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]"
                                />
                            </div>

                            <button
                                onClick={handleRecord}
                                disabled={isRecording}
                                className={`w-full mt-4 py-4 rounded-lg font-semibold text-lg transition-all ${isRecording
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg'
                                    }`}
                            >
                                {isRecording ? '🔴 녹화 중...' : '📹 녹화 시작 (3초)'}
                            </button>
                        </div>
                    </div>

                    {/* 상태 표시 */}
                    <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">상태:</span>
                            <span className="text-blue-600 font-semibold">{status}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">오늘의 기여:</span>
                            <span className="text-purple-600 font-bold text-xl">{contributionCount}개</span>
                        </div>
                    </div>

                    {/* 안내 */}
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-semibold mb-2">💡 팁:</h4>
                        <ul className="text-sm space-y-1 text-gray-700">
                            <li>• 손이 카메라에 명확히 보이도록 해주세요</li>
                            <li>• 참고 영상을 먼저 보고 동작을 익힌 후 녹화하세요</li>
                            <li>• 같은 수어를 여러 번 녹화해도 좋습니다 (다양성 ↑)</li>
                            <li>• 모든 데이터는 AI 모델 학습에만 사용됩니다</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
