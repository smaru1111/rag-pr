export interface Repository {
  id: number;
  owner_id: string;      // GitHubのオーナーID
  repo_id: number;
  full_name: string;     // "owner/repo" 形式
  description: string | null;
  is_enabled: boolean;
  review_style: "strict" | "friendly" | "casual";
  language: "en" | "ja";
  focus_areas: string[];
  created_at: Date;
  updated_at: Date;
}