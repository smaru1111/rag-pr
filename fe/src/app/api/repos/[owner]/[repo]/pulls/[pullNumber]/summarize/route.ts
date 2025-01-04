import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getPullRequestDiff, createPullRequestComment } from '@/app/api/utils/repository';
import { summarizePullRequest } from '@/lib/openai';

export async function POST(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string; pullNumber: string } }
) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { owner, repo, pullNumber } = params;

    // PRの差分を取得
    const diff = await getPullRequestDiff(token, owner, repo, parseInt(pullNumber));
    
    // GPT-4で要約を生成
    const summary = await summarizePullRequest(diff);
    
    // 要約をPRにコメント
    await createPullRequestComment(token, owner, repo, parseInt(pullNumber), summary);
    
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Error summarizing pull request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 