import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, ListGroup, Badge } from 'react-bootstrap';
import { useRoom } from '../../hooks/websocket';
import { WSMessage } from '../../services/websocket/WebSocketManager';
import { useAuth } from '../../contexts/AuthContext';

interface RealTimeChatProps {
  roomId: string;
  roomName?: string;
}

const RealTimeChat: React.FC<RealTimeChatProps> = ({ roomId, roomName = 'Chat Room' }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<WSMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { characterName } = useAuth();

  const { isJoined, sendToRoom, messages } = useRoom(roomId, {
    autoJoin: true,
    onMessage: (msg: WSMessage) => {
      console.log('Received message:', msg);
    }
  });

  // Update local messages when room messages change
  useEffect(() => {
    setChatMessages(messages);
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isJoined) return;

    try {
      await sendToRoom({
        type: 'message',
        data: {
          text: message,
          sender: characterName || 'Anonymous',
          timestamp: new Date().toISOString()
        }
      });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp: string | number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">{roomName}</h6>
        <div>
          <Badge bg={isJoined ? 'success' : 'secondary'}>
            {isJoined ? 'Connected' : 'Disconnected'}
          </Badge>
          {isJoined && (
            <Badge bg="info" className="ms-2">
              {chatMessages.length} messages
            </Badge>
          )}
        </div>
      </Card.Header>
      
      <Card.Body className="p-0 d-flex flex-column" style={{ height: '400px' }}>
        <div className="flex-grow-1 overflow-auto p-3">
          {chatMessages.length === 0 ? (
            <div className="text-center text-muted py-4">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {chatMessages.map((msg, index) => (
                <ListGroup.Item key={msg.id || index} className="border-0 px-0 py-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        <strong className="me-2">
                          {msg.data?.sender || 'Unknown'}
                        </strong>
                        <small className="text-muted">
                          {formatTime(msg.data?.timestamp || msg.timestamp || Date.now())}
                        </small>
                      </div>
                      <div>{msg.data?.text || JSON.stringify(msg.data)}</div>
                    </div>
                    <Badge bg="light" text="dark" className="ms-2">
                      {msg.type}
                    </Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-top p-3">
          <Form onSubmit={handleSendMessage}>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder={isJoined ? "Type a message..." : "Join room to send messages"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!isJoined}
              />
              <Button 
                type="submit" 
                variant="primary"
                disabled={!isJoined || !message.trim()}
              >
                Send
              </Button>
            </div>
          </Form>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RealTimeChat;