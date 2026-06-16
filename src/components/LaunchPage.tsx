import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Wifi } from 'lucide-react';
import Galaxy from '../../components/Galaxy';
// @ts-ignore
import logoUrl from '../assets/images/carerefill_logo_1781646744724.jpg';

interface LaunchPageProps {
  onLaunchComplete: () => void;
}

export default function LaunchPage({ onLaunchComplete }: LaunchPageProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing CareRefill kernel...');

  useEffect(() => {
    // Progress simulation
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onLaunchComplete();
          }, 600);
          return 100;
        }
        
        // Dynamic status transitions
        if (oldProgress < 25) {
          setStatusText('Resolving full-stack network gate...');
        } else if (oldProgress < 50) {
          setStatusText('Downloading Uganda offline registries...');
        } else if (oldProgress < 75) {
          setStatusText('Caching patient essential data streams...');
        } else {
          setStatusText('Securing encrypted PWA session container...');
        }

        const increment = Math.floor(Math.random() * 15) + 5;
        return Math.min(oldProgress + increment, 100);
      });
    }, 250);

    return () => clearInterval(interval);
  }, [onLaunchComplete]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-white via-[#F6FCEB] to-[#E6F7CE] flex flex-col items-center justify-between p-6 select-none font-sans">
      {/* Absolute background element containing the requested 1080x1080 Galaxy wrapper */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden pointer-events-none mix-blend-multiply opacity-60 flex items-center justify-center -z-10"
        style={{ width: '1080px', height: '1080px', position: 'absolute' }}
      >
        <Galaxy
          starSpeed={0.5}
          density={1}
          hueShift={140}
          speed={1}
          glowIntensity={0.3}
          saturation={0}
          mouseRepulsion
          repulsionStrength={2}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          transparent
        />
      </div>

      {/* Header Tag */}
      <div className="w-full max-w-5xl flex items-center justify-between text-[11px] font-bold text-[#558B2F]/80 uppercase tracking-widest pt-2 z-10">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
          <span>CareRefill Sync Engine v2.6</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-lime-600" />
          <span>PWA Compliant Local Node</span>
        </div>
      </div>

      {/* Center content container with enter animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="flex-1 flex flex-col items-center justify-center text-center z-10 max-w-md w-full px-4"
      >
        {/* Logo Container with rotating subtle ring and dual border design */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-3xl bg-lime-400/25 blur-md animate-pulse -z-10" />
          <div className="bg-white p-5 rounded-3xl border border-lime-200/50 shadow-xl overflow-hidden flex items-center justify-center transform hover:scale-105 transition duration-300">
            <img 
              src={logoUrl} 
              alt="CareRefill Logo" 
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Decorative small element */}
          <div className="absolute -bottom-2 -right-2 bg-[#84CC16] text-white p-1.5 rounded-full border border-white shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-lime-100" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B300C] tracking-tight leading-tight mb-2">
          CareRefill Compliance CRM
        </h1>
        <p className="text-xs text-[#558B2F]/90 max-w-sm font-medium mb-8">
          Synchronized clinical workflow coordination platform with integrated offline diagnostics, secure PWA state sync, and Patient Journey tracking.
        </p>

        {/* Interactive loading/gate elements container */}
        <div className="w-full bg-white/75 backdrop-blur-md border border-lime-200/40 p-4 rounded-2xl shadow-sm space-y-3.5">
          {/* Progress bar info */}
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-[#3A601E] tracking-tight">{statusText}</span>
            <span className="font-mono text-lime-700">{progress}%</span>
          </div>

          {/* Progress Bar background track */}
          <div className="h-1.5 w-full bg-lime-100/60 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-lime-500 to-[#84CC16] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>

          {/* Skip buttons or bypass triggers */}
          <button
            onClick={onLaunchComplete}
            className="w-full bg-[#84CC16] hover:bg-[#71B20A] text-white font-bold p-3 rounded-xl text-xs flex items-center justify-center gap-2 hover:shadow-md cursor-pointer transition-all uppercase tracking-wider"
          >
            <span>Skip Synchronization & Enter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Footer information bar */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[10px] text-gray-400 font-medium border-t border-lime-200/20 pt-4 z-10 font-mono">
        <p>© 2026 CareRefill Uganda. Compliance Hub Center.</p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#71B20A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#71B20A] animate-ping" />
            Workspace Node Operational
          </span>
          <span>●</span>
          <span>Lat: 0.3476° N, Lng: 32.5825° E</span>
        </div>
      </div>
    </div>
  );
}
