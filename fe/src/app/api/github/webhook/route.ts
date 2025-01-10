import { NextRequest, NextResponse } from 'next/server';
import { getInstallationToken, verifyGitHubWebhook } from '@/lib/github';
import { summarizePullRequest } from '@/lib/openai';
import { createPullRequestComment, getPullRequestDiff } from '@/app/api/utils/repository';

const BOT_NAME = 'rag-dev1111';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const isValid = await verifyGitHubWebhook(
      rawBody,
      signature || '',
      process.env.NEXT_PUBLIC_GITHUB_WEBHOOK_SECRET || ''
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 必要な場合は別途JSONとしてパース
    const body = JSON.parse(rawBody);

    // Issue commentイベントの処理
    if (body.action === 'created' && body.comment && body.issue.pull_request) {
      const commentBody = body.comment.body;
      
      // ボットへのメンションがある場合のみ処理
      if (commentBody.includes(`@${BOT_NAME}`)) {
        const { repository, issue } = body;
        
        // インストールトークンの取得
        const installationToken = await getInstallationToken(body.installation.id);
        
        // PRの差分を取得
        const diff = await getPullRequestDiff(
          installationToken,
          repository.owner.login,
          repository.name,
          issue.number
        );
        
        console.log('👀diff', diff);

        // GPT-4で要約を生成
        const summary = await summarizePullRequest(diff);

        console.log('👀summary', summary);

        // 要約をPRにコメント
        await createPullRequestComment(
          installationToken,
          repository.owner.login,
          repository.name,
          issue.number,
          `@${body.comment.user.login} PRの変更内容を要約しました：\n\n${summary}`
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 