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

// ユーザーの質問情報を取得
export async function getUserQuestionInfo(userId: string): Promise<{ count: number, lastUpdated: string } | null> {
  try {
    // まずユーザーIDで直接検索
    const { resources } = await entitiesContainer.items.query({
      query: "SELECT * FROM c WHERE c.type = 'user_question_count' AND c.user_id = @userId",
      parameters: [
        { name: "@userId", value: userId }
      ]
    }).fetchAll();
    
    if (resources.length === 0) {
      // IDでも検索
      const { resources: altResources } = await entitiesContainer.items.query({
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [
          { name: "@id", value: `user-question-${userId}` }
        ]
      }).fetchAll();
      
      if (altResources.length > 0) {
        return {
          count: altResources[0].count || 0,
          lastUpdated: altResources[0].lastUpdated
        };
      }
      return null;
    }
    
    return {
      count: resources[0].count || 0,
      lastUpdated: resources[0].lastUpdated
    };
  } catch (error) {
    console.error("質問情報取得エラー:", error);
    return null;
  }
}

// ユーザーの今日の質問回数を取得
export async function getUserQuestionsCount(userId: string): Promise<number> {
  try {
    const userInfo = await getUserQuestionInfo(userId);
    
    if (!userInfo) {
      return 0;
    }
    
    // 最終更新日が今日かチェック
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastUpdated = new Date(userInfo.lastUpdated);
    
    // 日付が変わっていれば0を返す（新しい日には質問回数リセット）
    if (lastUpdated < today) {
      return 0;
    }
    
    return userInfo.count;
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
    const today = new Date();
    const userInfo = await getUserQuestionInfo(userId);
    
    // 今日の日付
    today.setHours(0, 0, 0, 0);
    
    let count = 1; // デフォルトは1（初回の質問）
    
    if (userInfo) {
      const lastUpdated = new Date(userInfo.lastUpdated);
      
      // 最終更新日が今日なら質問回数を増やす、そうでなければリセット
      if (lastUpdated >= today) {
        count = userInfo.count + 1;
      }
    }
    
    const item = {
      id: `user-question-${userId}`,
      type: 'user_question_count',
      user_id: userId,
      count: count,
      lastUpdated: new Date().toISOString()
    };
    
    await entitiesContainer.items.upsert(item);
    return true;
  } catch (error) {
    console.error("質問記録エラー:", error);
    return false;
  }
} 