# React Falcon Development Guide

## Project Overview
React Falcon is a comprehensive admin dashboard template built with React 19, featuring multiple specialized dashboards for various business applications including analytics, CRM, e-commerce, project management, SaaS, and support desk systems.


## Development Setup

### Prerequisites
- Node.js (latest LTS version recommended)
- npm or yarn package manager

### Installation & Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview
```

### Key Development Commands
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run predeploy` - Build and prepare for deployment

## Architecture & Technology Stack

### Core Technologies
- **React 19.1.0** - Latest React with functional components and hooks
- **Vite 7.0.5** - Fast build tool and dev server
- **React Bootstrap 2.10.10** - UI component library
- **Bootstrap 5.3.7** - CSS framework
- **React Router 7.7.0** - Client-side routing
- **SCSS** - Enhanced CSS with variables and nesting

### Key Libraries
- **State Management**: Context API with custom providers
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form + Yup validation
- **Charts**: ECharts, Chart.js, D3.js
- **Maps**: Google Maps API, Leaflet
- **Date/Time**: Day.js, React DatePicker, FullCalendar
- **Rich Text**: TinyMCE editor
- **Drag & Drop**: DND Kit for Kanban boards
- **Animations**: Lottie React

## Project Structure

```
src/
├── components/           # 🎯 Reusable UI Components ONLY
│   ├── authentication/ # Auth components & layouts (with barrel export)
│   ├── common/         # Reusable UI component library (with barrel export)
│   ├── dashboards/     # Dashboard widget components (with barrel export)
│   ├── navbar/         # Navigation components
│   ├── wizard/         # Form wizard components
│   ├── errors/         # Error page components
│   └── notification/   # Notification components
├── features/           # 🚀 Complete Application Modules
│   ├── chat/          # Full chat application
│   ├── email/         # Complete email client
│   ├── kanban/        # Kanban board system
│   ├── events/        # Event management system
│   ├── social/        # Social media features
│   ├── support-desk/  # Help desk application
│   └── calendar/      # Calendar application
├── demos/             # 🚀 Complete Dashboard Demos
│   └── dashboards/    # Full dashboard layout examples
│       ├── DefaultDashboard.jsx
│       ├── AnalyticsDashboard.jsx
│       ├── CrmDashboard.jsx
│       └── [others...]
├── pages/             # 📄 Page-Level Components
│   ├── faq/          # FAQ pages
│   ├── pricing/      # Pricing pages
│   ├── user/         # User profile pages
│   ├── landing/      # Landing pages
│   └── miscellaneous/ # Other page components
├── docs/              # 📚 Documentation & Examples
│   ├── components/   # Component documentation & examples
│   ├── documentation/ # Development guides & docs
│   └── utilities/    # Bootstrap utility class examples
├── layouts/          # Layout components (9 different layouts)
├── providers/        # Context providers for state management
├── routes/          # Routing configuration
├── data/            # Static data and mock APIs
├── hooks/           # Custom React hooks
├── helpers/         # Utility functions
├── assets/          # Images, icons, SCSS files
└── reducers/        # State reducers
```

## Component Organization

### Perfect Separation of Concerns
The project now maintains crystal clear boundaries between different types of code:

#### 🎯 Reusable UI Components (`src/components/`)
**Only truly reusable UI components belong here:**
- **`common/`** - Core UI component library (Avatar, Button, Card, etc.) with barrel export
- **`authentication/`** - Auth-specific components (login forms, protected routes) with barrel export  
- **`dashboards/`** - Reusable dashboard widgets (WeeklySales, ActiveUsers, etc.) with barrel export
- **`navbar/`** - Navigation components (top nav, vertical nav, dropdowns)
- **`wizard/`** - Form wizard components
- **`errors/`** - Error page components (404, 500)
- **`notification/`** - Notification system components

#### 🚀 Complete Application Features (`src/features/`)
**Full-featured application modules with their own state and business logic:**
- **`chat/`** - Complete real-time messaging system
- **`email/`** - Full email client (inbox, compose, detail views)
- **`kanban/`** - Project management boards with drag & drop
- **`events/`** - Event management system (create, list, detail)
- **`social/`** - Social media features (feed, followers, activity log)  
- **`support-desk/`** - Help desk system (tickets, contacts, reports)
- **`calendar/`** - Calendar application with scheduling

#### 🚀 Dashboard Demos (`src/demos/dashboards/`)
**Complete dashboard layouts showing how to compose components:**
- **`DefaultDashboard.jsx`** - General business metrics layout
- **`AnalyticsDashboard.jsx`** - Web analytics dashboard
- **`CrmDashboard.jsx`** - CRM and sales dashboard
- **`ProjectManagementDashboard.jsx`** - Team collaboration dashboard
- **`SaasDashboard.jsx`** - SaaS metrics dashboard
- **`SupportDeskDashboard.jsx`** - Support desk dashboard

#### 📄 Page Components (`src/pages/`)
**Page-level components for routing:**
- **`admin/`** - Administrative pages (SettingsAdmin, SchedulerAdmin, TaskAnalyticsAdmin, UsersAdmin, CorporationsAdmin, AllianceAdmin, GroupsAdmin)
- **`faq/`** - FAQ pages (basic, accordion, alt layouts)
- **`pricing/`** - Pricing pages (default, alternative layouts)
- **`user/`** - User profile and settings pages
- **`landing/`** - Marketing and landing pages
- **`miscellaneous/`** - Other standalone pages

#### 📚 Documentation (`src/docs/`)
**Documentation, examples, and guides separate from application code:**
- **`components/`** - Component documentation with interactive examples
- **`documentation/`** - Development guides, setup docs, changelogs
- **`utilities/`** - Bootstrap utility class examples and demonstrations

### Layout System
- **MainLayout** - Primary dashboard layout
- **VerticalNavLayout** - Sidebar navigation (default)
- **TopNavLayout** - Top navigation bar
- **ComboNavLayout** - Combined top + sidebar
- **Auth Layouts** - Simple, Card, Split, Wizard variations

### Import Patterns
**Clean imports with barrel exports:**
```jsx
// Reusable components
import { Avatar, Button, Card } from 'components/common';
import { WeeklySales, TotalOrder } from 'components/dashboards'; 
import { EveOnlineLoginForm } from 'components/authentication';

// Complete features
import Chat from 'features/chat/Chat';
import Inbox from 'features/email/inbox/Inbox';

// Dashboard demos
import DefaultDashboard from 'demos/dashboards/DefaultDashboard';

// Pages
import PricingDefault from 'pages/pricing/pricing-default/PricingDefault';
```

## State Management

### Context Providers (src/providers/)
- **AppProvider** - Global app configuration (theme, navbar, RTL)
- **ProductProvider** - E-commerce product state
- **KanbanProvider** - Kanban board state
- **ChatProvider** - Chat application state
- **EmailProvider** - Email client state

### State Management Guidelines
**📖 Complete guide available:** `docs/STATE_MANAGEMENT_GUIDE.md`  
**🔧 DevTools debugging:** `docs/ZUSTAND_DEVTOOLS_GUIDE.md`

**Key Principles:**
1. **Use React Context for Dependency Injection, Not State Management**
   - Context provides access to state management tools
   - Avoid putting complex state directly in Context (performance issues)

2. **Choose the Right Tool:**
   - **Local State** (`useState`) - Simple component-level state, form inputs, toggles
   - **Context Providers** - Global configuration, dependency injection, feature-scoped state
   - **Consider Zustand** - Performance-critical or very complex state scenarios

3. **Feature Boundaries:**
   - Keep state scoped to feature boundaries
   - Each major feature has its own provider for isolated state management

4. **Decision Tree:**
   - Local to single component? → `useState`
   - Shared between 2-3 components? → Prop drilling or lift state up
   - Global setting/configuration? → Extend existing Context provider
   - Complex feature state? → Create feature-specific Context provider
   - Performance-critical/very complex? → Consider Zustand with Context injection

**Current Architecture:** Context-based approach with feature-specific providers works well. Use Context for dependency injection and keep state management scoped appropriately.

## Data Fetching with TanStack Query

### Overview
TanStack Query (React Query) v5 is integrated for efficient server state management, providing powerful caching, synchronization, and background updates for API calls.

### Backend API Specification
All API queries and mutations must respect the backend OpenAPI specification:
- **OpenAPI Spec URL**: https://go.eveonline.it/openapi.json
- **Compliance Required**: All data fetching operations must follow the defined endpoints, request/response schemas, and authentication requirements
- **Schema Validation**: Ensure request payloads and response handling match the OpenAPI definitions
- **Authentication Method**: All API calls use cookie-based authentication with `credentials: 'include'` (NOT Bearer tokens)

### Core Features
- **Intelligent Caching** - Automatic caching with configurable stale times
- **Background Updates** - Keep data fresh with background refetching
- **Optimistic Updates** - Update UI immediately, rollback on failure
- **Infinite Queries** - Built-in infinite scrolling support
- **DevTools Integration** - Debugging tools for development
- **Error Handling** - Robust error handling and retry logic

### Configuration (src/providers/QueryProvider.jsx)
```jsx
import QueryProvider from 'providers/QueryProvider';

// QueryClient configured with:
- 5-minute stale time for queries
- 10-minute garbage collection time
- Smart retry logic (no retry on 4xx errors)
- Background refetch disabled for better UX
- DevTools enabled in development
```

### Available Query Hooks

#### Settings Management (src/hooks/useSettings.js)
```jsx
import { useSettings, useCreateSetting, useUpdateSetting, useDeleteSetting } from 'hooks/useSettings';

// Fetch site settings with filters
const { data, isLoading, error } = useSettings({
  category: 'ui',
  is_public: true,
  is_active: true
});

// CRUD operations
const createMutation = useCreateSetting({
  onSuccess: (data) => console.log('Created!', data)
});

const updateMutation = useUpdateSetting();
const deleteMutation = useDeleteSetting();
```

#### Corporation Management (src/hooks/useCorporations.js)
```jsx
import { useManagedCorporations, useSearchCorporations, useAddManagedCorporation } from 'hooks/useCorporations';

// Fetch managed corporations
const { data, isLoading, error } = useManagedCorporations();

// Search EVE Online corporations
const { data: searchResults } = useSearchCorporations(query);

// CRUD operations with optimistic updates
const addMutation = useAddManagedCorporation();
const updateStatusMutation = useUpdateCorporationStatus();
const removeMutation = useRemoveManagedCorporation();
const bulkUpdateMutation = useBulkUpdateCorporations(); // Drag & drop reordering
```

#### Alliance Management (src/hooks/useAlliances.js)
```jsx
import { useManagedAlliances, useSearchAlliances, useAddManagedAlliance } from 'hooks/useAlliances';

// Fetch managed alliances
const { data, isLoading, error } = useManagedAlliances();

// Search EVE Online alliances
const { data: searchResults } = useSearchAlliances(query);

// CRUD operations with optimistic updates
const addMutation = useAddManagedAlliance();
const updateStatusMutation = useUpdateAllianceStatus();
const removeMutation = useRemoveManagedAlliance();
const bulkUpdateMutation = useBulkUpdateAlliances(); // Drag & drop reordering
```

#### Groups Management (src/hooks/useGroups.js)
```jsx
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup, useGroupMembers, useAddGroupMember, useRemoveGroupMember, useCharacterSearch } from 'hooks/useGroups';

// Fetch groups with filters
const { data, isLoading, error } = useGroups({
  type: 'custom',
  page: 1,
  limit: 20
});

// Group membership management - returns paginated response
const { data: members } = useGroupMembers(groupId);
// Access members array: members.members, total: members.total

// Character search for adding members
const { data: searchResults, isLoading: searching } = useCharacterSearch(searchTerm);
// Requires minimum 3 characters, returns: { characters: [...], count: number }

// CRUD operations with optimistic updates
const createMutation = useCreateGroup();
const updateMutation = useUpdateGroup();
const deleteMutation = useDeleteGroup();
const addMemberMutation = useAddGroupMember();
const removeMemberMutation = useRemoveGroupMember();
```

**Features**:
- **Character Search**: Search members by name (minimum 3 characters) with real-time results
- **Add Confirmation Modal**: Click character from search results to show confirmation dialog before adding
- **Remove Confirmation Modal**: Click remove button to show confirmation dialog before removing members
- **Active/Inactive Toggle**: Edit groups to change active/inactive status with visual switch control
- **Paginated Member List**: Character names displayed first for better UX
- **Safe Member Management**: Both add and remove operations require explicit confirmation
- **Interactive Workflows**: Search → Click → Confirm → Add and Click → Confirm → Remove
- **Status Management**: Create groups as active by default, toggle status during editing
- Backend error handling workarounds for inconsistent API responses (500 errors on successful operations)
- Member display format: Character Name, Character ID, Added Date, Actions

#### User Management (src/hooks/useUsers.js)
```jsx
import { 
  useUsers, 
  useUserStats, 
  useUserProfile, 
  useUpdateUser, 
  useUpdateUserStatus, 
  useRefreshUserData,
  useBulkUpdateUsers,
  useUsersStatus 
} from 'hooks/useUsers';

// Fetch users with filtering and pagination
const { data, isLoading, error } = useUsers({
  page: 1,
  limit: 20,
  search: 'character name',
  enabled: 'true',
  banned: 'false'
});

// Get user statistics
const { data: stats } = useUserStats();
// Returns: { total_users, enabled_users, disabled_users, banned_users, invalid_users }

// Get users module health status
const { data: status } = useUsersStatus();

// Individual user profile
const { data: profile } = useUserProfile(userId);

// Update user with full control (uses character_id, API endpoint: PUT /users/mgt/{character_id})
const updateMutation = useUpdateUser();
updateMutation.mutate({
  userId: characterId, // Actually expects character_id, not user_id
  data: {
    enabled: true,
    banned: false,
    invalid: false,
    notes: 'Admin notes',
    position: 10
  }
});

// Bulk user operations
const bulkMutation = useBulkUpdateUsers();
bulkMutation.mutate({
  userIds: [1, 2, 3],
  data: { enabled: false, banned: true }
});

// Refresh user data from EVE Online
const refreshMutation = useRefreshUserData();
refreshMutation.mutate(userId);
```

**Features**:
- **Complete User CRUD**: Create, read, update operations with comprehensive field support
- **Advanced Filtering**: Search by name, email, corporation, alliance with status filters  
- **Bulk Operations**: Mass enable/disable/ban/unban multiple users simultaneously
- **User Statistics**: Real-time counts of total, enabled, disabled, banned, and invalid users
- **Notes System**: Admin can add internal notes to users for tracking and management
- **Position Management**: Numerical ranking system for user organization and sorting
- **Health Monitoring**: Users module status checking for system health
- **EVE Online Integration**: Refresh user data directly from EVE Online ESI
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on errors
- **CSV Export**: Complete user data export functionality with filtering support
- **Status Management**: Granular control with enabled, banned, and invalid boolean flags
- **Row Selection**: Multi-select interface for bulk operations with safety confirmations

#### Analytics Data (src/hooks/useAnalytics.js)
```jsx
import { useAnalyticsOverview, useRevenueData, useAnalyticsDashboard } from 'hooks/useAnalytics';

// Individual analytics queries
const { data: overview } = useAnalyticsOverview();
const { data: revenue } = useRevenueData('30d');

// Multiple queries at once
const queries = useAnalyticsDashboard('30d'); // [overview, revenue, traffic, products]
```

#### Infinite Scrolling (src/hooks/useInfiniteData.js)
```jsx
import { useInfiniteProducts, useFlattenedInfiniteData } from 'hooks/useInfiniteData';

// Infinite query with pagination
const infiniteQuery = useInfiniteProducts({ category: 'electronics' });
const { flatData, hasNextPage, fetchNextPage } = useFlattenedInfiniteData(infiniteQuery);
```

### Usage Patterns

#### Basic Query Pattern
```jsx
const MyComponent = () => {
  const { data, isLoading, error, refetch } = useMyQuery(params);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <DataDisplay data={data} onRefresh={refetch} />;
};
```

#### Mutation Pattern
```jsx
const MyComponent = () => {
  const mutation = useMyMutation({
    onSuccess: () => toast.success('Updated successfully!'),
    onError: (error) => toast.error(`Failed: ${error.message}`)
  });
  
  const handleSubmit = (formData) => {
    mutation.mutate(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};
```

#### Infinite Query Pattern
```jsx
const InfiniteList = () => {
  const infiniteQuery = useInfiniteData('products');
  const { flatData, hasNextPage, fetchNextPage, isFetchingNextPage } = 
    useFlattenedInfiniteData(infiniteQuery);
  
  return (
    <div>
      {flatData.map(item => <Item key={item.id} data={item} />)}
      {hasNextPage && (
        <button onClick={fetchNextPage} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};
```

### Best Practices

1. **Query Keys**: Use structured, hierarchical keys
   ```jsx
   ['user', 'profile', userId]           // User profile
   ['analytics', 'revenue', timeRange]   // Analytics data
   ['infinite', 'products', filters]     // Infinite lists
   ```

2. **Stale Time Configuration**: Match your data's freshness requirements
   - User profiles: 5 minutes
   - Analytics: 15 minutes
   - Static content: 30+ minutes

3. **Error Handling**: Implement proper error boundaries and user feedback
   ```jsx
   const { error } = useQuery({
     queryKey: ['data'],
     queryFn: fetchData,
     throwOnError: false, // Handle errors in component
   });
   ```

4. **Optimistic Updates**: Use for better UX in mutations
   ```jsx
   const mutation = useMutation({
     mutationFn: updateData,
     onMutate: async (newData) => {
       // Cancel outgoing refetches
       await queryClient.cancelQueries(['data']);
       
       // Snapshot previous value
       const previous = queryClient.getQueryData(['data']);
       
       // Optimistically update
       queryClient.setQueryData(['data'], newData);
       
       return { previous };
     },
     onError: (err, newData, context) => {
       // Rollback on error
       queryClient.setQueryData(['data'], context.previous);
     },
   });
   ```

### Integration Points

- **Authentication**: Uses cookie-based authentication with `credentials: 'include'` on all API calls
- **Error Handling**: Global error handling for 401/403 responses
- **Loading States**: Integrated with existing loading UI patterns
- **Cache Management**: Automatic invalidation on route changes and user actions

### Authentication Pattern
**IMPORTANT**: All API calls in this application use cookie-based authentication:
```javascript
// ✅ CORRECT - Cookie-based authentication
const response = await fetch(url, {
  method: 'GET',
  credentials: 'include',  // Sends cookies with request
  headers: {
    'Content-Type': 'application/json',
  },
});

// ❌ INCORRECT - Do NOT use Bearer tokens
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,  // Don't use this pattern
  },
});
```

### Development Tools

- **React Query DevTools**: Available in development mode (bottom-right corner)
- **Query Inspection**: View cache, network requests, and query states
- **Performance Monitoring**: Track query performance and cache hit rates

### Example Implementation
See `src/docs/components/TanStackQueryExample.jsx` for a comprehensive example demonstrating all features including queries, mutations, infinite scrolling, and error handling.

### Configuration (src/config.js)
```javascript
export const settings = {
  isFluid: false,           // Container fluid layout
  isRTL: false,            // Right-to-left support
  isDark: false,           // Dark mode
  theme: 'light',          // Theme variant
  navbarPosition: 'vertical', // Navigation layout
  navbarStyle: 'transparent' // Navbar styling
};
```

## Styling & Theming

### SCSS Structure (src/assets/scss/)
- `theme.scss` - Main theme file
- `_user-variables.scss` - Custom variable overrides
- `theme/` directory with modular SCSS files
- `theme/_animations.scss` - CSS animations (spin, pulse, etc.)
- Bootstrap customization and extensions

### Theme System
- Light/Dark/Auto theme modes
- RTL language support
- Customizable color schemes
- Responsive breakpoints

### Available Themes
- **Light** (default)
- **Dark** 
- **Auto** (system preference)

## Development Guidelines

### Component Development
1. Use functional components with hooks
2. Follow existing naming conventions
3. Implement proper prop validation
4. Use React Bootstrap components when possible
5. Follow accessibility best practices

### State Management
1. **Follow the State Management Guide** (`docs/STATE_MANAGEMENT_GUIDE.md`)
2. Use Context for dependency injection, not complex state management
3. Start with local state (`useState`) and lift up only when necessary
4. Keep state scoped to feature boundaries
5. Use reducers for complex state logic within features
6. Consider Zustand only for performance-critical scenarios
7. Implement proper error boundaries

### Styling
1. Use SCSS modules when possible
2. Follow Bootstrap utility classes
3. Maintain responsive design
4. Support both RTL and LTR layouts

### File Organization
1. **Perfect separation**: Components, features, pages, demos, and docs in distinct directories
2. **Barrel exports**: Use index.js files for clean component imports
3. **Clear boundaries**: Reusable components vs complete applications vs documentation
4. **Focused responsibility**: Each directory has a single, well-defined purpose
5. **Scalable structure**: Easy to find, modify, and extend components and features

## Available Features

### Dashboard Types
1. **Default** - General business metrics
2. **Analytics** - Web analytics and traffic
3. **CRM** - Sales pipeline and customer data
4. **E-commerce** - Product and sales analytics
5. **Project Management** - Team collaboration
6. **SaaS** - Subscription and user metrics
7. **Support Desk** - Ticket management

### Application Modules
Located in `src/features/` - Complete, self-contained applications:
- **Chat** (`features/chat/`) - Real-time messaging system with threads and contacts
- **Email** (`features/email/`) - Full email client with inbox, compose, and detail views
- **Calendar** (`features/calendar/`) - Event scheduling with modals and calendar integration
- **Kanban** (`features/kanban/`) - Project management boards with drag & drop functionality
- **Events** (`features/events/`) - Event management system (create, list, detail views)
- **Social** (`features/social/`) - Social media features (feeds, followers, activity logs)
- **Support Desk** (`features/support-desk/`) - Complete help desk system with tickets and contacts

### Dashboard Demos
Located in `src/demos/dashboards/` - Complete dashboard examples:
- **Default Dashboard** - General business metrics and KPIs
- **Analytics Dashboard** - Web analytics with traffic and user data
- **CRM Dashboard** - Sales pipeline and customer relationship management
- **Project Management Dashboard** - Team collaboration and project tracking
- **SaaS Dashboard** - Subscription metrics and user analytics
- **Support Desk Dashboard** - Help desk metrics and ticket management

### Authentication & Authorization
- **EVE Online SSO** - EVE Online character authentication with secure backend integration

## Customization

### Adding New Components
1. **Determine the right location**:
   - `src/components/common/` - For reusable UI components
   - `src/components/dashboards/` - For dashboard-specific widgets
   - `src/features/[feature]/` - For feature-specific components
   - `src/pages/` - For page-level components
2. **Follow existing patterns and conventions**
3. **Add to barrel exports** (`index.js`) for reusable components
4. **Update relevant provider** if component needs state management
5. **Add documentation** if creating reusable components

### Theme Customization
1. Modify `_user-variables.scss` for color changes
2. Add custom SCSS files in `theme/` directory
3. Update configuration in `config.js`
4. Test across all theme modes

### Layout Modifications
1. Extend existing layouts in `src/layouts/`
2. Update routing in `src/routes/`
3. Ensure responsive behavior
4. Test navigation patterns

## Performance Considerations

### Optimization Features
- Vite for fast development and builds
- Code splitting with React Router
- Lazy loading for heavy components
- Optimized bundle size
- Tree shaking for unused code

### Best Practices
1. Use React.memo for expensive components
2. Implement proper dependency arrays in hooks
3. Lazy load routes and heavy components
4. Optimize images and assets
5. Use production builds for deployment

## Testing & Quality

### Available Tools
- ESLint for code quality
- Prettier for code formatting
- Jest and React Testing Library ready

### Development Workflow
1. Use development server for hot reloading
2. Follow ESLint rules and Prettier formatting
3. Test across different browsers and devices
4. Validate accessibility compliance
5. Check responsive design on various screen sizes

## Deployment

### Build Process
```bash
npm run build        # Creates optimized production build
npm run preview      # Test production build locally
npm run predeploy    # Prepare for deployment
```

### Deployment Options
- Static hosting (Netlify, Vercel, GitHub Pages)
- CDN deployment
- Docker containerization
- Traditional web servers

The build process creates optimized, minified assets ready for production deployment.

## EVE Online SSO Integration

### Overview
Complete EVE Online Single Sign-On (SSO) integration following official EVE Online SSO documentation. Provides secure OAuth 2.0 authentication flow for EVE Online character login.

### Features
- ✅ Official EVE Online SSO v2 endpoints
- ✅ CSRF protection with state parameter validation
- ✅ Environment variable configuration
- ✅ Comprehensive error handling
- ✅ JWT token parsing and verification
- ✅ Multiple authentication layouts (Simple, Card, Split)
- ✅ Character information extraction
- ✅ Session storage for authentication data

### Configuration

⚠️ **IMPORTANT**: See `SECURITY_SETUP.md` for complete environment configuration including API keys.

#### Environment Variables
Copy `.env.example` to `.env` and configure with your actual values:
```env
# Example configuration - replace with your actual values
VITE_EVE_BACKEND_URL=https://your-backend-domain.com
VITE_REACT_APP_TINYMCE_APIKEY=your_tinymce_api_key
VITE_REACT_APP_GOOGLE_API_KEY=your_google_api_key
```

The backend handles all EVE Online SSO configuration including:
- Client ID and secret management
- Scopes configuration
- State parameter generation and validation
- Token exchange and verification

### Available Routes
- `/authentication/simple/eve-login` - Simple layout EVE login
- `/authentication/card/eve-login` - Card layout EVE login
- `/authentication/split/eve-login` - Split layout EVE login

**Note**: No callback route needed - backend handles the OAuth callback directly.

### Components

#### Core Components
- **EveOnlineLoginForm** - Main login component (`src/components/authentication/EveOnlineLoginForm.jsx`)
- **EveSsoErrorHandler** - Comprehensive error handling (`src/components/authentication/EveSsoErrorHandler.jsx`)

#### Utility Functions
- **eveSsoUtils** - Simplified utility library (`src/utils/eveSsoUtils.js`)
  - `initiateEveLogin()` - Calls backend and redirects to EVE SSO

### Authentication Flow
1. User clicks "Login with EVE Online" button
2. React app calls `GET /auth/eve/login` on backend
3. Backend generates state parameter and EVE Online auth URL
4. React app redirects user to the auth URL
5. User selects character and authorizes scopes on EVE Online
6. EVE Online redirects directly to backend callback
7. Backend validates state, exchanges code for tokens, and verifies character
8. Backend handles session management and redirects user to frontend dashboard

### Authentication Status Check
The app uses `GET /auth/auth-status` endpoint to verify authentication status. This endpoint returns:
- `authenticated`: boolean indicating if user has valid session
- `user_id`, `character_id`, `character_name`: User information when authenticated
- Cookie-based authentication with `credentials: 'include'` in fetch requests

**Error Handling**: Server errors (502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout) are treated as connectivity/server problems, not authentication failures. These errors show appropriate user messages without clearing authentication state.

### Scheduler Status Check
The app uses `GET /scheduler/scheduler-status` endpoint to get scheduler engine status. This endpoint returns:
- `status`: "running" when scheduler is active
- `engine`: boolean indicating if scheduler engine is enabled
- `version`: scheduler version information
- **Note**: Different from `/scheduler/status` which returns module health status

### Task Analytics & Performance Monitoring
The application includes comprehensive task execution analytics and performance monitoring capabilities:

#### Available Analytics Components
- **TaskPerformanceCard** (`src/components/scheduler/TaskPerformanceCard.jsx`) - Individual task metrics with duration tracking, success rates, and performance trends
- **TaskPerformanceDashboard** (`src/components/scheduler/TaskPerformanceDashboard.jsx`) - System-wide performance overview with real-time metrics
- **TaskAnalyticsAdmin** (`src/pages/admin/TaskAnalyticsAdmin.jsx`) - Dedicated analytics page with comprehensive reporting

#### Analytics Hooks (`src/hooks/useTaskStatistics.js`)
- **useTaskStatistics(taskId)** - Task-specific performance metrics and execution history analysis
- **useGlobalExecutionStatistics()** - System-wide execution statistics and trends
- **useSystemPerformanceTrends(timeRange)** - Historical performance trend analysis
- **calculateTaskStatistics(executions)** - Utility function for comprehensive execution analysis

#### Key Metrics Tracked
- **Duration Analytics**: Average, median, min/max execution times with trend analysis
- **Success Rates**: Task completion rates with failure analysis
- **Performance Trends**: Improving/degrading/stable performance indicators
- **Execution Patterns**: Time-based distribution analysis (hourly/daily patterns)
- **Error Tracking**: Recent error messages and failure trend analysis

#### Analytics Features
- **Real-time Performance Monitoring**: Live updates of task execution metrics
- **Advanced Filtering**: Filter by task type, time range, and execution status
- **CSV Export**: Export analytics data for external analysis
- **Trend Analysis**: Historical performance comparison and trajectory analysis
- **Visual Indicators**: Performance badges, progress bars, and trend icons

#### Navigation
- **Scheduler Admin**: `/admin/scheduler` - Enhanced with performance metrics and analytics tab
- **Task Analytics**: `/admin/task-analytics` - Dedicated analytics dashboard with system overview, individual task performance, and trend analysis

### User Management & Administration
The application includes comprehensive user account management and administration capabilities:

#### Users Admin Page (`src/pages/admin/UsersAdmin.jsx`)
Complete user management interface with advanced features:

**Core Features:**
- **User List Management**: Paginated display of all EVE Online character accounts
- **Advanced Search**: Multi-field search by character name, corporation, alliance
- **Status Filtering**: Filter by enabled, banned, invalid status with checkbox controls
- **Bulk Operations**: Multi-select users for mass enable/disable/ban/unban operations
- **Individual User Management**: Edit user notes, position, and status individually
- **Character Integration**: Display EVE Online character portraits, corporation logos, and alliance logos using official ESI image service
- **ESI Data Enrichment**: Automatic fetching of missing corporation/alliance data from EVE Online ESI API

**Administrative Functions:**
- **User Statistics**: Real-time dashboard with counts of total, enabled, disabled, banned users
- **Health Monitoring**: Users module status indicator with system health checks
- **CSV Export**: Export filtered user data for external analysis and reporting
- **Notes System**: Internal admin notes for tracking user issues and communications
- **Position Management**: Numerical ranking system for user organization
- **Data Refresh**: Manual refresh of user data from EVE Online ESI

**User Interface:**
- **Character Portraits**: EVE Online character portraits displayed in table rows and modals with fallback icons
- **Corporation Logos**: Official EVE Online corporation logos displayed alongside corporation names
- **Alliance Logos**: Official EVE Online alliance logos displayed alongside alliance names (when available)
- **Row Selection**: Individual and bulk user selection with visual feedback
- **Status Badges**: Color-coded status indicators (Enabled/Disabled/Banned/Invalid)
- **Action Buttons**: Quick access to view details, edit, refresh, and status changes
- **Confirmation Modals**: Safety confirmations for all administrative actions
- **Progress Indicators**: Loading states and progress feedback for all operations

**Visual Integration System:**
- **Character Portraits**: Uses `https://images.evetech.net/characters/{character_id}/portrait` for official character portraits
  - Multiple sizes: 64px for table rows, 256px source for modal display (displayed at 128px)
  - Circular design with proper borders and responsive sizing
  - Fallback to user icons when portraits fail to load
- **Corporation Logos**: Uses `https://images.evetech.net/corporations/{corporation_id}/logo` for official corporation logos
  - Table rows: 24px size alongside corporation names
  - Modal portrait section: 20px size under character name
  - Modal detail tables: 20px in corporation name rows, 16px in corporation ID rows
  - Fallback to building icons when logos unavailable
- **Alliance Logos**: Uses `https://images.evetech.net/alliances/{alliance_id}/logo` for official alliance logos
  - Table rows: 24px size alongside alliance names (when available)
  - Modal portrait section: 18px size under corporation info
  - Modal detail tables: 20px in alliance name rows, 16px in alliance ID rows
  - Fallback to globe icons when logos unavailable
- **Component Architecture**: Reusable `CharacterPortrait`, `CorporationLogo`, and `AllianceLogo` components with comprehensive error state management and multiple size support

#### Navigation
- **Users Admin**: `/admin/users` - Complete user account management and administration
- **Navigation Hierarchy**: Administration section positioned prominently as second menu group (after Dashboard) for easy access to all administrative functions

### Character Data Structure
The backend manages all character data and session information. The React app doesn't directly handle tokens or character data - this is all managed server-side for security.

### Error Handling
Comprehensive error handling for:
- Authorization denied by user
- Invalid client configuration
- Expired authorization codes
- CSRF/state validation failures
- EVE Online server errors
- Network connectivity issues

### Security Features
- **Backend-Only Token Handling** - Tokens never exposed to frontend
- **CSRF Protection** - State parameter validation handled by backend
- **Secure Session Management** - Server-side session handling
- **Error Logging** - Detailed development logging

### Usage Examples

#### Basic Login Implementation
```jsx
import EveOnlineLoginForm from 'components/authentication/EveOnlineLoginForm';

const LoginPage = () => (
  <EveOnlineLoginForm 
    onError={(error) => {
      console.error('Login failed:', error);
    }}
  />
);
```

**Note**: No callback handler needed - the backend manages the entire OAuth flow and redirects the user back to the frontend after successful authentication.

### Setup Requirements
1. Backend must be configured with EVE Online application credentials
2. Update `.env` with backend URL if different from default
3. Restart development server

**Note**: All EVE Online SSO configuration is handled by the backend, including client ID, scopes, and callback URL setup.

### Documentation
Complete setup guide available in `EVE_SSO_SETUP.md`

