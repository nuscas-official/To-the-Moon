import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン麻婆豆腐宮保雞丁回鍋肉水煮魚夫妻肺片辣子雞口水雞蒜泥白肉毛血旺擔擔麵傷心酸辣粉1234567890%@$#&749201';

interface HybridTextProps {
    text: string;
    revealType?: 'stagger' | 'blur';
    speed?: number;
    periodicInterval?: number;
    revealDuration?: number; // duration of the initial reveal animation in ms before starting periodic scramble
    className?: string;
}

export const HybridText: React.FC<HybridTextProps> = ({
    text,
    revealType = 'stagger',
    speed = 40,
    periodicInterval = 6000,
    revealDuration = 1200,
    className = '',
}) => {
    const [hasRevealed, setHasRevealed] = useState(false);
    const [displayText, setDisplayText] = useState(text);
    const [triggerScramble, setTriggerScramble] = useState(0);

    // 1. Initial reveal phase duration timeout
    useEffect(() => {
        const timer = setTimeout(() => {
            setHasRevealed(true);
        }, revealDuration);
        return () => clearTimeout(timer);
    }, [revealDuration]);

    // 2. Periodic scramble timer (only active AFTER initial reveal)
    useEffect(() => {
        if (!hasRevealed || !periodicInterval) return;
        const interval = setInterval(() => {
            setTriggerScramble(prev => prev + 1);
        }, periodicInterval);
        return () => clearInterval(interval);
    }, [hasRevealed, periodicInterval]);

    // 3. Scramble animation effect
    useEffect(() => {
        if (!hasRevealed) return; // Don't scramble during initial reveal

        let iteration = -Math.max(4, Math.floor(text.length / 2));
        const interval = setInterval(() => {
            setDisplayText(
                text
                    .split('')
                    .map((char, idx) => {
                        if (char === ' ') return ' ';
                        if (idx < iteration) return text[idx];
                        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                    })
                    .join('')
            );

            iteration += 1 / 3;
            if (iteration >= text.length) {
                clearInterval(interval);
                setDisplayText(text);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, triggerScramble, hasRevealed]);

    // Render the initial reveal animation phase
    if (!hasRevealed) {
        const characters = text.split('');
        if (revealType === 'blur') {
            const containerVariants = {
                hidden: {},
                visible: {
                    transition: { staggerChildren: 0.05 },
                },
            };
            const charVariants = {
                hidden: { filter: 'blur(10px)', opacity: 0, y: 4 },
                visible: {
                    filter: 'blur(0px)',
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: 'easeOut' as const },
                },
            };
            return (
                <motion.span className={`inline-flex flex-wrap ${className}`} variants={containerVariants} initial="hidden" animate="visible">
                    {characters.map((char, idx) => (
                        <motion.span key={idx} variants={charVariants} className="inline-block" style={{ whiteSpace: 'pre' }}>
                            {char === ' ' ? '\u00A0' : char}
                        </motion.span>
                    ))}
                </motion.span>
            );
        } else {
            // stagger reveal
            const containerVariants = {
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.06 },
                },
            };
            const charVariants = {
                hidden: { y: '100%', opacity: 0 },
                visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                        ease: [0.2, 0.65, 0.3, 0.9] as const,
                        duration: 0.8,
                    },
                },
            };
            return (
                <motion.span
                    className={`inline-flex flex-wrap overflow-hidden py-1 ${className}`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {characters.map((char, idx) => (
                        <span key={idx} className="overflow-hidden inline-block font-inherit">
                            <motion.span variants={charVariants} className="inline-block" style={{ whiteSpace: 'pre' }}>
                                {char === ' ' ? '\u00A0' : char}
                            </motion.span>
                        </span>
                    ))}
                </motion.span>
            );
        }
    }

    // Render the scrambled/resolved text
    return <span className={className}>{displayText}</span>;
};
