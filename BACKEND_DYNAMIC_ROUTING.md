# Backend Dynamic Routing Implementation Plan (MongoDB)

## Overview
This document outlines the backend implementation for a dynamic, role-based routing system using MongoDB that will control frontend route access based on user permissions and roles. The backend will serve route configurations to the frontend based on authenticated user capabilities.

## Core Concepts

### Route Structure
Routes are defined as hierarchical objects with permissions, components, and metadata:

```json
{
  "_id": "unique-route-identifier",
  "path": "/dashboard/analytics",
  "component": "AnalyticsDashboard", 
  "permissions": ["analytics.view", "dashboard.access"],
  "meta": {
    "title": "Analytics Dashboard",
    "icon": "chart-pie",
    "group": "dashboard",
    "description": "View analytics and metrics"
  },
  "children": [
    {
      "_id": "analytics-reports", 
      "path": "/reports",
      "component": "AnalyticsReports",
      "permissions": ["analytics.reports.view"]
    }
  ],
  "active": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Permission System
- **Granular Permissions**: `module.resource.action` format (e.g., `support.tickets.create`)
- **Role-based**: Users have roles that grant permission sets
- **Hierarchical**: Parent routes can inherit child permissions

## API Endpoints

### 1. Get User Routes
**Endpoint**: `GET /api/user/routes`  
**Authentication**: Required (Bearer token)  
**Description**: Returns routes and navigation structure for authenticated user

**Response Format**:
```json
{
  "routes": [
    {
      "id": "dashboard-analytics",
      "path": "/dashboard/analytics",
      "component": "AnalyticsDashboard",
      "permissions": ["analytics.view"],
      "meta": {
        "title": "Analytics",
        "icon": "chart-pie",
        "group": "dashboard"
      }
    }
  ],
  "navigation": [
    {
      "label": "Dashboard",
      "group": "main",
      "icon": "chart-pie",
      "items": [
        {
          "routeId": "dashboard-analytics",
          "label": "Analytics",
          "icon": "chart-line",
          "active": true,
          "order": 1
        }
      ]
    }
  ],
  "userPermissions": ["analytics.view", "dashboard.access"]
}
```

### 2. Get Available Routes (Admin)
**Endpoint**: `GET /api/admin/routes`  
**Authentication**: Required (Admin role)  
**Description**: Returns all available routes in the system

### 3. Update User Permissions
**Endpoint**: `POST /api/admin/users/{userId}/permissions`  
**Authentication**: Required (Admin role)  
**Description**: Update user permissions and trigger route refresh

## MongoDB Collections Schema

### Routes Collection
```javascript
// Collection: routes
{
  "_id": "dashboard-analytics", // Custom string ID
  "path": "/dashboard/analytics",
  "component": "AnalyticsDashboard",
  "parentRouteId": null, // Reference to parent route
  "permissions": ["analytics.view", "dashboard.access"],
  "meta": {
    "title": "Analytics Dashboard",
    "icon": "chart-pie",
    "group": "dashboard",
    "description": "View analytics and metrics",
    "order": 1
  },
  "children": [
    {
      "_id": "analytics-reports",
      "path": "/reports", 
      "component": "AnalyticsReports",
      "permissions": ["analytics.reports.view"],
      "meta": {
        "title": "Reports",
        "icon": "file-alt"
      }
    }
  ],
  "active": true,
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00Z")
}

// Indexes
db.routes.createIndex({ "path": 1 })
db.routes.createIndex({ "permissions": 1 })
db.routes.createIndex({ "meta.group": 1 })
db.routes.createIndex({ "active": 1 })
```

### Permissions Collection
```javascript
// Collection: permissions
{
  "_id": ObjectId(),
  "name": "analytics.view", // Unique permission identifier
  "description": "View analytics dashboard and data",
  "module": "analytics",
  "resource": "dashboard", 
  "action": "view",
  "category": "dashboard", // Optional grouping
  "createdAt": ISODate("2024-01-01T00:00:00Z")
}

// Indexes
db.permissions.createIndex({ "name": 1 }, { unique: true })
db.permissions.createIndex({ "module": 1, "resource": 1, "action": 1 })
```

### Roles Collection
```javascript
// Collection: roles
{
  "_id": ObjectId(),
  "name": "admin",
  "displayName": "System Administrator",
  "description": "Full system access with administrative privileges",
  "permissions": [
    "analytics.view",
    "support.tickets.create",
    "support.tickets.view",
    "admin.users.manage"
  ],
  "hierarchy": 1, // Higher numbers = more privileges
  "active": true,
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00Z")
}

// Indexes
db.roles.createIndex({ "name": 1 }, { unique: true })
db.roles.createIndex({ "permissions": 1 })
db.roles.createIndex({ "active": 1 })
```

### Users Collection (Extended)
```javascript
// Collection: users (extend existing user schema)
{
  "_id": ObjectId(),
  "characterId": 123456789, // EVE Online character ID
  "characterName": "Captain Spaceman",
  "email": "user@example.com",
  
  // Permissions and Roles
  "roles": [
    {
      "roleId": ObjectId("role_object_id"),
      "roleName": "analyst", // Denormalized for quick access
      "assignedBy": ObjectId("admin_user_id"),
      "assignedAt": ISODate("2024-01-01T00:00:00Z"),
      "expiresAt": null // null = never expires
    }
  ],
  "directPermissions": [
    {
      "permission": "special.feature.access",
      "grantedBy": ObjectId("admin_user_id"),
      "grantedAt": ISODate("2024-01-01T00:00:00Z"),
      "expiresAt": ISODate("2024-12-31T23:59:59Z")
    }
  ],
  
  // EVE SSO Data
  "eveData": {
    "accessToken": "encrypted_token",
    "refreshToken": "encrypted_refresh_token",
    "scopes": ["esi-skills.read_skills.v1"],
    "tokenExpiry": ISODate("2024-01-02T00:00:00Z")
  },
  
  "preferences": {
    "theme": "dark",
    "language": "en",
    "timezone": "UTC"
  },
  
  "lastLogin": ISODate("2024-01-01T12:00:00Z"),
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00Z"),
  "active": true
}

// Indexes
db.users.createIndex({ "characterId": 1 }, { unique: true })
db.users.createIndex({ "roles.roleName": 1 })
db.users.createIndex({ "directPermissions.permission": 1 })
db.users.createIndex({ "active": 1 })
```

### User Sessions Collection (For JWT/Auth tracking)
```javascript
// Collection: userSessions
{
  "_id": ObjectId(),
  "userId": ObjectId("user_object_id"),
  "sessionToken": "jwt_token_hash",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1",
    "location": "US"
  },
  "permissions": ["analytics.view", "support.tickets.view"], // Cached for performance
  "roles": ["user", "analyst"],
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "expiresAt": ISODate("2024-01-02T00:00:00Z"),
  "lastActivity": ISODate("2024-01-01T12:00:00Z"),
  "active": true
}

// Indexes
db.userSessions.createIndex({ "sessionToken": 1 })
db.userSessions.createIndex({ "userId": 1 })
db.userSessions.createIndex({ "expiresAt": 1 })
db.userSessions.createIndex({ "active": 1 })
```

## Implementation Plan

### Phase 1: Core Infrastructure

1. **MongoDB Database Setup**
   ```javascript
   // Insert default permissions
   db.permissions.insertMany([
     {
       name: "dashboard.access",
       description: "Access to dashboard area",
       module: "dashboard", 
       resource: "general",
       action: "access",
       category: "dashboard",
       createdAt: new Date()
     },
     {
       name: "analytics.view",
       description: "View analytics dashboard",
       module: "analytics",
       resource: "dashboard", 
       action: "view",
       category: "dashboard",
       createdAt: new Date()
     },
     {
       name: "support.tickets.view",
       description: "View support tickets",
       module: "support",
       resource: "tickets",
       action: "view", 
       category: "support",
       createdAt: new Date()
     },
     {
       name: "support.tickets.create",
       description: "Create support tickets",
       module: "support",
       resource: "tickets",
       action: "create",
       category: "support", 
       createdAt: new Date()
     },
     {
       name: "admin.users.manage",
       description: "Manage users",
       module: "admin",
       resource: "users",
       action: "manage",
       category: "admin",
       createdAt: new Date()
     }
   ]);

   // Insert default roles
   db.roles.insertMany([
     {
       name: "admin",
       displayName: "System Administrator", 
       description: "Full system access with administrative privileges",
       permissions: [
         "dashboard.access",
         "analytics.view", 
         "support.tickets.view",
         "support.tickets.create",
         "admin.users.manage"
       ],
       hierarchy: 100,
       active: true,
       createdAt: new Date(),
       updatedAt: new Date()
     },
     {
       name: "user",
       displayName: "Regular User",
       description: "Standard user with basic access",
       permissions: ["dashboard.access"],
       hierarchy: 10,
       active: true,
       createdAt: new Date(),
       updatedAt: new Date()
     },
     {
       name: "support_agent", 
       displayName: "Support Agent",
       description: "Support desk agent with ticket management access",
       permissions: [
         "dashboard.access",
         "support.tickets.view",
         "support.tickets.create"
       ],
       hierarchy: 50,
       active: true,
       createdAt: new Date(),
       updatedAt: new Date()
     },
     {
       name: "analyst",
       displayName: "Data Analyst", 
       description: "Analytics and reporting access",
       permissions: [
         "dashboard.access",
         "analytics.view"
       ],
       hierarchy: 30,
       active: true,
       createdAt: new Date(),
       updatedAt: new Date()
     }
   ]);
   ```

2. **Route Configuration**
   ```javascript
   // Insert default routes
   db.routes.insertMany([
     {
       _id: "dashboard-analytics",
       path: "/dashboard/analytics",
       component: "AnalyticsDashboard",
       permissions: ["analytics.view"],
       meta: {
         title: "Analytics",
         icon: "chart-pie", 
         group: "dashboard",
         description: "View analytics dashboard and metrics",
         order: 1
       },
       active: true,
       createdAt: new Date(),
       updatedAt: new Date()
     },
     {
       _id: "dashboard-crm",
       path: "/dashboard/crm",
       component: "CrmDashboard", 
       permissions: ["crm.view"],
       meta: {
         title: "CRM",
         icon: "users",
         group: "dashboard", 
         description: "Customer relationship management dashboard",
         order: 2
       },
       active: true,
       createdAt: new Date(),
       updatedAt: new Date()
     },
     {
       _id: "support-tickets",
       path: "/support-desk/tickets",
       component: "TicketsLayout",
       permissions: ["support.tickets.view"],
       meta: {
         title: "Support Tickets",
         icon: "ticket-alt",
         group: "support",
         description: "Manage and view support tickets",
         order: 1
       },
       children: [
         {
           _id: "support-tickets-table",
           path: "/table",
           component: "TicketsTableView", 
           permissions: ["support.tickets.view"],
           meta: {
             title: "Table View",
             icon: "table"
           }
         },
         {
           _id: "support-tickets-card",
           path: "/card", 
           component: "TicketsCardView",
           permissions: ["support.tickets.view"],
           meta: {
             title: "Card View",
             icon: "th-large"
           }
         }
       ],
       active: true,
       createdAt: new Date(),
       updatedAt: new Date()
     }
   ]);
   ```

### Phase 2: API Implementation

1. **User Routes Service (MongoDB)**
   ```javascript
   const { MongoClient, ObjectId } = require('mongodb');

   class UserRoutesService {
     constructor(db) {
       this.db = db;
       this.users = db.collection('users');
       this.routes = db.collection('routes');
       this.roles = db.collection('roles');
       this.permissions = db.collection('permissions');
     }

     async getUserRoutes(userId) {
       try {
         // Get user permissions (direct + role-based)
         const permissions = await this.getUserPermissions(userId);
         
         // Get routes user has access to
         const routes = await this.getRoutesForPermissions(permissions);
         
         // Build navigation structure
         const navigation = await this.buildNavigationTree(routes);
         
         return { routes, navigation, userPermissions: permissions };
       } catch (error) {
         console.error('Error in getUserRoutes:', error);
         throw error;
       }
     }

     async getUserPermissions(userId) {
       try {
         // Convert string userId to ObjectId if needed
         const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
         
         // Get user with roles and direct permissions
         const user = await this.users.findOne(
           { _id: userObjectId, active: true },
           { 
             projection: { 
               roles: 1, 
               directPermissions: 1,
               characterId: 1,
               characterName: 1 
             } 
           }
         );

         if (!user) {
           throw new Error('User not found or inactive');
         }

         const allPermissions = new Set();
         const now = new Date();

         // Add direct permissions (that haven't expired)
         if (user.directPermissions && Array.isArray(user.directPermissions)) {
           user.directPermissions.forEach(perm => {
             if (!perm.expiresAt || new Date(perm.expiresAt) > now) {
               allPermissions.add(perm.permission);
             }
           });
         }

         // Add role-based permissions
         if (user.roles && Array.isArray(user.roles)) {
           for (const userRole of user.roles) {
             // Check if role assignment hasn't expired
             if (!userRole.expiresAt || new Date(userRole.expiresAt) > now) {
               // Get role permissions
               const role = await this.roles.findOne(
                 { 
                   $or: [
                     { _id: userRole.roleId },
                     { name: userRole.roleName }
                   ],
                   active: true 
                 },
                 { projection: { permissions: 1 } }
               );

               if (role && role.permissions) {
                 role.permissions.forEach(permission => {
                   allPermissions.add(permission);
                 });
               }
             }
           }
         }

         return Array.from(allPermissions);
       } catch (error) {
         console.error('Error getting user permissions:', error);
         throw error;
       }
     }

     async getRoutesForPermissions(permissions) {
       try {
         // MongoDB aggregation to find routes user can access
         const pipeline = [
           {
             $match: {
               active: true,
               $or: [
                 { permissions: { $size: 0 } }, // Routes with no permissions (public)
                 { permissions: null }, // Routes with null permissions
                 { permissions: { $in: permissions } } // Routes with matching permissions
               ]
             }
           },
           {
             $addFields: {
               // Check if user has all required permissions for this route
               hasAccess: {
                 $cond: {
                   if: { $or: [{ $eq: ["$permissions", null] }, { $eq: [{ $size: "$permissions" }, 0] }] },
                   then: true,
                   else: {
                     $allElementsTrue: {
                       $map: {
                         input: "$permissions",
                         as: "perm",
                         in: { $in: ["$$perm", permissions] }
                       }
                     }
                   }
                 }
               }
             }
           },
           {
             $match: { hasAccess: true }
           },
           {
             $sort: { "meta.group": 1, "meta.order": 1, "meta.title": 1 }
           }
         ];

         const routes = await this.routes.aggregate(pipeline).toArray();
         
         // Process children routes recursively
         return routes.map(route => this.processRouteChildren(route, permissions));
       } catch (error) {
         console.error('Error getting routes for permissions:', error);
         throw error;
       }
     }

     processRouteChildren(route, permissions) {
       if (route.children && Array.isArray(route.children)) {
         route.children = route.children.filter(child => {
           // Check if user has access to child route
           if (!child.permissions || child.permissions.length === 0) {
             return true; // No permissions required
           }
           
           return child.permissions.every(perm => permissions.includes(perm));
         }).map(child => this.processRouteChildren(child, permissions));
       }
       
       return route;
     }

     async buildNavigationTree(routes) {
       try {
         // Group routes by meta.group
         const groupedRoutes = routes.reduce((groups, route) => {
           const group = route.meta?.group || 'other';
           if (!groups[group]) {
             groups[group] = [];
           }
           groups[group].push({
             routeId: route._id,
             label: route.meta?.title || route._id,
             icon: route.meta?.icon,
             order: route.meta?.order || 999,
             active: true,
             path: route.path
           });
           return groups;
         }, {});

         // Convert to navigation structure
         const navigation = Object.entries(groupedRoutes).map(([groupName, items]) => ({
           label: this.getGroupDisplayName(groupName),
           group: groupName,
           items: items.sort((a, b) => a.order - b.order)
         }));

         // Sort groups by priority
         const groupPriority = {
           dashboard: 1,
           apps: 2,
           support: 3,
           admin: 4,
           other: 999
         };

         return navigation.sort((a, b) => 
           (groupPriority[a.group] || 999) - (groupPriority[b.group] || 999)
         );
       } catch (error) {
         console.error('Error building navigation tree:', error);
         throw error;
       }
     }

     getGroupDisplayName(groupName) {
       const displayNames = {
         dashboard: 'Dashboard',
         apps: 'Applications', 
         support: 'Support',
         admin: 'Administration',
         other: 'Other'
       };
       return displayNames[groupName] || groupName.charAt(0).toUpperCase() + groupName.slice(1);
     }
   }
   ```

2. **Route Controller (MongoDB)**
   ```javascript
   const { ObjectId } = require('mongodb');

   class RouteController {
     constructor(db) {
       this.db = db;
       this.routesService = new UserRoutesService(db);
       this.users = db.collection('users');
       this.roles = db.collection('roles');
     }

     async getUserRoutes(req, res) {
       try {
         const userId = req.user._id || req.user.id;
         const data = await this.routesService.getUserRoutes(userId);
         
         // Cache routes in session for performance
         req.session.userRoutes = data;
         req.session.routesCachedAt = new Date();
         
         res.json(data);
       } catch (error) {
         console.error('Error fetching user routes:', error);
         res.status(500).json({ 
           error: 'Failed to fetch routes',
           message: process.env.NODE_ENV === 'development' ? error.message : undefined
         });
       }
     }

     async updateUserPermissions(req, res) {
       try {
         const { userId } = req.params;
         const { permissions, roles } = req.body;
         
         // Verify admin permissions
         const userPermissions = await this.routesService.getUserPermissions(req.user._id);
         if (!userPermissions.includes('admin.users.manage')) {
           return res.status(403).json({ error: 'Insufficient permissions' });
         }

         const userObjectId = new ObjectId(userId);
         const updateData = {};

         // Update roles if provided
         if (roles && Array.isArray(roles)) {
           const roleObjects = await Promise.all(
             roles.map(async (roleName) => {
               const role = await this.roles.findOne({ name: roleName, active: true });
               if (!role) {
                 throw new Error(`Role '${roleName}' not found`);
               }
               return {
                 roleId: role._id,
                 roleName: role.name,
                 assignedBy: req.user._id,
                 assignedAt: new Date(),
                 expiresAt: null
               };
             })
           );
           updateData.roles = roleObjects;
         }

         // Update direct permissions if provided
         if (permissions && Array.isArray(permissions)) {
           const permissionObjects = permissions.map(permission => ({
             permission,
             grantedBy: req.user._id,
             grantedAt: new Date(),
             expiresAt: null
           }));
           updateData.directPermissions = permissionObjects;
         }

         // Update user
         const result = await this.users.updateOne(
           { _id: userObjectId },
           { 
             $set: {
               ...updateData,
               updatedAt: new Date()
             }
           }
         );

         if (result.matchedCount === 0) {
           return res.status(404).json({ error: 'User not found' });
         }

         // Clear cached routes for this user
         await this.clearUserRouteCache(userId);
         
         // Optionally trigger real-time update to user's frontend
         await this.notifyUserRouteUpdate(userId);
         
         res.json({ 
           success: true, 
           message: 'User permissions updated successfully',
           modifiedCount: result.modifiedCount
         });
       } catch (error) {
         console.error('Error updating user permissions:', error);
         res.status(500).json({ 
           error: 'Failed to update permissions',
           message: process.env.NODE_ENV === 'development' ? error.message : undefined
         });
       }
     }

     async getAllRoutes(req, res) {
       try {
         // Admin endpoint to get all available routes
         const userPermissions = await this.routesService.getUserPermissions(req.user._id);
         if (!userPermissions.includes('admin.routes.view')) {
           return res.status(403).json({ error: 'Insufficient permissions' });
         }

         const routes = await this.db.collection('routes').find({ active: true }).toArray();
         res.json({ routes });
       } catch (error) {
         console.error('Error fetching all routes:', error);
         res.status(500).json({ error: 'Failed to fetch routes' });
       }
     }

     async createRoute(req, res) {
       try {
         const userPermissions = await this.routesService.getUserPermissions(req.user._id);
         if (!userPermissions.includes('admin.routes.manage')) {
           return res.status(403).json({ error: 'Insufficient permissions' });
         }

         const { _id, path, component, permissions, meta } = req.body;
         
         const newRoute = {
           _id,
           path,
           component,
           permissions: permissions || [],
           meta: meta || {},
           active: true,
           createdAt: new Date(),
           updatedAt: new Date(),
           createdBy: req.user._id
         };

         const result = await this.db.collection('routes').insertOne(newRoute);
         
         res.status(201).json({ 
           success: true, 
           routeId: result.insertedId,
           message: 'Route created successfully'
         });
       } catch (error) {
         console.error('Error creating route:', error);
         res.status(500).json({ error: 'Failed to create route' });
       }
     }

     async clearUserRouteCache(userId) {
       // Implementation depends on your session/cache strategy
       // This could clear Redis cache, session data, etc.
       try {
         // Example: Clear from session store if using session-based caching
         // await this.sessionStore.destroy(userId);
         console.log(`Cleared route cache for user ${userId}`);
       } catch (error) {
         console.warn('Failed to clear user route cache:', error);
       }
     }

     async notifyUserRouteUpdate(userId) {
       // Optional: Send real-time notification to user about route changes
       try {
         // Example using WebSocket or Server-Sent Events
         // this.websocketService.sendToUser(userId, {
         //   type: 'ROUTES_UPDATED',
         //   timestamp: new Date()
         // });
         console.log(`Notified user ${userId} about route updates`);
       } catch (error) {
         console.warn('Failed to notify user of route update:', error);
       }
     }
   }
   ```

### Phase 3: Complete Route Definitions

Create comprehensive route configurations for all React Falcon application areas:

```javascript
// MongoDB script to insert all React Falcon routes
const COMPLETE_ROUTES = [
  // Dashboard Routes
  {
    _id: "dashboard-analytics",
    path: "/dashboard/analytics",
    component: "AnalyticsDashboard",
    permissions: ["analytics.view"],
    meta: { title: "Analytics", icon: "chart-pie", group: "dashboard", order: 1 }
  },
  {
    _id: "dashboard-crm",
    path: "/dashboard/crm",
    component: "CrmDashboard",
    permissions: ["crm.view"],
    meta: { title: "CRM", icon: "users", group: "dashboard", order: 2 }
  },
  {
    _id: "dashboard-saas",
    path: "/dashboard/saas",
    component: "SaasDashboard",
    permissions: ["saas.view"],
    meta: { title: "SaaS", icon: "cloud", group: "dashboard", order: 3 }
  },
  {
    _id: "dashboard-project-management",
    path: "/dashboard/project-management",
    component: "ProjectManagementDashboard",
    permissions: ["project.management.view"],
    meta: { title: "Project Management", icon: "tasks", group: "dashboard", order: 4 }
  },
  {
    _id: "dashboard-support-desk",
    path: "/dashboard/support-desk",
    component: "SupportDeskDashboard",
    permissions: ["support.dashboard.view"],
    meta: { title: "Support Desk", icon: "headset", group: "dashboard", order: 5 }
  },

  // Application Routes
  {
    _id: "app-calendar",
    path: "/app/calendar",
    component: "Calendar",
    permissions: ["calendar.access"],
    meta: { title: "Calendar", icon: "calendar-alt", group: "apps", order: 1 }
  },
  {
    _id: "app-chat",
    path: "/app/chat",
    component: "Chat",
    permissions: ["chat.access"],
    meta: { title: "Chat", icon: "comments", group: "apps", order: 2 }
  },
  {
    _id: "app-kanban",
    path: "/app/kanban",
    component: "Kanban",
    permissions: ["kanban.access"],
    meta: { title: "Kanban", icon: "trello", group: "apps", order: 3 }
  },

  // Email Routes
  {
    _id: "email-inbox",
    path: "/email/inbox",
    component: "EmailInbox",
    permissions: ["email.access"],
    meta: { title: "Inbox", icon: "envelope", group: "email", order: 1 }
  },
  {
    _id: "email-compose",
    path: "/email/compose",
    component: "EmailCompose",
    permissions: ["email.compose"],
    meta: { title: "Compose", icon: "edit", group: "email", order: 2 }
  },
  {
    _id: "email-detail",
    path: "/email/email-detail",
    component: "EmailDetail",
    permissions: ["email.access"],
    meta: { title: "Email Detail", icon: "envelope-open", group: "email", order: 3 }
  },

  // Events Routes
  {
    _id: "events-create",
    path: "/events/create-an-event",
    component: "CreateEvent",
    permissions: ["events.create"],
    meta: { title: "Create Event", icon: "plus-circle", group: "events", order: 1 }
  },
  {
    _id: "events-list",
    path: "/events/event-list",
    component: "EventList",
    permissions: ["events.view"],
    meta: { title: "Event List", icon: "list", group: "events", order: 2 }
  },
  {
    _id: "events-detail",
    path: "/events/event-detail",
    component: "EventDetail",
    permissions: ["events.view"],
    meta: { title: "Event Detail", icon: "calendar-day", group: "events", order: 3 }
  },

  // Social Routes
  {
    _id: "social-feed",
    path: "/social/feed",
    component: "Feed",
    permissions: ["social.feed.view"],
    meta: { title: "Feed", icon: "rss", group: "social", order: 1 }
  },
  {
    _id: "social-activity-log",
    path: "/social/activity-log",
    component: "ActivityLog",
    permissions: ["social.activity.view"],
    meta: { title: "Activity Log", icon: "history", group: "social", order: 2 }
  },
  {
    _id: "social-notifications",
    path: "/social/notifications",
    component: "Notifications",
    permissions: ["social.notifications.view"],
    meta: { title: "Notifications", icon: "bell", group: "social", order: 3 }
  },
  {
    _id: "social-followers",
    path: "/social/followers",
    component: "Followers",
    permissions: ["social.followers.view"],
    meta: { title: "Followers", icon: "user-friends", group: "social", order: 4 }
  },

  // Support Desk Routes
  {
    _id: "support-tickets-table",
    path: "/support-desk/tickets/table",
    component: "TicketsTableView",
    permissions: ["support.tickets.view"],
    meta: { title: "Tickets Table", icon: "table", group: "support", order: 1 }
  },
  {
    _id: "support-tickets-card",
    path: "/support-desk/tickets/card",
    component: "TicketsCardView",
    permissions: ["support.tickets.view"],
    meta: { title: "Tickets Card", icon: "th-large", group: "support", order: 2 }
  },
  {
    _id: "support-contacts",
    path: "/support-desk/contacts",
    component: "Contacts",
    permissions: ["support.contacts.view"],
    meta: { title: "Contacts", icon: "address-book", group: "support", order: 3 }
  },
  {
    _id: "support-contact-details",
    path: "/support-desk/contact-details",
    component: "ContactDetails",
    permissions: ["support.contacts.view"],
    meta: { title: "Contact Details", icon: "user-circle", group: "support", order: 4 }
  },
  {
    _id: "support-tickets-preview",
    path: "/support-desk/tickets-preview",
    component: "TicketsPreview",
    permissions: ["support.tickets.view"],
    meta: { title: "Tickets Preview", icon: "eye", group: "support", order: 5 }
  },
  {
    _id: "support-quick-links",
    path: "/support-desk/quick-links",
    component: "QuickLinks",
    permissions: ["support.quicklinks.view"],
    meta: { title: "Quick Links", icon: "external-link-alt", group: "support", order: 6 }
  },
  {
    _id: "support-reports",
    path: "/support-desk/reports",
    component: "Reports",
    permissions: ["support.reports.view"],
    meta: { title: "Reports", icon: "chart-bar", group: "support", order: 7 }
  },

  // User & Profile Routes
  {
    _id: "user-profile",
    path: "/user/profile",
    component: "UserProfile",
    permissions: ["profile.view"],
    meta: { title: "Profile", icon: "user", group: "user", order: 1 }
  },
  {
    _id: "user-settings",
    path: "/user/settings",
    component: "UserSettings",
    permissions: ["profile.edit"],
    meta: { title: "Settings", icon: "cog", group: "user", order: 2 }
  },

  // Page Routes
  {
    _id: "pages-starter",
    path: "/pages/starter",
    component: "Starter",
    permissions: [],
    meta: { title: "Starter", icon: "flag", group: "pages", order: 1 }
  },
  {
    _id: "pages-landing",
    path: "/landing",
    component: "Landing",
    permissions: [],
    meta: { title: "Landing", icon: "globe", group: "pages", order: 2 }
  },

  // Pricing Routes
  {
    _id: "pricing-default",
    path: "/pricing/pricing-default",
    component: "PricingDefault",
    permissions: ["pricing.view"],
    meta: { title: "Pricing Default", icon: "tags", group: "pricing", order: 1 }
  },
  {
    _id: "pricing-alt",
    path: "/pricing/pricing-alt",
    component: "PricingAlt",
    permissions: ["pricing.view"],
    meta: { title: "Pricing Alternative", icon: "tag", group: "pricing", order: 2 }
  },

  // FAQ Routes
  {
    _id: "faq-basic",
    path: "/faq/faq-basic",
    component: "FaqBasic",
    permissions: [],
    meta: { title: "FAQ Basic", icon: "question-circle", group: "faq", order: 1 }
  },
  {
    _id: "faq-alt",
    path: "/faq/faq-alt",
    component: "FaqAlt",
    permissions: [],
    meta: { title: "FAQ Alternative", icon: "question", group: "faq", order: 2 }
  },
  {
    _id: "faq-accordion",
    path: "/faq/faq-accordion",
    component: "FaqAccordion",
    permissions: [],
    meta: { title: "FAQ Accordion", icon: "list-ul", group: "faq", order: 3 }
  },

  // Admin Routes (High Security)
  {
    _id: "admin-users",
    path: "/admin/users",
    component: "AdminUsers",
    permissions: ["admin.users.view"],
    meta: { title: "User Management", icon: "users-cog", group: "admin", order: 1 }
  },
  {
    _id: "admin-roles",
    path: "/admin/roles",
    component: "AdminRoles",
    permissions: ["admin.roles.manage"],
    meta: { title: "Role Management", icon: "user-shield", group: "admin", order: 2 }
  },
  {
    _id: "admin-permissions",
    path: "/admin/permissions",
    component: "AdminPermissions",
    permissions: ["admin.permissions.manage"],
    meta: { title: "Permission Management", icon: "key", group: "admin", order: 3 }
  },
  {
    _id: "admin-routes",
    path: "/admin/routes",
    component: "AdminRoutes",
    permissions: ["admin.routes.manage"],
    meta: { title: "Route Management", icon: "route", group: "admin", order: 4 }
  }
];

// Insert all routes
db.routes.insertMany(COMPLETE_ROUTES.map(route => ({
  ...route,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
})));

// Add corresponding permissions
const COMPLETE_PERMISSIONS = [
  // Dashboard permissions
  { name: "analytics.view", description: "View analytics dashboard", module: "analytics", resource: "dashboard", action: "view" },
  { name: "crm.view", description: "View CRM dashboard", module: "crm", resource: "dashboard", action: "view" },
  { name: "saas.view", description: "View SaaS dashboard", module: "saas", resource: "dashboard", action: "view" },
  { name: "project.management.view", description: "View project management dashboard", module: "project", resource: "dashboard", action: "view" },
  { name: "support.dashboard.view", description: "View support desk dashboard", module: "support", resource: "dashboard", action: "view" },

  // App permissions
  { name: "calendar.access", description: "Access calendar application", module: "calendar", resource: "app", action: "access" },
  { name: "chat.access", description: "Access chat application", module: "chat", resource: "app", action: "access" },
  { name: "kanban.access", description: "Access kanban boards", module: "kanban", resource: "app", action: "access" },

  // Email permissions
  { name: "email.access", description: "Access email system", module: "email", resource: "app", action: "access" },
  { name: "email.compose", description: "Compose emails", module: "email", resource: "compose", action: "create" },

  // Events permissions
  { name: "events.create", description: "Create events", module: "events", resource: "event", action: "create" },
  { name: "events.view", description: "View events", module: "events", resource: "event", action: "view" },

  // Social permissions
  { name: "social.feed.view", description: "View social feed", module: "social", resource: "feed", action: "view" },
  { name: "social.activity.view", description: "View activity log", module: "social", resource: "activity", action: "view" },
  { name: "social.notifications.view", description: "View notifications", module: "social", resource: "notifications", action: "view" },
  { name: "social.followers.view", description: "View followers", module: "social", resource: "followers", action: "view" },

  // Support permissions
  { name: "support.tickets.view", description: "View support tickets", module: "support", resource: "tickets", action: "view" },
  { name: "support.tickets.create", description: "Create support tickets", module: "support", resource: "tickets", action: "create" },
  { name: "support.contacts.view", description: "View support contacts", module: "support", resource: "contacts", action: "view" },
  { name: "support.quicklinks.view", description: "View quick links", module: "support", resource: "quicklinks", action: "view" },
  { name: "support.reports.view", description: "View support reports", module: "support", resource: "reports", action: "view" },

  // Profile permissions
  { name: "profile.view", description: "View own profile", module: "profile", resource: "user", action: "view" },
  { name: "profile.edit", description: "Edit own profile", module: "profile", resource: "user", action: "edit" },

  // Pricing permissions
  { name: "pricing.view", description: "View pricing pages", module: "pricing", resource: "page", action: "view" },

  // Admin permissions (High Security)
  { name: "admin.users.view", description: "View user management", module: "admin", resource: "users", action: "view" },
  { name: "admin.users.manage", description: "Manage users", module: "admin", resource: "users", action: "manage" },
  { name: "admin.roles.manage", description: "Manage roles", module: "admin", resource: "roles", action: "manage" },
  { name: "admin.permissions.manage", description: "Manage permissions", module: "admin", resource: "permissions", action: "manage" },
  { name: "admin.routes.view", description: "View route configuration", module: "admin", resource: "routes", action: "view" },
  { name: "admin.routes.manage", description: "Manage route configuration", module: "admin", resource: "routes", action: "manage" }
];

// Insert all permissions
db.permissions.insertMany(COMPLETE_PERMISSIONS.map(perm => ({
  ...perm,
  createdAt: new Date()
})));
```

### Phase 4: Security Considerations

1. **Route Validation**: Always verify permissions server-side even if route exists on frontend
2. **Token Validation**: Ensure JWT tokens contain permission claims
3. **Audit Logging**: Log all permission changes and route access attempts
4. **Rate Limiting**: Implement rate limiting on route endpoint
5. **Cache Strategy**: Cache user routes with appropriate TTL
6. **MongoDB Security**: Use proper indexes and query optimization
7. **Data Encryption**: Encrypt sensitive data in EVE SSO tokens

```javascript
// Audit logging for MongoDB
const auditLog = {
  userId: ObjectId("user_id"),
  action: "PERMISSION_CHANGED",
  resourceType: "user_permissions",
  resourceId: ObjectId("target_user_id"),
  changes: {
    before: ["old.permission"],
    after: ["new.permission", "added.permission"]
  },
  performedBy: ObjectId("admin_user_id"),
  timestamp: new Date(),
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0..."
};

db.auditLogs.insertOne(auditLog);
```

## Testing Strategy

1. **Unit Tests**: Test permission calculation logic with MongoDB
2. **Integration Tests**: Test full route resolution flow with test database
3. **Security Tests**: Verify unauthorized access is prevented
4. **Performance Tests**: Ensure MongoDB aggregation queries are optimized

```javascript
// Example test with MongoDB
describe('UserRoutesService', () => {
  let db, service;
  
  beforeEach(async () => {
    // Setup test database
    db = await MongoClient.connect(TEST_MONGO_URL);
    service = new UserRoutesService(db);
  });
  
  it('should calculate user permissions correctly', async () => {
    // Insert test data
    await db.collection('users').insertOne({
      _id: new ObjectId(),
      roles: [{ roleName: 'user', assignedAt: new Date() }]
    });
    
    const permissions = await service.getUserPermissions(userId);
    expect(permissions).toContain('dashboard.access');
  });
});
```

## MongoDB Performance Optimization

### Indexing Strategy
```javascript
// Essential indexes for performance
db.users.createIndex({ "characterId": 1 }, { unique: true });
db.users.createIndex({ "roles.roleName": 1 });
db.users.createIndex({ "directPermissions.permission": 1 });
db.routes.createIndex({ "permissions": 1 });
db.routes.createIndex({ "meta.group": 1, "meta.order": 1 });
db.roles.createIndex({ "name": 1 }, { unique: true });
db.roles.createIndex({ "permissions": 1 });

// Compound indexes for common queries
db.users.createIndex({ "active": 1, "roles.roleName": 1 });
db.routes.createIndex({ "active": 1, "permissions": 1 });
```

### Query Optimization
```javascript
// Use aggregation pipeline for complex queries
const getUserRoutesOptimized = async (userId) => {
  const pipeline = [
    { $match: { _id: new ObjectId(userId), active: true } },
    {
      $lookup: {
        from: "roles",
        localField: "roles.roleId",
        foreignField: "_id",
        as: "userRoles"
      }
    },
    {
      $project: {
        allPermissions: {
          $concatArrays: [
            "$directPermissions.permission",
            { $reduce: {
              input: "$userRoles.permissions",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }}
          ]
        }
      }
    }
  ];
  
  return await db.collection('users').aggregate(pipeline).toArray();
};
```

## Deployment Considerations

1. **MongoDB Migrations**: Version control schema changes
2. **Index Management**: Create indexes before large data operations
3. **Backup Strategy**: Regular MongoDB backups before permission changes
4. **Monitoring**: Track MongoDB performance and query patterns
5. **Rollback Plan**: Database rollback procedures for permission changes

```javascript
// Migration example
const migration_v1_to_v2 = async (db) => {
  // Add new field to existing users
  await db.collection('users').updateMany(
    { directPermissions: { $exists: false } },
    { $set: { directPermissions: [] } }
  );
  
  // Create new indexes
  await db.collection('users').createIndex({ "directPermissions.permission": 1 });
  
  console.log('Migration v1 to v2 completed');
};
```

## Real-time Updates with MongoDB Change Streams

For immediate route updates when permissions change:

```javascript
// MongoDB Change Streams for real-time updates
class RouteUpdateNotifier {
  constructor(db, websocketService) {
    this.db = db;
    this.websocketService = websocketService;
    this.setupChangeStreams();
  }

  setupChangeStreams() {
    // Watch for user permission changes
    const userChangeStream = this.db.collection('users').watch([
      {
        $match: {
          $or: [
            { 'fullDocument.roles': { $exists: true } },
            { 'fullDocument.directPermissions': { $exists: true } }
          ]
        }
      }
    ]);

    userChangeStream.on('change', async (change) => {
      if (change.operationType === 'update') {
        const userId = change.documentKey._id;
        await this.notifyUserRouteUpdate(userId);
      }
    });

    // Watch for role permission changes
    const roleChangeStream = this.db.collection('roles').watch();
    roleChangeStream.on('change', async (change) => {
      if (change.operationType === 'update') {
        // Find all users with this role and update their routes
        const roleName = change.fullDocument.name;
        await this.notifyUsersWithRole(roleName);
      }
    });
  }

  async notifyUserRouteUpdate(userId) {
    const routesService = new UserRoutesService(this.db);
    const newRoutes = await routesService.getUserRoutes(userId);
    
    // Send via WebSocket
    this.websocketService.sendToUser(userId.toString(), {
      type: 'ROUTES_UPDATED',
      data: newRoutes,
      timestamp: new Date()
    });
  }

  async notifyUsersWithRole(roleName) {
    const users = await this.db.collection('users').find({
      'roles.roleName': roleName,
      active: true
    }).toArray();

    for (const user of users) {
      await this.notifyUserRouteUpdate(user._id);
    }
  }
}
```

## Caching Strategy with MongoDB

```javascript
// Redis caching layer for MongoDB route data
class RouteCacheService {
  constructor(redis, db) {
    this.redis = redis;
    this.db = db;
    this.TTL = 300; // 5 minutes
  }

  async getUserRoutes(userId) {
    const cacheKey = `user_routes:${userId}`;
    
    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from MongoDB
    const routesService = new UserRoutesService(this.db);
    const routes = await routesService.getUserRoutes(userId);
    
    // Cache the result
    await this.redis.setex(cacheKey, this.TTL, JSON.stringify(routes));
    
    return routes;
  }

  async invalidateUserRoutes(userId) {
    await this.redis.del(`user_routes:${userId}`);
  }
}
```

This MongoDB-based implementation provides a robust, scalable foundation for dynamic route management with complete backend control over user access patterns, optimized for performance and real-time updates.