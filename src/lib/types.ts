export type DashboardLink = {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  clicks: number;
  position: number;
};

export type DashboardProfile = {
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  views: number;
};

export type PublicLink = { id: string; title: string; url: string };
