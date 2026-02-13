// Hologram Shader - Creates glowing holographic effect for JARVIS core
import * as THREE from 'three'

export const hologramVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vFresnel;
  
  uniform float uTime;
  uniform float uPulse;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    // Calculate fresnel for edge glow
    vec3 viewDirection = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
    vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
    vFresnel = pow(1.0 - abs(dot(viewDirection, worldNormal)), 3.0);
    
    // Add subtle vertex displacement for pulse effect
    vec3 pos = position;
    float displacement = sin(uTime * 3.0 + position.y * 2.0) * 0.02 * uPulse;
    pos += normal * displacement;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

export const hologramFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vFresnel;
  
  uniform float uTime;
  uniform float uPulse;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uGlowColor;
  uniform float uScanlineIntensity;
  
  void main() {
    // Base color with gradient
    vec3 baseColor = uColor;
    
    // Scanline effect
    float scanline = sin(vPosition.y * 40.0 + uTime * 2.0) * 0.5 + 0.5;
    scanline = pow(scanline, 8.0) * uScanlineIntensity;
    
    // Horizontal scan wave
    float scanWave = sin(vPosition.y * 2.0 - uTime * 3.0) * 0.5 + 0.5;
    scanWave = smoothstep(0.4, 0.6, scanWave) * 0.3;
    
    // Edge glow using fresnel
    vec3 glowColor = uGlowColor * vFresnel * 2.0;
    
    // Combine effects
    vec3 finalColor = baseColor + glowColor + vec3(scanline * 0.2) + vec3(scanWave);
    
    // Pulse brightness
    float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
    finalColor *= pulse * (0.8 + uPulse * 0.4);
    
    // Add subtle noise for hologram texture
    float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    finalColor += noise * 0.02;
    
    // Alpha with fresnel-based transparency
    float alpha = uOpacity * (0.6 + vFresnel * 0.4);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`

// Create hologram material
export const createHologramMaterial = (options = {}) => {
  const {
    color = new THREE.Color(0x00d4ff),
    glowColor = new THREE.Color(0x0099ff),
    opacity = 0.85,
    scanlineIntensity = 0.3,
    pulse = 0.0
  } = options

  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPulse: { value: pulse },
      uOpacity: { value: opacity },
      uColor: { value: color },
      uGlowColor: { value: glowColor },
      uScanlineIntensity: { value: scanlineIntensity }
    },
    vertexShader: hologramVertexShader,
    fragmentShader: hologramFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
}

export default createHologramMaterial
