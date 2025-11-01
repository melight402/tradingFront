import { useState, useEffect, useRef } from "react";
import { MIN_VOLUME_USD } from "../constants";
import { formatSymbolLabel } from "../utils";
import { subscribeToSymbolsUpdates } from "../services/symbolsWebSocketService";

export function useSymbols() {
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const allowedSymbolsRef = useRef(new Set());

  useEffect(() => {
    const fetchInitialSymbols = async () => {
      try {
        setLoading(true);
        setError(null);

        const exchangeInfoUrl = "https://fapi.binance.com/fapi/v1/exchangeInfo";
        const exchangeInfoResponse = await fetch(exchangeInfoUrl, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!exchangeInfoResponse.ok) {
          throw new Error(`HTTP error! status: ${exchangeInfoResponse.status}`);
        }

        const exchangeInfo = await exchangeInfoResponse.json();
        
        const activeSymbols = new Set(
          exchangeInfo.symbols
            .filter((symbolInfo) => {
              return (
                symbolInfo.status === 'TRADING' &&
                symbolInfo.contractType === 'PERPETUAL' &&
                (symbolInfo.symbol.endsWith("USDT") || symbolInfo.symbol.endsWith("USDC"))
              );
            })
            .map((symbolInfo) => symbolInfo.symbol)
        );

        allowedSymbolsRef.current = activeSymbols;

        const url = "https://fapi.binance.com/fapi/v1/ticker/24hr";

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tickerData = await response.json();

        const initialSymbols = tickerData
          .filter((ticker) => {
            const quoteVolume = parseFloat(ticker.quoteVolume) || 0;
            const symbol = ticker.symbol;
            
            return (
              activeSymbols.has(symbol) &&
              quoteVolume >= MIN_VOLUME_USD &&
              (symbol.endsWith("USDT") || symbol.endsWith("USDC"))
            );
          })
          .map((ticker) => {
            const lastPrice = parseFloat(ticker.lastPrice) || 0;
            const openPrice = parseFloat(ticker.openPrice) || 0;
            let priceChangePercent = 0;
            if (openPrice > 0) {
              priceChangePercent = ((lastPrice - openPrice) / openPrice) * 100;
            }
            
            return {
              value: ticker.symbol,
              label: formatSymbolLabel(ticker.symbol),
              volume: parseFloat(ticker.quoteVolume) || 0,
              priceChangePercent: priceChangePercent,
            };
          })
          .sort((a, b) => b.volume - a.volume);

        setSymbols(initialSymbols);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load symbols");
        setSymbols([
          { value: "BTCUSDT", label: "BTC/USDT", volume: 0, priceChangePercent: 0 },
          { value: "ETHUSDT", label: "ETH/USDT", volume: 0, priceChangePercent: 0 },
        ]);
        setLoading(false);
      }
    };

    fetchInitialSymbols();

    const unsubscribe = subscribeToSymbolsUpdates((tickersData) => {
      const filteredSymbolsMap = new Map();

      tickersData.forEach((ticker) => {
        const symbol = ticker.symbol;
        
        if (
          allowedSymbolsRef.current.has(symbol) &&
          ticker.quoteVolume >= MIN_VOLUME_USD &&
          (symbol.endsWith("USDT") || symbol.endsWith("USDC"))
        ) {
          filteredSymbolsMap.set(symbol, {
            value: symbol,
            label: formatSymbolLabel(symbol),
            volume: ticker.quoteVolume,
            priceChangePercent: ticker.priceChangePercent,
          });
        }
      });

      if (filteredSymbolsMap.size > 0) {
        const sortedSymbols = Array.from(filteredSymbolsMap.values())
          .sort((a, b) => b.volume - a.volume);
        setSymbols(sortedSymbols);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { symbols, loading, error };
}

