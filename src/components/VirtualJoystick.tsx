import React, { useState, useRef } from 'react';
import { Radio } from 'lucide-react';

interface VirtualJoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
  onInteract?: () => void;
  hasInteractable?: boolean;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, onInteract, hasInteractable }) => {
  const [touching, setTouching] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setTouching(true);
    updatePosition(e);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touching) return;
    updatePosition(e);
  };

  const handleTouchEnd = () => {
    setTouching(false);
    setKnobPos({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  const updatePosition = (e: React.TouchEvent | React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;

    const maxRadius = 40;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance > maxRadius) {
      deltaX = (deltaX / distance) * maxRadius;
      deltaY = (deltaY / distance) * maxRadius;
    }

    setKnobPos({ x: deltaX, y: deltaY });
    onMove({ x: deltaX / maxRadius, y: -deltaY / maxRadius });
  };

  return (
    <div className="flex items-center justify-between w-full px-6 py-2 pointer-events-auto">
      {/* Touch Joystick Base */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        className="relative w-28 h-28 bg-slate-900/80 border-2 border-cyan-500/40 rounded-full flex items-center justify-center shadow-xl touch-none select-none active:border-cyan-400"
      >
        <div className="absolute inset-0 rounded-full bg-cyan-500/5 animate-ping pointer-events-none" />
        {/* Joystick Stick Knob */}
        <div
          style={{ transform: `translate(${knobPos.x}px, ${knobPos.y}px)` }}
          className="w-12 h-12 bg-cyan-500/90 border border-white rounded-full shadow-lg transition-transform duration-75 flex items-center justify-center"
        >
          <div className="w-4 h-4 rounded-full bg-slate-950" />
        </div>
      </div>

      {/* Action/Interact Button */}
      {hasInteractable && onInteract && (
        <button
          onClick={onInteract}
          className="px-6 py-4 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold font-mono text-sm rounded-2xl shadow-xl shadow-rose-500/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer animate-pulse"
        >
          <Radio className="w-5 h-5" />
          <span>터미널 해킹 접속</span>
        </button>
      )}
    </div>
  );
};
