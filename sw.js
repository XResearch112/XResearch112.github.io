/* 科研工作台 Service Worker
   策略说明：
   - 页面导航：网络优先，断网时回退缓存（保证每次打开都是最新版，避免旧缓存困扰）
   - CDN 静态库（pdf.js/mammoth/chart.js 等）与图标：缓存优先，离线可用
   - 数据库/存储 API 请求：完全不拦截，保持实时性 */
const CACHE = "wbench-v4";
const CDN = /jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com/;

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    try {
      const c = await caches.open(CACHE);
      await c.addAll(["offline.html", "icon-192.png", "icon-512.png", "manifest.webmanifest"]);
    } catch (err) { /* 预缓存失败不阻塞安装 */ }
    self.skipWaiting();
  })());
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }

  // 页面导航：网络优先
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        try {
          const c = await caches.open(CACHE);
          c.put(req, res.clone());
        } catch (err) {}
        return res;
      } catch (err) {
        const hit = await caches.match(req);
        if (hit) return hit;
        try {
          const off = await caches.match("offline.html");
          if (off) return off;
        } catch (e2) {}
        return new Response("离线中，请检查网络", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }

  // CDN 静态库 / 图标 / manifest：缓存优先
  const cacheable = CDN.test(url.hostname) || /\.(png|webmanifest|svg|ico|woff2?)$/.test(url.pathname);
  if (cacheable) {
    e.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        try {
          const c = await caches.open(CACHE);
          c.put(req, res.clone());
        } catch (err) {}
        return res;
      } catch (err) {
        return new Response("", { status: 504 });
      }
    })());
  }
  // 其余（同源 API、签名下载 URL 等）不拦截，走默认网络
});

/* —— 系统级消息通知 —— */
// 页面把通知转交给 SW 弹出（安卓 PWA 后台只有 SW 能弹系统通知）
self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type !== "notify" || !d.title) return;
  const payload = Object.assign({}, d.payload || {}, { data: { jump: d.jump || "" } });
  self.registration.showNotification(d.title, payload).catch(() => {});
});

// 点击通知：已开窗口就聚焦并切到对应页签，否则新开
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const jump = (e.notification.data && e.notification.data.jump) || "";
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const target = all.find(c => c.url.includes("sharecode=M445EZVXJS")) || all[0];
    if (target) {
      await target.focus();
      target.postMessage({ type: "notif-jump", jump });
    } else {
      await self.clients.openWindow("./?sharecode=M445EZVXJS" + (jump ? "#tab=" + jump : ""));
    }
  })());
});
