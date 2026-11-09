import React, { useRef, useEffect } from 'react';

/**
 * Free Momentum Scrolling from Pop!.js without native drag glitches
 */
export const DragScrollContainer = ({ children, className = '', id = '' }) => {
  const sliderRef = useRef(null);

  const stateRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
    velocity: 0,
    lastX: 0,
    lastTime: 0,
    animationId: null
  });

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Prevent native image and link ghost drag that breaks scroll
    const preventDrag = (e) => e.preventDefault();
    slider.addEventListener('dragstart', preventDrag);

    return () => {
      slider.removeEventListener('dragstart', preventDrag);
    };
  }, []);

  const beginMomentum = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    if (Math.abs(stateRef.current.velocity) < 0.25) return;

    slider.scrollLeft -= stateRef.current.velocity;
    stateRef.current.velocity *= 0.94; // Smooth deceleration
    stateRef.current.animationId = requestAnimationFrame(beginMomentum);
  };

  const handleMouseDown = (e) => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Don't drag if user clicked directly on an interactive button or input
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) {
      return;
    }

    stateRef.current.isDown = true;
    stateRef.current.hasMoved = false;
    cancelAnimationFrame(stateRef.current.animationId);

    stateRef.current.startX = e.pageX - slider.offsetLeft;
    stateRef.current.scrollLeft = slider.scrollLeft;
    stateRef.current.lastX = e.pageX;
    stateRef.current.lastTime = Date.now();
    stateRef.current.velocity = 0;
  };

  const handleMouseLeave = () => {
    if (!stateRef.current.isDown) return;
    stateRef.current.isDown = false;
    beginMomentum();
  };

  const handleMouseUp = (e) => {
    if (!stateRef.current.isDown) return;
    stateRef.current.isDown = false;
    if (stateRef.current.hasMoved) {
      beginMomentum();
    }
  };

  const handleMouseMove = (e) => {
    if (!stateRef.current.isDown) return;
    const slider = sliderRef.current;
    if (!slider) return;

    const x = e.pageX - slider.offsetLeft;
    const walk = x - stateRef.current.startX;

    if (Math.abs(walk) > 4) {
      stateRef.current.hasMoved = true;
      e.preventDefault();
      slider.scrollLeft = stateRef.current.scrollLeft - walk;

      const currentTime = Date.now();
      const timeElapsed = currentTime - stateRef.current.lastTime;
      if (timeElapsed > 0) {
        const distance = e.pageX - stateRef.current.lastX;
        stateRef.current.velocity = distance / (timeElapsed / 16);
        stateRef.current.lastX = e.pageX;
        stateRef.current.lastTime = currentTime;
      }
    }
  };

  return (
    <div
      ref={sliderRef}
      id={id}
      className={className}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      style={{
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {children}
    </div>
  );
};
