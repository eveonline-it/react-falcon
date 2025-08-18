import React, { createContext, use, useReducer, ReactNode, Dispatch } from 'react';
import { emailReducer } from 'reducers/emailReducer';
import rawEmails from 'data/email/emails';

// Type definitions
interface Email {
  id: number;
  user: string;
  img: string;
  title: string;
  description: string;
  time: string;
  star?: boolean;
  snooze?: boolean;
  read?: boolean;
  archive?: boolean;
  attachments?: boolean;
}

type EmailFilter = 'all' | 'unread' | 'star' | 'attachments' | 'archive' | 'snooze';

interface EmailState {
  emails: Email[];
  allEmails: Email[];
  filters: EmailFilter[];
  currentFilter: EmailFilter;
}

interface FilterAction {
  type: 'FILTER';
  payload: EmailFilter;
}

interface BulkUpdateAction {
  type: 'BULK_UPDATE';
  payload: {
    ids: number[];
    key: keyof Email;
    value: any;
  };
}

interface ArchiveAction {
  type: 'ARCHIVE';
  payload: number[];
}

interface DeleteAction {
  type: 'DELETE';
  payload: number[];
}

interface ReadAction {
  type: 'READ';
  payload: number[];
}

interface SnoozeAction {
  type: 'SNOOZE';
  payload: number[];
}

interface ResetAction {
  type: 'RESET';
}

type EmailAction = FilterAction | BulkUpdateAction | ArchiveAction | DeleteAction | ReadAction | SnoozeAction | ResetAction;

interface EmailContextValue {
  emailState: EmailState;
  emailDispatch: Dispatch<EmailAction>;
}

interface EmailProviderProps {
  children: ReactNode;
}

export const EmailContext = createContext<EmailContextValue | undefined>(undefined);

const EmailProvider: React.FC<EmailProviderProps> = ({ children }) => {
  const [emailState, emailDispatch] = useReducer(emailReducer, {
    emails: rawEmails as Email[],
    allEmails: rawEmails as Email[],
    filters: ['all', 'unread', 'star', 'attachments', 'archive', 'snooze'] as EmailFilter[],
    currentFilter: 'all' as EmailFilter
  });

  const value: EmailContextValue = {
    emailState,
    emailDispatch
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmailContext = (): EmailContextValue => {
  const context = use(EmailContext);
  if (!context) {
    throw new Error('useEmailContext must be used within EmailProvider');
  }
  return context;
};

export default EmailProvider;
