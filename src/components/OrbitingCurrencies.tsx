
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
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="animate-orbit-1-reverse"><CurrencyIcon><DollarSign className="w-5 h-5"/></CurrencyIcon></div>
                </div>
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <div className="animate-orbit-1-reverse"><CurrencyIcon><Euro className="w-5 h-5"/></CurrencyIcon></div>
                </div>
            </div>
            
             {/* Orbit 2 */}
            <div className="absolute h-60 w-60 rounded-full border-2 border-dashed border-muted animate-orbit-2">
                 <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2">
                     <div className="animate-orbit-2-reverse"><CurrencyIcon><IndianRupee className="w-5 h-5"/></CurrencyIcon></div>
                </div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2">
                    <div className="animate-orbit-2-reverse"><CurrencyIcon><PoundSterling className="w-5 h-5"/></CurrencyIcon></div>
                </div>
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="animate-orbit-2-reverse"><CurrencyIcon><Bitcoin className="w-5 h-5"/></CurrencyIcon></div>
                </div>
            </div>
            
            {/* Orbit 3 */}
            <div className="absolute h-80 w-80 rounded-full border-2 border-dashed border-muted animate-orbit-3">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="animate-orbit-3-reverse"><CurrencyIcon>¥</CurrencyIcon></div> {/* Yen */}
                </div>
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <div className="animate-orbit-3-reverse"><CurrencyIcon>Fr</CurrencyIcon></div> {/* Franc */}
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2">
                   <div className="animate-orbit-3-reverse"><CurrencyIcon>₽</CurrencyIcon></div> {/* Ruble */}
                </div>
                 <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2">
                   <div className="animate-orbit-3-reverse"><CurrencyIcon>C$</CurrencyIcon></div> {/* CAD */}
                </div>
            </div>

             {/* Orbit 4 */}
            <div className="absolute h-[26rem] w-[26rem] rounded-full border-2 border-dashed border-muted animate-orbit-4">
                 <div className="absolute top-1/4 left-0 -translate-x-1/2 -translate-y-1/2">
                    <div className="animate-orbit-4-reverse"><CurrencyIcon>A$</CurrencyIcon></div> {/* AUD */}
                </div>
                 <div className="absolute bottom-1/4 right-0 translate-x-1/2 translate-y-1/2">
                    <div className="animate-orbit-4-reverse"><CurrencyIcon>د.إ</CurrencyIcon></div> {/* AED */}
                </div>
            </div>
        </div>
    )
}

export default OrbitingCurrencies;
