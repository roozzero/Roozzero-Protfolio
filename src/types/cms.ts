export interface CMSSyllabusItem {
  id: string;
  title: string;
  description: string;
  duration?: string;
}

export interface CMSClass {
  id: string;
  courseImage: string;
  courseName: string;
  instructor: string;
  price: string | number;
  description: string;
  sessions: number;
  status: "Published" | "Draft" | "Archived" | string;
  displayOrder?: number;
  tags?: string[];
  syllabus?: CMSSyllabusItem[];
  [key: string]: any;
}

export interface CMSGeneralSettings {
  websiteTitle?: string;
  websiteDescription?: string;
  academyLogo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  defaultFont?: string;
  enableDarkTheme?: boolean;
  maintenanceMode?: boolean;
  [key: string]: any;
}

export interface CMSFullConfig {
  classes?: CMSClass[];
  general?: CMSGeneralSettings;
  hero?: Record<string, any>;
  skills?: any[];
  projects?: any[];
  testimonials?: any[];
  aboutMe?: Record<string, any>;
  contact?: Record<string, any>;
  footer?: Record<string, any>;
  [key: string]: any;
}
