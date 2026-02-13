// Particle Shader - Optimized instanced particle rendering
import * as THREE from 'three'

export const particleVertexShader = `
  attribute float aSize;
  attribute float aLife;
  attribute vec3 aVelocity;
  
  varying float vLife;
  varying float vSize;
  
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uBaseSize;
  
  void main() {
    vLife = aLife;
    vSize = aSize;
    
    // Animate position based on velocity and time
    vec3 pos = position + aVelocity * mod(uTime + aLife * 10.0, 5.0);
    
    // Add orbital motion
    float angle = uTime * 0.5 + aLife * 6.28;
    float radius = length(pos.xz);
    pos.x = cos(angle) * radius;
    pos.z = sin(angle) * radius;
    
    // Vertical oscillation
    pos.y += sin(uTime * 2.0 + aLife * 10.0) * 0.2;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Size attenuation
    float size = aSize * uBaseSize * uPixelRatio;
    size *= (1.0 / -mvPosition.z) * 50.0;
    
    // Pulse size based on life
    size *= 0.8 + sin(uTime * 3.0 + aLife * 20.0) * 0.2;
    
    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition;
  }
`

export const particleFragmentShader = `
  varying float vLife;
  varying float vSize;
  
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uCoreColor;
  
  void main() {
    // Circular particle shape
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    // Soft edge
    float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
    
    // Core glow
    float coreGlow = 1.0 - smoothstep(0.0, 0.2, dist);
    
    // Color variation based on life
    vec3 color = mix(uColor, uCoreColor, coreGlow);
    
    // Shimmer effect
    float shimmer = sin(vLife * 50.0 + uTime * 5.0) * 0.2 + 0.8;
    color *= shimmer;
    
    // Fade based on life cycle
    float lifeFade = sin(vLife * 3.14159);
    alpha *= lifeFade;
    
    gl_FragColor = vec4(color, alpha * 0.8);
  }
`

// Create particle material
export const createParticleMaterial = (options = {}) => {
    const {
        color = new THREE.Color(0x00d4ff),
        coreColor = new THREE.Color(0xffffff),
        baseSize = 15.0
    } = options

    return new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: color },
            uCoreColor: { value: coreColor },
            uBaseSize: { value: baseSize },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })
}

export default createParticleMaterial
