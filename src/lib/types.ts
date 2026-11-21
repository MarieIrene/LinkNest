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
};

export type PublicLink = { id: string; title: string; url: string; platform: string };
