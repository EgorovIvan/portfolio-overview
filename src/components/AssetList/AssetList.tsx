import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AssetItem from '../AssetItem/AssetItem.tsx';
import './AssetList.scss';
import { FixedSizeList as List } from 'react-window';
import {Asset} from "../../store/assetsSlice.ts";

interface RowProps {
    index: number;
    style: React.CSSProperties;
}

/**
 * Отображение списка активов с детальной информацией о каждом, включая название,
 * количество, текущую стоимость, изменение за 24 часа и долю в портфеле.
 */
const AssetList: React.FC = () => {
    const assets: Asset[] = useSelector((state: RootState) => state.assets.assets);

    const calculateTotalValue = () => {
        return assets.reduce((total, asset) => total + asset.quantity * asset.currentPrice, 0);
    };

    const totalPortfolioValue: number = calculateTotalValue();

    const calculatePortfolioPercentage = (value: number, totalValue: number): string => {
        if (totalValue === 0) return '0%';
        return `${((value / totalValue) * 100).toFixed(2)}%`;
    };

    // Компонент для отображения строки через FixedSizeList
    const Row: React.FC<RowProps> = ({ index, style }) => (
        <div style={style}>
            <AssetItem
                key={assets[index].id}
                asset={assets[index]}
                totalValue={totalPortfolioValue}
                calculatePortfolioPercentage={calculatePortfolioPercentage}
            />
        </div>
    );

    return (
        <div className="asset-list">
            <div className="asset-header" role="row">
                <div className="asset-column" role="cell">Название</div>
                <div className="asset-column" role="cell">Количество</div>
                <div className="asset-column" role="cell">Текущая цена</div>
                <div className="asset-column" role="cell">Общая стоимость</div>
                <div className="asset-column" role="cell">Изменение <br/>за 24 часа</div>
                <div className="asset-column" role="cell">Доля в портфеле</div>
            </div>
            <ul>
                <List
                    height={500} // Высота контейнера
                    itemCount={assets.length} // Количество элементов в списке
                    itemSize={50} // Высота одного элемента
                    width="100%" // Ширина контейнера
                >
                    {Row}
                </List>
            </ul>
        </div>
    );
};

export default AssetList;