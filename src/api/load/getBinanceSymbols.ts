import {createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

export interface ApiBinanceSymbol {
    symbol: string;
    price: string; // По умолчанию из API приходит строка
}

export interface BinanceSymbol {
    symbol: string;
    price: number;
}

/**
 * Загружает список торговых пар Binance, конвертирует цены в числа и фильтрует только пары, заканчивающиеся на USDT.
 */
export const getBinanceSymbols = createAsyncThunk('assets/fetchCoins', async (): Promise<BinanceSymbol[]> => {
    try {
        // Выполняем запрос к Binance API
        const response = await axios.get<ApiBinanceSymbol[]>('https://api.binance.com/api/v3/ticker/price');

        // Фильтруем только пары, заканчивающиеся на USDT
        const filteredCoins: BinanceSymbol[] = response.data
            .filter((coin: { symbol: string; price: string }) => coin.symbol.endsWith('USDT'))
            .map((coin: { symbol: string; price: string }) => ({
                symbol: coin.symbol,
                price: parseFloat(coin.price),
            }));

        return filteredCoins;
    } catch (error) {
        console.error('Error fetching coins:', error);
        throw new Error('Failed to fetch coins');
    }
});