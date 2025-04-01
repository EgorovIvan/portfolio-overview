import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { removeAsset, updateAssetPrice, Asset } from '../../store/assetsSlice.ts';
// import { io, Socket } from 'socket.io-client';
import './AssetItem.scss'

interface AssetItemProps {
    asset: Asset;
    totalValue: number; // Общая сумма по всем активам (для вычисления процента)
    calculatePortfolioPercentage: (val: number, totalVal: number) => string;
}

/**
 * Отображение информации о конкретном активе в портфеле, включая название, количество, текущую цену,
 * общую стоимость, процентное изменение цены и долю в портфеле.
 */
const AssetItem: React.FC<AssetItemProps> = ({
                                                 asset,
                                                 totalValue,
                                                 calculatePortfolioPercentage,
                                             }) => {
    const dispatch = useDispatch();

    // Скрыл рабочий вариант на socket.io чтобы запустить проект на https://app.netlify.com/
    // let socket: Socket | null = null;

    // useEffect(() => {
    //     // Подключаемся к Socket.IO серверу
    //     const SOCKET_URL = 'http://localhost:3001'; // URL вашего прокси-сервера
    //     socket = io(SOCKET_URL);
    //
    //     // Подписываемся на символ
    //     const symbol = asset.name.toLowerCase();
    //     socket.emit('subscribe', symbol);
    //
    //     // Получаем данные о цене
    //     socket.on('ticker', (data: any) => {
    //         try {
    //             if (data?.c && data?.P) {
    //                 const currentPrice = parseFloat(data.c);
    //                 const priceChangePercent = parseFloat(data.P);
    //                 dispatch(updateAssetPrice({ id: asset.id, currentPrice, priceChangePercent }));
    //             }
    //         } catch (err) {
    //             console.error('Error parsing Socket.IO data:', err);
    //         }
    //     });
    //
    //     return () => {
    //         // Отключаемся от сервера
    //         if (socket) {
    //             socket.disconnect();
    //             socket = null;
    //         }
    //     };
    // }, [asset.name, asset.id, dispatch]);
    useEffect(() => {
        // Открываем WebSocket
        const symbol: string = asset.name.toLowerCase();
        const wsUrl: string = `wss://stream.binance.com:9443/ws/${symbol}@ticker`;
        const ws: WebSocket = new WebSocket(wsUrl);

        ws.onopen = (): void => {
            console.log(`WebSocket connected for ${asset.name}`);
        };

        ws.onmessage = (event): void => {
            try {
                const data = JSON.parse(event.data);
                if (data?.c) {
                    const currentPrice = parseFloat(data.c);
                    const priceChangePercent = parseFloat(data.P); // Процентное изменение за 24 часа
                    // Обновляем цену в Redux
                    dispatch(updateAssetPrice({ id: asset.id, currentPrice, priceChangePercent }));
                }
            } catch (err) {
                console.error('Error parsing WS data:', err);
            }
        };

        ws.onerror = (error): void => {
            console.error(`WebSocket error for ${asset.name}:`, error);
        };

        ws.onclose = (): void => {
            console.log(`WebSocket disconnected for ${asset.name}`);
        };

        // При размонтировании компонента — закрываем соединение
        return (): void => {
            ws.close();
        };
    }, [asset.name, asset.id, dispatch]);

    const handleRemoveAsset = (): void => {
        dispatch(removeAsset(asset.id));
    };

    // Расчёты для отображения
    const totalValueForAsset: number = asset.quantity * asset.currentPrice;
    const portfolioPercentage: string = calculatePortfolioPercentage(totalValueForAsset, totalValue);

    // Определение классов для процентного изменения цены
    const priceChangeClass = classNames('asset-column', {
        'positive-change': asset.priceChangePercent > 0,
        'negative-change': asset.priceChangePercent < 0,
    });

    return (
        <li className="asset-item" role="row" onClick={handleRemoveAsset} aria-label={`Удалить актив ${asset.name}`}>
            {/* Название актива */}
            <div className="asset-column" role="cell">{asset.name}</div>
            {/* Количество */}
            <div className="asset-column" role="cell">{asset.quantity}</div>
            {/* Текущая цена */}
            <div className="asset-column" role="cell">${asset.currentPrice.toFixed(4)}</div>
            {/* Общая стоимость актива */}
            <div className="asset-column" role="cell">${totalValueForAsset.toFixed(2)}</div>
            {/* Процентное изменение цены */}
            <div className={priceChangeClass}>{asset.priceChangePercent}%</div>
            {/* Процент портфеля */}
            <div className="asset-column" role="cell">{portfolioPercentage}</div>
            {/* с кнопкой было бу удобнее, при выборе актива можно было бы загружить его в график*/}
            {/* Кнопка удаления */}
            {/*<div className="asset-column" role="cell">*/}
            {/*    <button*/}
            {/*        className={classNames('remove-button', { 'disabled': totalValueForAsset === 0 })}*/}
            {/*        onClick={handleRemoveAsset}*/}
            {/*        disabled={totalValueForAsset === 0}*/}
            {/*        aria-label={`Удалить актив ${asset.name}`}*/}
            {/*        tabIndex={1}*/}
            {/*    >*/}
            {/*        Удалить*/}
            {/*    </button>*/}
            {/*</div>*/}
        </li>
    );
};

export default AssetItem;