import React, { createContext, use, useReducer, ReactNode, Dispatch } from 'react';
import { feedReducer } from 'reducers/feedReducer';
import rawFeeds from 'data/feed';

// Type definitions
interface Feed {
  id: number;
  [key: string]: any;
}

interface AddAction {
  type: 'ADD';
  payload: Feed;
}

interface UpdateAction {
  type: 'UPDATE';
  payload: {
    id: number;
    feed: Feed;
  };
}

type FeedAction = AddAction | UpdateAction;

interface FeedContextValue {
  feeds: Feed[];
  feedDispatch: Dispatch<FeedAction>;
}

interface FeedProviderProps {
  children: ReactNode;
}

export const FeedContext = createContext<FeedContextValue | undefined>(undefined);

const FeedProvider: React.FC<FeedProviderProps> = ({ children }) => {
  const [feeds, feedDispatch] = useReducer(feedReducer, rawFeeds as Feed[]);

  const value: FeedContextValue = {
    feeds,
    feedDispatch
  };

  return (
    <FeedContext.Provider value={value}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeedContext = (): FeedContextValue => {
  const context = use(FeedContext);
  if (!context) {
    throw new Error('useFeedContext must be used within FeedProvider');
  }
  return context;
};

export default FeedProvider;
