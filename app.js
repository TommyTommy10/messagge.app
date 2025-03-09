const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesContainer = document.getElementById('messages');

// Connessione al server WebSocket tramite Socket.IO
const socket = io();

// Ascolta i messaggi dal server
socket.on('chat message', (msg) => {
  const messageElement = document.createElement('div');
  messageElement.textContent = msg;
  messageElement.classList.add('received');
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Invia un messaggio
sendButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('chat message', message);

    // Mostra il messaggio sul client
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('sent');
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Pulisci il campo di input
    messageInput.value = '';
  }
});
