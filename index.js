// index.js - Server side for messagge.app
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize the app
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

// Configure middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data (in a real app, you would use a database)
const users = [
    {
        id: 'user1',
        name: 'Il tuo nome',
        email: 'tu@esempio.com',
        avatar: '/images/avatar1.jpg',
        status: 'online',
        contacts: ['user2', 'user3', 'user4', 'user5', 'user6']
    },
    {
        id: 'user2',
        name: 'Marco Rossi',
        email: 'marco@esempio.com',
        avatar: '/images/avatar2.jpg',
        status: 'online',
        contacts: ['user1']
    },
    {
        id: 'user3',
        name: 'Gruppo Lavoro',
        email: null,
        avatar: '/images/group1.jpg',
        status: 'online',
        isGroup: true,
        members: ['user1', 'user2', 'user4', 'user5']
    },
    {
        id: 'user4',
        name: 'Giulia Bianchi',
        email: 'giulia@esempio.com',
        avatar: '/images/avatar3.jpg',
        status: 'offline',
        contacts: ['user1']
    },
    {
        id: 'user5',
        name: 'Luca Verdi',
        email: 'luca@esempio.com',
        avatar: '/images/avatar4.jpg',
        status: 'away',
        contacts: ['user1']
    },
    {
        id: 'user6',
        name: 'Sara Neri',
        email: 'sara@esempio.com',
        avatar: '/images/avatar5.jpg',
        status: 'online',
        contacts: ['user1']
    }
];

const conversations = [
    {
        id: 'conv1',
        participants: ['user1', 'user2'],
        lastMessage: {
            id: 'msg123',
            content: 'Ciao, come stai?',
            senderId: 'user2',
            timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        unreadCount: {
            user1: 3,
            user2: 0
        }
    },
    {
        id: 'conv2',
        participants: ['user1', 'user3'],
        isGroup: true,
        lastMessage: {
            id: 'msg234',
            content: 'Marco: Ci vediamo domani alle 9',
            senderId: 'user2',
            timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        unreadCount: {
            user1: 0,
            user2: 0,
            user4: 2,
            user5: 5
        }
    },
    {
        id: 'conv3',
        participants: ['user1', 'user4'],
        lastMessage: {
            id: 'msg345',
            content: 'Va bene, grazie!',
            senderId: 'user4',
            timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        unreadCount: {
            user1: 0,
            user4: 0
        }
    },
    {
        id: 'conv4',
        participants: ['user1', 'user5'],
        lastMessage: {
            id: 'msg456',
            content: 'Ho inviato il documento',
            senderId: 'user5',
            timestamp: new Date(Date.now() - 172800000).toISOString()
        },
        unreadCount: {
            user1: 0,
            user5: 0
        }
    },
    {
        id: 'conv5',
        participants: ['user1', 'user6'],
        lastMessage: {
            id: 'msg567',
            content: 'Perfetto! 👍',
            senderId: 'user6',
            timestamp: new Date(Date.now() - 259200000).toISOString()
        },
        unreadCount: {
            user1: 0,
            user6: 0
        }
    }
];

const messages = {
    conv1: [
        {
            id: 'msg1',
            conversationId: 'conv1',
            senderId: 'user2',
            content: 'Ciao, come stai oggi?',
            timestamp: new Date(Date.now() - 3700000).toISOString(),
            status: 'read'
        },
        {
            id: 'msg2',
            conversationId: 'conv1',
            senderId: 'user1',
            content: 'Tutto bene, grazie! Tu?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'read'
        },
        {
            id: 'msg3',
            conversationId: 'conv1',
            senderId: 'user2',
            content: 'Anche io, sto lavorando su un nuovo progetto.',
            timestamp: new Date(Date.now() - 3500000).toISOString(),
            status: 'read'
        },
        {
            id: 'msg4',
            conversationId: 'conv1',
            senderId: 'user2',
            content: 'Ci vediamo più tardi per un caffè?',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            status: 'read'
        },
        {
            id: 'msg5',
            conversationId: 'conv1',
            senderId: 'user2',
            content: 'Ho bisogno di parlarti di una cosa importante.',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            status: 'read'
        },
        {
            id: 'msg6',
            conversationId: 'conv1',
            senderId: 'user2',
            content: 'Fammi sapere quando sei disponibile, grazie!',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            status: 'delivered'
        }
    ]
};

// Add demo messages for other conversations
conversations.forEach(conv => {
    if (conv.id !== 'conv1' && !messages[conv.id]) {
        messages[conv.id] = [
            {
                id: `${conv.id}_msg1`,
                conversationId: conv.id,
                senderId: conv.participants.find(p => p !== 'user1'),
                content: 'Ciao, come stai?',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                status: 'read'
            },
            {
                id: `${conv.id}_msg2`,
                conversationId: conv.id,
                senderId: 'user1',
                content: 'Tutto bene, grazie! E tu?',
                timestamp: new Date(Date.now() - 85000000).toISOString(),
                status: 'read'
            },
            {
                id: `${conv.id}_msg3`,
                conversationId: conv.id,
                senderId: conv.participants.find(p => p !== 'user1'),
                content: conv.lastMessage.content,
                timestamp: conv.lastMessage.timestamp,
                status: 'read'
            }
        ];
    }
});

// Map to track connected clients
const clients = new Map();

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    // You would normally authenticate the user here
    const userId = 'user1'; // In a real app, this would come from auth
    
    // Store the connection
    clients.set(userId, ws);
    
    console.log(`User ${userId} connected`);
    
    // Send initial data
    sendUserData(userId, ws);
    
    // Handle messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'message':
                    handleNewMessage(data.data, userId);
                    break;
                case 'typing':
                    broadcastTypingStatus(data.conversationId, userId, data.isTyping);
                    break;
                case 'status':
                    updateUserStatus(userId, data.status);
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    // Handle disconnections
    ws.on('close', () => {
        clients.delete(userId);
        console.log(`User ${userId} disconnected`);
        
        // Update user status to offline
        updateUserStatus(userId, 'offline');
    });
});

// Send user data upon connection
function sendUserData(userId, ws) {
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    // Get user conversations
    const userConversations = conversations.filter(c => 
        c.participants.includes(userId)
    ).map(c => {
        // Find the other participant (or group info)
        let otherParticipant;
        
        if (c.isGroup) {
            otherParticipant = users.find(u => u.id === c.id);
        } else {
            const otherId = c.participants.find(p => p !== userId);
            otherParticipant = users.find(u => u.id === otherId);
        }
        
        // Format time
        const lastMessageTime = formatTimestamp(new Date(c.lastMessage.timestamp));
        
        return {
            id: c.id,
            name: otherParticipant?.name || 'Unknown',
            avatar: otherParticipant?.avatar || '/images/default.jpg',
            status: otherParticipant?.status || 'offline',
            isGroup: c.isGroup || false,
            lastMessage: c.lastMessage.content,
            lastMessageTime,
            unreadCount: c.unreadCount[userId] || 0
        };
    });
    
    // Send initial data
    ws.send(JSON.stringify({
        type: 'init',
        data: {
            user,
            conversations: userConversations
        }
    }));
}

// Handle new messages
function handleNewMessage(message, userId) {
    // Add message ID if not provided
    if (!message.id) {
        message.id = uuidv4();
    }
    
    // Add timestamp if not provided
    if (!message.timestamp) {
        message.timestamp = new Date().toISOString();
    }
    
    // Add to messages
    const conversation = conversations.find(c => c.id === message.conversationId);
    
    if (!conversation) {
        console.error('Conversation not found:', message.conversationId);
        return;
    }
    
    // Add message to storage
    if (!messages[conversation.id]) {
        messages[conversation.id] = [];
    }
    
    messages[conversation.id].push(message);
    
    // Update last message
    conversation.lastMessage = {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        timestamp: message.timestamp
    };
    
    // Update unread counts for other participants
    conversation.participants.forEach(participantId => {
        if (participantId !== userId) {
            conversation.unreadCount[participantId] = (conversation.unreadCount[participantId] || 0) + 1;
        }
    });
    
    // Forward message to other participants
    conversation.participants.forEach(participantId => {
        if (participantId !== userId) {
            const client = clients.get(participantId);
            
            if (client) {
                // Format time for real-time updates
                const formattedTime = formatTimestamp(new Date(message.timestamp));
                
                client.send(JSON.stringify({
                    type: 'message',
                    data: {
                        ...message,
                        formattedTime
                    }
                }));
                
                // Also update the conversation list
                const otherUser = users.find(u => u.id === userId);
                
                client.send(JSON.stringify({
                    type: 'conversation_update',
                    data: {
                        id: conversation.id,
                        lastMessage: message.content,
                        lastMessageTime: formattedTime,
                        unreadCount: conversation.unreadCount[participantId] || 0
                    }
                }));
            }
        }
    });
    
    // Acknowledge message receipt to sender
    const senderClient = clients.get(userId);
    
    if (senderClient) {
        senderClient.send(JSON.stringify({
            type: 'message_ack',
            data: {
                id: message.id,
                status: 'delivered'
            }
        }));
        
        // Update conversation list for sender too
        const formattedTime = formatTimestamp(new Date(message.timestamp));
        
        senderClient.send(JSON.stringify({
            type: 'conversation_update',
            data: {
                id: conversation.id,
                lastMessage: message.content,
                lastMessageTime: formattedTime,
                unreadCount: 0 // Sender's messages are always read for them
            }
        }));
    }
}

// Broadcast typing status
function broadcastTypingStatus(conversationId, userId, isTyping) {
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) {
        console.error('Conversation not found:', conversationId);
        return;
    }
    
    // Get the user info
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        console.error('User not found:', userId);
        return;
    }
    
    // Send typing status to other participants
    conversation.participants.forEach(participantId => {
        if (participantId !== userId) {
            const client = clients.get(participantId);
            
            if (client) {
                client.send(JSON.stringify({
                    type: 'typing',
                    data: {
                        conversationId,
                        userId,
                        userName: user.name,
                        isTyping
                    }
                }));
            }
        }
    });
}

// Update user status
function updateUserStatus(userId, status) {
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        console.error('User not found:', userId);
        return;
    }
    
    // Update status
    user.status = status;
    
    // Notify contacts
    user.contacts.forEach(contactId => {
        const client = clients.get(contactId);
        
        if (client) {
            client.send(JSON.stringify({
                type: 'status_update',
                data: {
                    userId,
                    status
                }
            }));
        }
    });
}

// Mark messages as read
function markMessagesAsRead(conversationId, userId) {
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) {
        console.error('Conversation not found:', conversationId);
        return;
    }
    
    // Reset unread count
    conversation.unreadCount[userId] = 0;
    
    // Update message status
    if (messages[conversationId]) {
        messages[conversationId].forEach(msg => {
            if (msg.senderId !== userId && msg.status !== 'read') {
                msg.status = 'read';
                
                // Notify sender that their message was read
                const senderClient = clients.get(msg.senderId);
                
                if (senderClient) {
                    senderClient.send(JSON.stringify({
                        type: 'message_status',
                        data: {
                            id: msg.id,
                            status: 'read'
                        }
                    }));
                }
            }
        });
    }
    
    // Notify user of updated unread count
    const client = clients.get(userId);
    
    if (client) {
        client.send(JSON.stringify({
            type: 'conversation_update',
            data: {
                id: conversationId,
                unreadCount: 0
            }
        }));
    }
}

// Format timestamp for display
function formatTimestamp(date) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear();
    
    const isYesterday = date.getDate() === yesterday.getDate() && 
                        date.getMonth() === yesterday.getMonth() && 
                        date.getFullYear() === yesterday.getFullYear();
    
    if (isToday) {
        return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
        return 'Ieri';
    } else {
        return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    }
}

// API routes
app.get('/api/user', (req, res) => {
    // In a real app, you would get the user from the session
    const userId = 'user1';
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
});

app.get('/api/conversations', (req, res) => {
    // In a real app, you would get the user from the session
    const userId = 'user1';
    
    // Get user conversations
    const userConversations = conversations.filter(c => 
        c.participants.includes(userId)
    ).map(c => {
        // Find the other participant (or group info)
        let otherParticipant;
        
        if (c.isGroup) {
            otherParticipant = users.find(u => u.id === c.id);
        } else {
            const otherId = c.participants.find(p => p !== userId);
            otherParticipant = users.find(u => u.id === otherId);
        }
        
        // Format time
        const lastMessageTime = formatTimestamp(new Date(c.lastMessage.timestamp));
        
        return {
            id: c.id,
            name: otherParticipant?.name || 'Unknown',
            avatar: otherParticipant?.avatar || '/images/default.jpg',
            status: otherParticipant?.status || 'offline',
            isGroup: c.isGroup || false,
            lastMessage: c.lastMessage.content,
            lastMessageTime,
            unreadCount: c.unreadCount[userId] || 0
        };
    });
    
    res.json(userConversations);
});

app.get('/api/conversations/:id/messages', (req, res) => {
    const conversationId = req.params.id;
    const conversationMessages = messages[conversationId] || [];
    
    // Format timestamps
    const formattedMessages = conversationMessages.map(msg => ({
        ...msg,
        formattedTime: formatTimestamp(new Date(msg.timestamp))
    }));
    
    // In a real app, mark messages as read here
    const userId = 'user1';
    markMessagesAsRead(conversationId, userId);
    
    res.json(formattedMessages);
});

app.post('/api/messages', (req, res) => {
    const userId = 'user1'; // In a real app, this would come from auth
    const messageData = req.body;
    
    // Add sender ID if not provided
    if (!messageData.senderId) {
        messageData.senderId = userId;
    }
    
    // Add to messages
    handleNewMessage(messageData, userId);
    
    res.status(201).json({ 
        id: messageData.id,
        status: 'sent'
    });
});

app.post('/api/conversations/:id/read', (req, res) => {
    const conversationId = req.params.id;
    const userId = 'user1'; // In a real app, this would come from auth
    
    markMessagesAsRead(conversationId, userId);
    
    res.status(200).json({ success: true });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
