import React, { useState, useRef, useEffect } from 'react';

export interface MetricTooltipProps {
  text: string;
  label?: string;
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({ text, label = 'Penjelasan metrik' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="metric-tooltip-container"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className="metric-info-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={label}
        aria-expanded={isOpen}
      >
        ℹ
      </button>

      {isOpen && (
        <div className="metric-tooltip-popover" role="tooltip">
          {text}
        </div>
      )}
    </div>
  );
};
