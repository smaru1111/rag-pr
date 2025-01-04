import { headers } from "next/headers";

export async function getApiBaseUrl() {
  const headersList = await headers();
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const host = headersList.get("host");
  if (!host) {
    throw new Error("Host header not found");
  }
  return `${protocol}://${host}`;
}

export async function fetchWithAuth(path: string, accessToken: string) {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response;
} 