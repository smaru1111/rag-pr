import { NextRequest, NextResponse } from 'next/server';
import { getInstallationToken, verifyGitHubWebhook } from '@/lib/github';
import { summarizePullRequest } from '@/lib/openai';
import { createPullRequestComment, getPullRequestDiff } from '@/app/api/utils/repository';
import { getRemainingQuestions, recordUserQuestion } from '@/app/api/utils/cosmosdb';

const BOT_NAME = process.env.NODE_ENV === 'production' ? 'rag-bot-prd' : 'rag-bot-dev';

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
        const userId = body.comment.user.id.toString();
        
        // 残り質問回数を確認
        const remainingQuestions = await getRemainingQuestions(userId);
        
        if (remainingQuestions <= 0) {
          // 質問回数が上限に達している場合
          await createPullRequestComment(
            await getInstallationToken(body.installation.id),
            repository.owner.login,
            repository.name,
            issue.number,
            `@${body.comment.user.login} 申し訳ありませんが、本日の質問回数上限（5回）に達しました。明日またお試しください。`
          );
          return NextResponse.json({ success: true });
        }
        
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

        // 質問回数を記録
        await recordUserQuestion(userId);
        
        // 残り質問回数を計算
        const newRemainingQuestions = remainingQuestions - 1;

        // 要約をPRにコメント
        await createPullRequestComment(
          installationToken,
          repository.owner.login,
          repository.name,
          issue.number,
          `@${body.comment.user.login} PRの変更内容を要約しました：\n\n${summary}\n\n（本日の残り質問回数: ${newRemainingQuestions}回）`
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