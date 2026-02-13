import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * ParticleField - Animated particles orbiting around the core
 * Features: Orbital motion, size variation, glow effects, audio reactivity
 */
const ParticleField = ({
    count = 200,
    radius = 3,
    isActive = true,
    audioLevel = 0,
    color = '#00d4ff'
}) => {
    const pointsRef = useRef()

    // Generate particle attributes
    const { positions, sizes, velocities, lifetimes } = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        const velocities = new Float32Array(count * 3)
        const lifetimes = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            // Distribute in a toroidal pattern around the core
            const theta = Math.random() * Math.PI * 2
            const phi = (Math.random() - 0.5) * Math.PI * 0.8
            const r = radius + (Math.random() - 0.5) * 1.5

            positions[i * 3] = Math.cos(theta) * Math.cos(phi) * r
            positions[i * 3 + 1] = Math.sin(phi) * r * 0.5
            positions[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * r

            sizes[i] = 0.5 + Math.random() * 1.5

            // Random orbital velocities
            velocities[i * 3] = (Math.random() - 0.5) * 0.02
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02

            lifetimes[i] = Math.random()
        }

        return { positions, sizes, velocities, lifetimes }
    }, [count, radius])

    // Shader material for particles
    const particleMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(color) },
                uAudioLevel: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
        attribute float aSize;
        attribute float aLifetime;
        
        varying float vLifetime;
        
        uniform float uTime;
        uniform float uAudioLevel;
        uniform float uPixelRatio;
        
        void main() {
          vLifetime = aLifetime;
          
          // Orbital animation
          float angle = uTime * (0.2 + aLifetime * 0.3);
          vec3 pos = position;
          
          float cosA = cos(angle);
          float sinA = sin(angle);
          float newX = pos.x * cosA - pos.z * sinA;
          float newZ = pos.x * sinA + pos.z * cosA;
          pos.x = newX;
          pos.z = newZ;
          
          // Vertical oscillation
          pos.y += sin(uTime * 2.0 + aLifetime * 10.0) * 0.3;
          
          // Audio reactivity - expand outward
          float audioExpand = 1.0 + uAudioLevel * 0.3;
          pos *= audioExpand;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          
          // Size with audio reactivity
          float size = aSize * (1.0 + uAudioLevel * 0.5);
          size *= uPixelRatio;
          size *= (200.0 / -mvPosition.z);
          
          gl_PointSize = size;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        varying float vLifetime;
        
        uniform vec3 uColor;
        uniform float uTime;
        
        void main() {
          // Circular particle
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          // Soft glow
          float alpha = 1.0 - smoothstep(0.1, 0.5, dist);
          
          // Core brightness
          float core = 1.0 - smoothstep(0.0, 0.15, dist);
          
          // Color with core highlight
          vec3 finalColor = uColor + vec3(core * 0.5);
          
          // Twinkle effect
          float twinkle = sin(vLifetime * 50.0 + uTime * 5.0) * 0.3 + 0.7;
          alpha *= twinkle;
          
          gl_FragColor = vec4(finalColor, alpha * 0.7);
        }
      `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    }, [color])

    useFrame((state) => {
        const time = state.clock.elapsedTime

        if (particleMaterial.uniforms) {
            particleMaterial.uniforms.uTime.value = time
            particleMaterial.uniforms.uAudioLevel.value = isActive ? audioLevel : 0
        }

        // Slow rotation of the entire field
        if (pointsRef.current) {
            pointsRef.current.rotation.y = time * 0.1
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aSize"
                    count={count}
                    array={sizes}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aLifetime"
                    count={count}
                    array={lifetimes}
                    itemSize={1}
                />
            </bufferGeometry>
            <primitive object={particleMaterial} attach="material" />
        </points>
    )
}

export default ParticleField
