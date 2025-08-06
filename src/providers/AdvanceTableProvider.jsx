import React, { createContext, use } from 'react';

export const AdvanceTableContext = createContext({});

const AdvanceTableProvider = ({ children, ...rest }) => {
  return (
    <AdvanceTableContext value={{ ...rest }}>
      {children}
    </AdvanceTableContext>
  );
};


export const useAdvanceTableContext = () => use(AdvanceTableContext);

export default AdvanceTableProvider;
