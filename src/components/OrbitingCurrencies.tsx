
'use client';

import { DollarSign, Euro, IndianRupee, PoundSterling, Bitcoin, JapaneseYen, SwissFranc, Globe } from 'lucide-react';
import React from 'react';

// A dedicated component for each icon on the orbit.
// The outer div handles positioning on the circle using rotation.
// The inner div handles the appearance and counter-rotation to keep the icon upright.
const CurrencyIcon = ({ children, rotation, animationClass }: { children: React.ReactNode, rotation: string, animationClass: string }) => (
    <div className="absolute w-full h-full" style={{ transform: `rotate(${rotation})` }}>
        <div className={`absolute top-0 left-1/2 -m-5 -translate-x-1/2 ${animationClass}`} style={{ animationDirection: 'reverse' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 border-primary/30 shadow-md text-primary">
                {children}
            </div>
        </div>
    </div>
);

const OrbitingCurrencies = () => {
    return (
        <div className="relative flex h-full w-full items-center justify-center scale-[0.6] md:scale-100">
            {/* Central Logo */}
            <div className="absolute flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
                <Globe className="h-10 w-10 text-primary" />
            </div>

            {/* Orbit 1 - 5 currencies */}
            <div className="absolute h-40 w-40 rounded-full border border-primary/20 animate-orbit-1">
                <CurrencyIcon rotation="0deg" animationClass="animate-orbit-1"><DollarSign className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon rotation="72deg" animationClass="animate-orbit-1"><Euro className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon rotation="144deg" animationClass="animate-orbit-1"><PoundSterling className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon rotation="216deg" animationClass="animate-orbit-1"><IndianRupee className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon rotation="288deg" animationClass="animate-orbit-1"><Bitcoin className="w-5 h-5"/></CurrencyIcon>
            </div>
            
             {/* Orbit 2 - 5 currencies */}
            <div className="absolute h-60 w-60 rounded-full border border-primary/20 animate-orbit-2">
                <CurrencyIcon rotation="0deg" animationClass="animate-orbit-2"><JapaneseYen className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon rotation="72deg" animationClass="animate-orbit-2"><SwissFranc className="w-5 h-5"/></CurrencyIcon>
                <CurrencyIcon rotation="144deg" animationClass="animate-orbit-2"><span className="text-xl font-bold">₺</span></CurrencyIcon>
                <CurrencyIcon rotation="216deg" animationClass="animate-orbit-2">C$</CurrencyIcon> {/* CAD */}
                <CurrencyIcon rotation="288deg" animationClass="animate-orbit-2">A$</CurrencyIcon> {/* AUD */}
            </div>
            
            {/* Orbit 3 - 5 currencies */}
            <div className="absolute h-80 w-80 rounded-full border border-primary/20 animate-orbit-3">
                 <CurrencyIcon rotation="0deg" animationClass="animate-orbit-3">₽</CurrencyIcon> {/* Ruble */}
                 <CurrencyIcon rotation="72deg" animationClass="animate-orbit-3">Fr</CurrencyIcon> {/* Franc */}
                 <CurrencyIcon rotation="144deg" animationClass="animate-orbit-3">د.إ</CurrencyIcon> {/* AED */}
                 <CurrencyIcon rotation="216deg" animationClass="animate-orbit-3">R</CurrencyIcon> {/* ZAR */}
                 <CurrencyIcon rotation="288deg" animationClass="animate-orbit-3">S$</CurrencyIcon> {/* SGD */}
            </div>

             {/* Orbit 4 - 5 currencies */}
            <div className="absolute h-[26rem] w-[26rem] rounded-full border border-primary/20 animate-orbit-4">
                 <CurrencyIcon rotation="0deg" animationClass="animate-orbit-4">CN¥</CurrencyIcon> {/* CNH/CNY */}
                 <CurrencyIcon rotation="72deg" animationClass="animate-orbit-4">₩</CurrencyIcon> {/* KRW */}
                 <CurrencyIcon rotation="144deg" animationClass="animate-orbit-4">฿</CurrencyIcon> {/* THB */}
                 <CurrencyIcon rotation="216deg" animationClass="animate-orbit-4">RM</CurrencyIcon> {/* MYR */}
                 <CurrencyIcon rotation="288deg" animationClass="animate-orbit-4">₱</CurrencyIcon> {/* PHP */}
            </div>
        </div>
    )
}

export default OrbitingCurrencies;
