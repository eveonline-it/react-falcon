import React from 'react';
import { Tab } from 'react-bootstrap';
import ChatContentHeader from './ChatContentHeader';
import threads from 'data/chat/threads';
import ChatContentBody from './ChatContentBody';
import MessageTextArea from './MessageTextArea';

const ChatContent = ({ setHideSidebar }) => {
  return (
    <Tab.Content className="card-chat-content">
      {threads.map((thread, index) => (
        <Tab.Pane key={index} eventKey={index} className="card-chat-pane">
          <ChatContentHeader thread={thread} setHideSidebar={setHideSidebar} />
          <ChatContentBody thread={thread} />
        </Tab.Pane>
      ))}
      <MessageTextArea />
    </Tab.Content>
  );
};

export default ChatContent;
