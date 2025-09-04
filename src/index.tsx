import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import AppProvider from 'providers/AppProvider';
import QueryProvider from 'providers/QueryProvider';
import { AuthProvider } from 'contexts/AuthContext';
import { WebSocketProvider } from 'providers/WebSocketProvider';
import { router } from 'routes';
import 'helpers/initFA';

const container = document.getElementById('main') as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <QueryProvider>
      <AuthProvider>
        <WebSocketProvider>
          <AppProvider>
            <RouterProvider router={router} />
          </AppProvider>
        </WebSocketProvider>
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>
);
