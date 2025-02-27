import { fetchWithAuth } from "@/utils/api-client";

export async function fetchRemainingQuestions(accessToken: string) {
  try {
    const response = await fetchWithAuth('/api/questions/remaining', accessToken, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('質問回数取得に失敗しました');
    }
    
    const data = await response.json();
    return data.remaining;
  } catch (error) {
    console.error('残り質問回数取得エラー:', error);
    return null;
  }
} 