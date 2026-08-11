'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowRightLeft, Repeat, Banknote, Bitcoin, RefreshCw } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { currencies } from '@/lib/currencies';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';

type Currency = {
  code: string;
  name: string;
};

const fiatCurrencies = currencies.filter(c => !c.name.includes('(Crypto)'));
const cryptoCurrencies = currencies.filter(c => c.name.includes('(Crypto)') || c.code === 'USD' || c.code === 'INR');

function CurrencyList({
  setOpen,
  onSelect,
  currencyList
}: {
  setOpen: (open: boolean) => void;
  onSelect: (currency: Currency) => void;
  currencyList: Currency[];
}) {
  return (
    <Command>
      <CommandInput placeholder="Search currency..." />
      <CommandList>
        <CommandEmpty>No currency found.</CommandEmpty>
        <CommandGroup>
          {currencyList.map((currency) => (
            <CommandItem
              key={currency.code}
              value={`${currency.code} ${currency.name}`}
              onSelect={() => {
                onSelect(currency);
                setOpen(false);
              }}
            >
              <span className="font-medium mr-2">{currency.code}</span>
              <span className="text-muted-foreground">{currency.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

const CurrencySelector = ({
  selected,
  onSelect,
  currencyList
}: {
  selected: Currency;
  onSelect: (currency: Currency) => void;
  currencyList: Currency[];
}) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selected.code} - {selected.name}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Currency</DialogTitle>
            <DialogDescription>Search and select a currency from the list below.</DialogDescription>
          </DialogHeader>
          <CurrencyList setOpen={setOpen} onSelect={onSelect} currencyList={currencyList} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selected.code} - {selected.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <CurrencyList setOpen={setOpen} onSelect={onSelect} currencyList={currencyList} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default function CurrencyConverterPage() {
  const { toast } = useToast();
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState<Currency>({ code: 'USD', name: 'United States Dollar' });
  const [toCurrency, setToCurrency] = useState<Currency>({ code: 'INR', name: 'Indian Rupee' });

  const [cryptoAmount, setCryptoAmount] = useState(1);
  const [fromCrypto, setFromCrypto] = useState<Currency>({ code: 'BTC', name: 'Bitcoin (Crypto)' });
  const [toCrypto, setToCrypto] = useState<Currency>({ code: 'USD', name: 'United States Dollar' });

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  
  // Real-time rates state map
  const [fiatRates, setFiatRates] = useState<Record<string, number>>({
    USD: 1,
    INR: 83.5,
    EUR: 0.92,
    GBP: 0.78,
    JPY: 155.2
  });

  const [cryptoRates, setCryptoRates] = useState<Record<string, number>>({
    BTC: 65420,
    ETH: 3450,
    USDT: 1.0,
    SOL: 145.8,
    USD: 1.0,
    INR: 83.5
  });

  const fetchLiveRates = async () => {
    setIsFetchingRates(true);
    try {
      // 1. Fetch Fiat exchange rates
      const fiatRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (fiatRes.ok) {
        const data = await fiatRes.json();
        if (data && data.rates) {
          setFiatRates(data.rates);
        }
      }

      // 2. Fetch Live Crypto rates from CoinGecko
      const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,solana&vs_currencies=usd,inr');
      if (cryptoRes.ok) {
        const cryptoData = await cryptoRes.json();
        setCryptoRates({
          BTC: cryptoData.bitcoin?.usd || 65420,
          ETH: cryptoData.ethereum?.usd || 3450,
          USDT: cryptoData.tether?.usd || 1.0,
          SOL: cryptoData.solana?.usd || 145.8,
          USD: 1.0,
          INR: cryptoData.tether?.inr || 83.5
        });
      }
      setLastUpdated(new Date().toLocaleTimeString());
      toast({
        title: "Live FX Rates Synced",
        description: "Exchange rates updated with live market prices.",
      });
    } catch (err) {
      console.warn("Using fallback exchange rates:", err);
      setLastUpdated(new Date().toLocaleTimeString() + " (Offline Fallback)");
    } finally {
      setIsFetchingRates(false);
    }
  };

  useEffect(() => {
    fetchLiveRates();
  }, []);

  const convertedAmount = useMemo(() => {
    if (!amount || amount <= 0) return "0.00";
    const fromRate = fiatRates[fromCurrency.code] || 1;
    const toRate = fiatRates[toCurrency.code] || 1;
    const amountInUSD = amount / fromRate;
    const result = amountInUSD * toRate;
    return result.toFixed(2);
  }, [amount, fromCurrency, toCurrency, fiatRates]);

  const convertedCryptoAmount = useMemo(() => {
    if (!cryptoAmount || cryptoAmount <= 0) return "0.00";
    const fromRate = cryptoRates[fromCrypto.code] || (fiatRates[fromCrypto.code] ? 1 / fiatRates[fromCrypto.code] : 1);
    const toRate = cryptoRates[toCrypto.code] || (fiatRates[toCrypto.code] ? 1 / fiatRates[toCrypto.code] : 1);
    
    // Convert to USD base first
    let valInUSD = cryptoAmount;
    if (fromCrypto.code === 'BTC' || fromCrypto.code === 'ETH' || fromCrypto.code === 'SOL' || fromCrypto.code === 'USDT') {
      valInUSD = cryptoAmount * (cryptoRates[fromCrypto.code] || 1);
    } else {
      valInUSD = cryptoAmount / (fiatRates[fromCrypto.code] || 1);
    }

    let finalVal = valInUSD;
    if (toCrypto.code === 'BTC' || toCrypto.code === 'ETH' || toCrypto.code === 'SOL') {
      finalVal = valInUSD / (cryptoRates[toCrypto.code] || 1);
      return finalVal.toFixed(6);
    } else {
      finalVal = valInUSD * (fiatRates[toCrypto.code] || 1);
      return finalVal.toFixed(2);
    }
  }, [cryptoAmount, fromCrypto, toCrypto, cryptoRates, fiatRates]);

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleCryptoSwap = () => {
    const temp = fromCrypto;
    setFromCrypto(toCrypto);
    setToCrypto(temp);
  };

  const fiatUnitRate = useMemo(() => {
    const total = Number(convertedAmount);
    return amount > 0 ? (total / amount).toFixed(4) : "0.0000";
  }, [convertedAmount, amount]);

  const cryptoUnitRate = useMemo(() => {
    const total = Number(convertedCryptoAmount);
    return cryptoAmount > 0 ? (total / cryptoAmount).toFixed(6) : "0.0000";
  }, [convertedCryptoAmount, cryptoAmount]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institutional FX &amp; Live Rates</h1>
          <p className="text-muted-foreground">Real-time fiat exchange rates &amp; Web3 cryptocurrency liquidity conversion.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLiveRates} disabled={isFetchingRates} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isFetchingRates ? 'animate-spin' : ''}`} />
          {isFetchingRates ? 'Syncing...' : 'Sync Market Rates'}
        </Button>
      </div>
      <Separator />

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote /> Fiat Currency Converter
            </CardTitle>
            <CardDescription>Convert between global fiat currencies with live FX rates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-5 gap-4 items-end">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <div className="sm:col-span-3 space-y-2">
                <Label>From</Label>
                <CurrencySelector selected={fromCurrency} onSelect={setFromCurrency} currencyList={fiatCurrencies} />
              </div>
            </div>

            <div className="flex justify-center my-2">
              <Button variant="ghost" size="icon" onClick={handleSwap}>
                <ArrowRightLeft className="w-5 h-5 text-muted-foreground"/>
              </Button>
            </div>

            <div className="grid sm:grid-cols-5 gap-4 items-end">
              <div className="sm:col-span-2 space-y-2">
                <Label>Converted Amount</Label>
                <Input value={convertedAmount} readOnly className="font-bold text-lg bg-muted text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="sm:col-span-3 space-y-2">
                <Label>To</Label>
                <CurrencySelector selected={toCurrency} onSelect={setToCurrency} currencyList={fiatCurrencies} />
              </div>
            </div>

            <div className="text-sm text-muted-foreground pt-4 flex justify-between items-center">
              <span>1 {fromCurrency.code} = {fiatUnitRate} {toCurrency.code}</span>
              {lastUpdated && <span className="text-xs text-muted-foreground/80">Updated: {lastUpdated}</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin /> Web3 Crypto Converter
            </CardTitle>
            <CardDescription>Convert between digital crypto assets &amp; fiat currencies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-5 gap-4 items-end">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="crypto-amount">Amount</Label>
                <Input
                  id="crypto-amount"
                  type="number"
                  min="0"
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(Number(e.target.value))}
                />
              </div>
              <div className="sm:col-span-3 space-y-2">
                <Label>From</Label>
                <CurrencySelector selected={fromCrypto} onSelect={setFromCrypto} currencyList={cryptoCurrencies} />
              </div>
            </div>

            <div className="flex justify-center my-2">
              <Button variant="ghost" size="icon" onClick={handleCryptoSwap}>
                <Repeat className="w-5 h-5 text-muted-foreground"/>
              </Button>
            </div>

            <div className="grid sm:grid-cols-5 gap-4 items-end">
              <div className="sm:col-span-2 space-y-2">
                <Label>Converted Amount</Label>
                <Input value={convertedCryptoAmount} readOnly className="font-bold text-lg bg-muted text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="sm:col-span-3 space-y-2">
                <Label>To</Label>
                <CurrencySelector selected={toCrypto} onSelect={setToCrypto} currencyList={cryptoCurrencies} />
              </div>
            </div>

            <div className="text-sm text-muted-foreground pt-4 flex justify-between items-center">
              <span>1 {fromCrypto.code} = {cryptoUnitRate} {toCrypto.code}</span>
              {lastUpdated && <span className="text-xs text-muted-foreground/80">Live Exchange API</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
