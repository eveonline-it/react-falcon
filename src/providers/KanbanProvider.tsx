import React, { createContext, use, ReactNode } from 'react';
import { useKanbanStore } from 'stores/kanbanStore';

interface KanbanProviderProps {
  children: ReactNode;
  initialData?: any;
}

type KanbanStoreType = typeof useKanbanStore;

export const KanbanContext = createContext<KanbanStoreType | null>(null);

const KanbanProvider: React.FC<KanbanProviderProps> = ({ children, initialData = null }) => {
  // Simply provide the Zustand hook through Context
  return (
    <KanbanContext.Provider value={useKanbanStore}>
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanbanContext = <T = any>(selector?: (state: any) => T): T => {
  const store = use(KanbanContext);
  if (!store) {
    throw new Error('useKanbanContext must be used within KanbanProvider');
  }
  return selector ? store(selector) : store();
};

// Alternative hook that uses the store directly (for components outside provider)
export const useKanban = () => useKanbanStore();

export default KanbanProvider;
