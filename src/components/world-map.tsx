
import React from 'react';

const WorldMap = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 1000 500"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <style>
      {`
        .country {
          fill: hsl(var(--card-foreground) / 0.2);
          stroke: hsl(var(--border));
          stroke-width: 0.5;
        }
        .dark .country {
          fill: hsl(var(--muted) / 0.5);
        }
        @keyframes blink {
          50% {
            opacity: 0.5;
          }
        }
        .pin {
          fill: hsl(var(--primary));
          animation: blink 1s infinite;
        }
      `}
    </style>
    {/* Add real world map SVG data here */}
    <g>
      {/* Example of a country path, replace with full map data */}
      <path className="country" d="M..." />
    </g>
    {/* Pins for specific countries */}
    {/* Coordinates are approximate */}
    <circle className="pin" cx="580" cy="220" r="5" /> {/* India */}
    <circle className="pin" cx="250" cy="180" r="5" /> {/* USA */}
    <circle className="pin" cx="350" cy="350" r="5" /> {/* Brazil */}
    <circle className="pin" cx="500" cy="290" r="5" /> {/* Nigeria */}
    <circle className="pin" cx="480" cy="150" r="5" /> {/* UK */}
    <circle className="pin" cx="720" cy="300" r="5" /> {/* Singapore */}
  </svg>
);

export default WorldMap;
