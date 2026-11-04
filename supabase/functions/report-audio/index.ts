import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
const bytesToHex = (bytes: Uint8Array) => Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
async function digest(token: string) { return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)))); }

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!url || !anon || !service) return reply({ error: "Supabase secrets missing" }, 500);
    const admin = createClient(url, service);
    if (req.method === "POST") {
      const auth = req.headers.get("Authorization") || "";
      if (!auth.startsWith("Bearer ")) return reply({ error: "Teacher authentication required" }, 401);
      const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } });
      const { data: { user }, error: authError } = await userClient.auth.getUser();
      if (authError || !user) return reply({ error: "Invalid teacher session" }, 401);
      const { data: profile } = await admin.from("profiles").select("role,status").eq("id", user.id).maybeSingle();
      if (profile?.status !== "active" || !["teacher", "admin"].includes(profile.role)) return reply({ error: "Teacher access required" }, 403);
      const body = await req.json();
      if (!Array.isArray(body.items) || body.items.length > 60) return reply({ error: "Invalid items" }, 400);
      const links: Record<string, string> = {};
      const base = `${url}/functions/v1/report-audio`;
      for (const item of body.items) {
        if (!item || !["student", "question"].includes(item.kind) || typeof item.responseId !== "string") continue;
        const { data: response } = await admin.from("responses").select("id,question_id,recording_bucket,recording_path").eq("id", item.responseId).maybeSingle();
        if (!response) continue;
        let bucket: string | null = null, path: string | null = null, publicUrl: string | null = null;
        if (item.kind === "student") {
          bucket = response.recording_bucket || "speaking-recordings";
          path = response.recording_path;
          if (!path) continue;
        } else {
          if (!response.question_id) continue;
          const { data: question } = await admin.from("question_bank").select("audio_url").eq("id", response.question_id).maybeSingle();
          if (!question?.audio_url) continue;
          const raw = String(question.audio_url);
          // Only permit HTTPS URLs from this project's Supabase Storage or its configured public site.
          let parsed: URL;
          try { parsed = new URL(raw); } catch { continue; }
          const allowed = [new URL(url).hostname, "aspect-english.github.io"];
          if (parsed.protocol !== "https:" || !allowed.includes(parsed.hostname)) continue;
          publicUrl = parsed.href;
        }
        const token = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
        const tokenHash = await digest(token);
        const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
        const { error } = await admin.from("report_audio_links").insert({ token_hash: tokenHash, response_id: response.id, kind: item.kind, bucket, object_path: path, public_url: publicUrl, expires_at: expiresAt, created_by: user.id });
        if (error) throw error;
        links[`${response.id}:${item.kind}`] = `https://aspect-english.github.io/assesssment.com/audio-player.html#token=${token}`;
      }
      return reply({ links });
    }
    if (req.method !== "GET") return reply({ error: "Method not allowed" }, 405);
    const token = new URL(req.url).searchParams.get("token") || "";
    if (!/^[a-f0-9]{64}$/.test(token)) return reply({ error: "Invalid link" }, 400);
    const { data: link } = await admin.from("report_audio_links").select("kind,bucket,object_path,public_url,expires_at,revoked_at").eq("token_hash", await digest(token)).maybeSingle();
    if (!link || link.revoked_at || Date.parse(link.expires_at) <= Date.now()) return reply({ error: "音檔連結已過期或被撤銷" }, 410);
    // Present a dedicated mobile-friendly player instead of returning a bare audio stream.
    // The original token remains private to the report holder and is validated on every request.
    const requestUrl = new URL(req.url);
    if (requestUrl.searchParams.get("raw") !== "1") {
      const rawUrl = new URL(req.url);
      rawUrl.searchParams.set("raw", "1");
      const safeSrc = rawUrl.href.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
      const page = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TOEIC 錄音播放</title><style>body{margin:0;background:#16191f;color:#fff;font:16px system-ui;display:grid;place-items:center;min-height:100vh}.panel{width:min(92%,520px);background:#252b35;border-radius:18px;padding:24px;box-sizing:border-box}audio{width:100%;margin:22px 0}p{color:#c7ceda;line-height:1.6}a{color:#a5c8ff}#err{color:#ffb8b8}</style></head><body><main class="panel"><h2>學生錄音</h2><p>按下播放鍵聆聽錄音。若裝置不支援原始 WebM/Opus 格式，可下載後以支援的播放器開啟。</p><audio id="player" controls preload="metadata" playsinline src="${safeSrc}"></audio><p id="err" role="alert"></p><a href="${safeSrc}" download="toeic-recording">下載原始音檔</a></main><script>const a=document.getElementById('player');a.addEventListener('error',()=>{document.getElementById('err').textContent='無法播放：可能是原始音檔不存在、連結失效，或此裝置不支援音檔格式。請先嘗試下載。';});</script></body></html>`;
      return new Response(page, { headers: { ...cors, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "Content-Security-Policy": "default-src 'none'; media-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'" } });
    }
    if (link.public_url) {
      const parsed = new URL(link.public_url);
      if (parsed.protocol !== "https:" || ![new URL(url).hostname, "aspect-english.github.io"].includes(parsed.hostname)) return reply({ error: "Invalid audio host" }, 403);
      return Response.redirect(parsed.href, 302);
    }
    if (!link.bucket || !link.object_path) return reply({ error: "Audio not found" }, 404);
    const { data: audio, error } = await admin.storage.from(link.bucket).download(link.object_path);
    if (error || !audio) return reply({ error: "Audio unavailable" }, 404);
    const buffer = await audio.arrayBuffer();
    const size = buffer.byteLength;
    const mime = audio.type || (link.object_path.toLowerCase().endsWith(".mp3") ? "audio/mpeg" : link.object_path.toLowerCase().endsWith(".m4a") ? "audio/mp4" : "audio/webm");
    const headers = { ...cors, "Content-Type": mime, "Content-Disposition": "inline", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes" };
    const range = req.headers.get("Range");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
      const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2] || 0));
      const end = match[1] ? (match[2] ? Number(match[2]) : size - 1) : size - 1;
      if (!size || start >= size || end < start) return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
      const last = Math.min(end, size - 1);
      return new Response(buffer.slice(start, last + 1), { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${last}/${size}`, "Content-Length": String(last - start + 1) } });
    }
    return new Response(buffer, { status: 200, headers: { ...headers, "Content-Length": String(size) } });
  } catch (e) { console.error("report-audio error", e); return reply({ error: e instanceof Error ? e.message : "Unexpected error" }, 500); }
});
