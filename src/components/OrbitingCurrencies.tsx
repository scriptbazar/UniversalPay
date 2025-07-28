
'use client';

import { Logo } from "./logo";
import { DollarSign, Euro, IndianRupee, PoundSterling, Bitcoin, JapaneseYen, SwissFranc, Globe } from 'lucide-react';
import React from 'react';

// A dedicated component for each icon on the orbit.
// The outer div handles positioning on the circle.
// The inner div handles the appearance and counter-rotation to keep the icon upright.
const CurrencyIcon = ({ children, positionClasses, animationClass }: { children: React.ReactNode, positionClasses: string, animationClass: string }) => (
    <div className={`absolute w-full h-full ${positionClasses}`}>
        <div className={`absolute -m-5 -translate-x-1/2 -translate-y-1/2 ${animationClass}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border shadow-md text-primary">
                {children}
            </div>
        </div>
    </div>
);

const OrbitingCurrencies = () => {
    return (
        <div className="relative flex h-96 w-96 items-center justify-center scale-75 md:scale-100">
            {/* Central Logo */}
            <div className="absolute flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm border">
                <Globe className="h-10 w-10 text-primary" />
            </div>

            {/* Orbit 1 */}
            <div className="absolute h-40 w-40 rounded-full border-2 border-dashed border-muted animate-orbit-1">
                <CurrencyIcon positionClasses="top-0 left-1/2" animationClass="animate-orbit-1-reverse"><DollarSign className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon positionClasses="top-1/2 left-full" animationClass="animate-orbit-1-reverse"><Euro className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon positionClasses="top-full left-1/2" animationClass="animate-orbit-1-reverse"><PoundSterling className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon positionClasses="top-1/2 left-0" animationClass="animate-orbit-1-reverse"><IndianRupee className="w-5 h-5"/></CurrencyIcon>
            </div>
            
             {/* Orbit 2 */}
            <div className="absolute h-60 w-60 rounded-full border-2 border-dashed border-muted animate-orbit-2">
                <CurrencyIcon positionClasses="top-0 left-1/2" animationClass="animate-orbit-2-reverse"><Bitcoin className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon positionClasses="top-1/2 left-full" animationClass="animate-orbit-2-reverse"><JapaneseYen className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon positionClasses="top-full left-1/2" animationClass="animate-orbit-2-reverse"><SwissFranc className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon positionClasses="top-1/2 left-0" animationClass="animate-orbit-2-reverse"><span className="text-xl font-bold">₺</span></CurrencyIcon>
            </div>
            
            {/* Orbit 3 */}
            <div className="absolute h-80 w-80 rounded-full border-2 border-dashed border-muted animate-orbit-3">
                <CurrencyIcon positionClasses="top-0 left-1/2" animationClass="animate-orbit-3-reverse">C$</CurrencyIcon> {/* CAD */}
                <CurrencyIcon positionClasses="top-1/2 left-full" animationClass="animate-orbit-3-reverse">A$</CurrencyIcon> {/* AUD */}
                <CurrencyIcon positionClasses="top-full left-1/2" animationClass="animate-orbit-3-reverse">₽</CurrencyIcon> {/* Ruble */}
                <CurrencyIcon positionClasses="top-1/2 left-0" animationClass="animate-orbit-3-reverse">Fr</CurrencyIcon> {/* Franc */}
            </div>

             {/* Orbit 4 */}
            <div className="absolute h-[26rem] w-[26rem] rounded-full border-2 border-dashed border-muted animate-orbit-4">
                 <CurrencyIcon positionClasses="top-0 left-1/2" animationClass="animate-orbit-4-reverse">د.إ</CurrencyIcon> {/* AED */}
                 <CurrencyIcon positionClasses="top-1/2 left-full" animationClass="animate-orbit-4-reverse">R</CurrencyIcon> {/* ZAR */}
                 <CurrencyIcon positionClasses="top-full left-1/2" animationClass="animate-orbit-4-reverse">S$</CurrencyIcon> {/* SGD */}
                 <CurrencyIcon positionClasses="top-1/2 left-0" animationClass="animate-orbit-4-reverse">CN¥</CurrencyIcon> {/* CNH/CNY */}
            </div>
        </div>
    )
}

export default OrbitingCurrencies;
