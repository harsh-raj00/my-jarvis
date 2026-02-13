import React, { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import './VoiceOrb.css'

/**
 * VoiceOrb — Siri-like animated voice popup (Vibrant Edition)
 *
 * Props:
 *   visible      — boolean, whether to show the overlay
 *   voiceState   — 'listening' | 'processing' | 'speaking'
 *   audioLevel   — 0..1, drives dynamic scale on blobs
 *   transcript   — string, live speech transcript
 *   onClose      — function, dismiss callback
 */
const VoiceOrb = ({ visible, voiceState, audioLevel = 0, transcript = '', onClose }) => {
    // Dynamic blob scale based on audio level
    const dynamicScale = useMemo(() => {
        return 1 + audioLevel * 0.35
    }, [audioLevel])

    // Lock body scroll when visible
    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [visible])

    const stateClass = voiceState || 'listening'

    const statusLabel = {
        listening: 'Listening…',
        processing: 'Processing…',
        speaking: 'Speaking…',
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="voice-orb-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
                >
                    {/* Orb */}
                    <motion.div
                        className="voice-orb-container"
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.3, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                        {/* Ambient glow */}
                        <div className={`voice-orb-ambient ${stateClass}`} />

                        {/* Rainbow spinning halo */}
                        <motion.div
                            className="voice-orb-halo"
                            animate={{ scale: dynamicScale * 0.9 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        />

                        {/* Expanding rings */}
                        <div className={`voice-orb-ring ring1 ${stateClass}`} />
                        <div className={`voice-orb-ring ring2 ${stateClass}`} />
                        <div className={`voice-orb-ring ring3 ${stateClass}`} />

                        {/* Floating particles */}
                        <div className="voice-orb-particles">
                            <div className="voice-orb-particle" />
                            <div className="voice-orb-particle" />
                            <div className="voice-orb-particle" />
                            <div className="voice-orb-particle" />
                            <div className="voice-orb-particle" />
                            <div className="voice-orb-particle" />
                        </div>

                        {/* Blob layers — scale reacts to audio */}
                        <motion.div
                            className={`voice-orb-blob primary ${stateClass}`}
                            animate={{ scale: dynamicScale }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        />
                        <motion.div
                            className={`voice-orb-blob secondary ${stateClass}`}
                            animate={{ scale: dynamicScale * 0.95 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                        />
                        <motion.div
                            className={`voice-orb-blob tertiary ${stateClass}`}
                            animate={{ scale: dynamicScale * 1.05 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        />
                        <motion.div
                            className={`voice-orb-blob quaternary ${stateClass}`}
                            animate={{ scale: dynamicScale * 0.9 }}
                            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                        />
                        <div className="voice-orb-blob highlight" />
                    </motion.div>

                    {/* Status label */}
                    <motion.div
                        className={`voice-orb-status ${stateClass}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        key={stateClass}
                    >
                        {statusLabel[stateClass] || 'Listening…'}
                    </motion.div>

                    {/* Transcript */}
                    <motion.div
                        className="voice-orb-transcript"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {transcript && `"${transcript}"`}
                    </motion.div>

                    {/* Close button */}
                    <motion.button
                        className="voice-orb-close"
                        onClick={onClose}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Close voice overlay"
                    >
                        <X size={22} />
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default VoiceOrb
