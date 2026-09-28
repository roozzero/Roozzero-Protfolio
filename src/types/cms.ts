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
  shortDescription?: string;
  description: string;
  sessions: number;
  status: "Published" | "Draft" | "Archived" | string;
  displayOrder?: number;
  tags?: string[];
  syllabus?: CMSSyllabusItem[];
  [key: string]: any;
}

export interface CMSHeroConfig {
  badge: string;
  headline: string;
  animatedTexts: string[];
  heroImage: string;
  subtitle?: string;
  presetIndex?: number;
}

export interface CMSAboutCard {
  id: string;
  tag: string;
  badgeText: string;
  badgeIcon: string;
  statNumber: string;
  statSubtitle: string;
  footerLabel: string;
  footerValue: string;
}

export interface CMSAboutMeConfig {
  badge: string;
  title: string;
  bio: string;
  cvUrl: string;
  githubUrl: string;
  portraitImage: string;
  cards: CMSAboutCard[];
}

export interface CMSSkillItem {
  id: string;
  name: string;
  category: "frontend" | "backend" | "security" | string;
  percentage: number;
  levelBadge: string;
  description: string;
  icon?: string;
}

export interface CMSSkillsConfig {
  badge: string;
  title: string;
  description: string;
  skills: CMSSkillItem[];
}

export interface CMSProjectItem {
  id: string;
  tabLabel: string;
  title: string;
  badge: string;
  description: string;
  coverImage: string;
  tags: string[];
  liveDemoUrl: string;
  githubUrl: string;
  isPreviewDisabled?: boolean;
  previewDisabledNotice?: string;
}

export interface CMSProjectsConfig {
  badge: string;
  title: string;
  description: string;
  projects: CMSProjectItem[];
}

export interface CMSClassesConfig {
  badge: string;
  title: string;
  description: string;
  classes: CMSClass[];
}

export interface CMSTestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  course: string;
  rating: number;
  avatar: string;
  avatarBg?: string;
  text: string;
  highlight: string;
  roiStat?: string;
  location?: string;
}

export interface CMSStatItem {
  id: string;
  value: string;
  label: string;
}

export interface CMSTestimonialsConfig {
  badge: string;
  title: string;
  description: string;
  stats: CMSStatItem[];
  testimonials: CMSTestimonialItem[];
}

export interface CMSContactConfig {
  badge: string;
  title: string;
  description: string;
  email: string;
  phone?: string;
  location?: string;
  telegramUrl: string;
  instagramUrl: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface CMSFooterConfig {
  animatedWords: string[];
  brandName: string;
  tagline: string;
  copyright: string;
}

export interface CMSFullConfig {
  hero: CMSHeroConfig;
  aboutMe: CMSAboutMeConfig;
  skills: CMSSkillsConfig;
  projects: CMSProjectsConfig;
  classes: CMSClass[];
  classesHeader?: {
    badge: string;
    title: string;
    description: string;
  };
  testimonials: CMSTestimonialsConfig;
  contact: CMSContactConfig;
  footer: CMSFooterConfig;
  general?: Record<string, any>;
  [key: string]: any;
}

