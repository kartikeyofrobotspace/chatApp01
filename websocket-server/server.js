import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const { sender, text } = JSON.parse(message.toString()); // Expect JSON input
            console.log(`Received from ${sender}: ${text}`);

            const messageData = JSON.stringify({ sender, text });

            // Broadcast message to all clients
            wss.clients.forEach(client => {
                if (client.readyState === ws.OPEN) {
                    client.send(messageData); // Send as JSON
                }
            });
        } catch (error) {
            console.error('Invalid message format:', error);
        }
    });

    ws.on('close', () => console.log('Client disconnected'));
});

console.log('WebSocket server running on ws://0.0.0.0:3001');
