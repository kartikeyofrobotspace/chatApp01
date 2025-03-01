<script>
    import { onMount, afterUpdate } from "svelte";
    import { tick } from "svelte";

    let ws;
    let messages = [];
    let input = "";
    let username = "User" + Math.floor(Math.random() * 1000); // Temporary username
    let chatContainer;

    onMount(() => {
        ws = new WebSocket("ws://localhost:8080/ws/");

        ws.onmessage = (event) => {
            const { sender, text } = JSON.parse(event.data);
            messages = [...messages, { sender, text }];
        };
    });

    async function sendMessage() {
        if (ws && input.trim()) {
            const messageData = JSON.stringify({ sender: username, text: input });
            ws.send(messageData);
            input = "";
            await tick();  // Wait for DOM update
            scrollToBottom();
        }
    }

    function scrollToBottom() {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    afterUpdate(scrollToBottom);
</script>

<style>
    .chat-container {
        display: flex;
        flex-direction: column;
        height: 80vh;
        max-width: 400px;
        width: 100%;
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .messages {
        flex-grow: 1;
        overflow-y: auto;
        padding: 10px;
        background: #f0f0f0;
    }

    .message {
        max-width: 75%;
        word-wrap: break-word;
        padding: 8px 12px;
        border-radius: 15px;
        margin-bottom: 8px;
        position: relative;
        font-size: 14px;
    }

    .sent {
        align-self: flex-end;
        background: #0084ff;
        color: white;
        border-bottom-right-radius: 2px;
    }

    .received {
        align-self: flex-start;
        background: #e5e5ea;
        color: black;
        border-bottom-left-radius: 2px;
    }

    .timestamp {
        font-size: 10px;
        opacity: 0.7;
        display: block;
        text-align: right;
        margin-top: 2px;
    }

    .input-container {
        display: flex;
        align-items: center;
        padding: 10px;
        background: white;
        border-top: 1px solid #ddd;
    }

    input {
        flex-grow: 1;
        padding: 10px;
        border: none;
        border-radius: 20px;
        outline: none;
        font-size: 14px;
        background: #f0f0f0;
    }

    button {
        background: #0084ff;
        border: none;
        color: white;
        padding: 10px 15px;
        border-radius: 50%;
        margin-left: 8px;
        cursor: pointer;
        font-size: 16px;
    }
</style>

<div class="flex justify-center items-center min-h-screen bg-gray-200 p-4">
    <div class="chat-container">
        <!-- Chat Header -->
        <div class="bg-blue-500 text-white text-center p-3 font-bold">
            WebSocket Chat
        </div>

        <!-- Messages -->
        <div bind:this={chatContainer} class="messages flex flex-col">
            {#each messages as msg}
                <div class="message {msg.sender === username ? 'sent' : 'received'}">
                    <strong>{msg.sender}:</strong> {msg.text}
                    <span class="timestamp">{new Date().toLocaleTimeString()}</span>
                </div>
            {/each}
        </div>

        <!-- Input Box -->
        <div class="input-container">
            <input 
                bind:value={input} 
                placeholder="Type a message..." 
                on:keypress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button on:click={sendMessage}>Send</button>
        </div>
    </div>
</div>
