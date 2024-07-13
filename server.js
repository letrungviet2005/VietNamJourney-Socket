const WebSocket = require('ws');
const { handleMessage, handleClientClose } = require('./handler');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        handleMessage(ws, message, wss); // Gọi hàm xử lý tin nhắn từ handler
    });

    ws.on('close', () => {
        handleClientClose(); // Gọi hàm xử lý khi client đóng kết nối từ handler
    });
});

console.log('WebSocket server is running on ws://localhost:8080');