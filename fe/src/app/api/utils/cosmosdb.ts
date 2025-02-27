import { CosmosClient } from "@azure/cosmos";
import { Collaborator, Repository } from "@/types/repository";
import { User } from "next-auth";

const client = new CosmosClient({
  endpoint: process.env.NEXT_PUBLIC_COSMOS_ENDPOINT!,
  key: process.env.NEXT_PUBLIC_COSMOS_KEY!,
});

const database = client.database("rag-pr");
// パーティションキーを type に設定
const entitiesContainer = database.container("entities");

export async function getRepositories(repoIds: number[]): Promise<Repository[]> {
  try {
    const { resources } = await entitiesContainer.items.query({
      query: "SELECT * FROM c WHERE c.type = 'repository' AND ARRAY_CONTAINS(@repoIds, c.repo_id)",
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

export async function updateRepository(repository: Repository, me: User): Promise<Repository> {
  if (!repository.id) {
    throw new Error('id is required');
  }

  if (!isRepository(repository)) {
    throw new Error('Invalid data structure received from database');
  }
  
  const collaborators = repository.collaborators || [];
  const registered_collaborators = repository.registered_collaborators || [];
  
  const me_collaborators: Collaborator | undefined = collaborators.find(
    collaborator => collaborator.id.toString() === me.id
  );
  const is_registered_collaborator = registered_collaborators.some(
    collaborator => collaborator.id.toString() === me.id
  );
  
  const now = new Date();
  const item: Repository & { type: string } = {
    ...repository,
    type: 'repository',
    id: repository.id,
    updated_at: now,
    collaborators: collaborators,
    registered_collaborators: is_registered_collaborator 
      ? registered_collaborators 
      : me_collaborators 
        ? [...registered_collaborators, me_collaborators]
        : registered_collaborators
  };
  const { resource } = await entitiesContainer.items.upsert(item);
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
  const { resource } = await entitiesContainer.items.upsert(item);
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
    'collaborators',
    'registered_collaborators',
    'created_at',
    'updated_at'
  ];
  
  return requiredFields.every(field => field in data);
}

// ユーザーの今日の質問回数を取得
export async function getUserQuestionsCount(userId: string): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { resources } = await entitiesContainer.items.query({
      query: "SELECT VALUE COUNT(1) FROM c WHERE c.type = 'question' AND c.user_id = @userId AND c.timestamp >= @today",
      parameters: [
        { name: "@userId", value: userId },
        { name: "@today", value: today.toISOString() }
      ]
    }).fetchAll();
    
    return resources[0] || 0;
  } catch (error) {
    console.error("質問回数取得エラー:", error);
    return 0;
  }
}

// ユーザーの残り質問回数を取得
export async function getRemainingQuestions(userId: string): Promise<number> {
  const MAX_QUESTIONS_PER_DAY = 5;
  const usedCount = await getUserQuestionsCount(userId);
  return Math.max(0, MAX_QUESTIONS_PER_DAY - usedCount);
}

// 質問履歴を記録
export async function recordUserQuestion(userId: string): Promise<boolean> {
  try {
    const item = {
      id: `question-${userId}-${Date.now()}`,
      type: 'question',
      user_id: userId,
      timestamp: new Date().toISOString()
    };
    
    await entitiesContainer.items.create(item);
    return true;
  } catch (error) {
    console.error("質問記録エラー:", error);
    return false;
  }
} 