import React, { useState, useRef } from 'react';

/**
 * 3D BorrowLoop Logo Icon
 * Renders an extruded, multi-layered 3D interlocking loops with dynamic lighting,
 * specular highlights, central 3D sphere, and interactive 3D mouse tilt.
 */
export const BorrowLoopIcon3D = ({
  size = 40,
  animated = true,
  interactive = true,
  className = '',
}) => {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-15deg to +15deg)
    const rotateX = ((y - centerY) / centerY) * -16;
    const rotateY = ((x - centerX) / centerX) * 16;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        perspective: '1000px',
      }}
    >
      <div
        className={`w-full h-full relative transition-transform ${
          isHovered ? 'duration-100 ease-out' : 'duration-500 ease-out'
        } ${animated && !isHovered ? 'animate-float-subtle' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.08 : 1}, ${isHovered ? 1.08 : 1}, 1)`,
        }}
      >
        {/* Under-glow ambient 3D shadow */}
        <div
          className="absolute -inset-1 rounded-full opacity-60 dark:opacity-75 blur-md pointer-events-none transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.45), rgba(79, 70, 229, 0.45) 60%, transparent 80%)',
            transform: 'translateZ(-15px) scale(0.95)',
          }}
        />

        {/* Dynamic Glare Reflection Overlay */}
        {interactive && isHovered && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none z-20 mix-blend-overlay opacity-60 transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
            }}
          />
        )}

        {/* High Precision 3D Vector SVG */}
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.15))' }}
        >
          <defs>
            {/* Emerald Green 3D Gradients */}
            <linearGradient id="emeraldMain" x1="20" y1="30" x2="160" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="35%" stopColor="#10b981" />
              <stop offset="85%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            <linearGradient id="emeraldBevelTop" x1="40" y1="20" x2="120" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="emeraldDepth" x1="30" y1="50" x2="150" y2="190" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#065f46" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>

            {/* Indigo/Purple-Blue 3D Gradients */}
            <linearGradient id="indigoMain" x1="180" y1="30" x2="40" y2="170" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="30%" stopColor="#6366f1" />
              <stop offset="75%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>

            <linearGradient id="indigoBevelTop" x1="150" y1="30" x2="70" y2="110" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="indigoDepth" x1="160" y1="50" x2="50" y2="170" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>

            {/* Central Sphere 3D Radial Gradients */}
            <radialGradient id="sphereLight" cx="38%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#e0e7ff" />
              <stop offset="25%" stopColor="#818cf8" />
              <stop offset="65%" stopColor="#4f46e5" />
              <stop offset="90%" stopColor="#3730a3" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </radialGradient>

            {/* Drop Shadow Filter */}
            <filter id="shadow3d" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="3" dy="8" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.35" />
            </filter>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ======================================================== */}
          {/* LAYER 0: Bottom 3D Cast Shadows & Depth Extrusion */}
          {/* ======================================================== */}
          <g transform="translate(4, 7)" opacity="0.6">
            {/* Green Loop Shadow */}
            <path
              d="M 125 152 C 90 185, 38 178, 22 135 C 8 98, 28 48, 68 32 C 92 22, 118 28, 134 44"
              stroke="#022c22"
              strokeWidth="24"
              strokeLinecap="round"
            />
            {/* Blue Loop Shadow */}
            <path
              d="M 75 48 C 110 15, 162 22, 178 65 C 192 102, 172 152, 132 168 C 108 178, 82 172, 66 156"
              stroke="#1e1b4b"
              strokeWidth="24"
              strokeLinecap="round"
            />
          </g>

          {/* ======================================================== */}
          {/* LAYER 1: 3D Extrusion Side Walls (Depth simulation) */}
          {/* ======================================================== */}
          <g transform="translate(2, 4)">
            {/* Green Arc Extrusion */}
            <path
              d="M 125 152 C 90 185, 38 178, 22 135 C 8 98, 28 48, 68 32 C 92 22, 118 28, 134 44"
              stroke="url(#emeraldDepth)"
              strokeWidth="24"
              strokeLinecap="round"
            />
            {/* Blue Arc Extrusion */}
            <path
              d="M 75 48 C 110 15, 162 22, 178 65 C 192 102, 172 152, 132 168 C 108 178, 82 172, 66 156"
              stroke="url(#indigoDepth)"
              strokeWidth="24"
              strokeLinecap="round"
            />
          </g>

          {/* ======================================================== */}
          {/* LAYER 2: Main 3D Torus Arcs with Rich Shading */}
          {/* ======================================================== */}
          
          {/* 1. Emerald Green Interlocking Loop */}
          <path
            d="M 125 152 C 90 185, 38 178, 22 135 C 8 98, 28 48, 68 32 C 92 22, 118 28, 134 44"
            stroke="url(#emeraldMain)"
            strokeWidth="24"
            strokeLinecap="round"
          />

          {/* 2. Indigo / Blue Interlocking Loop */}
          <path
            d="M 75 48 C 110 15, 162 22, 178 65 C 192 102, 172 152, 132 168 C 108 178, 82 172, 66 156"
            stroke="url(#indigoMain)"
            strokeWidth="24"
            strokeLinecap="round"
          />

          {/* Intersecting Overlap Blend: Front lip of Green Loop over Blue */}
          <path
            d="M 60 36 C 75 29, 95 28, 112 34 C 122 38, 130 45, 134 44"
            stroke="url(#emeraldMain)"
            strokeWidth="24"
            strokeLinecap="round"
          />

          {/* ======================================================== */}
          {/* LAYER 3: 3D Top Rim Bevels & Specular Light Highlights */}
          {/* ======================================================== */}
          
          {/* Emerald Top Light Rim */}
          <path
            d="M 120 148 C 88 178, 42 172, 28 132 C 16 98, 34 54, 70 38"
            stroke="url(#emeraldBevelTop)"
            strokeWidth="7"
            strokeLinecap="round"
            transform="translate(-2, -3)"
          />

          {/* Indigo Top Light Rim */}
          <path
            d="M 80 52 C 112 22, 158 28, 172 68 C 184 102, 166 146, 130 162"
            stroke="url(#indigoBevelTop)"
            strokeWidth="7"
            strokeLinecap="round"
            transform="translate(-2, -3)"
          />

          {/* Glossy Bright Accent Gleams */}
          <ellipse
            cx="48"
            cy="70"
            rx="5"
            ry="18"
            transform="rotate(-35 48 70)"
            fill="#ffffff"
            opacity="0.55"
          />
          <ellipse
            cx="152"
            cy="130"
            rx="5"
            ry="18"
            transform="rotate(-35 152 130)"
            fill="#ffffff"
            opacity="0.45"
          />

          {/* ======================================================== */}
          {/* LAYER 4: Central 3D Sphere Node */}
          {/* ======================================================== */}
          {/* Sphere Cast Shadow */}
          <ellipse
            cx="103"
            cy="106"
            rx="16"
            ry="12"
            fill="#0f172a"
            opacity="0.4"
            filter="url(#softGlow)"
          />

          {/* 3D Sphere Body */}
          <circle
            cx="100"
            cy="100"
            r="16"
            fill="url(#sphereLight)"
          />

          {/* Specular Gleam on Sphere */}
          <circle
            cx="95"
            cy="94"
            r="5"
            fill="#ffffff"
            opacity="0.85"
          />
          <circle
            cx="94"
            cy="93"
            r="2"
            fill="#ffffff"
            opacity="0.95"
          />
        </svg>
      </div>
    </div>
  );
};

/**
 * Full BorrowLoop Brand Logo Component
 * Supports multiple layouts (horizontal, vertical, compact, hero)
 * and rich 3D typography.
 */
export const BorrowLoopLogo = ({
  size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl', 'hero'
  layout = 'horizontal', // 'horizontal', 'vertical', 'icon-only'
  showTagline = true,
  animated = true,
  interactive = true,
  className = '',
}) => {
  // Size mapping
  const sizeConfig = {
    xs: { iconSize: 26, textClass: 'text-base', subClass: 'text-[7px]', gap: 'gap-1.5' },
    sm: { iconSize: 34, textClass: 'text-lg', subClass: 'text-[8px]', gap: 'gap-2' },
    md: { iconSize: 44, textClass: 'text-2xl', subClass: 'text-[9.5px]', gap: 'gap-2.5' },
    lg: { iconSize: 58, textClass: 'text-3xl', subClass: 'text-[11px]', gap: 'gap-3' },
    xl: { iconSize: 76, textClass: 'text-4xl', subClass: 'text-[13px]', gap: 'gap-4' },
    hero: { iconSize: 110, textClass: 'text-5xl sm:text-6xl', subClass: 'text-sm sm:text-base', gap: 'gap-5' },
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  if (layout === 'icon-only') {
    return (
      <BorrowLoopIcon3D
        size={currentSize.iconSize}
        animated={animated}
        interactive={interactive}
        className={className}
      />
    );
  }

  return (
    <div
      className={`inline-flex ${
        layout === 'vertical' ? 'flex-col items-center text-center' : 'flex-row items-center'
      } ${currentSize.gap} ${className} group`}
    >
      {/* 3D Icon */}
      <BorrowLoopIcon3D
        size={currentSize.iconSize}
        animated={animated}
        interactive={interactive}
      />

      {/* Typography */}
      <div className={`flex flex-col ${layout === 'vertical' ? 'items-center' : 'items-start'}`}>
        <div className="flex items-baseline font-black tracking-tight leading-none">
          <span className={`${currentSize.textClass} text-slate-900 dark:text-white drop-shadow-sm transition-colors`}>
            Borrow
          </span>
          <span
            className={`${currentSize.textClass} font-extrabold bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 dark:from-brand-400 dark:via-indigo-400 dark:to-accent-300 bg-clip-text text-transparent`}
            style={{
              filter: 'drop-shadow(0 2px 8px rgba(99, 102, 241, 0.25))',
            }}
          >
            Loop
          </span>
        </div>

        {showTagline && (
          <span
            className={`${currentSize.subClass} font-bold text-slate-500 dark:text-slate-400 tracking-[0.2em] uppercase mt-0.5`}
            style={{ letterSpacing: '0.18em' }}
          >
            COMMUNITY GEAR EXCHANGE
          </span>
        )}
      </div>
    </div>
  );
};

export default BorrowLoopLogo;
