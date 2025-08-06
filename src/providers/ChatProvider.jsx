import React, { useState, useReducer, use, createContext } from 'react';
import users from 'data/people';
import rawThreads from 'data/chat/threads';
import rawMessages from 'data/chat/messages';
import groups from 'data/chat/groups';
import { arrayReducer } from 'reducers/arrayReducer';

export const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [messages, messagesDispatch] = useReducer(arrayReducer, rawMessages);
  const [threads, threadsDispatch] = useReducer(arrayReducer, rawThreads);
  const [currentThread, setCurrentThread] = useState(threads[0]);
  const [textAreaInitialHeight, setTextAreaInitialHeight] = useState(32);
  const [activeThreadId, setActiveThreadId] = useState(threads[0].id);
  const [isOpenThreadInfo, setIsOpenThreadInfo] = useState(false);
  const [scrollToBottom, setScrollToBottom] = useState(true);

  const getUser = thread => {
    let user = {};
    if (thread.type === 'group') {
      const { name, members } = groups.find(({ id }) => id === thread.groupId);
      user = {
        name,
        avatarSrc: members.map(
          member => users.find(({ id }) => id === member.userId).avatarSrc
        )
      };
    } else {
      user = users.find(({ id }) => id === thread.userId);
    }
    return user;
  };

  const value = {
    users,
    groups,
    threads,
    getUser,
    messages,
    activeThreadId,
    setActiveThreadId,
    threadsDispatch,
    messagesDispatch,
    textAreaInitialHeight,
    setTextAreaInitialHeight,
    isOpenThreadInfo,
    setIsOpenThreadInfo,
    currentThread,
    setCurrentThread,
    scrollToBottom,
    setScrollToBottom
  };

  return <ChatContext value={value}>{children}</ChatContext>;
};

export const useChatContext = () => use(ChatContext);

export default ChatProvider;
