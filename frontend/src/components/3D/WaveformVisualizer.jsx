import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * WaveformVisualizer - Audio-reactive circular waveform
 * Features: Frequency bars arranged in circle, amplitude animation, glow effects
 */
const WaveformVisualizer = ({
    radius = 2.5,
    barCount = 64,
    isListening = false,
    audioLevel = 0,
    frequencyData = null // Optional: actual audio frequency data
}) => {
    const groupRef = useRef()
    const barsRef = useRef([])

    // Generate simulated frequency data if not provided
    const simulatedData = useMemo(() => {
        return Array.from({ length: barCount }, (_, i) => ({
            baseHeight: 0.1 + Math.random() * 0.1,
            phase: (i / barCount) * Math.PI * 4,
            frequency: 1 + Math.random() * 2
        }))
    }, [barCount])

    useFrame((state) => {
        const time = state.clock.elapsedTime

        // Slow rotation
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.2
        }

        // Animate bars
        barsRef.current.forEach((bar, i) => {
            if (bar) {
                const data = simulatedData[i]

                // Use provided frequency data or simulate
                let height
                if (frequencyData && frequencyData[i] !== undefined) {
                    height = (frequencyData[i] / 255) * 0.8 + 0.1
                } else if (isListening) {
                    // Simulated active waveform
                    const wave1 = Math.sin(time * data.frequency * 3 + data.phase) * 0.5 + 0.5
                    const wave2 = Math.sin(time * 5 + i * 0.2) * 0.3 + 0.7
                    const audioPulse = audioLevel * 0.5
                    height = (wave1 * wave2 * 0.6 + audioPulse + data.baseHeight)
                } else {
                    // Idle state - subtle breathing
                    height = data.baseHeight + Math.sin(time * 0.5 + data.phase) * 0.02
                }

                bar.scale.y = Math.max(0.05, height)
                bar.position.y = height * 0.5 // Center the bar

                // Color intensity based on height
                if (bar.material) {
                    const intensity = isListening ? 0.5 + height * 0.5 : 0.3
                    bar.material.opacity = intensity
                }
            }
        })
    })

    return (
        <group ref={groupRef}>
            {Array.from({ length: barCount }, (_, i) => {
                const angle = (i / barCount) * Math.PI * 2
                const x = Math.cos(angle) * radius
                const z = Math.sin(angle) * radius

                return (
                    <mesh
                        key={i}
                        ref={el => barsRef.current[i] = el}
                        position={[x, 0, z]}
                        rotation={[0, -angle + Math.PI / 2, 0]}
                    >
                        <boxGeometry args={[0.08, 1, 0.02]} />
                        <meshBasicMaterial
                            color={isListening ? '#00ffff' : '#0066aa'}
                            transparent
                            opacity={0.5}
                        />
                    </mesh>
                )
            })}

            {/* Base ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radius - 0.1, radius + 0.1, 64]} />
                <meshBasicMaterial
                    color="#003366"
                    transparent
                    opacity={0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Glow ring when active */}
            {isListening && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[radius - 0.2, radius + 0.2, 64]} />
                    <meshBasicMaterial
                        color="#00ffff"
                        transparent
                        opacity={0.2 + audioLevel * 0.3}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </group>
    )
}

export default WaveformVisualizer
