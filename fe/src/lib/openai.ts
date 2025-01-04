import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function summarizePullRequest(diffContent: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'あなたはプログラマーのアシスタントです。Pull Requestの差分を要約してください。',
      },
      {
        role: 'user',
        content: `以下のPull Request差分を簡潔に要約してください：\n\n${diffContent}`,
      },
    ],
    max_tokens: 500,
  });

  return response.choices[0].message.content || '要約を生成できませんでした。';
} 