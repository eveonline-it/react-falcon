# React Falcon Dashboard

A comprehensive, feature-rich admin dashboard template built with React 19 and Bootstrap 5. React Falcon provides multiple specialized dashboards and a complete component library for building modern web applications.

## ✨ Features

### 🎛️ Multiple Dashboard Types
- **Default Dashboard** - General business metrics and analytics
- **Analytics Dashboard** - Web traffic and user behavior insights  
- **CRM Dashboard** - Sales pipeline and customer relationship management
- **E-commerce Dashboard** - Product catalog and sales analytics
- **LMS Dashboard** - Learning management and course tracking
- **Project Management** - Team collaboration and task management
- **SaaS Dashboard** - Subscription metrics and user analytics
- **Support Desk** - Help desk and ticket management system

### 🚀 Complete Application Suite
- **📅 Calendar** - Event scheduling with FullCalendar integration
- **💬 Chat** - Real-time messaging system with thread management
- **📧 Email** - Full-featured email client with inbox and compose
- **📋 Kanban** - Drag-and-drop project management boards
- **🛒 E-commerce** - Complete online store with products, orders, and checkout
- **🎓 E-learning** - Course management with student progress tracking
- **📱 Social Media** - Activity feeds, profiles, and social interactions
- **🎫 Support System** - Comprehensive help desk and customer support

### 🎨 Modern UI Components
- **100+ Components** - Comprehensive Bootstrap 5 component library
- **Interactive Charts** - ECharts, Chart.js, and D3.js integrations
- **Advanced Tables** - Sortable, searchable, and paginated data tables
- **Forms & Validation** - React Hook Form with Yup validation
- **Rich Text Editor** - TinyMCE integration for content editing
- **Date & Time** - Advanced date pickers and calendar components

### 🌟 Theme & Layout Options
- **Light/Dark/Auto Themes** - Complete theming system with auto-detection
- **RTL Support** - Right-to-left language compatibility
- **9 Layout Variations** - Vertical nav, top nav, combo nav, and more
- **Responsive Design** - Mobile-first approach with Bootstrap 5
- **Customizable** - Extensive SCSS variables and configuration options

## 🛠️ Technology Stack

### Core Technologies
- **React 19.1.0** - Latest React with functional components and hooks
- **Vite 7.0.5** - Lightning-fast build tool and development server
- **React Bootstrap 2.10.10** - Bootstrap components for React
- **Bootstrap 5.3.7** - Modern CSS framework
- **React Router 7.7.0** - Declarative routing for React

### Key Libraries
- **Charts**: ECharts, Chart.js, D3.js for data visualization
- **Forms**: React Hook Form + Yup for form handling and validation
- **Maps**: Google Maps API and Leaflet for mapping
- **Rich Text**: TinyMCE for content editing
- **Drag & Drop**: DND Kit for interactive interfaces
- **Animations**: Lottie React for micro-interactions
- **Icons**: FontAwesome and React Icons

## 🚀 Quick Start

### Prerequisites
- Node.js (latest LTS version)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/react-falcon.git
cd react-falcon

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:3000`

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📁 Project Structure

```
react-falcon/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/       # Shared components
│   │   ├── dashboards/   # Dashboard components
│   │   ├── app/         # Feature-specific components
│   │   └── authentication/ # Auth components
│   ├── layouts/          # Layout components
│   ├── providers/        # Context providers
│   ├── routes/          # Routing configuration
│   ├── data/            # Mock data and APIs
│   ├── hooks/           # Custom React hooks
│   ├── assets/          # SCSS, images, and static files
│   └── App.jsx          # Main application component
├── package.json
└── vite.config.js       # Vite configuration
```

## 🎨 Customization

### Theme Configuration
Customize the application in `src/config.js`:

```javascript
export const settings = {
  isFluid: false,              // Full-width layout
  isRTL: false,               // Right-to-left support
  isDark: false,              // Dark mode
  theme: 'light',             // Theme variant
  navbarPosition: 'vertical', // Navigation layout
  navbarStyle: 'transparent'  // Navbar styling
};
```

### SCSS Customization
Override default styles in `src/assets/scss/_user-variables.scss`:

```scss
// Custom color variables
$primary: #your-color;
$secondary: #your-secondary-color;

// Custom component overrides
$card-border-radius: 12px;
$navbar-padding-y: 1rem;
```

## 📱 Responsive Design

React Falcon is built with a mobile-first approach:
- **Mobile** (< 576px) - Optimized mobile experience
- **Tablet** (≥ 576px) - Touch-friendly tablet interface  
- **Desktop** (≥ 768px) - Full desktop functionality
- **Large Desktop** (≥ 1200px) - Enhanced large screen experience

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari (latest)
- Chrome Android (latest)

## 📚 Documentation

For detailed documentation, visit the `/documentation` section in the application, which includes:
- Component showcase with live examples
- Configuration guides
- Migration instructions
- Styling guidelines
- API references

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@reactfalcon.com
- 💬 Discord: [Join our community](https://discord.gg/reactfalcon)
- 📖 Documentation: Built-in documentation at `/documentation`
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/react-falcon/issues)

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The JavaScript library for building user interfaces
- [Bootstrap](https://getbootstrap.com/) - The world's most popular CSS framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [FontAwesome](https://fontawesome.com/) - The web's most popular icon set

---

**React Falcon** - Building the future of admin dashboards, one component at a time. 🚀