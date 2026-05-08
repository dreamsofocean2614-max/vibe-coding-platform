import React from 'react';
import { useTheme } from '../lib/ThemeContext';
import { motion } from 'motion/react';

export default function ThemeEffect() {
  const { mode } = useTheme();

  if (mode === 'light') {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        {/* Falling Pink Petals with Wind Effect */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-pink-400/60"
            initial={{ 
              left: `${Math.random() * 120 - 10}vw`, 
              top: '-10vh',
              rotate: Math.random() * 360,
              scale: Math.random() * 0.5 + 0.4,
              opacity: Math.random() * 0.5 + 0.4
            }}
            animate={{ 
              top: '110vh', 
              x: [0, 100, -100, 0],
              rotate: 360
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 10
            }}
            style={{ 
              width: 12, 
              height: 16, 
              borderRadius: '80% 0 80% 0',
              boxShadow: '0 0 6px rgba(244, 114, 182, 0.4)'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[#020617]">
      {/* Starry Sky */}
      {[...Array(80)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute bg-white rounded-full"
          initial={{ 
            left: `${Math.random() * 100}vw`, 
            top: `${Math.random() * 100}vh`, 
            scale: Math.random() * 0.5 + 0.2,
            opacity: Math.random() * 0.3 + 0.2
          }}
          animate={{ 
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: Math.random() * 3 + 2, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
          style={{ width: 2, height: 2, filter: 'blur(1px)' }}
        />
      ))}

      {/* Falling Snow */}
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={`snow-${i}`}
          className="absolute bg-white/60 rounded-full blur-[1px]"
          initial={{ 
            left: `${Math.random() * 100}vw`, 
            top: '-10vh',
            scale: Math.random() * 0.5 + 0.3
          }}
          animate={{ 
            top: '110vh', 
            x: [0, 50, -50, 0]
          }}
          transition={{ 
            duration: Math.random() * 8 + 8, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
          style={{ width: Math.random() * 4 + 2, height: Math.random() * 4 + 2 }}
        />
      ))}

      {/* Cosmic Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[120px]" />
    </div>
  );
}
