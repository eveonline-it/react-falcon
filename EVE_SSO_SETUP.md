# EVE Online SSO Integration Setup

This document explains how to set up and use the simplified EVE Online SSO integration in your React Falcon application.

## Overview

The EVE Online SSO integration is designed with security in mind - the React frontend only initiates login and the Go backend handles the complete OAuth 2.0 flow.

## Features

- ✅ Secure backend-only token handling
- ✅ CSRF protection with backend state validation
- ✅ Simple frontend integration
- ✅ Comprehensive error handling
- ✅ Multiple layout support (Simple, Card, Split)
- ✅ No sensitive data exposed to frontend

## Setup Instructions

### 1. EVE Online Developer Application

1. Go to [EVE Online Developer Portal](https://developers.eveonline.com/)
2. Create a new application
3. Set the callback URL to: `http://localhost:3000/authentication/eve-callback`
4. Note your **Client ID** (keep the secret secure for server-side use)

### 2. Backend Configuration

Configure your Go backend with the EVE Online application credentials. The backend handles all EVE SSO configuration.

### 3. Frontend Environment Configuration

Update your React app's `.env` file:

```env
# EVE Online SSO Configuration
# Backend handles all EVE SSO configuration and OAuth flow
VITE_EVE_BACKEND_URL=https://go.eveonline.it
```

**Note**: All EVE Online configuration (Client ID, scopes, redirect URI) is managed by the backend for security.

## Usage

### Available Login Pages

The integration provides three layout variants:

1. **Simple Layout**: `/authentication/simple/eve-login`
2. **Card Layout**: `/authentication/card/eve-login`
3. **Split Layout**: `/authentication/split/eve-login`

### Authentication Flow

1. User clicks "Login with EVE Online" button
2. React app calls `GET /auth/eve/login` on backend
3. Backend generates secure state parameter and returns EVE Online auth URL
4. React app redirects user to the EVE Online SSO URL
5. User selects character and authorizes scopes
6. EVE Online redirects directly to backend callback (`/auth/eve/callback`)
7. Backend validates state, exchanges code for tokens, and verifies character
8. Backend manages session and redirects user back to frontend dashboard

### Using the Components

#### Basic Login Form

```jsx
import EveOnlineLoginForm from 'components/authentication/EveOnlineLoginForm';

const MyLoginPage = () => (
  <EveOnlineLoginForm 
    onError={(error) => {
      console.error('Login failed:', error);
    }}
  />
);
```

**Note**: No callback handler needed - the backend manages the complete OAuth flow and redirects the user back to the frontend after successful authentication.

## Authentication Data Management

The backend manages all authentication data including:
- Character information
- Access and refresh tokens
- Session management
- Token refresh logic

The React frontend doesn't directly handle any sensitive authentication data - this is all managed server-side for security.

## Error Handling

The integration provides comprehensive error handling for:

- Authorization denied by user
- Invalid client configuration
- Expired authorization codes
- CSRF/state validation failures
- EVE Online server errors
- Network connectivity issues

Errors are displayed with user-friendly messages and appropriate retry options.

## Security Features

- **CSRF Protection**: State parameter validation prevents cross-site request forgery
- **Token Verification**: All tokens are verified against EVE Online ESI
- **Secure Storage**: Authentication data is stored in session storage
- **Error Logging**: Detailed error logging in development mode

## Troubleshooting

### Common Issues

1. **"Client ID not configured"**
   - Check your `.env` file has the correct `VITE_EVE_CLIENT_ID`
   - Restart your development server after updating `.env`

2. **"Invalid redirect URI"**
   - Ensure your EVE Online app callback URL matches `VITE_EVE_REDIRECT_URI`
   - Check for typos in the URL

3. **"Invalid state parameter"**
   - This usually indicates a CSRF attack or browser issues
   - Try clearing browser storage and attempting login again

4. **"Token verification failed"**
   - EVE Online servers may be experiencing issues
   - Try again in a few minutes

### Development Tips

- Use browser developer tools to inspect network requests
- Check the console for detailed error messages in development mode
- Verify your EVE Online application settings in the developer portal

## Production Deployment

When deploying to production:

1. Update `VITE_EVE_REDIRECT_URI` to your production callback URL
2. Update your EVE Online application callback URL in the developer portal
3. Ensure all environment variables are properly set
4. Consider implementing server-side token refresh logic

## Support

For issues specific to this implementation, check the component files:
- `src/components/authentication/EveOnlineLoginForm.jsx`
- `src/components/authentication/EveCallbackHandler.jsx` 
- `src/utils/eveSsoUtils.js`

For EVE Online SSO issues, refer to:
- [EVE Online SSO Documentation](https://developers.eveonline.com/docs/services/sso/)
- [EVE Online ESI Documentation](https://esi.evetech.net/ui/)