"use client"

import { useRef, Suspense, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html, useGLTF, useAnimations } from "@react-three/drei"
import * as THREE from "three"

interface AvatarViewerProps {
    landmarks_data: any[]
    isPlaying: boolean
    speed: number
    showBackground: boolean
    avatarId: number
}

// MediaPipe → Mixamo bone 매핑
const HAND_BONE_MAP = {
    left: {
        wrist: 'mixamorig:LeftHand',
        foreArm: 'mixamorig:LeftForeArm',
        arm: 'mixamorig:LeftArm',
        thumb: ['mixamorig:LeftHandThumb1', 'mixamorig:LeftHandThumb2', 'mixamorig:LeftHandThumb3', 'mixamorig:LeftHandThumb4'],
        index: ['mixamorig:LeftHandIndex1', 'mixamorig:LeftHandIndex2', 'mixamorig:LeftHandIndex3', 'mixamorig:LeftHandIndex4'],
        middle: ['mixamorig:LeftHandMiddle1', 'mixamorig:LeftHandMiddle2', 'mixamorig:LeftHandMiddle3', 'mixamorig:LeftHandMiddle4'],
        ring: ['mixamorig:LeftHandRing1', 'mixamorig:LeftHandRing2', 'mixamorig:LeftHandRing3', 'mixamorig:LeftHandRing4'],
        pinky: ['mixamorig:LeftHandPinky1', 'mixamorig:LeftHandPinky2', 'mixamorig:LeftHandPinky3', 'mixamorig:LeftHandPinky4'],
    },
    right: {
        wrist: 'mixamorig:RightHand',
        foreArm: 'mixamorig:RightForeArm',
        arm: 'mixamorig:RightArm',
        thumb: ['mixamorig:RightHandThumb1', 'mixamorig:RightHandThumb2', 'mixamorig:RightHandThumb3', 'mixamorig:RightHandThumb4'],
        index: ['mixamorig:RightHandIndex1', 'mixamorig:RightHandIndex2', 'mixamorig:RightHandIndex3', 'mixamorig:RightHandIndex4'],
        middle: ['mixamorig:RightHandMiddle1', 'mixamorig:RightHandMiddle2', 'mixamorig:RightHandMiddle3', 'mixamorig:RightHandMiddle4'],
        ring: ['mixamorig:RightHandRing1', 'mixamorig:RightHandRing2', 'mixamorig:RightHandRing3', 'mixamorig:RightHandRing4'],
        pinky: ['mixamorig:RightHandPinky1', 'mixamorig:RightHandPinky2', 'mixamorig:RightHandPinky3', 'mixamorig:RightHandPinky4'],
    }
}

// 스타일 설정
const AVATAR_STYLES = [
    { name: "basic", label: "기본", bgColor: "#f5f0eb" },
    { name: "professional", label: "전문가", bgColor: "#e8f4f8" },
    { name: "cute", label: "귀여움", bgColor: "#fff5f8" },
]

// =====================================================
// Michelle 캐릭터 with Bone Control
// =====================================================
function MichelleCharacter({ landmarks, isPlaying, speed }: { landmarks: any[], isPlaying: boolean, speed: number }) {
    const group = useRef<THREE.Group>(null)
    const { scene, animations } = useGLTF('/models/woman.glb')

    const [clonedScene, setClonedScene] = useState<THREE.Object3D | null>(null)
    const bonesRef = useRef<{ [key: string]: THREE.Bone }>({})
    const frameIndexRef = useRef(0)
    const lastTimeRef = useRef(0)
    const mixerRef = useRef<THREE.AnimationMixer | null>(null)

    // Scene 복제
    useEffect(() => {
        const clone = scene.clone(true)
        setClonedScene(clone)

        // Bone 찾기
        const bones: { [key: string]: THREE.Bone } = {}
        clone.traverse((child: any) => {
            if (child.isBone) {
                bones[child.name] = child
            }
        })
        bonesRef.current = bones
        console.log('✅ Bones found:', Object.keys(bones).length)
        console.log('📌 Sample bones:', Object.keys(bones).slice(0, 10))

        // 애니메이션 믹서 설정
        const mixer = new THREE.AnimationMixer(clone)
        mixerRef.current = mixer

        // TPose 찾아서 적용
        const tposeAnim = animations.find(a => a.name === 'TPose')
        if (tposeAnim) {
            const action = mixer.clipAction(tposeAnim)
            action.play()
            action.paused = true
            console.log('✅ TPose applied')
        }
    }, [scene, animations])

    // 프레임 업데이트
    useFrame((state, delta) => {
        if (!landmarks || landmarks.length === 0) return
        if (Object.keys(bonesRef.current).length === 0) return

        // 믹서 업데이트
        if (mixerRef.current) {
            mixerRef.current.update(delta)
        }

        const now = state.clock.getElapsedTime()
        if (isPlaying && now - lastTimeRef.current > (1 / 30) / speed) {
            frameIndexRef.current = (frameIndexRef.current + 1) % landmarks.length
            lastTimeRef.current = now
        } else if (!isPlaying) {
            frameIndexRef.current = 0
        }

        const currentLandmarks = landmarks[frameIndexRef.current]
        if (!currentLandmarks || currentLandmarks.length !== 21) return

        // 손 포즈 적용
        applyHandPose(currentLandmarks, 'right')
        applyHandPose(currentLandmarks, 'left', true)
    })

    const applyHandPose = (lm: number[][], hand: 'left' | 'right', mirror: boolean = false) => {
        const bones = bonesRef.current
        const map = HAND_BONE_MAP[hand]

        // 각 손가락 처리
        const fingers = [
            { name: 'thumb', indices: [1, 2, 3, 4], baseAngle: Math.PI * 0.1 },
            { name: 'index', indices: [5, 6, 7, 8], baseAngle: 0 },
            { name: 'middle', indices: [9, 10, 11, 12], baseAngle: 0 },
            { name: 'ring', indices: [13, 14, 15, 16], baseAngle: 0 },
            { name: 'pinky', indices: [17, 18, 19, 20], baseAngle: 0 },
        ]

        fingers.forEach(finger => {
            const boneNames = map[finger.name as keyof typeof map]
            if (!boneNames || !Array.isArray(boneNames)) return

            for (let i = 0; i < boneNames.length; i++) {
                const boneName = boneNames[i]
                const bone = bones[boneName]
                if (!bone) continue

                const currIdx = finger.indices[i]
                const prevIdx = i === 0 ? 0 : finger.indices[i - 1]
                const nextIdx = i < finger.indices.length - 1 ? finger.indices[i + 1] : currIdx

                const curr = lm[currIdx]
                const prev = lm[prevIdx]
                const next = lm[nextIdx]

                if (curr && prev && next) {
                    // 벡터 계산
                    const v1 = new THREE.Vector3(
                        curr[0] - prev[0],
                        curr[1] - prev[1],
                        (curr[2] || 0) - (prev[2] || 0)
                    ).normalize()

                    const v2 = new THREE.Vector3(
                        next[0] - curr[0],
                        next[1] - curr[1],
                        (next[2] || 0) - (curr[2] || 0)
                    ).normalize()

                    // 굽힘 각도 계산
                    let bendAngle = v1.angleTo(v2)

                    // 각도 스케일링 및 제한
                    bendAngle = Math.min(bendAngle * 2.5, Math.PI * 0.6)

                    // 엄지는 다른 축으로 회전
                    if (finger.name === 'thumb') {
                        bone.rotation.z = (mirror ? 1 : -1) * bendAngle * 0.8
                    } else {
                        // 다른 손가락은 X축으로 굽힘
                        bone.rotation.x = bendAngle
                    }
                }
            }
        })

        // 손목 회전 (전체적인 손 방향)
        const wristBone = bones[map.wrist]
        if (wristBone && lm[0] && lm[9]) {
            // 손바닥 방향 계산
            const palmDir = new THREE.Vector3(
                lm[9][0] - lm[0][0],
                lm[9][1] - lm[0][1],
                (lm[9][2] || 0) - (lm[0][2] || 0)
            ).normalize()

            // Y 위치에 따른 손목 굽힘
            const wristBend = (0.5 - lm[0][1]) * (mirror ? -1 : 1) * 0.5
            wristBone.rotation.x = wristBend
        }
    }

    if (!clonedScene) return null

    return (
        <group ref={group} position={[0, 0, 0]} scale={0.0085}>
            <primitive object={clonedScene} />
        </group>
    )
}

// =====================================================
// 메인 컴포넌트
// =====================================================
export default function AvatarViewer({ landmarks_data, isPlaying, speed, showBackground, avatarId }: AvatarViewerProps) {
    const style = AVATAR_STYLES[avatarId] || AVATAR_STYLES[0]

    return (
        <div className="w-full h-full rounded-xl overflow-hidden relative shadow-inner border border-slate-200 transition-colors duration-500" style={{ backgroundColor: style.bgColor }}>
            <Canvas camera={{ position: [0, 0.6, 1.3], fov: 45 }}>
                <ambientLight intensity={0.65} />
                <spotLight position={[1, 2, 2]} angle={0.5} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-1, 1, -1]} intensity={0.3} />
                <directionalLight position={[0, 2, 1]} intensity={0.5} />

                <Suspense fallback={null}>
                    <MichelleCharacter
                        landmarks={landmarks_data}
                        isPlaying={isPlaying}
                        speed={speed}
                    />
                </Suspense>

                <OrbitControls
                    autoRotate={false}
                    enableZoom
                    minDistance={0.5}
                    maxDistance={3}
                    target={[0, 0.5, 0]}
                />

                <gridHelper args={[2, 2, "#ddd", "#eee"]} position={[0, 0, 0]} />

                <Html position={[0, 0.05, 0]} center>
                    <div className="pointer-events-none opacity-40 text-[9px] font-bold tracking-widest uppercase text-amber-700">
                        {style.label}
                    </div>
                </Html>
            </Canvas>

            {(!landmarks_data || landmarks_data.length === 0) && isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="w-6 h-6 border-3 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-white font-mono text-xs">로딩 중...</p>
                    </div>
                </div>
            )}
        </div>
    )
}

useGLTF.preload('/models/woman.glb')
