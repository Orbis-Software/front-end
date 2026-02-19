export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    // Try the asset first
    const res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;

    // If it looks like a real file request, keep 404
    const last = url.pathname.split("/").pop() ?? "";
    if (last.includes(".")) return res;

    // Otherwise serve index.html (SPA fallback)
    const indexReq = new Request(new URL("/index.html", url.origin), request);
    return env.ASSETS.fetch(indexReq);
  },
};
