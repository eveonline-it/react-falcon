import React, { createContext, use, useState } from 'react';

export const AuthWizardContext = createContext({ user: {} });

const AuthWizardProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [step, setStep] = useState(1);

  const value = { user, setUser, step, setStep };
  return (
    <AuthWizardContext value={value}>
      {children}
    </AuthWizardContext>
  );
};

export const useAuthWizardContext = () => use(AuthWizardContext);

export default AuthWizardProvider;
