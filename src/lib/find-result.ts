import crypto from "node:crypto";

/**
 * 复刻 APK 中 oo0oO0.FindResult 的配置解密:
 * 1. 明文 JSON 直接返回
 * 2. `[A-Za-z0]{8}**` 标记 + Base64
 * 3. 带 `;pk;` 密码时 AES/ECB/PKCS7 解密
 */
export function findResult(raw: string, pk?: string | null): string | null {
  const text = raw.trim();
  if (!text) return null;
  try {
    JSON.parse(text);
    return text;
  } catch {
    /* 继续解密 */
  }
  try {
    const marker = text.match(/[A-Za-z0]{8}\*\*/);
    const body = marker ? atob(text.slice(text.indexOf(marker[0]) + 10)) : text;
    if (body.startsWith("2423")) return decrypt2423(body);
    if (pk) {
      try {
        JSON.parse(body);
        return body;
      } catch {
        /* 需要 AES 解密 */
      }
      const key = Buffer.from(padKey(pk));
      const decipher = crypto.createDecipheriv("aes-128-ecb", key, null);
      decipher.setAutoPadding(true);
      return Buffer.concat([decipher.update(Buffer.from(body, "base64")), decipher.final()]).toString("utf8");
    }
    try {
      JSON.parse(body);
      return body;
    } catch {
      return body;
    }
  } catch {
    return null;
  }
}

function padKey(k: string): string {
  const t = k.trim();
  return t.length >= 16 ? t.slice(0, 16) : t + "0".repeat(16 - t.length);
}

function hexToBytes(hex: string): Buffer {
  return Buffer.from(hex, "hex");
}

/** 2423...2324 自定义头尾格式, 密钥藏在尾部 `$#key#$` 标记内 */
function decrypt2423(body: string): string | null {
  try {
    const lower = body.toLowerCase();
    const keyStart = lower.indexOf("$#") + 2;
    const keyEnd = lower.indexOf("#$", keyStart);
    if (keyStart < 2 || keyEnd < 0) return null;
    const key = body.slice(keyStart, keyEnd);
    const iv = body.slice(body.length - 13, body.length - 3);
    const cipherText = body.slice(body.indexOf("2324") + 4, body.length - 26);
    const decipher = crypto.createDecipheriv("aes-128-cbc", Buffer.from(padKey(key)), Buffer.from(iv));
    decipher.setAutoPadding(true);
    return Buffer.concat([decipher.update(hexToBytes(cipherText)), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
