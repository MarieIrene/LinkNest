export type DashboardLink = {
  id: string;
  title: string;
  url: string;
  platform: string;
  isActive: boolean;
  clicks: number;
  position: number;
};

export type DashboardProfile = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  views: number;
  cardTaps: number;
  suspended: boolean;
  jobTitle: string | null;
  company: string | null;
  phone: string | null;
  whatsapp: string | null;
  publicEmail: string | null;
  location: string | null;
  contactSaves: number;
};

export type DashboardCard = {
  id: string;
  code: string;
  type: string;
  status: string;
  taps: number;
  lastTapAt: string | null;
};

export type PublicLink = { id: string; title: string; url: string; platform: string };
