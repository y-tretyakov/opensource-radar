export interface GitHubOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubLicense {
  spdx_id: string;
}

export interface GitHubRepo {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
  pushed_at: string;
  topics: string[];
  owner: GitHubOwner;
  license: GitHubLicense | null;
  size: number;
}

export interface GitHubSearchResponse {
  total_count: number;
  items: GitHubRepo[];
}

export interface FilterState {
  topic: string;
  starsFrom: number;
  starsTo: number;
  days: number;
  language: string;
  sort: string;
  order: 'asc' | 'desc';
  perPage: number;
}

export type ViewMode = 'grid' | 'list';
