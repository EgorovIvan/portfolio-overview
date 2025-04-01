import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Описание структуры одного актива
export interface Asset {
    id: string;
    name: string;
    quantity: number;
    currentPrice: number;
    priceChangePercent: number; // Процентное изменение цены за 24 часа
}

interface AssetsState {
    assets: Asset[];
}

// Читаем данные из localStorage (если есть)
const localStorageKey = 'assets';

const savedAssets = localStorage.getItem(localStorageKey);
const initialState: AssetsState = {
    assets: savedAssets
        ? JSON.parse(savedAssets).map((asset: Asset) => ({
            ...asset,
            priceChangePercent: asset.priceChangePercent || 0, // Добавляем значение по умолчанию
        }))
        : [],
};

/**
 * Модуль assetsSlice управляет состоянием активов (акции, товары и т.д.) в приложении.
 * Основные возможности:
 * - Добавление нового актива или обновление количества существующего актива по имени.
 * - Удаление актива по его уникальному идентификатору (id).
 * - Обновление текущей цены и процентного изменения цены актива.
 */
 const assetsSlice = createSlice({
    name: 'assets',
    initialState,
    reducers: {
        addAsset: (
            state,
            action: PayloadAction<{
                name: string;
                quantity: number;
                currentPrice: number;
                priceChangePercent: number;
            }>
        ): void => {
            const { name, quantity, currentPrice, priceChangePercent } = action.payload;

            // Проверяем, существует ли актив с таким же именем
            const existingAsset = state.assets.find((asset) => asset.name === name);

            if (existingAsset) {
                // Если актив уже существует, обновляем только количество
                existingAsset.quantity += quantity;
            } else {
                // Если актива нет, добавляем новый
                const newAsset: Asset = {
                    id: uuidv4(),
                    name,
                    quantity,
                    currentPrice,
                    priceChangePercent,
                };
                state.assets.push(newAsset);
            }

            // Сохраняем обновлённое состояние в localStorage
            localStorage.setItem(localStorageKey, JSON.stringify(state.assets));
        },
        removeAsset: (state, action: PayloadAction<string>): void => {
            state.assets = state.assets.filter((asset) => asset.id !== action.payload);
            localStorage.setItem(localStorageKey, JSON.stringify(state.assets));
        },
        updateAssetPrice: (
            state,
            action: PayloadAction<{ id: string; currentPrice: number; priceChangePercent: number }>
        ): void => {
            const asset = state.assets.find((a) => a.id === action.payload.id);
            if (asset) {
                asset.currentPrice = action.payload.currentPrice;
                asset.priceChangePercent = action.payload.priceChangePercent;
            }
            localStorage.setItem(localStorageKey, JSON.stringify(state.assets));
        },
    },
});

export const { addAsset, removeAsset, updateAssetPrice } = assetsSlice.actions;
export default assetsSlice.reducer;
