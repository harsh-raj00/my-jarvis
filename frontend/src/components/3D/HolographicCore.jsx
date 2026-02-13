import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createHologramMaterial } from './shaders/hologramShader'

/**
 * HolographicCore - Main JARVIS holographic sphere with animated effects
 * Features: Glowing core, pulsing animations, scanlines, fresnel edge glow
 */
const HolographicCore = ({
    radius = 1.5,
    isActive = true,
    audioLevel = 0,
    color = '#00d4ff',
    glowColor = '#0099ff',
    opacity = 0.85
}) => {
    const coreRef = useRef()
    const innerCoreRef = useRef()
    const outerGlowRef = useRef()

    // Create shader materials
    const hologramMaterial = useMemo(() => {
        return createHologramMaterial({
            color: new THREE.Color(color),
            glowColor: new THREE.Color(glowColor),
            opacity: opacity,
            scanlineIntensity: 0.3,
            pulse: 0
        })
    }, [color, glowColor, opacity])

    // Animation loop
    useFrame((state) => {
        const time = state.clock.elapsedTime

        // Update shader uniforms
        if (hologramMaterial.uniforms) {
            hologramMaterial.uniforms.uTime.value = time
            hologramMaterial.uniforms.uPulse.value = isActive ?
                0.5 + audioLevel * 0.5 : 0.2
        }

        // Rotate core
        if (coreRef.current) {
            coreRef.current.rotation.y = time * 0.3
            coreRef.current.rotation.x = Math.sin(time * 0.2) * 0.1
        }

        // Inner core pulse
        if (innerCoreRef.current) {
            const pulseScale = isActive
                ? 1 + Math.sin(time * 3) * 0.05 + audioLevel * 0.1
                : 1 + Math.sin(time) * 0.02
            innerCoreRef.current.scale.setScalar(pulseScale)
        }

        // Outer glow pulse
        if (outerGlowRef.current) {
            const glowScale = isActive
                ? 1.2 + Math.sin(time * 2) * 0.1 + audioLevel * 0.15
                : 1.15 + Math.sin(time * 0.5) * 0.05
            outerGlowRef.current.scale.setScalar(glowScale)
            outerGlowRef.current.material.opacity = 0.15 + audioLevel * 0.1
        }
    })

    return (
        <group ref={coreRef}>
            {/* Main holographic sphere */}
            <mesh>
                <icosahedronGeometry args={[radius, 4]} />
                <primitive object={hologramMaterial} attach="material" />
            </mesh>

            {/* Inner bright core */}
            <mesh ref={innerCoreRef}>
                <sphereGeometry args={[radius * 0.4, 32, 32]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Inner glow layer */}
            <mesh>
                <sphereGeometry args={[radius * 0.6, 32, 32]} />
                <meshBasicMaterial
                    color={glowColor}
                    transparent
                    opacity={0.4}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Outer ambient glow */}
            <mesh ref={outerGlowRef}>
                <sphereGeometry args={[radius * 1.3, 32, 32]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Wireframe overlay */}
            <mesh>
                <icosahedronGeometry args={[radius * 1.02, 2]} />
                <meshBasicMaterial
                    color={glowColor}
                    wireframe
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </group>
    )
}

export default HolographicCore
