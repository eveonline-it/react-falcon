import React, { createContext, use, useState } from 'react';
import { useKanbanStore } from 'stores/kanbanStore';

export const KanbanContext = createContext(null);

const KanbanProvider = ({ children, initialData = null }) => {
  // Simply provide the Zustand hook through Context
  return (
    <KanbanContext.Provider value={useKanbanStore}>
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanbanContext = (selector) => {
  const store = use(KanbanContext);
  if (!store) {
    throw new Error('useKanbanContext must be used within KanbanProvider');
  }
  return store(selector);
};

// Alternative hook that uses the store directly (for components outside provider)
export const useKanban = () => useKanbanStore();

export default KanbanProvider;
