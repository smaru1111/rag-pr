import { createHmac } from 'crypto';
import { sign } from 'jsonwebtoken';

export async function verifyGitHubWebhook(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const hmac = createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return signature === digest;
}

export async function getInstallationToken(installationId: number): Promise<string> {
  const appId = process.env.NEXT_PUBLIC_GITHUB_APP_ID;
  let privateKey = process.env.NEXT_PUBLIC_GITHUB_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error('GitHub App credentials not configured');
  }

  // 環境変数から読み込んだ秘密鍵の改行を処理
  privateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/^"(.*)"$/, '$1');

  try {
    // JWTの生成
    const jwt = sign(
      {
        iat: Math.floor(Date.now() / 1000) - 60,
        exp: Math.floor(Date.now() / 1000) + (10 * 60),
        iss: appId,
      },
      privateKey,
      { 
        algorithm: 'RS256'
      }
    );

    // インストールトークンの取得
    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API Error:', errorData);
      throw new Error(`Failed to get installation token: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('JWT signing error:', error);
    throw error;
  }
} 