
'use client';

import { Logo } from "./logo";
import { DollarSign, Euro, IndianRupee, PoundSterling, Bitcoin, Code } from 'lucide-react';
import React from 'react';

const CurrencyIcon = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`absolute flex h-10 w-10 items-center justify-center rounded-full bg-background border shadow-md text-primary ${className}`}>
        {children}
    </div>
);

const OrbitingCurrencies = () => {
    return (
        <div className="relative flex h-96 w-96 items-center justify-center scale-75 md:scale-100">
            {/* Central Logo */}
            <div className="absolute flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm border">
                <Logo />
            </div>

            {/* Orbit 1 */}
            <div className="absolute h-40 w-40 rounded-full border-2 border-dashed border-muted animate-orbit-1">
                <CurrencyIcon className="top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-1-reverse"><DollarSign className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon className="bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 animate-orbit-1-reverse"><Euro className="w-5 h-5"/></CurrencyIcon>
            </div>
            
             {/* Orbit 2 */}
            <div className="absolute h-60 w-60 rounded-full border-2 border-dashed border-muted animate-orbit-2">
                <CurrencyIcon className="top-1/2 right-0 -translate-y-1/2 translate-x-1/2 animate-orbit-2-reverse"><IndianRupee className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon className="top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 animate-orbit-2-reverse"><PoundSterling className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon className="top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-2-reverse"><Bitcoin className="w-5 h-5"/></CurrencyIcon>
            </div>
            
            {/* Orbit 3 */}
            <div className="absolute h-80 w-80 rounded-full border-2 border-dashed border-muted animate-orbit-3">
                <CurrencyIcon className="top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-3-reverse">¥</CurrencyIcon> {/* Yen */}
                <CurrencyIcon className="bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 animate-orbit-3-reverse">Fr</CurrencyIcon> {/* Franc */}
                <CurrencyIcon className="top-1/2 right-0 -translate-y-1/2 translate-x-1/2 animate-orbit-3-reverse">₽</CurrencyIcon> {/* Ruble */}
                <CurrencyIcon className="top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 animate-orbit-3-reverse">C$</CurrencyIcon> {/* CAD */}
            </div>

             {/* Orbit 4 */}
            <div className="absolute h-[26rem] w-[26rem] rounded-full border-2 border-dashed border-muted animate-orbit-4">
                <CurrencyIcon className="top-1/4 left-0 -translate-x-1/2 -translate-y-1/2 animate-orbit-4-reverse">A$</CurrencyIcon> {/* AUD */}
                <CurrencyIcon className="bottom-1/4 right-0 translate-x-1/2 translate-y-1/2 animate-orbit-4-reverse">د.إ</CurrencyIcon> {/* AED */}
            </div>
        </div>
    )
}

export default OrbitingCurrencies;
