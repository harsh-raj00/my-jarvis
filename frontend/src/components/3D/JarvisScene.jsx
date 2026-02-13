import React, { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Dense Particle Sphere - Creates the glowing particle effect like the reference image
 */
const ParticleSphere = ({ radius = 2.5, count = 8000, color = '#00FFCC' }) => {
    const pointsRef = useRef()

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const sizes = new Float32Array(count)

        const color1 = new THREE.Color('#00E5B0')
        const color2 = new THREE.Color('#00CC99')

        for (let i = 0; i < count; i++) {
            // Create sphere distribution
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)

            // Add some depth variation for that fuzzy look
            const r = radius * (0.85 + Math.random() * 0.3)

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = r * Math.cos(phi)

            // Color variation
            const mixRatio = Math.random()
            const mixedColor = color1.clone().lerp(color2, mixRatio)
            colors[i * 3] = mixedColor.r
            colors[i * 3 + 1] = mixedColor.g
            colors[i * 3 + 2] = mixedColor.b

            // Size variation
            sizes[i] = 0.02 + Math.random() * 0.03
        }

        return { positions, colors, sizes }
    }, [count, radius])

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1
            pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.positions.length / 3}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particles.colors.length / 3}
                    array={particles.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                vertexColors
                transparent
                opacity={0.9}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    )
}

/**
 * Inner glow effect for the sphere
 */
const InnerGlow = ({ radius = 2.2 }) => {
    return (
        <mesh>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshBasicMaterial
                color="#005544"
                transparent
                opacity={0.15}
                side={THREE.BackSide}
            />
        </mesh>
    )
}

/**
 * Orbital Ring with small sphere - like in the reference image
 */
const OrbitalRing = ({ radius = 3.5, color = '#CCCCCC', speed = 1, tilt = 0 }) => {
    const groupRef = useRef()
    const orbitingRef = useRef()

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.z = state.clock.elapsedTime * speed * 0.5
        }
    })

    return (
        <group rotation={[tilt, 0, 0]}>
            {/* Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius, 0.015, 16, 100]} />
                <meshBasicMaterial color={color} transparent opacity={0.6} />
            </mesh>

            {/* Orbiting sphere */}
            <group ref={groupRef}>
                <mesh position={[radius, 0, 0]}>
                    <sphereGeometry args={[0.12, 32, 32]} />
                    <meshBasicMaterial color="#FF4444" />
                </mesh>
                {/* Glow around orbiting sphere */}
                <mesh position={[radius, 0, 0]}>
                    <sphereGeometry args={[0.2, 32, 32]} />
                    <meshBasicMaterial color="#FF4444" transparent opacity={0.3} />
                </mesh>
            </group>
        </group>
    )
}

/**
 * Spiral orbital element - like the swirl in the reference
 */
const SpiralOrbit = ({ color = '#AAAAAA' }) => {
    const points = useMemo(() => {
        const pts = []
        for (let i = 0; i < 100; i++) {
            const t = i / 100
            const angle = t * Math.PI * 4
            const radius = 0.3 + t * 0.5
            pts.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                (t - 0.5) * 2,
                Math.sin(angle) * radius
            ))
        }
        return pts
    }, [])

    const lineGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        return geometry
    }, [points])

    return (
        <group position={[4, 0.5, 0]}>
            <mesh>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshBasicMaterial color="#333333" />
            </mesh>
            <line geometry={lineGeometry}>
                <lineBasicMaterial color={color} transparent opacity={0.6} />
            </line>
        </group>
    )
}

/**
 * 3D Text inside the sphere
 */
const SphereText = ({ text = "J.A.R.V.I.S." }) => {
    const textRef = useRef()

    useFrame((state) => {
        if (textRef.current) {
            textRef.current.rotation.y = state.clock.elapsedTime * 0.2
        }
    })

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
            <group ref={textRef}>
                {/* Main text */}
                <Text
                    font="/fonts/Orbitron-Bold.ttf"
                    fontSize={0.5}
                    color="#FFFFFF"
                    anchorX="center"
                    anchorY="middle"
                    position={[0, 0.2, 0]}
                    maxWidth={3}
                >
                    J.A.R.V.I.S.
                    <meshBasicMaterial color="#FFFFFF" transparent opacity={0.95} />
                </Text>

                {/* Subtitle */}
                <Text
                    font="/fonts/Orbitron-Bold.ttf"
                    fontSize={0.18}
                    color="#00CC99"
                    anchorX="center"
                    anchorY="middle"
                    position={[0, -0.3, 0]}
                >
                    STARK INDUSTRIES
                    <meshBasicMaterial color="#00CC99" transparent opacity={0.8} />
                </Text>
            </group>
        </Float>
    )
}

/**
 * Floating labels around the sphere
 */
const FloatingLabel = ({ text, position, color = '#00AA88' }) => {
    return (
        <Float speed={1.5} rotationIntensity={0} floatIntensity={0.5}>
            <Text
                position={position}
                fontSize={0.15}
                color={color}
                anchorX="center"
                anchorY="middle"
            >
                {text}
                <meshBasicMaterial color={color} transparent opacity={0.7} />
            </Text>
        </Float>
    )
}

/**
 * JarvisScene - Main 3D scene with particle sphere and text
 */
const JarvisScene = ({
    isActive = true,
    voiceState = 'idle',
    audioLevel = 0,
    systemMetrics = { cpu: 0, memory: 0 }
}) => {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                style={{ background: '#000000' }}
                gl={{
                    alpha: false,
                    antialias: true,
                    powerPreference: "high-performance"
                }}
            >
                {/* Dark background */}
                <color attach="background" args={['#000000']} />

                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <pointLight position={[5, 5, 5]} color="#00E5B0" intensity={2} />
                <pointLight position={[-5, -5, 5]} color="#00AA77" intensity={1} />

                <Suspense fallback={null}>
                    {/* Main particle sphere */}
                    <ParticleSphere radius={2.5} count={10000} />

                    {/* Inner glow */}
                    <InnerGlow radius={2.2} />

                    {/* Text inside sphere */}
                    <SphereText />

                    {/* Orbital rings */}
                    <OrbitalRing radius={3.5} color="#FFFFFF" speed={0.8} tilt={0.3} />
                    <OrbitalRing radius={4} color="#AAAAAA" speed={-0.5} tilt={-0.5} />

                    {/* Spiral element */}
                    <SpiralOrbit />

                    {/* Floating labels */}
                    <FloatingLabel text="AI CORE" position={[-3.5, 2, 0]} />
                    <FloatingLabel text="NEURAL NET" position={[3.5, 1.5, 0]} />
                    <FloatingLabel text="VOICE SYNC" position={[-3, -1.5, 0]} color="#AA8800" />
                    <FloatingLabel text="ANALYSIS" position={[3, -2, 0]} />

                    {/* Camera controls */}
                    <OrbitControls
                        enableZoom={true}
                        enablePan={false}
                        autoRotate={isActive}
                        autoRotateSpeed={0.3}
                        maxDistance={15}
                        minDistance={5}
                    />
                </Suspense>
            </Canvas>

            {/* Voice state indicator */}
            {voiceState !== 'idle' && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0, 180, 140, 0.2)',
                        border: '2px solid #00E5B0',
                        borderRadius: '25px',
                        padding: '10px 30px',
                        color: '#00E5B0',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        letterSpacing: '3px',
                        boxShadow: '0 0 25px rgba(0, 200, 150, 0.5)'
                    }}
                >
                    {voiceState === 'listening' ? '● LISTENING' :
                        voiceState === 'processing' ? '◐ PROCESSING' :
                            '◉ SPEAKING'}
                </div>
            )}
        </div>
    )
}

export default JarvisScene
