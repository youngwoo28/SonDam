"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, CameraOff, Sparkles, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// MediaPipe types
type Results = any
type Hands = any

export default function TranslatorPage() {
  // State management
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [recognizedText, setRecognizedText] = useState("")
  const [accumulatedSentence, setAccumulatedSentence] = useState("")
  const [lastWord, setLastWord] = useState("")
  const [confidence, setConfidence] = useState(0)

  // Refs for camera and canvas
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handsRef = useRef<Hands | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const lastRecognitionTime = useRef<number>(0)
  const recognitionInterval = 500 // Recognize every 500ms (2 times per second)
  // Buffer to collect 30 frames of landmarks before sending to backend
  const frameSeqRef = useRef<number[][][]>([])

  // Initialize MediaPipe Hands
  useEffect(() => {
    // Auto-start camera logic if needed, or wait for user interaction
    // Currently we let user click 'Start Camera' to avoid permission issues on load

    return () => {
      stopCamera()
    }
  }, [])

  // Start camera when isCameraActive becomes true
  useEffect(() => {
    if (isCameraActive) {
      initializeMediaPipe()
    }
  }, [isCameraActive])

  const initializeMediaPipe = async () => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      console.log('Requesting camera access...')

      // Check if browser supports mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "이 브라우저에서는 카메라 접근이 지원되지 않습니다.\n" +
          "보안상의 이유로 HTTPS 환경이나 localhost에서만 카메라를 사용할 수 있습니다."
        )
      }

      // Get camera stream - force front camera for laptops
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user" // Front camera
        },
        audio: false,
      })

      console.log('Camera stream obtained:', stream)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream

        // Wait for metadata to load before playing
        videoRef.current.onloadedmetadata = async () => {
          try {
            if (videoRef.current) {
              await videoRef.current.play()
              console.log('✅ Video playing successfully!')
            }
          } catch (playError) {
            console.error('❌ Error playing video:', playError)
          }
        }
      }

      console.log('Loading MediaPipe Hands...')
      // Dynamically import MediaPipe Hands
      const { Hands } = await import("@mediapipe/hands")

      // Initialize MediaPipe Hands
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        },
      })

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      hands.onResults(onResults)
      handsRef.current = hands

      console.log('MediaPipe initialized, starting frame processing...')
      // Start processing frames
      processFrame()
    } catch (error) {
      console.error("Error initializing MediaPipe:", error)
      alert(`카메라를 시작할 수 없습니다: ${error instanceof Error ? error.message : String(error)}`)
      setIsCameraActive(false)
    }
  }

  const onResults = (results: Results) => {
    if (!canvasRef.current) return

    const canvasCtx = canvasRef.current.getContext("2d")
    if (!canvasCtx) return

    // Clear canvas
    canvasCtx.save()
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Draw hand landmarks
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks)
        drawLandmarks(canvasCtx, landmarks)
      }

      // Collect landmarks for the buffer (EVERY FRAME)
      if (results.multiHandLandmarks.length > 0) {
        const firstHand = results.multiHandLandmarks[0]
        const flat = firstHand.map((pt: any) => [pt.x, pt.y, pt.z || 0])

        const seq = frameSeqRef.current
        seq.push(flat)
        if (seq.length > 30) seq.shift()
      }

      // Throttle API calls - only recognize every 500ms
      const now = Date.now()
      if (now - lastRecognitionTime.current > recognitionInterval) {
        lastRecognitionTime.current = now
        recognizeSign()
      }
    }

    canvasCtx.restore()
  }

  const drawConnectors = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
    ]

    ctx.strokeStyle = "#00FF00"
    ctx.lineWidth = 2

    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start]
      const endPoint = landmarks[end]

      ctx.beginPath()
      ctx.moveTo(startPoint.x * canvasRef.current!.width, startPoint.y * canvasRef.current!.height)
      ctx.lineTo(endPoint.x * canvasRef.current!.width, endPoint.y * canvasRef.current!.height)
      ctx.stroke()
    })
  }

  const drawLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    landmarks.forEach((landmark) => {
      ctx.fillStyle = "#FF0000"
      ctx.beginPath()
      ctx.arc(
        landmark.x * canvasRef.current!.width,
        landmark.y * canvasRef.current!.height,
        5,
        0,
        2 * Math.PI
      )
      ctx.fill()
    })
  }

  const processFrame = async () => {
    if (!videoRef.current || !handsRef.current || !isCameraActive) return

    try {
      await handsRef.current.send({ image: videoRef.current })
    } catch (error) {
      console.error("Error processing frame:", error)
    }

    // Continue processing
    if (isCameraActive) {
      animationRef.current = requestAnimationFrame(processFrame)
    }
  }

  const recognizeSign = async () => {
    try {
      // ---- FRAME BUFFER LOGIC ----
      // Use a ref to keep the sequence across renders
      const seq = frameSeqRef.current

      // When we have a full sequence, send it to the backend
      if (seq.length === 30) {
        // Determine API URL based on current hostname
        const apiBaseUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:8000'
          : `http://${window.location.hostname}:8000`

        const response = await fetch(`${apiBaseUrl}/api/recognize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ landmarks: seq })
        })
        if (!response.ok) {
          throw new Error('Recognition API error')
        }
        const result = await response.json()
        // Update UI
        setRecognizedText(result.sign)
        setConfidence(result.confidence)
        // Accumulate words if new and confidence is high enough
        if (result.sign && result.sign !== lastWord && result.confidence > 0.7) {
          setAccumulatedSentence(prev => prev ? `${prev} ${result.sign}` : result.sign)
          setLastWord(result.sign)
        }
        console.log(`Recognized: ${result.sign} (${(result.confidence * 100).toFixed(1)}%)`)
      }
    } catch (error) {
      console.error('Recognition error:', error)
    }
  }

  const startCamera = () => {
    setIsCameraActive(true)
  }

  const stopCamera = () => {
    // Stop animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Close MediaPipe Hands
    if (handsRef.current) {
      handsRef.current.close()
      handsRef.current = null
    }

    setIsCameraActive(false)
    setRecognizedText("")
    setConfidence(0)
  }



  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6 sm:pt-24 sm:pb-8 lg:pt-28 lg:pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chart-2/10 border border-chart-2/20 mb-2">
            <Sparkles className="w-4 h-4 text-chart-2" />
            <span className="text-sm font-semibold text-chart-2">AI 실시간 번역</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
            <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              실시간으로 수어를 번역합니다
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            카메라를 켜고 수어를 동작하면 AI가 텍스트로 번역해드립니다
          </p>
        </div>

        {/* Camera & Result Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Camera Card */}
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                카메라 입력
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video rounded-xl border-2 border-border overflow-hidden bg-black">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                      autoPlay
                      playsInline
                      muted
                      onLoadedMetadata={() => {
                        if (videoRef.current) {
                          videoRef.current.play().catch(e => console.error("Video play error:", e));
                        }
                      }}
                    />
                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={480}
                      className="absolute inset-0 w-full h-full transform scale-x-[-1]"
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-secondary/30">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <CameraOff className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-center">
                      카메라를 시작하여
                      <br />
                      수어를 인식하세요
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                {isCameraActive ? (
                  <Button onClick={stopCamera} variant="destructive" className="gap-2 rounded-xl">
                    <CameraOff className="w-4 h-4" />
                    카메라 중지
                  </Button>
                ) : (
                  <Button onClick={startCamera} className="gap-2 rounded-xl">
                    <Camera className="w-4 h-4" />
                    카메라 시작
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card className="border-2 shadow-xl bg-gradient-to-br from-card to-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-chart-2" />
                인식 결과
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recognizedText ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-xl bg-background border-2 text-center">
                    <p className="text-4xl font-bold mb-2">{recognizedText}</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="w-full max-w-xs bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${confidence * 100}%` }}
                        />
                      </div>
                      <span>{Math.round(confidence * 100)}%</span>
                    </div>
                  </div>

                  {accumulatedSentence && (
                    <div className="p-4 rounded-xl bg-secondary/50 border text-center">
                      <p className="text-sm text-muted-foreground mb-1">누적된 문장</p>
                      <p className="text-xl font-medium">{accumulatedSentence}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="min-h-[300px] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 bg-background/50">
                  <div className="w-20 h-20 rounded-full bg-chart-2/10 flex items-center justify-center">
                    <Video className="w-10 h-10 text-chart-2" />
                  </div>
                  <p className="text-muted-foreground text-center">
                    카메라를 시작하면
                    <br />
                    인식 결과가 표시됩니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 gap-4 pt-4">
          <Card className="border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold">실시간 인식</h3>
              <p className="text-sm text-muted-foreground">카메라로 수어를 즉시 인식합니다</p>
            </CardContent>
          </Card>
          <Card className="border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-chart-2/10 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="font-bold">AI 분석</h3>
              <p className="text-sm text-muted-foreground">정확도 높은 최신 AI 모델 사용</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
