const SESSION_COOKIE_NAME = 'quotakeeper_session';
const TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function stringToBase64Url(str: string): string {
  const enc = new TextEncoder();
  return uint8ArrayToBase64Url(enc.encode(str));
}

function base64UrlToString(base64Url: string): string {
  const bytes = base64UrlToUint8Array(base64Url);
  const dec = new TextDecoder();
  return dec.decode(bytes);
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export function getAuthSecret(): string {
  const secret = process.env.QUOTAKEEPER_PASSWORD || process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error('QUOTAKEEPER_PASSWORD is not configured in environment');
  }
  return secret;
}

export async function createSessionToken(secret: string): Promise<string> {
  const payload = JSON.stringify({
    authenticated: true,
    exp: Date.now() + TOKEN_MAX_AGE_SECONDS * 1000,
    created: Date.now(),
  });
  const b64Payload = stringToBase64Url(payload);

  const key = await getHmacKey(secret);
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(b64Payload));
  const b64Sig = uint8ArrayToBase64Url(new Uint8Array(signatureBuffer));

  return `${b64Payload}.${b64Sig}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  try {
    if (!token || !secret) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [b64Payload, b64Sig] = parts;
    const key = await getHmacKey(secret);
    const enc = new TextEncoder();
    const sigBytes = base64UrlToUint8Array(b64Sig);

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes.buffer.slice(sigBytes.byteOffset, sigBytes.byteOffset + sigBytes.byteLength) as ArrayBuffer,
      enc.encode(b64Payload)
    );

    if (!valid) return false;

    const payloadJson = base64UrlToString(b64Payload);
    const payload = JSON.parse(payloadJson);

    if (!payload.authenticated) return false;
    if (payload.exp && Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export { SESSION_COOKIE_NAME, TOKEN_MAX_AGE_SECONDS };
