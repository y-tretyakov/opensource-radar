import type { ScoreBreakdown, Badge, ProjectClassification } from '../features/scoring/types'

export interface EnrichedRepository {
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
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  license: { spdx_id: string } | null;
  size: number;
  subscribers_count: number;
  open_issues_count: number;
  has_issues: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  archived: boolean;
  disabled: boolean;
  fork: boolean;
  default_branch: string;
  homepage: string | null;
  _ageDays: number;
  _growthPerDay: number;
  _weeklyGrowth: number;
  _trend: string;
  _activity: string;
  _score: number;
  _scoreBreakdown: ScoreBreakdown;
  _badges: Badge[];
  _classification: ProjectClassification;
  _scoreDescription: string;
  _trendLabel: string;
  _trendIcon: string;
}

export interface RadarState {
  view: 'grid' | 'list';
  page: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  repositories: EnrichedRepository[];
  tracked: Set<string>;
}

export type { ScoreBreakdown, Badge, ProjectClassification }
