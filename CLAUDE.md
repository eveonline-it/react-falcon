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

## Full-Stack Development

This React frontend works in conjunction with a Go backend API server. The backend code is available at `~/go-falcon` for complete full-stack development and analysis.

- **Frontend**: React Falcon dashboard (current repository)
- **Backend**: Go Falcon API server (available at `~/go-falcon`)
- **Integration**: Cookie-based authentication and OpenAPI-compliant endpoints

## Core Technologies

- **React 19.1.0** - Latest React with functional components and hooks
- **Vite 7.0.5** - Fast build tool and dev server
- **React Bootstrap 2.10.10** - UI component library
- **Bootstrap 5.3.7** - CSS framework
- **React Router 7.7.0** - Client-side routing
- **TanStack Query v5** - Server state management
- **SCSS** - Enhanced CSS with variables and nesting

## Architecture

React Falcon follows a **Perfect Separation of Concerns** architecture with clear boundaries between reusable components, complete applications, page components, and documentation. See `CLAUDE-patterns.md` for comprehensive architectural details, component organization, and import patterns.

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
**Cookie-based authentication ONLY** - Always use `credentials: 'include'`. Never use Bearer tokens. See `CLAUDE-patterns.md` for complete authentication patterns and examples.

## MongoDB Direct Access (MCP Server)

### Development & Debugging Tool
The project includes a MongoDB MCP server that provides **direct access to the backend database** for development, testing, and debugging purposes. This powerful integration allows:

- **Direct database queries** without going through the API layer
- **Access to user access tokens** and all user data for authentication testing
- **Real-time database inspection** and manipulation
- **Advanced analytics** and data exploration
- **System monitoring** and performance analysis

### Available MongoDB Operations
```javascript
// Database exploration
mcp__mongodb-falcon__list-databases()
mcp__mongodb-falcon__list-collections(database)
mcp__mongodb-falcon__collection-schema(database, collection)

// Data access and querying
mcp__mongodb-falcon__find(database, collection, filter, projection, sort, limit)
mcp__mongodb-falcon__aggregate(database, collection, pipeline)
mcp__mongodb-falcon__count(database, collection, query)

// Data manipulation
mcp__mongodb-falcon__insert-many(database, collection, documents)
mcp__mongodb-falcon__update-many(database, collection, filter, update)
mcp__mongodb-falcon__delete-many(database, collection, filter)

// Performance and monitoring
mcp__mongodb-falcon__explain(database, collection, method)
mcp__mongodb-falcon__db-stats(database)
mcp__mongodb-falcon__collection-storage-size(database, collection)
mcp__mongodb-falcon__mongodb-logs(limit, type)

// Index management
mcp__mongodb-falcon__collection-indexes(database, collection)
mcp__mongodb-falcon__create-index(database, collection, keys, name)
```

### Key Use Cases

#### 1. Authentication Testing
```javascript
// Access user tokens directly for testing
mcp__mongodb-falcon__find('falcon', 'users', 
  { character_name: 'YourTestCharacter' }, 
  { access_token: 1, refresh_token: 1 }
)
```

#### 2. Data Verification
```javascript
// Verify API responses match database state
mcp__mongodb-falcon__find('falcon', 'corporations', 
  { corporation_id: 123456 }
)
```

#### 3. System Monitoring
```javascript
// Check system performance
mcp__mongodb-falcon__db-stats('falcon')
mcp__mongodb-falcon__mongodb-logs(50, 'global')
```

### Security & Usage Guidelines
- **Development only** - Never use in production code
- **Authentication bypass** - Direct access bypasses all API authentication
- **Data integrity** - Be cautious with write operations
- **Token access** - User access tokens are available for integration testing
- **Audit trail** - All operations are logged for debugging

### Integration with Frontend Development
This MCP server complements the TanStack Query hooks by providing:
- **Backend data verification** for frontend state
- **Authentication token inspection** for debugging auth issues
- **Performance analysis** of database queries triggered by frontend actions
- **Test data setup** and teardown for development scenarios

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

See `CLAUDE-config-variables.md` for comprehensive configuration details including environment variables, application settings, theme configuration, and build optimization.

## Development Guidelines

Follow established patterns for component development, file organization, naming conventions, and performance optimization. See `CLAUDE-patterns.md` for comprehensive development guidelines and code examples.

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