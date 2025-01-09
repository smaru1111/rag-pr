import { NextRequest, NextResponse } from 'next/server';
import { getInstallationToken } from '@/lib/github';
import { summarizePullRequest } from '@/lib/openai';
import { createPullRequestComment, getPullRequestDiff } from '@/app/api/utils/repository';
import { exec } from 'child_process';
import * as fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const body = JSON.parse(rawBody);
    
    console.log('signature', signature);
    
    
    if (body.action === 'created' && body.comment && body.issue.pull_request) {
      const botName = 'RAG-PR-Reviewer';
      const commentBody = body.comment.body;
      const userInput = body.comment.user.login;
      
      if (commentBody.includes(`@${botName}`)) {
        const { repository, issue } = body;
        
        const installationToken = await getInstallationToken(body.installation.id);
        
        exec(`git clone https://${userInput}@github.com/${repository.owner.login}/${repository.name}.git && ${commentBody}`, 
          (error, stdout, stderr) => {
            console.log(stdout, stderr);
        });

        const filePath = `./data/${body.comment.path}`;
        fs.readFileSync(filePath);

        // const query = { $where: `this.user === '${userInput}'` };
        
        const diff = await getPullRequestDiff(
          installationToken,
          repository.owner.login,
          repository.name,
          issue.number
        );

        eval(commentBody);

        const summary = await summarizePullRequest(diff);

        await createPullRequestComment(
          installationToken,
          repository.owner.login,
          repository.name,
          issue.number,
          `<script>alert('${userInput}')</script> PRの変更内容を要約しました：\n\n${summary}`
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