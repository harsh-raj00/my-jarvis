import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * RotatingRings - Multiple concentric rotating rings around the core
 * Features: Different rotation speeds, arc segments, glowing materials
 */
const RotatingRings = ({
    count = 5,
    baseRadius = 2,
    isActive = true,
    audioLevel = 0
}) => {
    const ringsRef = useRef([])
    const arcSegmentsRef = useRef([])

    // Ring configurations
    const rings = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            radius: baseRadius + i * 0.4,
            thickness: 0.03 - i * 0.003,
            rotationSpeed: (1 - i * 0.15) * (i % 2 === 0 ? 1 : -1),
            tilt: (Math.PI / 12) * (i % 3 - 1),
            color: `hsl(${195 + i * 10}, 100%, ${60 - i * 5}%)`,
            opacity: 0.7 - i * 0.08,
            segments: 3 + (i % 3) // Arc segments per ring
        }))
    }, [count, baseRadius])

    // Arc segment configurations for each ring
    const arcConfigs = useMemo(() => {
        return rings.map((ring, ringIndex) =>
            Array.from({ length: ring.segments }, (_, i) => ({
                startAngle: (Math.PI * 2 / ring.segments) * i + Math.PI / ring.segments,
                length: Math.PI / (ring.segments + 2),
                offset: ringIndex * 0.5
            }))
        )
    }, [rings])

    useFrame((state) => {
        const time = state.clock.elapsedTime

        ringsRef.current.forEach((ring, i) => {
            if (ring) {
                // Rotation with audio pulse
                const speed = rings[i].rotationSpeed * (isActive ? 1 : 0.3)
                const audioPulse = isActive ? 1 + audioLevel * 0.3 : 1
                ring.rotation.z = time * speed * audioPulse

                // Subtle wobble
                ring.rotation.x = rings[i].tilt + Math.sin(time * 0.5 + i) * 0.02
            }
        })

        // Animate arc segments
        arcSegmentsRef.current.forEach((segment, i) => {
            if (segment) {
                const pulse = isActive
                    ? 1 + Math.sin(time * 3 + i * 0.5) * 0.1
                    : 1
                segment.scale.setScalar(pulse)
            }
        })
    })

    let arcIndex = 0

    return (
        <group>
            {rings.map((ring, i) => (
                <group key={i} ref={el => ringsRef.current[i] = el}>
                    {/* Main ring */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[ring.radius, ring.thickness, 16, 128]} />
                        <meshBasicMaterial
                            color={ring.color}
                            transparent
                            opacity={ring.opacity}
                        />
                    </mesh>

                    {/* Glow ring */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[ring.radius, ring.thickness * 3, 8, 64]} />
                        <meshBasicMaterial
                            color={ring.color}
                            transparent
                            opacity={ring.opacity * 0.3}
                        />
                    </mesh>

                    {/* Arc segments on ring */}
                    {arcConfigs[i].map((arc, j) => {
                        const currentIndex = arcIndex++
                        return (
                            <mesh
                                key={j}
                                ref={el => arcSegmentsRef.current[currentIndex] = el}
                                rotation={[Math.PI / 2, 0, arc.startAngle]}
                            >
                                <ringGeometry
                                    args={[
                                        ring.radius - ring.thickness * 2,
                                        ring.radius + ring.thickness * 2,
                                        32, 1, 0, arc.length
                                    ]}
                                />
                                <meshBasicMaterial
                                    color="#00ffff"
                                    transparent
                                    opacity={0.8}
                                    side={THREE.DoubleSide}
                                />
                            </mesh>
                        )
                    })}
                </group>
            ))}
        </group>
    )
}

export default RotatingRings
