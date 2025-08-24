# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AI Guidance

* Ignore GEMINI.md and GEMINI-*.md files
* **NEVER EVER run `npm run dev` - The frontend is already running**
* To save main context space, for code searches, inspections, troubleshooting or analysis, use code-searcher subagent where appropriate - giving the subagent full context background for the task(s) you assign it.
* After receiving tool results, carefully reflect on their quality and determine optimal next steps before proceeding. Use your thinking to plan and iterate based on this new information, and then take the best next action.
* For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.
* Before you finish, please verify your solution
* Do what has been asked; nothing more, nothing less.
* NEVER create files unless they're absolutely necessary for achieving your goal.
* ALWAYS prefer editing an existing file to creating a new one.
* NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
* When you update or modify core context files, also update markdown documentation and memory bank
* When asked to commit changes, exclude CLAUDE-*.md referenced memory bank system files from any commits. Never delete these files.

## Memory Bank System

This project uses a structured memory bank system with specialized context files. Always check these files for relevant information before starting work:

### Core Context Files

* **CLAUDE-activeContext.md** - Current session state, goals, and progress (if exists)
* **CLAUDE-patterns.md** - Established code patterns and conventions (if exists)
* **CLAUDE-decisions.md** - Architecture decisions and rationale (if exists)
* **CLAUDE-troubleshooting.md** - Common issues and proven solutions (if exists)
* **CLAUDE-config-variables.md** - Configuration variables reference (if exists)
* **CLAUDE-temp.md** - Temporary scratch pad (only read when referenced)

**Important:** Always reference the active context file first to understand what's currently being worked on and maintain session continuity.

## Project Overview

React Falcon is a comprehensive admin dashboard template built with React 19, featuring multiple specialized dashboards for various business applications including analytics, CRM, e-commerce, project management, SaaS, and support desk systems.

## Core Technologies

- **React 19.1.0** - Latest React with functional components and hooks
- **Vite 7.0.5** - Fast build tool and dev server
- **React Bootstrap 2.10.10** - UI component library
- **Bootstrap 5.3.7** - CSS framework
- **React Router 7.7.0** - Client-side routing
- **TanStack Query v5** - Server state management
- **SCSS** - Enhanced CSS with variables and nesting

## Architecture

### Project Structure (Key Directories)
```
src/
├── components/           # 🎯 Reusable UI Components ONLY
│   ├── common/          # Core UI library (Avatar, Button, Card, etc.)
│   ├── authentication/ # Auth components & layouts
│   ├── dashboards/      # Dashboard widget components
│   └── [others...]      # Navigation, wizard, errors, notification
├── features/            # 🚀 Complete Application Modules
│   ├── chat/           # Full chat application
│   ├── email/          # Complete email client
│   ├── kanban/         # Kanban board system
│   └── [others...]     # events, social, support-desk, calendar
├── demos/dashboards/    # 🚀 Complete Dashboard Demos
├── pages/              # 📄 Page-Level Components
│   ├── admin/          # Admin interfaces (8 complete admin pages)
│   └── [others...]     # faq, pricing, user, landing, misc
├── docs/               # 📚 Documentation & Examples
├── hooks/              # Custom React hooks (TanStack Query hooks)
├── providers/          # Context providers
└── [others...]         # layouts, routes, data, helpers, assets
```

### Component Organization Principles

1. **Perfect Separation of Concerns**: Clear boundaries between reusable components, complete applications, page components, and documentation
2. **Barrel Exports**: Clean imports with `index.ts` files for component libraries
3. **Feature Boundaries**: Each major feature has isolated state management
4. **Focused Responsibility**: Each directory serves a single, well-defined purpose

### Import Patterns
```jsx
// Reusable components
import { Avatar, Button, Card } from 'components/common';
import { WeeklySales, TotalOrder } from 'components/dashboards'; 
import { EveOnlineLoginForm } from 'components/authentication';

// Complete features
import Chat from 'features/chat/Chat';
import Inbox from 'features/email/inbox/Inbox';
```

## Data Fetching & Authentication

### TanStack Query Integration
- **All data fetching** uses TanStack Query v5 with comprehensive hook system
- **Backend API**: Must comply with OpenAPI spec at `https://go.eveonline.it/openapi.json`
- **Authentication**: Cookie-based with `credentials: 'include'` (NOT Bearer tokens)
- **Configuration**: 5-minute stale time, smart retry logic, DevTools enabled

### Key Hooks Available
- **Admin Management**: `useUsers`, `useGroups`, `usePermissions`, `useCorporations`, `useAlliances`
- **System Monitoring**: `useScheduler`, `useTaskStatistics`, `useSettings`
- **Analytics**: `useAnalytics`, `useDashboard`
- **Communication**: `useChat`, `useEmail`
- **Data Patterns**: `useInfiniteData` for pagination

### Authentication Pattern (CRITICAL)
```javascript
// ✅ CORRECT - Cookie-based authentication
const response = await fetch(url, {
  method: 'GET',
  credentials: 'include',  // Always include cookies
  headers: { 'Content-Type': 'application/json' }
});

// ❌ NEVER use Bearer tokens in this project
```

## State Management

### Guidelines
1. **Use React Context for Dependency Injection** - Not direct state storage
2. **Decision Tree**:
   - Single component → `useState`
   - 2-3 components → Prop drilling or lift state up
   - Global configuration → Context provider
   - Complex feature state → Feature-specific Context provider
   - Performance-critical → Consider Zustand

### Available Providers
- **AppProvider** - Global app configuration (theme, navbar, RTL)
- **AuthProvider** - Authentication state
- **Feature Providers** - Chat, Email, Kanban, Feed providers

## EVE Online Integration

### SSO Authentication
- **Complete OAuth 2.0 flow** with backend handling all token management
- **Available routes**: `/authentication/{simple|card|split}/eve-login`
- **Backend endpoints**: `/auth/eve/login`, `/auth/auth-status`
- **Components**: `EveOnlineLoginForm`, `EveSsoErrorHandler`

### Visual Integration
- **Character portraits**: `https://images.evetech.net/characters/{id}/portrait`
- **Corporation logos**: `https://images.evetech.net/corporations/{id}/logo`
- **Alliance logos**: `https://images.evetech.net/alliances/{id}/logo`
- **Reusable components**: `CharacterPortrait`, `CorporationLogo`, `AllianceLogo`

## Admin System (8 Complete Pages)

1. **UsersAdmin** - EVE character management with portraits, group membership, bulk operations
2. **GroupsAdmin** - Group management with member assignment and permissions
3. **PermissionsAdmin** - Permission system with interactive testing
4. **CorporationsAdmin** & **AllianceAdmin** - EVE entity management
5. **SchedulerAdmin** - System task scheduling and monitoring
6. **TaskAnalyticsAdmin** - Performance analytics and trend analysis
7. **SettingsAdmin** - System configuration management

## Development Commands

```bash
npm install           # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

## Key Configuration

### Environment Variables
```env
VITE_EVE_BACKEND_URL=https://your-backend-domain.com
VITE_REACT_APP_TINYMCE_APIKEY=your_tinymce_api_key
VITE_REACT_APP_GOOGLE_API_KEY=your_google_api_key
```

### Theme Configuration (src/config.ts)
```typescript
export const settings = {
  isFluid: false,
  isRTL: false,
  isDark: false,
  theme: 'light',
  navbarPosition: 'vertical',
  navbarStyle: 'transparent'
};
```

## Development Guidelines

### Component Development
1. Use functional components with hooks
2. Follow existing naming conventions and TypeScript patterns
3. Use React Bootstrap components when possible
4. Support both light/dark themes and RTL/LTR layouts

### File Organization
1. **Determine correct location** based on component type (reusable vs feature vs page vs docs)
2. **Add barrel exports** for reusable components
3. **Follow existing patterns** in similar components
4. **Update providers** if component needs state management

### Performance
- Use React.memo for expensive components
- Implement proper dependency arrays in hooks
- Lazy load routes and heavy components
- TanStack Query handles caching and optimization

## Available Features

### Dashboard Types
Default, Analytics, CRM, E-commerce, Project Management, SaaS, Support Desk

### Complete Application Modules
Chat (real-time messaging), Email (full client), Calendar (event scheduling), Kanban (project boards), Events (management system), Social (feeds, followers), Support Desk (help desk system)

### Layouts
MainLayout, VerticalNavLayout, TopNavLayout, ComboNavLayout, Auth Layouts (Simple, Card, Split, Wizard)

## Important Reminders

- **Always check memory bank files** before starting work
- **Use cookie-based authentication** with `credentials: 'include'`
- **Follow OpenAPI compliance** for all backend API calls
- **Maintain component separation** (reusable vs features vs pages vs docs)
- **Update memory bank** when making significant architectural changes
- **Exclude CLAUDE*.md files** from commits