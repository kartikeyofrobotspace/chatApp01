import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';  // Import UUID for unique IDs

const wss = new WebSocketServer({ port: 3001 }); // creates a new WebSocket server that listens for incoming connections on port 3001.
const clients = new Map(); // Store connected clients (id -> WebSocket)

wss.on('connection', (ws) => {
    let userId;
    do {
        userId = uuidv4(); // Generate a unique ID
    } while (clients.has(userId)); // Regenerate if it already exists
    ws.userId = userId;  // Store userId on the WebSocket object
    ws.isAlive = true;  // Track whether the client is responding
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

    ws.on('pong', () => {
        ws.isAlive = true;  // Reset the flag when a pong is received
    });

    ws.on('message', (message) => {
        try {
            const { target, text } = JSON.parse(message.toString());
            const sender = ws.userId;  // Get the stored userId

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
                    if (client.readyState === ws.OPEN && id !== sender) { // prevent sending the message back to you
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

// Periodically check clients
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            console.log(`Client ${ws.userId} is unresponsive. Terminating.`);
            ws.terminate(); // Forcefully close unresponsive connection
            clients.delete(ws.userId); // Remove from map
            return;
        }
        ws.isAlive = false; /*If the client responds with a pong, its isAlive flag will be set to true. If not, the isAlive flag will remain false */
        ws.ping(); // Send ping, expecting a pong in response
    });
}, 10000); // Run every 10 seconds

wss.on('close', () => clearInterval(interval)); // Cleanup on shutdown

console.log('WebSocket server running on ws://0.0.0.0:3001');


/* # ISSUES

1. Sometimes, a user’s connection might drop suddenly (like losing internet or closing the app), 
    and the server might not realize they’re gone. How can we make sure the server properly removes 
    these disconnected users to free up memory, avoid sending messages to people who aren’t there, 
    and handle unexpected shutdowns smoothly?  

2. If a user gets disconnected, how can they keep the same ID when they reconnect so their chat history 
    and identity stay the same? What’s a secure way to store and verify their ID (like using local storage or tokens) 
    without letting someone else pretend to be them? Also, how can we do this without relying on browser cookies, 
    since not all users may be on a web browser?  

3. If the server tries to send a message to a user who just disconnected, it can cause errors. 
    What’s the best way to check if a user is still online before sending a message, 
    so the server doesn’t crash or throw unexpected errors?

*/