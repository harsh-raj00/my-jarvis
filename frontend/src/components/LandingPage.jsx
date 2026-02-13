import React, { useState, useEffect, useRef } from 'react'

/**
 * Iron Man / Avengers themed landing page
 * Epic splash screen before accessing the J.A.R.V.I.S. dashboard
 */
const LandingPage = ({ onEnter }) => {
    const [bootPhase, setBootPhase] = useState(0)
    const [bootText, setBootText] = useState([])
    const [showEnter, setShowEnter] = useState(false)
    const [arcReactorPulse, setArcReactorPulse] = useState(0)
    const canvasRef = useRef(null)

    // Boot sequence messages
    const bootMessages = [
        'STARK INDUSTRIES SECURE NETWORK',
        'INITIALIZING ARC REACTOR CORE...',
        'POWER LEVEL: 100%',
        'LOADING J.A.R.V.I.S. NEURAL MATRIX...',
        'CONNECTING TO AVENGERS DATABASE...',
        'SECURITY PROTOCOLS: ACTIVE',
        'HOLOGRAPHIC INTERFACE: READY',
        'VOICE RECOGNITION: CALIBRATED',
        'ALL SYSTEMS OPERATIONAL',
        '',
        'WELCOME BACK, SIR.'
    ]

    // Boot sequence effect
    useEffect(() => {
        const timer = setInterval(() => {
            setBootPhase(prev => {
                if (prev < bootMessages.length) {
                    setBootText(t => [...t, bootMessages[prev]])
                    return prev + 1
                } else {
                    clearInterval(timer)
                    setTimeout(() => setShowEnter(true), 500)
                    return prev
                }
            })
        }, 300)
        return () => clearInterval(timer)
    }, [])

    // Arc reactor pulse animation
    useEffect(() => {
        const pulse = setInterval(() => {
            setArcReactorPulse(prev => (prev + 1) % 100)
        }, 50)
        return () => clearInterval(pulse)
    }, [])

    // Particle effect
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const particles = Array.from({ length: 100 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            color: Math.random() > 0.7 ? '#ff4444' : '#00d4ff'
        }))

        let animationId
        const animate = () => {
            ctx.fillStyle = 'rgba(0, 8, 20, 0.1)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            particles.forEach(p => {
                p.x += p.vx
                p.y += p.vy
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1

                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fillStyle = p.color
                ctx.fill()
            })

            // Draw connecting lines
            particles.forEach((p1, i) => {
                particles.slice(i + 1).forEach(p2 => {
                    const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y)
                    if (dist < 100) {
                        ctx.beginPath()
                        ctx.moveTo(p1.x, p1.y)
                        ctx.lineTo(p2.x, p2.y)
                        ctx.strokeStyle = `rgba(0, 212, 255, ${1 - dist / 100})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                })
            })

            animationId = requestAnimationFrame(animate)
        }
        animate()
        return () => cancelAnimationFrame(animationId)
    }, [])

    const pulseSize = 1 + Math.sin(arcReactorPulse * 0.1) * 0.1

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(135deg, #000814 0%, #001d3d 50%, #000814 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            fontFamily: "'Orbitron', 'Segoe UI', monospace"
        }}>
            {/* Background particles */}
            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />

            {/* Hexagonal grid overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='43.4' viewBox='0 0 50 43.4'%3E%3Cpolygon fill='none' stroke='%23003366' stroke-width='0.5' points='25,0 50,14.4 50,43.4 25,28.9 0,43.4 0,14.4'/%3E%3C/svg%3E")`,
                opacity: 0.3
            }} />

            {/* Arc Reactor */}
            <div style={{
                position: 'relative',
                width: '300px',
                height: '300px',
                marginBottom: '40px',
                transform: `scale(${pulseSize})`
            }}>
                {/* Outer ring */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '3px solid #334455',
                    boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)'
                }} />

                {/* Ring segments */}
                {[...Array(8)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '100px',
                        height: '4px',
                        background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
                        transformOrigin: '0 50%',
                        transform: `rotate(${i * 45}deg)`,
                        opacity: 0.6
                    }} />
                ))}

                {/* Inner rotating ring */}
                <div style={{
                    position: 'absolute',
                    inset: '40px',
                    borderRadius: '50%',
                    border: '2px solid #00d4ff',
                    borderTopColor: 'transparent',
                    animation: 'spin 3s linear infinite'
                }} />

                {/* Core glow */}
                <div style={{
                    position: 'absolute',
                    inset: '80px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #00ffff 0%, #00d4ff 30%, #0066ff 60%, transparent 70%)',
                    boxShadow: '0 0 60px #00d4ff, 0 0 100px #0066ff, inset 0 0 30px rgba(255,255,255,0.3)',
                    animation: 'pulse 2s ease-in-out infinite'
                }} />

                {/* Center triangle */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '25px solid transparent',
                    borderRight: '25px solid transparent',
                    borderBottom: '43px solid rgba(255, 255, 255, 0.8)',
                    filter: 'drop-shadow(0 0 10px #00ffff)'
                }} />
            </div>

            {/* Title */}
            <h1 style={{
                fontSize: '72px',
                fontWeight: 'bold',
                letterSpacing: '20px',
                margin: 0,
                background: 'linear-gradient(180deg, #ffffff 0%, #00d4ff 50%, #0066ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
                position: 'relative',
                zIndex: 10
            }}>
                J.A.R.V.I.S.
            </h1>

            <p style={{
                fontSize: '14px',
                letterSpacing: '8px',
                color: '#668899',
                margin: '20px 0 40px',
                position: 'relative',
                zIndex: 10
            }}>
                JUST A RATHER VERY INTELLIGENT SYSTEM
            </p>

            {/* Boot sequence terminal */}
            <div style={{
                width: '500px',
                maxHeight: '200px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid #003366',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: "'Courier New', monospace",
                fontSize: '12px',
                color: '#00d4ff',
                overflowY: 'auto',
                position: 'relative',
                zIndex: 10,
                boxShadow: '0 0 20px rgba(0, 100, 200, 0.3)'
            }}>
                {bootText.map((text, i) => (
                    <div key={i} style={{
                        marginBottom: '4px',
                        color: text.includes('WELCOME') ? '#ffcc00' : text.includes('100%') || text.includes('READY') || text.includes('ACTIVE') || text.includes('OPERATIONAL') ? '#00ff88' : '#00d4ff'
                    }}>
                        {text && <span style={{ color: '#ff4444' }}>{'>'}</span>} {text}
                    </div>
                ))}
                {bootPhase < bootMessages.length && (
                    <span style={{ animation: 'blink 0.5s infinite' }}>_</span>
                )}
            </div>

            {/* Enter button */}
            {showEnter && (
                <button
                    onClick={onEnter}
                    style={{
                        marginTop: '40px',
                        padding: '16px 48px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        letterSpacing: '6px',
                        background: 'linear-gradient(135deg, rgba(200, 50, 50, 0.8), rgba(150, 30, 30, 0.8))',
                        border: '2px solid #ff4444',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        position: 'relative',
                        zIndex: 10,
                        boxShadow: '0 0 30px rgba(255, 68, 68, 0.5)',
                        transition: 'all 0.3s ease',
                        animation: 'fadeIn 0.5s ease-out'
                    }}
                    onMouseEnter={e => {
                        e.target.style.transform = 'scale(1.05)'
                        e.target.style.boxShadow = '0 0 50px rgba(255, 68, 68, 0.8)'
                    }}
                    onMouseLeave={e => {
                        e.target.style.transform = 'scale(1)'
                        e.target.style.boxShadow = '0 0 30px rgba(255, 68, 68, 0.5)'
                    }}
                >
                    INITIALIZE
                </button>
            )}

            {/* Stark Industries logo */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#445566',
                fontSize: '12px',
                letterSpacing: '4px'
            }}>
                <div style={{
                    width: '30px',
                    height: '30px',
                    border: '2px solid #445566',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px'
                }}>S</div>
                STARK INDUSTRIES
            </div>

            {/* Avengers-style corner decorations */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', width: '60px', height: '60px', borderTop: '2px solid #ff4444', borderLeft: '2px solid #ff4444' }} />
            <div style={{ position: 'absolute', top: '20px', right: '20px', width: '60px', height: '60px', borderTop: '2px solid #ff4444', borderRight: '2px solid #ff4444' }} />
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '60px', height: '60px', borderBottom: '2px solid #ff4444', borderLeft: '2px solid #ff4444' }} />
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '60px', height: '60px', borderBottom: '2px solid #ff4444', borderRight: '2px solid #ff4444' }} />

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    )
}

export default LandingPage
