// Global declarations for data modules
declare module 'data/*' {
  const value: any;
  export default value;
  export const notifications: any;
  export const audienceChart: any;
  export const bounceRateChart: any;
  export const totalOrderChart: any;
  export const weeklySalesChart: any;
  export const topProducts: any;
  export const marketShareChart: any;
  export const realTimeUsers: any;
  export const salesByPos: any;
  export const totalSales: any;
  export const runningProjects: any;
  export const projectsTable: any;
  export const files: any;
  export const products: any;
  export const orders: any;
  export const customers: any;
  // Additional exports may exist
}

// Specific module declarations for commonly used ones
declare module 'data/dashboard/analytics' {
  export const audienceChart: any;
  export const bounceRateChart: any;
  export const topProducts: any;
  export const realTimeUsers: any;
  export const salesByPos: any;
  export const totalSales: any;
}

declare module 'data/dashboard/default' {
  export const files: any;
  export const products: any;
  export const runningProjects: any;
  export const projectsTable: any;
  export default any;
}

declare module 'data/notification/notification' {
  export const notifications: any;
  export default notifications;
}

declare module 'data/associations' {
  const associations: any[];
  export default associations;
}

declare module 'data/events/events' {
  const events: any[];
  export default events;
}

declare module 'data/experiences' {
  const experiences: any[];
  export default experiences;
}

declare module 'data/feed' {
  const feed: any[];
  export default feed;
}

declare module 'data/people' {
  const people: any[];
  export default people;
}

declare module 'data/activities' {
  const activities: any[];
  export default activities;
}

declare module 'data/dashboard/projectManagement' {
  export const runningProjects: any;
  export const projectsTable: any;
  export const totalOrderChart: any;
  export const weeklySalesChart: any;
  export default any;
}

declare module 'data/dashboard/saas' {
  export const marketShareChart: any;
  export const totalOrderChart: any;
  export const weeklySalesChart: any;
  export const topProducts: any;
  export default any;
}

declare module 'data/dashboard/crm' {
  export const totalOrderChart: any;
  export const weeklySalesChart: any;
  export const topProducts: any;
  export default any;
}

declare module 'data/dashboard/ecom' {
  export const totalOrderChart: any;
  export const weeklySalesChart: any;
  export const topProducts: any;
  export default any;
}