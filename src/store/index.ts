import { configureStore } from '@reduxjs/toolkit';
import assetsReducer from './assetsSlice.ts';
import binanceReducer from './binanceSlice.ts';

/**
 * Конфигурация глобального хранилища Redux с использованием Redux Toolkit.
 * Содержит редьюсеры для управления состоянием assets и binance.
 * Экспортирует типы RootState и AppDispatch для удобства работы с хранилищем.
 */
export const store = configureStore({
    reducer: {
        assets: assetsReducer,
        binance: binanceReducer,
    },
});

// Типы для использования в useSelector и useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;