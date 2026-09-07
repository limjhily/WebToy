/* ─────────────────────────────────────────────
   codec.js — 카드 데이터를 URL 해시로 넣고 빼는 모듈
   서버가 없기 때문에 카드의 모든 내용은 링크 자체에 담긴다.
   JSON → (deflate-raw 압축) → base64url
   ───────────────────────────────────────────── */
(function (g) {
  'use strict';

  const CAN_ZIP = typeof CompressionStream === 'function' &&
                  typeof DecompressionStream === 'function';

  function b64urlEncode(bytes) {
    let s = '';
    const CH = 0x8000;
    for (let i = 0; i < bytes.length; i += CH) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    }
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function b64urlDecode(str) {
    const s = str.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(s + '==='.slice((s.length + 3) % 4));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function pipe(bytes, stream) {
    const rs = new Response(new Blob([bytes]).stream().pipeThrough(stream));
    return new Uint8Array(await rs.arrayBuffer());
  }

  /** 객체 → 링크에 붙일 문자열 */
  async function encode(obj) {
    const raw = new TextEncoder().encode(JSON.stringify(obj));
    if (CAN_ZIP) {
      try {
        return 'z' + b64urlEncode(await pipe(raw, new CompressionStream('deflate-raw')));
      } catch (e) { /* 압축 실패 시 원본 */ }
    }
    return 'r' + b64urlEncode(raw);
  }

  /** 링크 문자열 → 객체 (실패하면 null) */
  async function decode(str) {
    if (!str) return null;
    try {
      const tag = str[0], body = b64urlDecode(str.slice(1));
      let raw = body;
      if (tag === 'z') raw = await pipe(body, new DecompressionStream('deflate-raw'));
      else if (tag !== 'r') return null;
      return JSON.parse(new TextDecoder().decode(raw));
    } catch (e) {
      return null;
    }
  }

  g.Codec = { encode, decode };
})(window);
