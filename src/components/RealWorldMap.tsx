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
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              className="fill-current text-muted-foreground/30 dark:text-muted-foreground/50 stroke-background"
            />
          ))
        }
      </Geographies>
      {markers.map(({ name, coordinates, markerOffset }) => (
        <Marker key={name} coordinates={coordinates as [number, number]}>
          <circle r={4} fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth={1} />
          <text
            textAnchor="middle"
            y={markerOffset}
            className="fill-current text-foreground text-xs font-semibold"
          >
            {name}
          </text>
        </Marker>
      ))}
    </ComposableMap>
  )
}

export default memo(RealWorldMap)