import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import currentUserAvatar from 'assets/img/team/3.jpg';
import {
  members,
  labels,
  attachments,
  kanbanItems,
  comments,
  activities
} from 'data/kanban';
import { createDevToolsConfig, createActionLogger, createPerformanceTracker } from './devtools';

// Type definitions
export interface KanbanMember {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface KanbanLabel {
  id: string;
  name: string;
  color: string;
}

export interface KanbanAttachment {
  id: string;
  name: string;
  src: string;
  size?: number;
  type?: string;
}

export interface KanbanComment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: Date | string;
}

export interface KanbanActivity {
  id: string;
  type: string;
  user: string;
  description: string;
  timestamp: Date | string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  labels?: KanbanLabel[];
  members?: KanbanMember[];
  attachments?: KanbanAttachment[];
  comments?: KanbanComment[];
  dueDate?: Date | string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

export interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanTask[];
  color?: string;
  limit?: number;
}

export interface KanbanModal {
  show: boolean;
  modalContent: {
    image?: string;
    [key: string]: any;
  };
}

export interface CurrentUser {
  name: string;
  avatarSrc: string;
  profileLink: string;
  institutionLink: string;
}

export interface KanbanState {
  members: KanbanMember[];
  labels: KanbanLabel[];
  attachments: KanbanAttachment[];
  kanbanItems: KanbanColumn[];
  comments: KanbanComment[];
  activities: KanbanActivity[];
  kanbanModal: KanbanModal;
  cardHeight: number;
  currentUser: CurrentUser;
}

export interface KanbanActions {
  // Modal actions
  openKanbanModal: (image: string) => void;
  toggleKanbanModal: () => void;
  
  // Column actions
  addKanbanColumn: (newColumn: KanbanColumn) => void;
  removeKanbanColumn: (columnId: string) => void;
  
  // Task card actions
  addTaskCard: (targetListId: string, newCard: KanbanTask) => void;
  removeTaskCard: (cardId: string) => void;
  
  // Drag and drop actions
  updateSingleColumn: (column: KanbanColumn, reorderedItems: KanbanTask[]) => void;
  updateDualColumn: (
    sourceColumn: KanbanColumn,
    destColumn: KanbanColumn,
    updatedSourceItems: KanbanTask[],
    updatedDestItems: KanbanTask[]
  ) => void;
  
  // UI state actions
  setCardHeight: (height: number) => void;
  
  // Utility actions
  resetKanbanState: () => void;
  
  // Selectors
  getKanbanItemById: (id: string) => KanbanColumn | undefined;
  getTaskById: (taskId: string) => KanbanTask | null;
}

export type KanbanStore = KanbanState & KanbanActions;

const initialState: KanbanState = {
  members: members,
  labels: labels,
  attachments: attachments,
  kanbanItems: kanbanItems,
  comments: comments,
  activities: activities,
  kanbanModal: {
    show: false,
    modalContent: {}
  },
  cardHeight: 0,
  currentUser: {
    name: 'Emma',
    avatarSrc: currentUserAvatar,
    profileLink: '/user/profile',
    institutionLink: '#!'
  }
};

// Development helpers
const actionLogger = createActionLogger('Kanban Store');
const performanceTracker = createPerformanceTracker('Kanban Store');

export const useKanbanStore = create<KanbanStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Modal actions
      openKanbanModal: (image: string) =>
        set(
          (state) => ({
            kanbanModal: {
              ...state.kanbanModal,
              modalContent: {
                ...state.kanbanModal.modalContent,
                image
              },
              show: true
            }
          }),
          false,
          'openKanbanModal'
        ),

      toggleKanbanModal: () =>
        set(
          (state) => ({
            kanbanModal: {
              ...state.kanbanModal,
              show: !state.kanbanModal.show
            }
          }),
          false,
          'toggleKanbanModal'
        ),

      // Column actions
      addKanbanColumn: (newColumn: KanbanColumn) =>
        set(
          (state) => ({
            kanbanItems: [...state.kanbanItems, newColumn]
          }),
          false,
          'addKanbanColumn'
        ),

      removeKanbanColumn: (columnId: string) =>
        set(
          (state) => ({
            kanbanItems: state.kanbanItems.filter(
              (kanbanItem) => kanbanItem.id !== columnId
            )
          }),
          false,
          'removeKanbanColumn'
        ),

      // Task card actions
      addTaskCard: (targetListId: string, newCard: KanbanTask) =>
        set(
          (state) => ({
            kanbanItems: state.kanbanItems.map((kanbanItem) =>
              kanbanItem.id === targetListId
                ? { ...kanbanItem, items: [...kanbanItem.items, newCard] }
                : kanbanItem
            )
          }),
          false,
          'addTaskCard'
        ),

      removeTaskCard: (cardId: string) =>
        set(
          (state) => ({
            kanbanItems: state.kanbanItems.map((kanbanItem) => ({
              ...kanbanItem,
              items: kanbanItem.items.filter((item) => item.id !== cardId)
            }))
          }),
          false,
          'removeTaskCard'
        ),

      // Drag and drop actions - optimized for performance
      updateSingleColumn: (column: KanbanColumn, reorderedItems: KanbanTask[]) => {
        performanceTracker.start('updateSingleColumn');
        const prevState = get();
        
        set(
          (state) => ({
            kanbanItems: state.kanbanItems.map((kanbanItem) =>
              kanbanItem.id === column.id
                ? {
                    ...kanbanItem,
                    items: [...reorderedItems]
                  }
                : kanbanItem
            )
          }),
          false,
          'updateSingleColumn'
        );
        
        performanceTracker.end('updateSingleColumn');
        actionLogger('updateSingleColumn', prevState, get());
      },

      updateDualColumn: (
        sourceColumn: KanbanColumn,
        destColumn: KanbanColumn,
        updatedSourceItems: KanbanTask[],
        updatedDestItems: KanbanTask[]
      ) => {
        performanceTracker.start('updateDualColumn');
        const prevState = get();
        
        set(
          (state) => ({
            kanbanItems: state.kanbanItems.map((kanbanItem) => {
              if (kanbanItem.id === sourceColumn.id) {
                return {
                  ...kanbanItem,
                  items: updatedSourceItems
                };
              } else if (kanbanItem.id === destColumn.id) {
                return {
                  ...kanbanItem,
                  items: updatedDestItems
                };
              }
              return kanbanItem;
            })
          }),
          false,
          'updateDualColumn'
        );
        
        performanceTracker.end('updateDualColumn');
        actionLogger('updateDualColumn', prevState, get());
      },

      // UI state actions
      setCardHeight: (height: number) =>
        set(
          { cardHeight: height },
          false,
          'setCardHeight'
        ),

      // Utility actions
      resetKanbanState: () =>
        set(
          initialState,
          false,
          'resetKanbanState'
        ),

      // Selectors (derived state)
      getKanbanItemById: (id: string): KanbanColumn | undefined => {
        const state = get();
        return state.kanbanItems.find(item => item.id === id);
      },

      getTaskById: (taskId: string): KanbanTask | null => {
        const state = get();
        for (const column of state.kanbanItems) {
          const task = column.items.find(item => item.id === taskId);
          if (task) return task;
        }
        return null;
      }
    }),
    createDevToolsConfig('kanban-store')
  )
);

// Export individual action creators for easier testing and usage
export const kanbanActions = {
  openKanbanModal: (image: string) => useKanbanStore.getState().openKanbanModal(image),
  toggleKanbanModal: () => useKanbanStore.getState().toggleKanbanModal(),
  addKanbanColumn: (column: KanbanColumn) => useKanbanStore.getState().addKanbanColumn(column),
  removeKanbanColumn: (id: string) => useKanbanStore.getState().removeKanbanColumn(id),
  addTaskCard: (targetListId: string, newCard: KanbanTask) => useKanbanStore.getState().addTaskCard(targetListId, newCard),
  removeTaskCard: (id: string) => useKanbanStore.getState().removeTaskCard(id),
  updateSingleColumn: (column: KanbanColumn, items: KanbanTask[]) => useKanbanStore.getState().updateSingleColumn(column, items),
  updateDualColumn: (sourceColumn: KanbanColumn, destColumn: KanbanColumn, sourceItems: KanbanTask[], destItems: KanbanTask[]) => 
    useKanbanStore.getState().updateDualColumn(sourceColumn, destColumn, sourceItems, destItems),
  setCardHeight: (height: number) => useKanbanStore.getState().setCardHeight(height),
  resetKanbanState: () => useKanbanStore.getState().resetKanbanState()
};