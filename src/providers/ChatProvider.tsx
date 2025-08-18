import React, { useState, useReducer, use, createContext, ReactNode, Dispatch } from 'react';
import users from 'data/people';
import rawThreads from 'data/chat/threads';
import rawMessages from 'data/chat/messages';
import groups from 'data/chat/groups';
import { arrayReducer } from 'reducers/arrayReducer';

// Type definitions
interface User {
  id: number;
  name: string;
  avatarSrc: string;
  email?: string;
  status?: string;
}

interface Thread {
  id: number;
  userId?: number;
  groupId?: number;
  type: 'user' | 'group';
  messagesId: number;
  read: boolean;
}

interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  type?: string;
}

interface Group {
  id: number;
  name: string;
  members: Array<{ userId: number }>;
}

interface GroupUser {
  name: string;
  avatarSrc: string[];
}

interface ArrayAction {
  type: 'ADD' | 'REMOVE' | 'EDIT' | 'SORT';
  id?: number;
  payload?: any;
  sortBy?: string;
  order?: string;
  isAddToStart?: boolean;
  isUpdatedStart?: boolean;
}

interface ChatContextValue {
  users: User[];
  groups: Group[];
  threads: Thread[];
  getUser: (thread: Thread) => User | GroupUser;
  messages: Message[];
  activeThreadId: number;
  setActiveThreadId: (id: number) => void;
  threadsDispatch: Dispatch<ArrayAction>;
  messagesDispatch: Dispatch<ArrayAction>;
  textAreaInitialHeight: number;
  setTextAreaInitialHeight: (height: number) => void;
  isOpenThreadInfo: boolean;
  setIsOpenThreadInfo: (open: boolean) => void;
  currentThread: Thread;
  setCurrentThread: (thread: Thread) => void;
  scrollToBottom: boolean;
  setScrollToBottom: (scroll: boolean) => void;
}

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, messagesDispatch] = useReducer(arrayReducer, rawMessages);
  const [threads, threadsDispatch] = useReducer(arrayReducer, rawThreads);
  const [currentThread, setCurrentThread] = useState(threads[0]);
  const [textAreaInitialHeight, setTextAreaInitialHeight] = useState(32);
  const [activeThreadId, setActiveThreadId] = useState(threads[0].id);
  const [isOpenThreadInfo, setIsOpenThreadInfo] = useState(false);
  const [scrollToBottom, setScrollToBottom] = useState(true);

  const getUser = (thread: Thread): User | GroupUser => {
    if (thread.type === 'group') {
      const group = groups.find(({ id }) => id === thread.groupId);
      if (!group) {
        return { name: 'Unknown Group', avatarSrc: [] };
      }
      const { name, members } = group;
      return {
        name,
        avatarSrc: members.map(
          member => {
            const user = users.find(({ id }) => id === member.userId);
            return user ? user.avatarSrc : '';
          }
        )
      };
    } else {
      const user = users.find(({ id }) => id === thread.userId);
      return user || { id: 0, name: 'Unknown User', avatarSrc: '' };
    }
  };

  const value: ChatContextValue = {
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

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = (): ChatContextValue => {
  const context = use(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

export default ChatProvider;
