// app.js - Client-side JavaScript for messagge.app

// DOM Elements
const conversationList = document.querySelector('.conversation-list');
const messagesContainer = document.querySelector('.messages-container');
const messageInput = document.querySelector('.message-input input');
const sendButton = document.querySelector('.send-btn');
const infoPanel = document.querySelector('.info-panel');
const conversationItemTemplate = document.getElementById('conversation-item-template');
const messageTemplate = document.getElementById('message-template');
const chatName = document.querySelector('.chat-name');
const chatStatus = document.querySelector('.chat-status');
const contactName = document.querySelector('.contact-name');
const contactStatus = document.querySelector('.contact-status');
const sidebarToggle = document.querySelector('.chat-avatar');
const infoToggle = document.querySelector('.action-btn:nth-child(3)');
const closeInfoBtn = document.querySelector('.close-info-btn');
const searchInput = document.querySelector('.search-input input');
const newChatBtn = document.querySelector('.new-chat-btn');

// State
let currentUser = {
    id: 'user1',
    name: 'Il tuo nome',
    avatar: '/api/placeholder/80/80',
    status: 'online'
};

let currentChat = null;
let conversations = [];
let messages = {};
let socket = null;

// Initialize the app
function initApp() {
    // Fetch initial data
    fetchConversations()
        .then(data => {
            conversations = data;
            renderConversations();
            
            // Select first conversation by default
            if (conversations.length > 0) {
                selectConversation(conversations[0].id);
            }
        });
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize websocket connection
    initializeWebSocket();
}

// Fetch conversations from the server
function fetchConversations() {
    // This would be an API call in a real app
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    id: 'conv1',
                    name: 'Marco Rossi',
                    avatar: '/api/placeholder/80/80',
                    status: 'online',
                    lastMessage: 'Ciao, come stai?',
                    lastMessageTime: '10:30',
                    unreadCount: 3
                },
                {
                    id: 'conv2',
                    name: 'Gruppo Lavoro',
                    avatar: '/api/placeholder/80/80',
                    status: 'online',
                    lastMessage: 'Marco: Ci vediamo domani alle 9',
                    lastMessageTime: '09:15',
                    unreadCount: 0
                },
                {
                    id: 'conv3',
                    name: 'Giulia Bianchi',
                    avatar: '/api/placeholder/80/80',
                    status: 'offline',
                    lastMessage: 'Va bene, grazie!',
                    lastMessageTime: 'Ieri',
                    unreadCount: 0
                },
                {
                    id: 'conv4',
                    name: 'Luca Verdi',
                    avatar: '/api/placeholder/80/80',
                    status: 'away',
                    lastMessage: 'Ho inviato il documento',
                    lastMessageTime: 'Ieri',
                    unreadCount: 0
                },
                {
                    id: 'conv5',
                    name: 'Sara Neri',
                    avatar: '/api/placeholder/80/80',
                    status: 'online',
                    lastMessage: 'Perfetto! 👍',
                    lastMessageTime: 'Lun',
                    unreadCount: 0
                }
            ]);
        }, 500);
    });
}

// Fetch messages for a specific conversation
function fetchMessages(conversationId) {
    // This would be an API call in a real app
    return new Promise(resolve => {
        if (messages[conversationId]) {
            resolve(messages[conversationId]);
            return;
        }
        
        setTimeout(() => {
            // Generate some dummy messages
            const now = new Date();
            const dummyMessages = [];
            
            // Find the conversation
            const conversation = conversations.find(c => c.id === conversationId);
            
            if (conversation) {
                // Add some messages
                dummyMessages.push({
                    id: 'm1' + conversationId,
                    conversationId,
                    senderId: conversation.id,
                    senderName: conversation.name,
                    senderAvatar: conversation.avatar,
                    content: 'Ciao, come stai oggi?',
                    timestamp: new Date(now.getTime() - 3600000).toISOString(),
                    status: 'read'
                });
                
                dummyMessages.push({
                    id: 'm2' + conversationId,
                    conversationId,
                    senderId: currentUser.id,
                    senderName: currentUser.name,
                    senderAvatar: currentUser.avatar,
                    content: 'Tutto bene, grazie! Tu?',
                    timestamp: new Date(now.getTime() - 3500000).toISOString(),
                    status: 'read'
                });
                
                dummyMessages.push({
                    id: 'm3' + conversationId,
                    conversationId,
                    senderId: conversation.id,
                    senderName: conversation.name,
                    senderAvatar: conversation.avatar,
                    content: 'Anche io, sto lavorando su un nuovo progetto.',
                    timestamp: new Date(now.getTime() - 3400000).toISOString(),
                    status: 'read'
                });
                
                // Add more messages for other conversations
                if (conversationId === 'conv1') {
                    dummyMessages.push({
                        id: 'm4' + conversationId,
                        conversationId,
                        senderId: conversation.id,
                        senderName: conversation.name,
                        senderAvatar: conversation.avatar,
                        content: 'Ci vediamo più tardi per un caffè?',
                        timestamp: new Date(now.getTime() - 600000).toISOString(),
                        status: 'read'
                    });
                    
                    dummyMessages.push({
                        id: 'm5' + conversationId,
                        conversationId,
                        senderId: conversation.id,
                        senderName: conversation.name,
                        senderAvatar: conversation.avatar,
                        content: 'Ho bisogno di parlarti di una cosa importante.',
                        timestamp: new Date(now.getTime() - 300000).toISOString(),
                        status: 'read'
                    });
                    
                    dummyMessages.push({
                        id: 'm6' + conversationId,
                        conversationId,
                        senderId: conversation.id,
                        senderName: conversation.name,
                        senderAvatar: conversation.avatar,
                        content: 'Fammi sapere quando sei disponibile, grazie!',
                        timestamp: new Date(now.getTime() - 60000).toISOString(),
                        status: 'delivered'
                    });
                }
            }
            
            messages[conversationId] = dummyMessages;
            resolve(dummyMessages);
        }, 300);
    });
}

// Render the list of conversations
function renderConversations() {
    conversationList.innerHTML = '';
    
    conversations.forEach(conversation => {
        const clone = document.importNode(conversationItemTemplate.content, true);
        const item = clone.querySelector('.conversation-item');
        
        item.dataset.id = conversation.id;
        if (currentChat && currentChat.id === conversation.id) {
            item.classList.add('active');
        }
        
        const avatar = clone.querySelector('.conversation-avatar img');
        avatar.src = conversation.avatar;
        avatar.alt = conversation.name;
        
        const statusIndicator = clone.querySelector('.status-indicator');
        statusIndicator.classList.add(conversation.status);
        
        clone.querySelector('.conversation-name').textContent = conversation.name;
        clone.querySelector('.conversation-time').textContent = conversation.lastMessageTime;
        clone.querySelector('.conversation-preview').textContent = conversation.lastMessage;
        
        const unreadBadge = clone.querySelector('.unread-badge');
        if (conversation.unreadCount > 0) {
            unreadBadge.textContent = conversation.unreadCount;
        } else {
            unreadBadge.style.display = 'none';
        }
        
        conversationList.appendChild(clone);
    });
}

// Render messages for the current conversation
function renderMessages(messagesList) {
    messagesContainer.innerHTML = '<div class="date-separator"><span>Oggi</span></div>';
    
    messagesList.forEach(msg => {
        const clone = document.importNode(messageTemplate.content, true);
        const messageDiv = clone.querySelector('.message');
        
        if (msg.senderId === currentUser.id) {
            messageDiv.classList.add('sent');
        }
        
        const avatar = clone.querySelector('.message-avatar img');
        avatar.src = msg.senderAvatar;
        avatar.alt = msg.senderName;
        
        clone.querySelector('.message-text').textContent = msg.content;
        
        // Format timestamp
        const date = new Date(msg.timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        clone.querySelector('.message-time').textContent = `${hours}:${minutes}`;
        
        // Message status
        const statusSpan = clone.querySelector('.message-status');
        if (msg.senderId === currentUser.id) {
            let statusIcon = '';
            switch (msg.status) {
                case 'sent':
                    statusIcon = '<i class="fas fa-check"></i>';
                    break;
                case 'delivered':
                    statusIcon = '<i class="fas fa-check-double"></i>';
                    break;
                case 'read':
                    statusIcon = '<i class="fas fa-check-double" style="color: #5b68f1;"></i>';
                    break;
            }
            statusSpan.innerHTML = statusIcon;
        }
        
        messagesContainer.appendChild(clone);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Select a conversation
function selectConversation(conversationId) {
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) return;
    
    currentChat = conversation;
    
    // Update UI
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id === conversationId) {
            item.classList.add('active');
        }
    });
    
    // Reset unread count
    conversation.unreadCount = 0;
    renderConversations();
    
    // Update chat header
    chatName.textContent = conversation.name;
    chatStatus.textContent = conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1);
    
    // Update contact info
    contactName.textContent = conversation.name;
    contactStatus.textContent = conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1);
    
    // Fetch and render messages
    fetchMessages(conversationId).then(renderMessages);
}

// Send a message
function sendMessage() {
    const content = messageInput.value.trim();
    
    if (!content || !currentChat) return;
    
    // Create a new message
    const newMessage = {
        id: 'msg_' + Date.now(),
        conversationId: currentChat.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content,
        timestamp: new Date().toISOString(),
        status: 'sent'
    };
    
    // Add to messages
    messages[currentChat.id] = messages[currentChat.id] || [];
    messages[currentChat.id].push(newMessage);
    
    // Update UI
    renderMessages(messages[currentChat.id]);
    
    // Clear input
    messageInput.value = '';
    
    // Send via websocket (this would connect to the real server)
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'message',
            data: newMessage
        }));
    }
    
    // Simulate receiving a response
    simulateResponse(currentChat);
}

// Simulate receiving a response
function simulateResponse(conversation) {
    setTimeout(() => {
        // Update sent message status
        const latestMessage = messages[conversation.id].find(m => m.senderId === currentUser.id && m.status === 'sent');
        if (latestMessage) {
            latestMessage.status = 'delivered';
            renderMessages(messages[conversation.id]);
        }
        
        setTimeout(() => {
            if (latestMessage) {
                latestMessage.status = 'read';
                renderMessages(messages[conversation.id]);
            }
            
            // Add typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message';
            typingIndicator.innerHTML = `
                <div class="message-avatar">
                    <img src="${conversation.avatar}" alt="${conversation.name}">
                </div>
                <div class="message-content">
                    <div class="message-bubble typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(typingIndicator);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // After "typing", add the response
            setTimeout(() => {
                // Remove typing indicator
                messagesContainer.removeChild(typingIndicator);
                
                // Add response
                const responseMessage = {
                    id: 'resp_' + Date.now(),
                    conversationId: conversation.id,
                    senderId: conversation.id,
                    senderName: conversation.name,
                    senderAvatar: conversation.avatar,
                    content: getRandomResponse(),
                    timestamp: new Date().toISOString(),
                    status: 'read'
                };
                
                messages[conversation.id].push(responseMessage);
                renderMessages(messages[conversation.id]);
                
                // Update conversation list
                const conv = conversations.find(c => c.id === conversation.id);
                if (conv) {
                    conv.lastMessage = responseMessage.content;
                    conv.lastMessageTime = '1m';
                    renderConversations();
                }
            }, 1500);
        }, 1000);
    }, 500);
}

// Get a random response
function getRandomResponse() {
    const responses = [
        'Va bene, grazie per l\'informazione!',
        'Capisco, interessante!',
        'Ok, ci sentiamo più tardi allora.',
        'Perfetto! 👍',
        'Hai ragione, sono d\'accordo.',
        'Grazie per avermelo detto.',
        'Non vedo l\'ora!',
        'Buona idea!',
        'Ci sto pensando...',
        'Mi sembra un buon piano.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Search conversations
function searchConversations(query) {
    query = query.toLowerCase();
    
    if (!query) {
        renderConversations();
        return;
    }
    
    const filtered = conversations.filter(conv => 
        conv.name.toLowerCase().includes(query) || 
        conv.lastMessage.toLowerCase().includes(query)
    );
    
    conversationList.innerHTML = '';
    
    filtered.forEach(conversation => {
        const clone = document.importNode(conversationItemTemplate.content, true);
        const item = clone.querySelector('.conversation-item');
        
        item.dataset.id = conversation.id;
        
        const avatar = clone.querySelector('.conversation-avatar img');
        avatar.src = conversation.avatar;
        avatar.alt = conversation.name;
        
        const statusIndicator = clone.querySelector('.status-indicator');
        statusIndicator.classList.add(conversation.status);
        
        clone.querySelector('.conversation-name').textContent = conversation.name;
        clone.querySelector('.conversation-time').textContent = conversation.lastMessageTime;
        clone.querySelector('.conversation-preview').textContent = conversation.lastMessage;
        
        const unreadBadge = clone.querySelector('.unread-badge');
        if (conversation.unreadCount > 0) {
            unreadBadge.textContent = conversation.unreadCount;
        } else {
            unreadBadge.style.display = 'none';
        }
        
        conversationList.appendChild(clone);
    });
}

// Initialize WebSocket connection
function initializeWebSocket() {
    // In a real app, this would connect to your server
    // socket = new WebSocket('ws://your-server-url');
    
    // For this demo, simulate some functionality
    socket = {
        readyState: 1, // WebSocket.OPEN
        send: function(data) {
            console.log('WebSocket message sent:', data);
        }
    };
}

// Setup event listeners
function setupEventListeners() {
    // Conversation selection
    conversationList.addEventListener('click', (e) => {
        const item = e.target.closest('.conversation-item');
        if (item) {
            selectConversation(item.dataset.id);
        }
    });
    
    // Send message
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Info panel toggle
    infoToggle.addEventListener('click', () => {
        infoPanel.classList.toggle('active');
    });
    
    closeInfoBtn.addEventListener('click', () => {
        infoPanel.classList.remove('active');
    });
    
    // Search
    searchInput.addEventListener('input', (e) => {
        searchConversations(e.target.value);
    });
    
    // New chat button
    newChatBtn.addEventListener('click', () => {
        alert('Questa funzione non è ancora implementata in questo demo.');
    });
    
    // Mobile sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
