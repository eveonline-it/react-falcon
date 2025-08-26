import React from 'react';
import paths, { rootPaths } from './paths';
import { sitemapService } from '../services/sitemapService';

export interface Badge {
  type: string;
  text: string;
}

export interface NavItem {
  name: string;
  to?: string;
  icon?: string | string[];
  active?: boolean;
  exact?: boolean;
  newtab?: boolean;
  badge?: Badge;
  label?: string;
  children?: NavItem[];
}

export interface RouteGroup {
  label: string;
  labelDisable?: boolean;
  children: NavItem[];
}

export const dashboardRoutes: RouteGroup = {
  label: 'Dashboard',
  labelDisable: true,
  children: [
    {
      name: 'Dashboard',
      active: true,
      icon: 'chart-pie',
      children: [
        {
          name: 'Default',
          to: rootPaths.root,
          exact: true,
          active: true
        },
        {
          name: 'Analytics',
          to: paths.analytics,
          active: true
        },
        {
          name: 'CRM',
          to: paths.crm,
          active: true
        },
        {
          name: 'Management',
          to: paths.projectManagement,
          active: true
        },
        {
          name: 'SaaS',
          to: paths.saas,
          active: true
        },
        {
          name: 'Support desk',
          to: paths.supportDesk,
          active: true
        }
      ]
    }
  ]
};
export const appRoutes: RouteGroup = {
  label: 'app',
  children: [
    {
      name: 'Calendar',
      icon: 'calendar-alt',
      to: paths.calendar,
      active: true
    },
    {
      name: 'Chat',
      icon: 'comments',
      to: paths.chat,
      active: true
    },
    {
      name: 'Email',
      icon: 'envelope-open',
      active: true,
      children: [
        {
          name: 'Inbox',
          to: paths.emailInbox,
          active: true
        },
        {
          name: 'Email detail',
          to: paths.emailDetail,
          active: true
        },
        {
          name: 'Compose',
          to: paths.emailCompose,
          active: true
        }
      ]
    },
    {
      name: 'Events',
      icon: 'calendar-day',
      active: true,
      children: [
        {
          name: 'Create an event',
          to: paths.createEvent,
          active: true
        },
        {
          name: 'Event detail',
          to: paths.eventDetail,
          active: true
        },
        {
          name: 'Event list',
          to: paths.eventList,
          active: true
        }
      ]
    },
    {
      name: 'Kanban',
      icon: ['fab', 'trello'],
      to: paths.kanban,
      active: true
    },
    {
      name: 'Social',
      icon: 'share-alt',
      active: true,
      children: [
        {
          name: 'Feed',
          to: paths.feed,
          active: true
        },
        {
          name: 'Activity log',
          to: paths.activityLog,
          active: true
        },
        {
          name: 'Notifications',
          to: paths.notifications,
          active: true
        },
        {
          name: 'Followers',
          to: paths.followers,
          active: true
        }
      ]
    },
    {
      name: 'Support desk',
      icon: 'ticket-alt',
      active: true,
      children: [
        {
          name: 'Table view',
          to: paths.ticketsTable,
          active: true
        },
        {
          name: 'Card view',
          to: paths.ticketsCard,
          active: true
        },
        {
          name: 'Contacts',
          to: paths.contacts,
          active: true
        },
        {
          name: 'Contact details',
          to: paths.contactDetails,
          active: true
        },
        {
          name: 'Tickets preview',
          to: paths.ticketsPreview,
          active: true
        },
        {
          name: 'Quick links',
          to: paths.quickLinks,
          active: true
        },
        {
          name: 'Reports',
          to: paths.reports,
          active: true
        }
      ]
    }
  ]
};

export const pagesRoutes: RouteGroup = {
  label: 'pages',
  children: [
    {
      name: 'Test Sitemap',
      icon: 'vial',
      to: paths.testSitemap,
      active: true
    },
    {
      name: 'Landing',
      icon: 'globe',
      to: paths.landing,
      active: true
    },
    {
      name: 'Authentication',
      icon: 'lock',
      active: true,
      children: [
        {
          name: 'EVE Online Login',
          to: paths.login,
          active: true
        }
      ]
    },
    {
      name: 'User',
      icon: 'user',
      active: true,
      children: [
        {
          name: 'Profile',
          to: paths.userProfile,
          active: true
        },
        {
          name: 'Characters',
          to: paths.userCharacters,
          active: true
        },
        {
          name: 'Settings',
          to: paths.userSettings,
          active: true
        }
      ]
    },
    {
      name: 'Pricing',
      icon: 'tags',
      active: true,
      children: [
        {
          name: 'Pricing default',
          to: paths.pricingDefault,
          active: true
        },
        {
          name: 'Pricing alt',
          to: paths.pricingAlt,
          active: true
        }
      ]
    },
    {
      name: 'Faq',
      icon: 'question-circle',
      active: true,
      children: [
        {
          name: 'Faq basic',
          to: paths.faqBasic,
          active: true
        },
        {
          name: 'Faq alt',
          to: paths.faqAlt,
          active: true
        },
        {
          name: 'Faq accordion',
          to: paths.faqAccordion,
          active: true
        }
      ]
    },
    {
      name: 'Errors',
      active: true,
      icon: 'exclamation-triangle',
      children: [
        {
          name: '404',
          to: paths.error404,
          active: true
        },
        {
          name: '500',
          to: paths.error500,
          active: true
        }
      ]
    },
    {
      name: 'Miscellaneous',
      icon: 'thumbtack',
      active: true,
      children: [
        {
          name: 'Associations',
          to: paths.associations,
          active: true
        },
        {
          name: 'Invite people',
          to: paths.invitePeople,
          active: true
        },
        {
          name: 'Privacy policy',
          to: paths.privacyPolicy,
          active: true
        }
      ]
    },
    {
      name: 'Layouts',
      icon: 'columns',
      active: true,
      badge: {
        type: 'success',
        text: 'New'
      },
      children: [
        {
          name: 'Navbar vertical',
          to: paths.verticalNavLayout,
          active: true,
          newtab: true
        },
        {
          name: 'Top nav',
          to: paths.topNavLayout,
          active: true,
          newtab: true
        },
        {
          name: 'Double top',
          to: paths.doubleTopNavLayout,
          active: true,
          newtab: true
        },
        {
          name: 'Combo nav',
          to: paths.comboNavLayout,
          active: true,
          newtab: true
        }
      ]
    }
  ]
};

export const modulesRoutes: RouteGroup = {
  label: 'Modules',
  children: [
    {
      name: 'Forms',
      active: true,
      icon: 'file-alt',
      children: [
        {
          name: 'Basic',
          active: true,
          children: [
            {
              name: 'Form control',
              to: paths.formControl,
              active: true
            },
            {
              name: 'Input group',
              to: paths.inputGroup,
              active: true
            },
            {
              name: 'Select',
              to: paths.select,
              active: true
            },
            {
              name: 'Checks',
              to: paths.checks,
              active: true
            },
            {
              name: 'Range',
              to: paths.range,
              active: true
            },
            {
              name: 'Layout',
              to: paths.formLayout,
              active: true
            }
          ]
        },
        {
          name: 'Advance',
          active: true,
          children: [
            {
              name: 'Advance select',
              to: paths.advanceSelect,
              active: true
            },
            {
              name: 'Date picker',
              to: paths.datePicker,
              active: true
            },
            {
              name: 'Editor',
              to: paths.editor,
              active: true
            },
            {
              name: 'Emoji button',
              to: paths.emojiButton,
              active: true
            },
            {
              name: 'File uploader',
              to: paths.fileUploader,
              active: true
            },
            {
              name: 'Input mask',
              to: paths.inputMask,
              active: true
            },
            {
              name: 'Range slider',
              to: paths.rangeSlider,
              active: true
            },
            {
              name: 'Rating',
              to: paths.rating,
              active: true
            }
          ]
        },
        {
          name: 'Floating labels',
          to: paths.floatingLabels,
          active: true
        },
        {
          name: 'Wizard',
          to: paths.wizard,
          active: true
        },
        {
          name: 'Validation',
          to: paths.validation,
          active: true
        }
      ]
    },
    {
      name: 'Tables',
      icon: 'table',
      active: true,
      children: [
        {
          name: 'Basic tables',
          to: paths.basicTables,
          active: true
        },
        {
          name: 'Advance tables',
          to: paths.advanceTables,
          active: true
        }
      ]
    },
    {
      name: 'Charts',
      icon: 'chart-line',
      active: true,
      children: [
        {
          name: 'Chartjs',
          to: paths.chartjs,
          active: true
        },
        {
          name: 'D3js',
          to: paths.d3js,
          active: true,
          badge: {
            type: 'success',
            text: 'New'
          }
        },
        {
          name: 'ECharts',
          active: true,
          children: [
            {
              name: 'How to use',
              to: paths.echartsHowToUse,
              active: true
            },
            {
              name: 'Line charts',
              to: paths.lineCharts,
              active: true
            },
            {
              name: 'Bar charts',
              to: paths.barCharts,
              active: true
            },
            {
              name: 'Candlestick charts',
              to: paths.candlestickCharts,
              active: true
            },
            {
              name: 'Geo map',
              to: paths.geoMap,
              active: true
            },
            {
              name: 'Scatter charts',
              to: paths.scatterCharts,
              active: true
            },
            {
              name: 'Pie charts',
              to: paths.pieCharts,
              active: true
            },
            {
              name: 'Radar charts',
              to: paths.radarCharts,
              active: true
            },
            {
              name: 'Heatmap charts',
              to: paths.heatmapCharts,
              active: true
            }
          ]
        }
      ]
    },
    {
      name: 'Icons',
      active: true,
      icon: 'shapes',
      children: [
        {
          name: 'Font awesome',
          to: paths.fontAwesome,
          active: true
        },
        {
          name: 'React icons',
          to: paths.reactIcons,
          active: true
        }
      ]
    },
    {
      name: 'Maps',
      icon: 'map',
      active: true,
      children: [
        {
          name: 'Google map',
          to: paths.googleMap,
          active: true
        },
        {
          name: 'Leaflet map',
          to: paths.leafletMap,
          active: true
        }
      ]
    },
    {
      name: 'Components',
      active: true,
      icon: 'puzzle-piece',
      children: [
        {
          name: 'Alerts',
          to: paths.alerts,
          active: true
        },
        {
          name: 'Accordion',
          to: paths.accordion,
          active: true
        },
        {
          name: 'Animated icons',
          to: paths.animatedIcons,
          active: true
        },
        {
          name: 'Backgrounds',
          to: paths.background,
          active: true
        },
        {
          name: 'Badges',
          to: paths.badges,
          active: true
        },
        {
          name: 'Breadcrumbs',
          to: paths.breadcrumbs,
          active: true
        },
        {
          name: 'Buttons',
          to: paths.buttons,
          active: true
        },
        {
          name: 'Calendar',
          to: paths.calendar,
          active: true
        },
        {
          name: 'Cards',
          to: paths.cards,
          active: true
        },
        {
          name: 'Carousel',
          active: true,
          children: [
            {
              name: 'Bootstrap',
              to: paths.bootstrapCarousel,
              label: 'bootstrap-carousel',
              active: true
            },
            {
              name: 'Slick',
              to: paths.slickCarousel,
              active: true
            }
          ]
        },
        {
          name: 'Collapse',
          to: paths.collapse,
          active: true
        },
        {
          name: 'Cookie notice',
          to: paths.cookieNotice,
          active: true
        },
        {
          name: 'Countup',
          to: paths.countup,
          active: true
        },
        {
          name: 'Draggable',
          to: paths.draggable,
          active: true
        },
        {
          name: 'Dropdowns',
          to: paths.dropdowns,
          active: true
        },
        {
          name: 'List group',
          to: paths.listGroup,
          active: true
        },
        {
          name: 'Modals',
          to: paths.modals,
          active: true
        },
        {
          name: 'Offcanvas',
          to: paths.offcanvas,
          active: true
        },
        {
          name: 'Navs & Tabs',
          active: true,
          children: [
            {
              name: 'Navs',
              to: paths.navs,
              active: true
            },
            {
              name: 'Navbar',
              to: paths.navbar,
              active: true
            },
            {
              name: 'Vertical navbar',
              to: paths.verticalNavbar,
              active: true
            },
            {
              name: 'Top navbar',
              to: paths.topNavbar,
              active: true
            },
            {
              name: 'Double Top',
              to: paths.doubleTopNavbar,
              active: true
            },
            {
              name: 'Combo navbar',
              to: paths.comboNavbar,
              active: true
            },
            {
              name: 'Tabs',
              to: paths.tabs,
              active: true
            }
          ]
        },
        {
          name: 'Pictures',
          active: true,
          children: [
            {
              name: 'Avatar',
              to: paths.avatar,
              active: true
            },
            {
              name: 'Images',
              to: paths.images,
              active: true
            },
            {
              name: 'Figures',
              to: paths.figures,
              active: true
            },
            {
              name: 'Hoverbox',
              to: paths.hoverbox,
              active: true
            },
            {
              name: 'Lightbox',
              to: paths.lightbox,
              active: true
            }
          ]
        },
        {
          name: 'Progress Bar',
          to: paths.progressBar,
          active: true
        },
        {
          name: 'Pagination',
          to: paths.pagination,
          active: true
        },
        {
          name: 'Placeholder',
          to: paths.placeholder,
          active: true
        },
        {
          name: 'Popovers',
          to: paths.popovers,
          active: true
        },
        {
          name: 'Scrollspy',
          to: paths.scrollspy,
          active: true
        },
        {
          name: 'Search',
          to: paths.search,
          active: true
        },
        {
          name: 'Spinners',
          to: paths.spinners,
          active: true
        },
        {
          name: 'Timeline',
          to: paths.timeline,
          active: true
        },
        {
          name: 'Toasts',
          to: paths.toasts,
          active: true
        },
        {
          name: 'Tooltips',
          to: paths.tooltips,
          active: true
        },
        {
          name: 'Treeview',
          to: paths.treeview,
          active: true
        },
        {
          name: 'Typed text',
          to: paths.typedText,
          active: true
        },
        {
          name: 'Videos',
          active: true,
          children: [
            {
              name: 'Embed',
              to: paths.embedVideo,
              active: true
            },
            {
              name: 'React Player',
              to: paths.reactPlayer,
              active: true
            }
          ]
        }
      ]
    },
    {
      name: 'Utilities',
      active: true,
      icon: 'fire',
      children: [
        {
          name: 'Background',
          to: paths.backgroundColor,
          active: true
        },
        {
          name: 'Borders',
          to: paths.borders,
          active: true
        },
        {
          name: 'Colors',
          to: paths.colors,
          active: true
        },
        {
          name: 'Colored links',
          to: paths.coloredLinks,
          active: true
        },
        {
          name: 'Display',
          to: paths.display,
          active: true
        },
        {
          name: 'Flex',
          to: paths.flex,
          active: true
        },
        {
          name: 'Float',
          to: paths.float,
          active: true
        },
        {
          name: 'Grid',
          to: paths.grid,
          active: true
        },
        {
          name: 'Scroll Bar',
          to: paths.scrollBar,
          active: true
        },
        {
          name: 'Position',
          to: paths.position,
          active: true
        },
        {
          name: 'Spacing',
          to: paths.spacing,
          active: true
        },
        {
          name: 'Sizing',
          to: paths.sizing,
          active: true
        },
        {
          name: 'Stretched link',
          to: paths.stretchedLink,
          active: true
        },
        {
          name: 'Text truncation',
          to: paths.textTruncation,
          active: true
        },
        {
          name: 'Typography',
          to: paths.typography,
          active: true
        },
        {
          name: 'Vertical align',
          to: paths.verticalAlign,
          active: true
        },
        {
          name: 'Visibility',
          to: paths.visibility,
          active: true
        }
      ]
    },
    {
      name: 'Widgets',
      icon: 'poll',
      to: paths.widgets,
      active: true
    },
    {
      name: 'Multi level',
      active: true,
      icon: 'layer-group',
      children: [
        {
          name: 'Level two',
          active: true,
          children: [
            {
              name: 'Item 1',
              active: true,
              to: '#!'
            },
            {
              name: 'Item 2',
              active: true,
              to: '#!'
            }
          ]
        },
        {
          name: 'Level three',
          active: true,
          children: [
            {
              name: 'Item 3',
              active: true,
              to: '#!'
            },
            {
              name: 'Item 4',
              active: true,
              children: [
                {
                  name: 'Item 5',
                  active: true,
                  to: '#!'
                },
                {
                  name: 'Item 6',
                  active: true,
                  to: '#!'
                }
              ]
            }
          ]
        },
        {
          name: 'Level four',
          active: true,
          children: [
            {
              name: 'Item 6',
              active: true,
              to: '#!'
            },
            {
              name: 'Item 7',
              active: true,
              children: [
                {
                  name: 'Item 8',
                  active: true,
                  to: '#!'
                },
                {
                  name: 'Item 9',
                  active: true,
                  children: [
                    {
                      name: 'Item 10',
                      active: true,
                      to: '#!'
                    },
                    {
                      name: 'Item 11',
                      active: true,
                      to: '#!'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const adminRoutes: RouteGroup = {
  label: 'Administration',
  children: [
    {
      name: 'Scheduler',
      icon: 'clock',
      to: paths.schedulerAdmin,
      active: true
    },
    {
      name: 'Task Analytics',
      icon: 'chart-line',
      to: paths.taskAnalyticsAdmin,
      active: true
    },
    {
      name: 'Users',
      icon: 'user',
      to: paths.usersAdmin,
      active: true
    },
    {
      name: 'Groups',
      icon: 'users',
      to: paths.groupsAdmin,
      active: true
    },
    {
      name: 'Permissions',
      icon: 'shield-alt',
      to: paths.permissionsAdmin,
      active: true
    },
    {
      name: 'Sitemap',
      icon: 'map',
      to: paths.sitemapAdmin,
      active: true
    },
    {
      name: 'Settings',
      icon: 'cog',
      active: true,
      children: [
        {
          name: 'Site Settings',
          to: paths.settingsAdmin,
          active: true
        },
        {
          name: 'Corporations',
          to: paths.corporationsAdmin,
          active: true
        },
        {
          name: 'Alliances',
          to: paths.alliancesAdmin,
          active: true
        }
      ]
    }
  ]
};

export const documentationRoutes: RouteGroup = {
  label: 'documentation',
  children: [
    {
      name: 'Getting started',
      icon: 'rocket',
      to: paths.gettingStarted,
      active: true
    },
    {
      name: 'Customization',
      active: true,
      icon: 'wrench',
      children: [
        {
          name: 'Configuration',
          to: paths.configuration,
          active: true
        },
        {
          name: 'Styling',
          to: paths.styling,
          active: true
        },
        {
          name: 'Dark mode',
          to: paths.darkMode,
          active: true
        },
        {
          name: 'Plugin',
          to: paths.plugin,
          active: true
        }
      ]
    },
    {
      name: 'Faq',
      icon: 'question-circle',
      to: paths.faq,
      active: true
    },
    {
      name: 'Design file',
      icon: 'palette',
      to: paths.designFile,
      active: true
    },
    {
      name: 'Changelog',
      icon: 'code-branch',
      to: paths.changelog,
      active: true
    },
    {
      name: 'Migration',
      icon: 'sign-out-alt',
      to: paths.migration,
      active: true,
      badge: {
        type: 'success',
        text: 'New'
      }
    }
  ]
};

// Static fallback route groups
const staticRouteGroups: RouteGroup[] = [
  dashboardRoutes,
  adminRoutes,
  appRoutes,
  pagesRoutes,
  modulesRoutes,
  documentationRoutes
];

// Backend route groups
let backendRouteGroups: RouteGroup[] | null = null;
let isLoadingBackendRoutes = false;

export async function loadDynamicRouteGroups(forceRefresh = false): Promise<RouteGroup[]> {
  if (backendRouteGroups && !forceRefresh) {
    return backendRouteGroups;
  }

  if (isLoadingBackendRoutes) {
    // Wait for ongoing load to complete
    while (isLoadingBackendRoutes) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return backendRouteGroups || [];
  }

  isLoadingBackendRoutes = true;

  try {
    // Clear the cache before fetching fresh data
    if (forceRefresh) {
      backendRouteGroups = null;
      sitemapService.clearCache();
    }
    
    backendRouteGroups = await sitemapService.generateRouteGroups();
    console.info('Successfully loaded backend route groups');
    return backendRouteGroups;
  } catch (error) {
    console.warn('Failed to load backend routes:', error);
    backendRouteGroups = [];
    return [];
  } finally {
    isLoadingBackendRoutes = false;
  }
}

// Get route groups (sync function that returns backend routes or empty if not loaded)
export function getRouteGroups(): RouteGroup[] {
  return backendRouteGroups || [];
}

// Component registry for dynamic route loading
export const routeComponents = {
  // Dashboard components (in demos folder)
  'DefaultDashboard': () => import('../demos/dashboards/DefaultDashboard'),
  'AnalyticsDashboard': () => import('../demos/dashboards/AnalyticsDashboard'),
  'CrmDashboard': () => import('../demos/dashboards/CrmDashboard'),
  'ProjectManagement': () => import('../demos/dashboards/ProjectManagementDashboard'),
  'SaasDashboard': () => import('../demos/dashboards/SaasDashboard'),
  'SupportDesk': () => import('../demos/dashboards/SupportDeskDashboard'),
  
  // App components (in features folder)
  'Calendar': () => import('../features/calendar/Calendar'),
  'Chat': () => import('../features/chat/Chat'),
  'EmailInbox': () => import('../features/email/inbox/Inbox'),
  'EmailDetail': () => import('../features/email/email-detail/EmailDetail'),
  'EmailCompose': () => import('../features/email/compose/Compose'),
  'Kanban': () => import('../features/kanban/Kanban'),
  'SocialProfile': () => import('../pages/user/profile/Profile'),
  'SocialFeed': () => import('../features/social/feed/Feed'),
  
  // User components
  'UserProfile': () => import('../pages/user/profile/Profile'),
  'UserSettings': () => import('../pages/user/settings/Settings'),
  'Characters': () => import('../pages/user/Characters'),
  
  // Admin components
  'UsersAdmin': () => import('../pages/admin/UsersAdmin'),
  'GroupsAdmin': () => import('../pages/admin/GroupsAdmin'),
  'PermissionsAdmin': () => import('../pages/admin/PermissionsAdmin'),
  'CorporationsAdmin': () => import('../pages/admin/CorporationsAdmin'),
  'AllianceAdmin': () => import('../pages/admin/AllianceAdmin'),
  'SchedulerAdmin': () => import('../pages/admin/SchedulerAdmin'),
  'TaskAnalyticsAdmin': () => import('../pages/admin/TaskAnalyticsAdmin'),
  'SettingsAdmin': () => import('../pages/admin/SettingsAdmin'),
  'HierarchicalSitemapAdmin': () => import('../pages/admin/HierarchicalSitemapAdmin'),
  
  // Public pages  
  'Landing': () => import('../pages/landing/Landing')
};

// Get dynamic routes for React Router configuration
export async function getDynamicRoutes() {
  try {
    const backendRoutes = await sitemapService.getDynamicRoutes();
    return backendRoutes.map(route => {
      // Get component loader from registry
      const ComponentLoader = routeComponents[route.component];
      if (!ComponentLoader) {
        console.warn(`Component ${route.component} not found in registry for route ${route.path}`);
        return null;
      }
      
      return {
        path: route.path,
        component: route.component, // Store component name for lazy loading
        loader: ComponentLoader,    // Store the loader function
        // Add additional route properties if needed
        id: route.id,
        title: route.title,
        permissions: route.permissions,
        accessible: route.accessible
      };
    }).filter(Boolean); // Remove null entries
  } catch (error) {
    console.error('Failed to get dynamic routes:', error);
    return [];
  }
}

// Initialize dynamic routes on module load (non-blocking)
loadDynamicRouteGroups().catch(error => {
  console.warn('Initial dynamic route loading failed:', error);
});

// Force refresh navigation from backend  
export async function forceRefreshNavigation(): Promise<void> {
  console.log('🔄 Forcing navigation refresh from backend...');
  sitemapService.clearCache();
  await loadDynamicRouteGroups(true);
}

// Static routes are kept for reference but not used in navigation
const routeGroups: RouteGroup[] = staticRouteGroups;

export default routeGroups;
