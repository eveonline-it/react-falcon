import React, { useState } from 'react';
import Flex from 'components/common/Flex';
import { Card, Tab } from 'react-bootstrap';
import ChatContent from './content/ChatContent';
import ChatSidebar from './sidebar/ChatSidebar';
import ChatProvider, { useChatContext } from 'providers/ChatProvider';

const ChatTab = () => {
  const {
    setIsOpenThreadInfo,
    threadsDispatch,
    threads,
    setCurrentThread,
    setScrollToBottom
  } = useChatContext();
  const [hideSidebar, setHideSidebar] = useState(false);

  const handleSelect = e => {
    setHideSidebar(false);
    setIsOpenThreadInfo(false);
    const thread = threads.find(thread => thread.id === parseInt(e));
    setCurrentThread(thread);
    threadsDispatch({
      type: 'EDIT',
      id: thread.id,
      payload: { ...thread, read: true }
    });
    setScrollToBottom(true);
  };

  return (
    <Tab.Container
      id="left-tabs-example"
      defaultActiveKey="0"
      onSelect={handleSelect}
    >
      <Card className="card-chat overflow-hidden">
        <Card.Body as={Flex} className="p-0 h-100">
          <ChatSidebar hideSidebar={hideSidebar} />
          <ChatContent setHideSidebar={setHideSidebar} />
        </Card.Body>
      </Card>
    </Tab.Container>
  );
};

const Chat = () => {
  return (
    <ChatProvider>
      <ChatTab />
    </ChatProvider>
  );
};

export default Chat;
