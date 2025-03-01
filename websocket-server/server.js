import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';  // Import UUID for unique IDs

const wss = new WebSocketServer({ port: 3001 });
const clients = new Map(); // Store connected clients (id -> WebSocket)

wss.on('connection', (ws) => {
    const userId = uuidv4(); // Generate a unique ID
    clients.set(userId, ws); // Store client
    /*
        The resulting Map might look like this when logged:
        Map(3) {
        'user123' => WebSocket { ... },
        'user456' => WebSocket { ... },
        'user789' => WebSocket { ... }
        }
    */

    console.log(`Client connected: ${userId}`);

    // Send the user their unique ID. 
    // When a client connects, the server generates a unique ID and sends it to them.
    ws.send(JSON.stringify({ type: 'id', userId }));

    ws.on('message', (message) => {
        try {
            const { sender, target, text } = JSON.parse(message.toString());

            // sender: The unique ID of the client sending the message.
            // target: the unique ID of the specific user the message is meant for. If target is null or missing, the message is sent to all users (broadcast).

            console.log(`Message from ${sender} to ${target || 'ALL'}: ${text}`);

            const messageData = JSON.stringify({ sender, text });

            if (target) {
                // Targeted messaging: Send only to the specific client
                const targetClient = clients.get(target);
                if (targetClient && targetClient.readyState === ws.OPEN) { // checks if the target client is still connected (ws.OPEN).
                    targetClient.send(messageData);
                }
            } else {
                // in ws, there’s no built-in broadcast method like socket.io. 
                // So, you must manually iterate over all connected clients and send messages accordingly.
                clients.forEach((client, id) => {
                    if (client.readyState === ws.OPEN && id !== sender) {
                        client.send(messageData);
                    }
                });
            }
        } catch (error) {
            console.error('Invalid message format:', error);
        }
    });

    ws.on('close', () => {
        console.log(`Client disconnected: ${userId}`);
        clients.delete(userId);
    });
});

console.log('WebSocket server running on ws://0.0.0.0:3001');
