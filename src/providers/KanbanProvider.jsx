import React, { createContext, use, useReducer, useState } from 'react';
import currentUserAvatar from 'assets/img/team/3.jpg';
import {
  members,
  labels,
  attachments,
  kanbanItems,
  comments,
  activities
} from 'data/kanban';
import { kanbanReducer } from 'reducers/kanbanReducer';

export const KanbanContext = createContext({
  KanbanColumns: [],
  kanbanTasks: []
});

const KanbanProvider = ({ children }) => {
  const initData = {
    members: members,
    labels: labels,
    attachments: attachments,
    kanbanItems: kanbanItems,
    comments: comments,
    activities: activities,
    kanbanModal: {
      show: false,
      modalContent: {}
    }
  };

  const currentUser = {
    name: 'Emma',
    avatarSrc: currentUserAvatar,
    profileLink: '/user/profile',
    institutionLink: '#!'
  };

  const [kanbanState, kanbanDispatch] = useReducer(kanbanReducer, initData);
  const [cardHeight, setCardHeight] = useState(0);

  return (
    <KanbanContext
      value={{
        kanbanState,
        kanbanDispatch,
        currentUser,
        cardHeight,
        setCardHeight
      }}
    >
      {children}
    </KanbanContext>
  );
};

export const useKanbanContext = () => use(KanbanContext);

export default KanbanProvider;
