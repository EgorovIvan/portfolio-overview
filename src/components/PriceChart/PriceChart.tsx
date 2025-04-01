import React, { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './PriceChart.scss';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Регистрация компонентов PriceChart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface PriceChartProps {
    asset: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ asset }) => {
    const [prices, setPrices] = React.useState<number[]>([]);
    const [timestamps, setTimestamps] = React.useState<string[]>([]);

    // Инициализация WebSocket
    useEffect(() => {
        const symbol: string = asset.toLowerCase();
        const wsUrl: string = `wss://stream.binance.com:9443/ws/${symbol}@ticker`;
        const ws: WebSocket = new WebSocket(wsUrl);

        ws.onopen = (): void => {
            console.log(`WebSocket connected for ${asset}`);
        };

        ws.onmessage = (event): void => {
            try {
                const data = JSON.parse(event.data);
                if (data?.c) {
                    const currentPrice = parseFloat(data.c);

                    // Обновляем массив цен и временных меток
                    setPrices((prevPrices) => {
                        const updatedPrices = [...prevPrices, currentPrice];
                        if (updatedPrices.length > 20) {
                            updatedPrices.shift(); // Ограничиваем количество точек до 20
                        }
                        return updatedPrices;
                    });

                    setTimestamps((prevTimestamps) => {
                        const now = new Date().toLocaleTimeString();
                        const updatedTimestamps = [...prevTimestamps, now];
                        if (updatedTimestamps.length > 20) {
                            updatedTimestamps.shift(); // Ограничиваем количество меток до 20
                        }
                        return updatedTimestamps;
                    });
                }
            } catch (err) {
                console.error('Error parsing WS data:', err);
            }
        };

        ws.onerror = (error): void => {
            console.error(`WebSocket error for ${asset}:`, error);
        };

        ws.onclose = (): void => {
            console.log(`WebSocket disconnected for ${asset}`);
        };

        // Закрытие соединения при размонтировании компонента
        return (): void => {
            ws.close();
        };
    }, [asset]);

    // Настройка данных для графика
    const chartData = {
        labels: timestamps, // Временные метки
        datasets: [
            {
                label: `Цена ${asset}`,
                data: prices, // Цены
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4, // Сглаживание линии
            },
        ],
    };

    // Настройка опций графика
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `График цены ${asset}`,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: false,
            },
        },
    };

    return (
        <div className="chart">
            <Line data={chartData} options={chartOptions} />
        </div>
    );
};

export default PriceChart;