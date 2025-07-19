
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowRightLeft, Bot } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { currencies } from '@/lib/currencies';
import { getCurrencyInfo } from '@/ai/flows/currencyInfoFlow';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Currency = {
  code: string;
  name: string;
};

const CurrencySelector = ({
  selected,
  onSelect,
}: {
  selected: Currency;
  onSelect: (currency: Currency) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal">
          {selected.code} - {selected.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-[300px]" 
        side="bottom" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {currencies.map((currency) => (
                <CommandItem
                  key={currency.code}
                  value={`${currency.code} ${currency.name}`}
                  onSelect={() => {
                    onSelect(currency);
                    setOpen(false);
                  }}
                >
                  <span>{currency.code}</span>
                  <span className="text-muted-foreground ml-2">{currency.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function CurrencyConverterPage() {
    const { toast } = useToast();
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState<Currency>({ code: 'USD', name: 'United States Dollar' });
  const [toCurrency, setToCurrency] = useState<Currency>({ code: 'INR', name: 'Indian Rupee' });
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const exchangeRate = 83.5; // Dummy exchange rate for demonstration

  const convertedAmount = useMemo(() => {
    if (!amount) return 0;
    // In a real app, you would fetch this from an API
    if (fromCurrency.code === 'USD' && toCurrency.code === 'INR') {
      return (amount * exchangeRate).toFixed(2);
    }
    if (fromCurrency.code === 'INR' && toCurrency.code === 'USD') {
      return (amount / exchangeRate).toFixed(2);
    }
    // Dummy conversion for other pairs
    return (amount * (Math.random() * 2 + 0.5)).toFixed(2);
  }, [amount, fromCurrency, toCurrency, exchangeRate]);
  
  const handleSwap = () => {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
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
        <h1 className="text-3xl font-bold tracking-tight">Live Currency Converter</h1>
        <p className="text-muted-foreground">Check real-time rates and convert currencies.</p>
      </div>
      <Separator />

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Converter</CardTitle>
            <CardDescription>Select currencies and enter an amount to convert.</CardDescription>
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
              <div className="sm:col-span-2 space-y-2">
                <Label>From</Label>
                <CurrencySelector selected={fromCurrency} onSelect={setFromCurrency} />
              </div>
            </div>

            <div className="flex justify-center my-4">
                <Button variant="ghost" size="icon" onClick={handleSwap}>
                    <ArrowRightLeft className="w-5 h-5 text-muted-foreground"/>
                </Button>
            </div>

             <div className="grid sm:grid-cols-5 gap-4 items-end">
                <div className="sm:col-span-2 space-y-2">
                    <Label>Converted Amount</Label>
                    <Input value={convertedAmount} readOnly className="font-bold text-lg bg-muted" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                    <Label>To</Label>
                    <CurrencySelector selected={toCurrency} onSelect={setToCurrency} />
                </div>
            </div>

            <div className="text-sm text-muted-foreground pt-4">
                1 {fromCurrency.code} = {exchangeRate} {toCurrency.code}
                {lastUpdated && <p className="text-xs">Last updated: {lastUpdated}. Rates are for demonstration purposes.</p>}
            </div>

          </CardContent>
        </Card>

        <Card>
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
                placeholder="e.g., 'Gold Pressed Latinum', 'DogeCoin'"
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
    </div>
  );
}
