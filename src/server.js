
import http from 'http';
import { Server } from 'socket.io';
import WebSocket from 'ws';

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: '*', // Разрешаем все источники
    },
});

io.on('connection', (socket) => {
    console.log(`A client connected: ${socket.id}`);

    socket.on('subscribe', (symbol) => {
        console.log(`Client subscribed to ${symbol}`);

        // Подключаемся к Binance WebSocket
        const binanceWs = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);

        binanceWs.on('message', (data) => {
            try {
                const parsedData = JSON.parse(data.toString());
                if (parsedData?.c && parsedData?.P) {
                    // Пересылаем данные клиенту
                    socket.emit('ticker', parsedData);
                }
            } catch (err) {
                console.error('Error parsing Binance WebSocket data:', err);
            }
        });

        binanceWs.on('close', () => {
            console.log(`Binance WebSocket closed for ${symbol}`);
        });

        // Отключаем соединение при отключении клиента
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            binanceWs.close();
        });
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Socket.IO server is running on port ${PORT}`);
});