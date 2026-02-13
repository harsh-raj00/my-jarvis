import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createEnergyMaterial } from './shaders/energyShader'

/**
 * ArcReactor - Iron Man arc reactor visualization
 * Features: Concentric glowing rings, energy pulses, central core
 */
const ArcReactor = ({
    size = 2,
    isActive = true,
    powerLevel = 1.0,
    position = [0, 0, 0]
}) => {
    const groupRef = useRef()
    const ringsRef = useRef([])
    const coreRef = useRef()

    // Energy material for the core plane
    const energyMaterial = useMemo(() => {
        return createEnergyMaterial({
            coreColor: new THREE.Color(0x00ffff),
            edgeColor: new THREE.Color(0x0066ff),
            intensity: 1.5,
            flowSpeed: 3.0,
            ringCount: 6.0
        })
    }, [])

    // Ring configurations
    const rings = useMemo(() => [
        { radius: size * 0.3, width: 0.08, speed: 2, color: '#00ffff' },
        { radius: size * 0.45, width: 0.06, speed: -1.5, color: '#0088ff' },
        { radius: size * 0.6, width: 0.04, speed: 1, color: '#00aaff' },
        { radius: size * 0.75, width: 0.03, speed: -0.8, color: '#0066ff' },
        { radius: size * 0.9, width: 0.02, speed: 0.5, color: '#0044ff' },
    ], [size])

    useFrame((state) => {
        const time = state.clock.elapsedTime

        // Update energy shader
        if (energyMaterial.uniforms) {
            energyMaterial.uniforms.uTime.value = time
            energyMaterial.uniforms.uIntensity.value = isActive ? 1.5 * powerLevel : 0.5
        }

        // Rotate main group slowly
        if (groupRef.current) {
            groupRef.current.rotation.z = time * 0.1
        }

        // Animate rings
        ringsRef.current.forEach((ring, i) => {
            if (ring) {
                ring.rotation.z = time * rings[i].speed

                // Pulse effect
                const pulse = isActive
                    ? 1 + Math.sin(time * 3 + i * 0.5) * 0.1 * powerLevel
                    : 1
                ring.scale.setScalar(pulse)
            }
        })

        // Core pulse
        if (coreRef.current) {
            const corePulse = isActive
                ? 1 + Math.sin(time * 4) * 0.15 * powerLevel
                : 0.9
            coreRef.current.scale.setScalar(corePulse)
        }
    })

    return (
        <group ref={groupRef} position={position}>
            {/* Energy core plane */}
            <mesh ref={coreRef} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[size * 0.25, 64]} />
                <primitive object={energyMaterial} attach="material" />
            </mesh>

            {/* Center bright point */}
            <mesh>
                <sphereGeometry args={[size * 0.05, 16, 16]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Concentric rings */}
            {rings.map((ring, i) => (
                <mesh
                    key={i}
                    ref={el => ringsRef.current[i] = el}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <ringGeometry args={[ring.radius - ring.width, ring.radius + ring.width, 64]} />
                    <meshBasicMaterial
                        color={ring.color}
                        transparent
                        opacity={isActive ? 0.8 - i * 0.1 : 0.3}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Arc segments on outer ring */}
            {[0, 1, 2, 3].map((i) => (
                <mesh
                    key={`arc-${i}`}
                    rotation={[-Math.PI / 2, 0, (Math.PI / 2) * i]}
                >
                    <ringGeometry
                        args={[size * 0.92, size * 0.98, 32, 1, 0, Math.PI / 4]}
                    />
                    <meshBasicMaterial
                        color="#00ffff"
                        transparent
                        opacity={isActive ? 0.9 : 0.4}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Outer glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[size * 0.95, size * 1.1, 64]} />
                <meshBasicMaterial
                    color="#0088ff"
                    transparent
                    opacity={isActive ? 0.3 : 0.1}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Point lights for glow effect */}
            <pointLight
                color="#00ffff"
                intensity={isActive ? 2 * powerLevel : 0.5}
                distance={5}
                decay={2}
            />
        </group>
    )
}

export default ArcReactor
