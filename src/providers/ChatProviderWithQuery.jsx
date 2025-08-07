import React, { useState, createContext, useContext } from 'react';
import {
  useChatThreads,
  useFlattenedChatMessages,
  useChatContacts,
  useChatGroups,
  useSendMessage,
  useCreateThread,
  useMarkThreadAsRead
} from 'hooks/useChat';

export const ChatContext = createContext();

const ChatProviderWithQuery = ({ children }) => {
  // Local UI state
  const [currentThread, setCurrentThread] = useState(null);
  const [textAreaInitialHeight, setTextAreaInitialHeight] = useState(32);
  const [isOpenThreadInfo, setIsOpenThreadInfo] = useState(false);
  const [scrollToBottom, setScrollToBottom] = useState(true);

  // TanStack Query for data fetching
  const threadsQuery = useChatThreads();
  const contactsQuery = useChatContacts();
  const groupsQuery = useChatGroups();
  
  // Messages for the current thread
  const messagesQuery = useFlattenedChatMessages(currentThread?.id);
  
  // Mutations
  const sendMessageMutation = useSendMessage({
    onSuccess: () => {
      setScrollToBottom(true);
    },
  });
  
  const createThreadMutation = useCreateThread({
    onSuccess: (newThread) => {
      setCurrentThread(newThread);
      setScrollToBottom(true);
    },
  });
  
  const markAsReadMutation = useMarkThreadAsRead();

  // Helper functions
  const getUser = (thread) => {
    if (!thread) return {};
    
    if (thread.type === 'group') {
      const group = groupsQuery.data?.find(g => g.id === thread.groupId);
      if (group) {
        return {
          name: group.name,
          avatarSrc: group.members?.map(member => member.avatarSrc) || []
        };
      }
    } else {
      const contact = contactsQuery.data?.find(c => c.id === thread.userId);
      return contact || {};
    }
    return {};
  };

  const sendMessage = async (message, attachments = []) => {
    if (!currentThread) return;
    
    try {
      await sendMessageMutation.mutateAsync({
        threadId: currentThread.id,
        message,
        attachments
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const createThread = async (participants, isGroup = false, groupName = '') => {
    try {
      await createThreadMutation.mutateAsync({
        participants,
        isGroup,
        groupName
      });
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const markThreadAsRead = async (threadId) => {
    try {
      await markAsReadMutation.mutateAsync(threadId);
    } catch (error) {
      console.error('Failed to mark thread as read:', error);
    }
  };

  const selectThread = (thread) => {
    setCurrentThread(thread);
    setIsOpenThreadInfo(false);
    setScrollToBottom(true);
    
    // Mark as read if it has unread messages
    if (thread && thread.unreadCount > 0) {
      markThreadAsRead(thread.id);
    }
  };

  const value = {
    // Data
    threads: threadsQuery.data?.threads || [],
    contacts: contactsQuery.data || [],
    groups: groupsQuery.data || [],
    messages: messagesQuery.messages || [],
    currentThread,
    
    // Loading states
    isLoadingThreads: threadsQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading,
    isLoadingContacts: contactsQuery.isLoading,
    isLoadingGroups: groupsQuery.isLoading,
    
    // Error states
    threadsError: threadsQuery.error,
    messagesError: messagesQuery.error,
    contactsError: contactsQuery.error,
    groupsError: groupsQuery.error,
    
    // Mutation states
    isSendingMessage: sendMessageMutation.isPending,
    isCreatingThread: createThreadMutation.isPending,
    
    // Helper functions
    getUser,
    
    // Actions
    sendMessage,
    createThread,
    selectThread,
    markThreadAsRead,
    
    // UI State
    textAreaInitialHeight,
    setTextAreaInitialHeight,
    isOpenThreadInfo,
    setIsOpenThreadInfo,
    scrollToBottom,
    setScrollToBottom,
    
    // Manual refetch functions
    refetchThreads: threadsQuery.refetch,
    refetchMessages: messagesQuery.refetch,
    refetchContacts: contactsQuery.refetch,
    refetchGroups: groupsQuery.refetch,
    
    // Infinite loading for messages
    hasNextPage: messagesQuery.hasNextPage,
    fetchNextPage: messagesQuery.fetchNextPage,
    isFetchingNextPage: messagesQuery.isFetchingNextPage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProviderWithQuery');
  }
  return context;
};

export default ChatProviderWithQuery;