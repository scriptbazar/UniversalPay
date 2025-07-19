
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowRightLeft, Bot, Repeat } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { currencies } from '@/lib/currencies';
import { getCurrencyInfo } from '@/ai/flows/currencyInfoFlow';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
          <Button variant="outline" className="w-full justify-start font-normal">
            {selected.code} - {selected.name}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Select Currency</DialogTitle>
            <DialogDescription>
              Choose a currency from the list below.
            </DialogDescription>
          </DialogHeader>
          <CurrencyList setOpen={setOpen} onSelect={onSelect} currencyList={currencyList} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal">
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

  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const exchangeRate = 83.5; // Dummy exchange rate for demonstration
  const cryptoExchangeRate = 65000; // Dummy BTC to USD

  const convertedAmount = useMemo(() => {
    if (!amount) return 0;
    if (fromCurrency.code === 'USD' && toCurrency.code === 'INR') {
      return (amount * exchangeRate).toFixed(2);
    }
    if (fromCurrency.code === 'INR' && toCurrency.code === 'USD') {
      return (amount / exchangeRate).toFixed(2);
    }
    return (amount * (Math.random() * 200 + 0.5)).toFixed(2);
  }, [amount, fromCurrency, toCurrency, exchangeRate]);

  const convertedCryptoAmount = useMemo(() => {
      if (!cryptoAmount) return 0;
      if (fromCrypto.code === 'BTC' && toCrypto.code === 'USD') {
        return (cryptoAmount * cryptoExchangeRate).toFixed(2);
      }
      if (fromCrypto.code === 'USD' && toCrypto.code === 'BTC') {
        return (cryptoAmount / cryptoExchangeRate).toFixed(8);
      }
      return (cryptoAmount * (Math.random() * 50000 + 1000)).toFixed(2);
  }, [cryptoAmount, fromCrypto, toCrypto, cryptoExchangeRate]);
  
  const handleSwap = () => {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
  }

  const handleCryptoSwap = () => {
      const temp = fromCrypto;
      setFromCrypto(toCrypto);
      setToCrypto(temp);
  }
  
  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery) return;
    setIsLoading(true);
    setAiResponse('');
    try {
      const { explanation } = await getCurrencyInfo({ currency: aiQuery });
      setAiResponse(explanation);
    } catch (error) {
      console.error("AI query failed:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not get information about the currency.",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Currency Tools</h1>
        <p className="text-muted-foreground">Convert currencies, check crypto rates, and ask our AI assistant.</p>
      </div>
      <Separator />

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Fiat Currency Converter</CardTitle>
            <CardDescription>Convert between global government-issued currencies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-5 gap-4 items-end">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
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
                    <Input value={convertedAmount} readOnly className="font-bold text-lg bg-muted" />
                </div>
                <div className="sm:col-span-3 space-y-2">
                    <Label>To</Label>
                    <CurrencySelector selected={toCurrency} onSelect={setToCurrency} currencyList={fiatCurrencies} />
                </div>
            </div>

            <div className="text-sm text-muted-foreground pt-4">
                1 {fromCurrency.code} = {(convertedAmount / (amount || 1)).toFixed(4)} {toCurrency.code}
                {lastUpdated && <p className="text-xs">Last updated: {lastUpdated}. Rates are for demonstration purposes.</p>}
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crypto Converter</CardTitle>
            <CardDescription>Convert between cryptocurrencies and major fiat.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-5 gap-4 items-end">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="crypto-amount">Amount</Label>
                <Input
                  id="crypto-amount"
                  type="number"
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
                    <Input value={convertedCryptoAmount} readOnly className="font-bold text-lg bg-muted" />
                </div>
                <div className="sm:col-span-3 space-y-2">
                    <Label>To</Label>
                    <CurrencySelector selected={toCrypto} onSelect={setToCrypto} currencyList={cryptoCurrencies} />
                </div>
            </div>

            <div className="text-sm text-muted-foreground pt-4">
                1 {fromCrypto.code} = {(convertedCryptoAmount / (cryptoAmount || 1)).toFixed(4)} {toCrypto.code}
                 {lastUpdated && <p className="text-xs">Last updated: {lastUpdated}. Rates are for demonstration purposes.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

       <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot /> AI Currency Assistant
            </CardTitle>
            <CardDescription>
              Can't find a currency? Ask our AI about it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAiQuery} className="flex gap-2 mb-4">
              <Input
                placeholder="e.g., 'Gold Pressed Latinum', 'DogeCoin', '100 JPY to INR'"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Asking...' : 'Ask AI'}
              </Button>
            </form>

            {isLoading && <p>Thinking...</p>}
            
            {aiResponse && (
                <Alert>
                    <Bot className="h-4 w-4"/>
                    <AlertTitle>AI Response</AlertTitle>
                    <AlertDescription>
                        {aiResponse}
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
