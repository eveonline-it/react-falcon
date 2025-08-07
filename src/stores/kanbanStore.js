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

const initialState = {
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

export const useKanbanStore = create(
  devtools(
    (set, get) => ({
      ...initialState,

      // Modal actions
      openKanbanModal: (image) =>
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
      addKanbanColumn: (newColumn) =>
        set(
          (state) => ({
            kanbanItems: [...state.kanbanItems, newColumn]
          }),
          false,
          'addKanbanColumn'
        ),

      removeKanbanColumn: (columnId) =>
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
      addTaskCard: (targetListId, newCard) =>
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

      removeTaskCard: (cardId) =>
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
      updateSingleColumn: (column, reorderedItems) => {
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

      updateDualColumn: (sourceColumn, destColumn, updatedSourceItems, updatedDestItems) => {
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
      setCardHeight: (height) =>
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
      getKanbanItemById: (id) => {
        const state = get();
        return state.kanbanItems.find(item => item.id === id);
      },

      getTaskById: (taskId) => {
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
  openKanbanModal: (image) => useKanbanStore.getState().openKanbanModal(image),
  toggleKanbanModal: () => useKanbanStore.getState().toggleKanbanModal(),
  addKanbanColumn: (column) => useKanbanStore.getState().addKanbanColumn(column),
  removeKanbanColumn: (id) => useKanbanStore.getState().removeKanbanColumn(id),
  addTaskCard: (targetListId, newCard) => useKanbanStore.getState().addTaskCard(targetListId, newCard),
  removeTaskCard: (id) => useKanbanStore.getState().removeTaskCard(id),
  updateSingleColumn: (column, items) => useKanbanStore.getState().updateSingleColumn(column, items),
  updateDualColumn: (sourceColumn, destColumn, sourceItems, destItems) => 
    useKanbanStore.getState().updateDualColumn(sourceColumn, destColumn, sourceItems, destItems),
  setCardHeight: (height) => useKanbanStore.getState().setCardHeight(height),
  resetKanbanState: () => useKanbanStore.getState().resetKanbanState()
};