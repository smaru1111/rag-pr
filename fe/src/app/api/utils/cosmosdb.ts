import { CosmosClient } from "@azure/cosmos";
import { Repository } from "@/types/repository";
const client = new CosmosClient({
  endpoint: process.env.NEXT_PUBLIC_COSMOS_ENDPOINT!,
  key: process.env.NEXT_PUBLIC_COSMOS_KEY!,
});

const database = client.database("rag-pr");
// パーティションキーを owner_id に設定
const repoContainer = database.container("repositories");

export async function getRepositories(repoIds: number[]): Promise<Repository[]> {
  try {
    const { resources } = await repoContainer.items.query({
      query: "SELECT * FROM c WHERE ARRAY_CONTAINS(@repoIds, c.repo_id)",
      parameters: [
        {
          name: "@repoIds",
          value: repoIds
        }
      ]
    }).fetchAll();
    return resources;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateRepository(repository: Repository): Promise<Repository> {
  if (!repository.id) {
    throw new Error('id is required');
  }

  if (!isRepository(repository)) {
    throw new Error('Invalid data structure received from database');
  }
  
  const now = new Date();
  const item = {
    ...repository,
    id: (repository.id as number | string).toString(),
    updated_at: now,
  };
  const { resource } = await repoContainer.items.upsert(item);
  if (!resource) {
    throw new Error('Failed to update repository');
  }
  return resource as unknown as Repository;
}

export async function createRepository(repository: Repository): Promise<Repository> {
  if (!isRepository(repository)) {
    throw new Error('Invalid data structure received from database');
  }
  
  const now = new Date();
  const item = {
    ...repository,
    created_at: now,
    updated_at: now,
  };
  const { resource } = await repoContainer.items.upsert(item);
  if (!resource) {
    throw new Error('Failed to create repository');
  }
  return resource as unknown as Repository;
}

function isRepository(data: unknown): data is Repository {
  if (!data || typeof data !== 'object') return false;
  
  const requiredFields: (keyof Repository)[] = [
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