// Token utility functions
export function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}

export function getTokenExpiryTime(token: string): number | null {
  const decoded = decodeJwt(token);
  return decoded?.exp ? decoded.exp * 1000 : null; // Convert to ms
}

export function isTokenExpiringSoon(token: string, thresholdSeconds = 60): boolean {
  const expiryTime = getTokenExpiryTime(token);
  if (!expiryTime) return true;
  const now = Date.now();
  return expiryTime - now < thresholdSeconds * 1000;
}

export function isTokenExpired(token: string): boolean {
  const expiryTime = getTokenExpiryTime(token);
  if (!expiryTime) return true;
  return Date.now() >= expiryTime;
}

export function scheduleTokenRefresh(token: string, callback: () => void, bufferSeconds = 60): NodeJS.Timeout | null {
  const expiryTime = getTokenExpiryTime(token);
  if (!expiryTime) return null;
  
  const now = Date.now();
  const refreshTime = expiryTime - bufferSeconds * 1000;
  const delay = refreshTime - now;
  
  if (delay <= 0) {
    // Already expired or about to expire
    callback();
    return null;
  }
  
  console.log(`[Token] Scheduled refresh in ${Math.floor(delay / 1000)}s`);
  return setTimeout(callback, delay);
}
