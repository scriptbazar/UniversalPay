
'use client';

import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { scaleQuantile } from 'd3-scale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Mock data generation
const generateMockGeoData = () => {
    const countries = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "Singapore", "UAE"];
    return countries.map((country, i) => ({
        country,
        flag: "in", // Placeholder
        volume: Math.floor(Math.random() * 50000) + 10000,
        transactions: Math.floor(Math.random() * 1000) + 100,
        merchants: Math.floor(Math.random() * 50) + 5,
        iso: ["IND", "USA", "GBR", "CAN", "AUS", "DEU", "SGP", "ARE"][i]
    }));
};

export default function GeoAnalyticsPage() {
    const [geoData, setGeoData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setGeoData(generateMockGeoData());
        setLoading(false);
    }, []);

    const colorScale = useMemo(() => {
        if (geoData.length === 0) {
            return () => "#EEE";
        }
        const volumes = geoData.map(d => d.volume);
        return scaleQuantile<string>()
            .domain(volumes)
            .range([
                "#d1e6f1",
                "#b3d6e8",
                "#94c6df",
                "#76b6d6",
                "#58a6cd",
                "#3a96c4",
                "#1c86bb",
                "#0076b2",
                "#0067a1",
            ]);
    }, [geoData]);


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Geographical Revenue</CardTitle>
                    <CardDescription>An overview of your revenue distribution across the world.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="w-full h-[450px]" />
                    ) : (
                        <TooltipProvider>
                        <ComposableMap
                            projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
                            style={{ width: "100%", height: "auto" }}
                         >
                            <Geographies geography={GEO_URL}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const d = geoData.find((s) => s.iso === geo.properties.ISO_A3);
                                        const countryName = geo.properties.NAME;
                                        const tooltipText = d ? `${countryName} - $${d.volume.toLocaleString()}` : `${countryName} - No data`;
                                        return (
                                            <Tooltip key={geo.rsmKey}>
                                                <TooltipTrigger asChild>
                                                     <Geography
                                                        geography={geo}
                                                        style={{
                                                            default: { fill: d ? colorScale(d.volume) : "#EEE", outline: "none" },
                                                            hover: { fill: "#F53", outline: "none", cursor: 'pointer' },
                                                            pressed: { fill: "#E42", outline: "none" },
                                                        }}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{tooltipText}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })
                                }
                            </Geographies>
                        </ComposableMap>
                        </TooltipProvider>
                    )}
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Country Breakdown</CardTitle>
                    <CardDescription>Detailed statistics for each country.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Country</TableHead>
                                <TableHead>Volume (USD)</TableHead>
                                <TableHead>Transactions</TableHead>
                                <TableHead>Merchants</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    </TableRow>
                                ))
                            ) : geoData.map(d => (
                                <TableRow key={d.country}>
                                    <TableCell className="font-medium">{d.country}</TableCell>
                                    <TableCell>${d.volume.toLocaleString()}</TableCell>
                                    <TableCell>{d.transactions.toLocaleString()}</TableCell>
                                    <TableCell>{d.merchants.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

