import React, { createContext, use, useReducer } from 'react';
import { feedReducer } from 'reducers/feedReducer';
import rawFeeds from 'data/feed';

export const FeedContext = createContext({ feeds: [] });

const FeedProvider = ({ children }) => {
  const [feeds, feedDispatch] = useReducer(feedReducer, rawFeeds);

  return (
    <FeedContext value={{ feeds, feedDispatch }}>
      {children}
    </FeedContext>
  );
};

export const useFeedContext = () => use(FeedContext);

export default FeedProvider;
