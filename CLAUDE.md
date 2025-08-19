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

#### User Management (src/hooks/useUserProfile.js)
```jsx
import { useUserProfile, useUpdateUserProfile } from 'hooks/useUserProfile';

// Fetch user profile
const { data, isLoading, error } = useUserProfile(userId);

// Update user profile with optimistic updates
const updateMutation = useUpdateUserProfile({
  onSuccess: (data) => console.log('Updated!', data)
});
```

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

