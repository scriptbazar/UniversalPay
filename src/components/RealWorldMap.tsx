"use client"

import React, { memo } from "react"
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps"

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json"

const markers = [
    { markerOffset: -15, name: "New Delhi", coordinates: [77.2090, 28.6139] },
    { markerOffset: -15, name: "New York", coordinates: [-74.0060, 40.7128] },
    { markerOffset: 25, name: "London", coordinates: [-0.1278, 51.5074] },
    { markerOffset: 25, name: "Tokyo", coordinates: [139.6917, 35.6895] },
    { markerOffset: 25, name: "Sydney", coordinates: [151.2093, -33.8688] },
    { markerOffset: -15, name: "Dubai", coordinates: [55.2708, 25.2048] },
    { markerOffset: -15, name: "Singapore", coordinates: [103.8198, 1.3521] },
];

const RealWorldMap = () => {
  return (
    <ComposableMap
        projectionConfig={{
            scale: 140,
        }}
        style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <radialGradient id="gradient1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0 }} />
        </radialGradient>
        <style>
            {`
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 1; }
                    70% { transform: scale(1.5); opacity: 0.3; }
                    100% { transform: scale(0.95); opacity: 1; }
                }
                .pulsing-marker {
                    animation: pulse 2s infinite;
                }
            `}
        </style>
      </defs>
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              className="fill-current text-muted-foreground/10 dark:text-muted-foreground/20 stroke-background"
            />
          ))
        }
      </Geographies>
      {markers.map(({ name, coordinates, markerOffset }) => (
        <Marker key={name} coordinates={coordinates as [number, number]}>
            <g className="pulsing-marker">
                 <circle r={8} fill="url(#gradient1)" />
                 <circle r={3} fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth={0.5} />
            </g>
          <text
            textAnchor="middle"
            y={markerOffset}
            className="fill-current text-foreground text-xs font-semibold pointer-events-none"
          >
            {name}
          </text>
        </Marker>
      ))}
    </ComposableMap>
  )
}

export default memo(RealWorldMap)
