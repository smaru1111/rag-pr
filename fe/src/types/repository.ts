export interface Repository {
  id: string;
  owner_id: string;      // GitHubのオーナーID
  repo_id: number;
  full_name: string;     // "owner/repo" 形式
  name: string;
  description: string | null;
  is_enabled: boolean;
  review_style: "strict" | "friendly" | "casual";
  language: "en" | "ja";
  focus_areas: string[];
  created_at: Date;
  updated_at: Date;
  collaborators: Collaborator[];
  registered_collaborators: Collaborator[];
}

export interface Collaborator {
  id: number;
  login: string;
  avatar_url: string;
  role_name: string;
  permissions: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
}