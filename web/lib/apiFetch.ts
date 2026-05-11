// Adds ngrok-skip-browser-warning header so ngrok free tier doesn't intercept API calls
// with its interstitial warning page. This header is harmless on real production servers.
export function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      'ngrok-skip-browser-warning': '1',
      ...options?.headers,
    },
  });
}
