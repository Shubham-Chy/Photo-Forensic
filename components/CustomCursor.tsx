
import React, { useEffect, useState, useRef } from 'react';

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  
  const mousePos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
      
      // Robust hover check
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName.toLowerCase() === 'button' || 
        target.tagName.toLowerCase() === 'a' || 
        target.tagName.toLowerCase() === 'input' || 
        target.tagName.toLowerCase() === 'textarea' || 
        target.closest('.cursor-pointer') ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('glitch-hover');
      
      setIsHovering(!!isClickable);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const animate = () => {
      dotPos.current.x = mousePos.current.x;
      dotPos.current.y = mousePos.current.y;
      
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${isClicking ? 0.8 : 1})`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible, isClicking]);

  if (!isVisible) return null;

  return (
    <div id="custom-cursor" className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Outer Ring */}
      <div 
        ref={ringRef}
        className="fixed pointer-events-none transition-[width,height,opacity,border-color] duration-300 ease-out"
        style={{
          width: isHovering ? '70px' : '34px',
          height: isHovering ? '70px' : '34px',
          border: '1px solid white',
          borderRadius: '50%',
          opacity: isHovering ? 0.6 : 0.2,
          willChange: 'transform',
        }}
      />
      
      {/* Inner Dot */}
      <div 
        ref={dotRef}
        className="fixed pointer-events-none z-[10000] flex items-center justify-center"
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: 'white',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(255,255,255,0.5)',
          willChange: 'transform',
        }}
      >
        {isHovering && (
           <div className="absolute inset-0 bg-white blur-[2px] animate-pulse rounded-full"></div>
        )}
      </div>
    </div>
  );
};

export default CustomCursor;
