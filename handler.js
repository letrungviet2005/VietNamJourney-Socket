const WebSocket = require('ws');

// Xử lý khi nhận được tin nhắn từ client
function handleMessage(ws, message, wss) {
    console.log('Received message:', message); // Log received message
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.type) {
        case 'subscribe':
            handleSubscribe(ws, parsedMessage);
            break;
        case 'comment':
            handleComment(ws, parsedMessage, wss);
            break;
        case 'sendMessage':
            handleSendMessage(ws, parsedMessage, wss);
            handleMessageUserUpdate(ws, parsedMessage, wss);
            break;
        case 'getUserOnlines':
            handleGetUserOnlines(ws, parsedMessage, wss);
            break;
         case 'chatgroup': // Add case for chatgroup
            handleChatGroup(ws, parsedMessage, wss);
            break;
        default:
            console.log('Unknown message type:', parsedMessage.type);
            break;
    }
}

// Xử lý đăng ký (subscribe)
function handleSubscribe(ws, parsedMessage) {
    // Dành cho tin nhắn
    ws.user_to_chat = parsedMessage.user_to_chat;
    ws.user_from_chat = parsedMessage.user_from_chat;
    // Dành cho MessengerUser
    ws.user_from = parsedMessage.user_from;
    // Dành cho comment
    ws.post_ID = parsedMessage.post_ID;
    // Trạng thái hoạt động
    ws.user_online = parsedMessage.user_online;
     // Dành cho group chat
    ws.user_group_from = parsedMessage.user_group_from;
    ws.group_id = parsedMessage.group_id;
    console.log( "Nhóm chat đăng ký :",ws.user_group_from , ws.group_id);
}

// Xử lý tin nhắn comment
function handleComment(ws, parsedMessage, wss) {
    console.log('Received comment:', parsedMessage); // Log received comment
    wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN && client.post_ID === parsedMessage.post_ID) {
            client.send(JSON.stringify(parsedMessage)); // Đảm bảo gửi tin nhắn dưới dạng chuỗi JSON
        }
    });
}

// Xử lý tin nhắn gửi đi
function handleSendMessage(ws, parsedMessage, wss) {
    console.log('Received message to send:', parsedMessage); // Log received message to send
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && 
            ((client.user_to_chat === parsedMessage.user_to && client.user_from_chat === parsedMessage.user_from))) {
            client.send(JSON.stringify(parsedMessage)); 
        }
    });
}

// Xử lý tin nhắn gửi đi từ user_from
function handleMessageUserUpdate(ws, parsedMessage, wss) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && (client.user_from_chat === parsedMessage.user_from_chat
            ||
            client.user_to_chat === parsedMessage.user_from || client.user_from === parsedMessage.user_to
        )) {
            client.send(JSON.stringify(parsedMessage)); 
        }
    });
}

function handleGetUserOnlines(ws, parsedMessage, wss) {
    const onlineUsers = parsedMessage.onlineUsers;
    const result = [];
    console.log('Mảng nhận được:', onlineUsers);

    wss.clients.forEach(client => {
        const clientUserOnline = parseInt(client.user_online); // Chuyển đổi thành kiểu integer

        if (!isNaN(clientUserOnline) && onlineUsers.includes(clientUserOnline)) {
            result.push(clientUserOnline);
        }
    });

    console.log("Mảng sau khi kiểm tra:", result);

    ws.send(JSON.stringify({ type: 'getUserOnlines', onlineUsers: result }));
}

function handleChatGroup(ws, parsedMessage, wss) {
    console.log('Received chatgroup message:', parsedMessage);
    console.log('cua group:', parsedMessage.group_id);
    console.log('mảng :', parsedMessage.userIds);// Log received message
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.group_id === parsedMessage.group_id) {
            client.send(JSON.stringify(parsedMessage)); 
            console.log('Gui thong bao cho client:', client.group_id,"và người dùng :",client.user_group_from);
        }
    });
}

// Xử lý khi client đóng kết nối
function handleClientClose() {
    console.log('Client disconnected');
}

module.exports = {
    handleMessage,
    handleClientClose
};