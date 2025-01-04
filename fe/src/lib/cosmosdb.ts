import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient({
  endpoint: process.env.NEXT_PUBLIC_COSMOS_ENDPOINT!,
  key: process.env.NEXT_PUBLIC_COSMOS_KEY!,
});

const database = client.database("rag-pr");
// パーティションキーを owner_id に設定
const repoContainer = database.container("repositories");

export interface RepoSettings {
  id: string;
  owner_id: string;      // GitHubのオーナーID（パーティションキー）
  repo_id: number;
  full_name: string;     // "owner/repo" 形式
  is_enabled: boolean;
  review_style: "strict" | "friendly" | "casual";
  language: "en" | "ja";
  focus_areas: string[];
  created_at: Date;
  updated_at: Date;
}

export async function getRepoSettings(ownerId: string, repoId: number): Promise<RepoSettings | null> {
  try {
    // owner_id でパーティション分割されたデータにアクセス
    const { resource } = await repoContainer.item(repoId.toString(), ownerId).read();
    return resource;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getRepoSettingsByOwner(ownerId: string): Promise<RepoSettings[]> {
  try {
    // 特定のオーナーの全リポジトリ設定を取得
    const querySpec = {
      query: "SELECT * FROM c WHERE c.owner_id = @ownerId",
      parameters: [
        {
          name: "@ownerId",
          value: ownerId
        }
      ]
    };

    const { resources } = await repoContainer.items
      .query<RepoSettings>(querySpec)
      .fetchAll();
    
    return resources;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateRepoSettings(settings: Partial<RepoSettings>): Promise<RepoSettings> {
  if (!settings.owner_id) {
    throw new Error('owner_id is required');
  }

  const now = new Date();
  const item = {
    ...settings,
    updated_at: now,
  };

  // owner_id をパーティションキーとして使用
  const { resource } = await repoContainer.items.upsert(item);
  
  if (!isRepoSettings(resource)) {
    throw new Error('Invalid data structure received from database');
  }
  
  return resource;
}

function isRepoSettings(data: unknown): data is RepoSettings {
  if (!data || typeof data !== 'object') return false;
  
  const requiredFields: (keyof RepoSettings)[] = [
    'id',
    'owner_id',
    'repo_id',
    'full_name',
    'is_enabled',
    'review_style',
    'language',
    'focus_areas',
    'created_at',
    'updated_at'
  ];
  
  return requiredFields.every(field => field in data);
} 