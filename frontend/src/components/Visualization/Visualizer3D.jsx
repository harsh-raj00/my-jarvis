import React, { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Stars, 
  Float, 
  Text3D, 
  Center,
  Environment,
  MeshReflectorMaterial
} from '@react-three/drei'
import * as THREE from 'three'

const CoreSphere = ({ isActive }) => {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
      
      // Pulsing effect
      const scale = isActive 
        ? 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1 
        : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          color={isActive ? "#3b82f6" : "#0ea5e9"}
          emissive={isActive ? "#3b82f6" : "#0ea5e9"}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Inner Glow */}
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
    </Float>
  )
}

const OrbitalRings = ({ count = 5, isActive }) => {
  const ringsRef = useRef([])
  
  useFrame((state) => {
    ringsRef.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.y = state.clock.elapsedTime * (0.5 + i * 0.2)
        const scale = isActive 
          ? 1 + Math.sin(state.clock.elapsedTime * (5 + i * 2)) * 0.1
          : 1
        ring.scale.setScalar(scale)
      }
    })
  })

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <mesh
          key={i}
          ref={el => ringsRef.current[i] = el}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[2 + i * 0.5, 2.2 + i * 0.5, 64]} />
          <meshBasicMaterial
            color={`hsl(${200 + i * 20}, 100%, 60%)`}
            transparent
            opacity={0.4 - i * 0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

const FloatingParticles = ({ count = 100, isActive }) => {
  const particlesRef = useRef()
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  const particles = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const radius = 3 + Math.sin(i * 0.5) * 0.5
    particles.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(state.clock.elapsedTime + i) * 0.5,
      z: Math.sin(angle) * radius,
      size: 0.05 + Math.random() * 0.05,
      color: `hsl(${200 + (i % 5) * 20}, 100%, 70%)`
    })
  }

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh
          key={i}
          position={[particle.x, particle.y, particle.z]}
        >
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshBasicMaterial
            color={particle.color}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

const DataStreams = ({ count = 8, isActive }) => {
  const streamsRef = useRef([])
  
  useFrame((state) => {
    streamsRef.current.forEach((stream, i) => {
      if (stream) {
        stream.position.y = Math.sin(state.clock.elapsedTime * 2 + i) * 0.3
      }
    })
  })

  return (
    <>
      {[...Array(count)].map((_, i) => {
        const angle = (i / count) * Math.PI * 2
        const radius = 4
        return (
          <mesh
            key={i}
            ref={el => streamsRef.current[i] = el}
            position={[
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius
            ]}
          >
            <cylinderGeometry args={[0.02, 0.02, 8, 8]} />
            <meshBasicMaterial
              color={`hsl(${180 + i * 10}, 100%, 60%)`}
              transparent
              opacity={isActive ? 0.8 : 0.3}
            />
          </mesh>
        )
      })}
    </>
  )
}

const Visualizer3D = () => {
  const [isActive, setIsActive] = useState(true)

  return (
    <div className="h-full relative">
      {/* Controls Overlay */}
      <div className="absolute top-6 left-6 z-10">
        <div className="glass-card p-4 space-y-4">
          <h3 className="text-white font-bold">3D Visualization</h3>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}
          >
            {isActive ? 'Pause Animation' : 'Resume Animation'}
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        className="!absolute !inset-0"
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={['#000011']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0ea5e9" />
        
        {/* Fog */}
        <fog attach="fog" args={['#000011', 5, 15]} />
        
        {/* Scene Elements */}
        <Suspense fallback={null}>
          <Center>
            <CoreSphere isActive={isActive} />
            <OrbitalRings count={5} isActive={isActive} />
            <FloatingParticles count={100} isActive={isActive} />
            <DataStreams count={8} isActive={isActive} />
          </Center>
          
          {/* J.A.R.V.I.S. Text */}
          <Text3D
            font="/fonts/helvetiker_bold.typeface.json"
            position={[0, -3, 0]}
            size={0.8}
            height={0.2}
          >
            J.A.R.V.I.S.
            <meshNormalMaterial />
          </Text3D>
          
          {/* Environment */}
          <Environment preset="city" />
          
          {/* Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
            <planeGeometry args={[20, 20]} />
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={2048}
              mixBlur={1}
              mixStrength={40}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#050505"
              metalness={0.5}
            />
          </mesh>
          
          {/* Stars */}
          <Stars radius={100} depth={50} count={5000} factor={4} fade />
          
          {/* Controls */}
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            autoRotate={true}
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
            minDistance={5}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>

      {/* Stats Overlay */}
      <div className="absolute bottom-6 right-6 z-10">
        <div className="glass-card p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">FPS</span>
              <span className="text-green-400 text-sm font-mono">60</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Triangles</span>
              <span className="text-blue-400 text-sm font-mono">12.4k</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Memory</span>
              <span className="text-purple-400 text-sm font-mono">142MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Visualizer3D