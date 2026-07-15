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
