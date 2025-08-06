import React, { createContext, use, useReducer } from 'react';
import { emailReducer } from 'reducers/emailReducer';
import rawEmails from 'data/email/emails';

export const EmailContext = createContext({ emails: [] });

const EmailProvider = ({ children }) => {
  const [emailState, emailDispatch] = useReducer(emailReducer, {
    emails: rawEmails,
    allEmails: rawEmails,
    filters: ['all', 'unread', 'star', 'attachments', 'archive', 'snooze'],
    currentFilter: 'all'
  });

  return (
    <EmailContext value={{ emailState, emailDispatch }}>
      {children}
    </EmailContext>
  );
};

export const useEmailContext = () => use(EmailContext);

export default EmailProvider;
