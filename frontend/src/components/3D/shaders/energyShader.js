// Energy Shader - Arc reactor energy flow effect
import * as THREE from 'three'

export const energyVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  uniform float uTime;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const energyFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uCoreColor;
  uniform vec3 uEdgeColor;
  uniform float uFlowSpeed;
  uniform float uRingCount;
  
  #define PI 3.14159265359
  
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 uv = vUv - center;
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Concentric energy rings
    float rings = sin(dist * uRingCount * PI - uTime * uFlowSpeed) * 0.5 + 0.5;
    rings = pow(rings, 2.0);
    
    // Radial energy flow
    float flow = sin(angle * 8.0 + uTime * 2.0) * 0.5 + 0.5;
    flow *= sin(dist * 20.0 - uTime * 4.0) * 0.5 + 0.5;
    
    // Core glow
    float coreGlow = 1.0 - smoothstep(0.0, 0.3, dist);
    coreGlow = pow(coreGlow, 2.0);
    
    // Edge fade
    float edgeFade = 1.0 - smoothstep(0.3, 0.5, dist);
    
    // Combine colors
    vec3 color = mix(uEdgeColor, uCoreColor, coreGlow);
    color += uCoreColor * rings * 0.5;
    color += uEdgeColor * flow * 0.3;
    
    // Add energy flicker
    float flicker = noise(vec2(uTime * 10.0, dist * 5.0)) * 0.1;
    color *= 1.0 + flicker;
    
    // Final intensity
    color *= uIntensity;
    
    // Alpha based on distance from center
    float alpha = edgeFade * (0.5 + rings * 0.3 + coreGlow * 0.5);
    
    gl_FragColor = vec4(color, alpha);
  }
`

// Create energy material for arc reactor
export const createEnergyMaterial = (options = {}) => {
    const {
        coreColor = new THREE.Color(0x00ffff),
        edgeColor = new THREE.Color(0x0066ff),
        intensity = 1.5,
        flowSpeed = 3.0,
        ringCount = 6.0
    } = options

    return new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uIntensity: { value: intensity },
            uCoreColor: { value: coreColor },
            uEdgeColor: { value: edgeColor },
            uFlowSpeed: { value: flowSpeed },
            uRingCount: { value: ringCount }
        },
        vertexShader: energyVertexShader,
        fragmentShader: energyFragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })
}

export default createEnergyMaterial
