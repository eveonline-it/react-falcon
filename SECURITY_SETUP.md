# Security Setup Guide

## 🔒 Environment Configuration

### Important Security Notes

⚠️ **NEVER commit sensitive information to public repositories!**

The following files are automatically ignored by `.gitignore`:
- `.env` - Contains sensitive API keys and secrets
- `*.key`, `*.pem`, `*.p12` - Certificate and key files
- `config/secrets.json` - Configuration secrets

### Environment Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your actual values:**
   ```env
   # TinyMCE API Key - Get from https://www.tiny.cloud/get-tiny/
   VITE_REACT_APP_TINYMCE_APIKEY=your_actual_tinymce_key

   # Google Maps API Key - Get from https://developers.google.com/maps
   VITE_REACT_APP_GOOGLE_API_KEY=your_actual_google_key

   # EVE Online Backend URL
   VITE_EVE_BACKEND_URL=https://your-backend-domain.com
   ```

### Required API Keys

#### TinyMCE API Key
- **Purpose**: Rich text editor functionality
- **Get it**: https://www.tiny.cloud/get-tiny/
- **Free tier**: Available for personal and small commercial projects

#### Google Maps API Key  
- **Purpose**: Map components and location services
- **Get it**: https://developers.google.com/maps/documentation/javascript/get-api-key
- **Required APIs**: Maps JavaScript API, Places API (if using places)

### EVE Online SSO Setup

The application uses EVE Online Single Sign-On for authentication:

1. **Backend Configuration**: All EVE SSO credentials are managed server-side
2. **Frontend Configuration**: Only needs the backend URL
3. **Security**: No EVE SSO secrets are stored in the frontend

For complete EVE SSO setup, see `EVE_SSO_SETUP.md`

### Development vs Production

#### Development
- Use `.env` file for local development
- API keys can be development/test keys
- Backend URL should point to your development server

#### Production  
- Set environment variables directly on your hosting platform
- Use production API keys with appropriate domains/referrers
- Ensure backend URL uses HTTPS

### Security Best Practices

1. **Never commit `.env` files**
2. **Use different API keys for development and production**
3. **Set up domain restrictions on your API keys**
4. **Regularly rotate API keys**
5. **Monitor API usage for unexpected spikes**

### Troubleshooting

#### TinyMCE Not Loading
- Check that `VITE_REACT_APP_TINYMCE_APIKEY` is set correctly
- Verify the API key is valid and not expired
- Check browser console for specific error messages

#### Google Maps Not Working
- Ensure `VITE_REACT_APP_GOOGLE_API_KEY` is configured
- Verify the Maps JavaScript API is enabled
- Check that your domain is authorized for the API key

#### EVE SSO Issues
- Verify `VITE_EVE_BACKEND_URL` points to your backend
- Check that the backend is running and accessible
- Review backend logs for EVE SSO configuration issues