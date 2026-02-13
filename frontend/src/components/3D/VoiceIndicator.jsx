import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * VoiceIndicator - Visual indicator for voice states (listening/processing/speaking)
 * Features: State-based colors, ripple effects, glow intensity based on audio
 */
const VoiceIndicator = ({
    state = 'idle', // 'idle' | 'listening' | 'processing' | 'speaking'
    audioLevel = 0,
    position = [0, -2.5, 0]
}) => {
    const groupRef = useRef()
    const rippleRefs = useRef([])
    const coreRef = useRef()
    const pulseRef = useRef()

    // State configurations
    const stateConfig = {
        idle: { color: '#333355', coreColor: '#555588', pulseSpeed: 0.5, intensity: 0.3 },
        listening: { color: '#00aaff', coreColor: '#00ddff', pulseSpeed: 2, intensity: 0.8 },
        processing: { color: '#ff9900', coreColor: '#ffcc00', pulseSpeed: 4, intensity: 0.9 },
        speaking: { color: '#00ff88', coreColor: '#88ffcc', pulseSpeed: 3, intensity: 1.0 }
    }

    const config = stateConfig[state] || stateConfig.idle

    useFrame((state) => {
        const time = state.clock.elapsedTime
        const isActive = state !== 'idle'

        // Rotate group subtly
        if (groupRef.current) {
            groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.1
        }

        // Core pulse
        if (coreRef.current) {
            const scale = 1 + Math.sin(time * config.pulseSpeed) * 0.15 * config.intensity
            const audioScale = 1 + audioLevel * 0.2
            coreRef.current.scale.setScalar(scale * audioScale)
        }

        // Outer pulse ring
        if (pulseRef.current) {
            const scale = 1 + Math.sin(time * config.pulseSpeed * 0.7) * 0.1
            pulseRef.current.scale.setScalar(scale)
            pulseRef.current.material.opacity = 0.2 + Math.sin(time * 2) * 0.1
        }

        // Animated ripples for listening state
        rippleRefs.current.forEach((ripple, i) => {
            if (ripple && state === 'listening') {
                const rippleTime = (time * 0.5 + i * 0.3) % 1
                const scale = 1 + rippleTime * 1.5
                const opacity = (1 - rippleTime) * 0.3
                ripple.scale.setScalar(scale)
                ripple.material.opacity = opacity
            } else if (ripple) {
                ripple.material.opacity = 0
            }
        })
    })

    return (
        <group ref={groupRef} position={position}>
            {/* Base platform */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.4, 0.6, 32]} />
                <meshBasicMaterial
                    color={config.color}
                    transparent
                    opacity={0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Core indicator */}
            <mesh ref={coreRef}>
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshBasicMaterial color={config.coreColor} />
            </mesh>

            {/* Core glow */}
            <mesh>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshBasicMaterial
                    color={config.coreColor}
                    transparent
                    opacity={0.4}
                />
            </mesh>

            {/* Outer pulse ring */}
            <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.55, 32]} />
                <meshBasicMaterial
                    color={config.color}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Ripple effects (for listening state) */}
            {[0, 1, 2].map((i) => (
                <mesh
                    key={i}
                    ref={el => rippleRefs.current[i] = el}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <ringGeometry args={[0.5, 0.52, 32]} />
                    <meshBasicMaterial
                        color="#00ddff"
                        transparent
                        opacity={0}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* State label rings */}
            {state === 'processing' && (
                <group>
                    {[0, 1, 2].map((i) => (
                        <mesh
                            key={i}
                            rotation={[-Math.PI / 2, 0, (Math.PI * 2 / 3) * i]}
                        >
                            <ringGeometry args={[0.55, 0.58, 32, 1, 0, Math.PI / 6]} />
                            <meshBasicMaterial
                                color="#ffcc00"
                                transparent
                                opacity={0.8}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    ))}
                </group>
            )}

            {/* Point light for glow effect */}
            <pointLight
                color={config.coreColor}
                intensity={config.intensity * (1 + audioLevel)}
                distance={2}
                decay={2}
            />
        </group>
    )
}

export default VoiceIndicator
