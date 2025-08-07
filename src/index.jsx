import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import AppProvider from 'providers/AppProvider';
import QueryProvider from 'providers/QueryProvider';
import { AuthProvider } from 'contexts/AuthContext';
import { router } from 'routes';
import 'helpers/initFA';

const container = document.getElementById('main');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <QueryProvider>
      <AuthProvider>
        <AppProvider>
          <RouterProvider router={router} />
        </AppProvider>
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>
);
