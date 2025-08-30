// Type declarations for data/dashboard modules

declare module 'data/dashboard/analytics' {
  // Chart data types
  export const audienceChart: {
    users: number[][];
    sessions: number[][];
    rate: number[][];
    duration: number[][];
  };

  export const activeUsersChart: {
    mobile: number[];
    desktop: number[];
    tablet: number[];
  };

  export const bounceRate: number[];

  export const campaignTable: Array<{
    id: number;
    campaigns: string;
    cost: number;
    revenue: number;
  }>;

  export const campaignChart: {
    revenue: number[];
    clicks: number[];
  };

  export const stats: Array<{
    title: string;
    value: number | string;
    chartData: number[];
    grid: {
      right?: string;
      left?: string;
      bottom?: string;
      top?: string;
    };
  }>;

  export const realTimeUsers: Array<{
    page: string;
    count: number;
  }>;

  export const sessionByBrowser: Array<{
    icon: string;
    label: string;
    value: string;
    progress: boolean;
    caret: string;
    color: string;
    progressValue: string;
  }>;

  export const sessionByCountry: [string[], number[]];

  export const intelligence: Array<{
    title: string;
    icon: string;
    description: string;
  }>;

  export const topPagesTableData: Array<{
    id: number;
    path: string;
    views: number;
    time: string;
    exitRate: string;
  }>;
}

declare module 'data/dashboard/projectManagement' {
  export const greetingItems: Array<{
    title: string;
    text: string;
    icon: string;
    color: string;
  }>;

  export const projectUsers: Array<{
    id: number;
    img?: string;
    name?: string;
  }>;

  export const progressBar: Array<{
    id: number;
    amount: number;
    variant: string;
  }>;

  export const markers: Array<{
    id: number;
    lat: number;
    long: number;
    name: string;
    street: string;
    location: string;
  }>;

  export const managementEvents: Array<any>;
  export const membersActivities: Array<any>;
  export const recentActivities: Array<any>;
  export const membersInfo: Array<any>;
  export const discussionMembers: Array<any>;
}

declare module 'data/dashboard/ecom' {
  export const notifications: Array<{
    id: number;
    title: string;
    linkFor?: string;
    type?: string;
  }>;
}

declare module 'data/dashboard/default' {
  export const weather: {
    city: string;
    condition: string;
    precipitation: string;
    temperature: number;
    highestTemperature: number;
    lowestTemperature: number;
  };

  export const users: Array<{
    id: number;
    name: string;
    avatar: {
      src: string;
      size: string;
      status: string;
    };
    role: string;
  }>;
}

declare module 'data/dashboard/saas' {
  export const transactionSummary: Array<{
    id: number;
    img: string;
    title: string;
    subtitle: string;
    status: string;
    amount: string;
    date: string;
  }>;
}