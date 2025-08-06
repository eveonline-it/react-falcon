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
├── components/           # Component library
│   ├── common/          # Reusable UI components
│   ├── dashboards/      # Dashboard-specific components
│   ├── app/            # Feature-specific components
│   ├── authentication/ # Auth components & layouts
│   └── doc-components/ # Documentation examples
├── layouts/            # Layout components (9 different layouts)
├── providers/          # Context providers for state management
├── routes/            # Routing configuration
├── data/              # Static data and mock APIs
├── hooks/             # Custom React hooks
├── helpers/           # Utility functions
├── assets/            # Images, icons, SCSS files
└── reducers/          # State reducers
```

## Component Organization

### Layout System
- **MainLayout** - Primary dashboard layout
- **VerticalNavLayout** - Sidebar navigation (default)
- **TopNavLayout** - Top navigation bar
- **ComboNavLayout** - Combined top + sidebar
- **Auth Layouts** - Simple, Card, Split, Wizard variations

### Dashboard Components
Located in `src/components/dashboards/`:
- `default/` - General business dashboard
- `analytics/` - Web analytics dashboard  
- `crm/` - CRM and sales dashboard
- `e-commerce/` - E-commerce metrics
- `project-management/` - Team collaboration
- `saas/` - SaaS metrics and analytics
- `support-desk/` - Help desk and tickets

### Common Components
Located in `src/components/common/`:
- `AdvanceTable/` - Feature-rich data tables
- `FalconEditor` - TinyMCE wrapper
- `ReactEchart` - ECharts wrapper
- `Calendar` - FullCalendar integration
- `Avatar`, `Badge`, `Button` components

## State Management

### Context Providers (src/providers/)
- **AppProvider** - Global app configuration (theme, navbar, RTL)
- **ProductProvider** - E-commerce product state
- **KanbanProvider** - Kanban board state
- **ChatProvider** - Chat application state
- **EmailProvider** - Email client state

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
1. Use Context API for feature-specific state
2. Keep global state minimal
3. Use reducers for complex state logic
4. Implement proper error boundaries

### Styling
1. Use SCSS modules when possible
2. Follow Bootstrap utility classes
3. Maintain responsive design
4. Support both RTL and LTR layouts

### File Organization
1. Group related components in folders
2. Use index.js for clean imports
3. Separate data and logic from presentation
4. Keep components focused and reusable

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
- **Chat** - Real-time messaging system
- **Email** - Full email client
- **Calendar** - Event scheduling
- **Kanban** - Project management boards
- **E-commerce** - Product catalog and orders
- **Social** - Activity feeds and profiles
- **Support Desk** - Help desk system
- **EVE Online SSO** - EVE Online character authentication

## Customization

### Adding New Components
1. Create component in appropriate directory
2. Follow existing patterns and conventions
3. Add to documentation if reusable
4. Update relevant provider if stateful

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

#### Environment Variables (.env)
```env
# EVE Online SSO Configuration
# Backend handles all EVE SSO configuration and OAuth flow
VITE_EVE_BACKEND_URL=https://go.eveonline.it
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