import { createSlice } from '@reduxjs/toolkit';
import { BinanceSymbol, getBinanceSymbols} from "../api/load/getBinanceSymbols.ts";

export interface BinanceState {
    symbols: BinanceSymbol[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: BinanceState = {
    symbols: [],
    status: 'idle',
    error: null,
};

/**
 * Модуль binanceSlice управляет состоянием данных, связанных с биржей Binance.
 * Основные возможности:
 * - pending: Устанавливает статус "loading" и очищает ошибки.
 * - fulfilled: Сохраняет полученные данные символов и устанавливает статус "succeeded".
 * - rejected: Обрабатывает ошибку, сохраняя её текст и устанавливая статус "failed".
 */
const binanceSlice = createSlice({
    name: 'binance',
    initialState,
    reducers: {},
    extraReducers: (builder): void => {
        builder
            .addCase(getBinanceSymbols.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getBinanceSymbols.fulfilled, (state, action): void  => {
                state.status = 'succeeded';
                state.symbols = action.payload;
            })
            .addCase(getBinanceSymbols.rejected, (state, action): void  => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export default binanceSlice.reducer;
