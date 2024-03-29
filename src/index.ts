/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { lainLaUpload, memberCashUpload, nostrBuildUpload, nostrImgUpload, voidCatUpload } from "./uploader";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
}

const Uploaders = [
  nostrBuildUpload,
  voidCatUpload,
  memberCashUpload,
  lainLaUpload,
  nostrImgUpload,
]

const AllowHosts = [
  "nostr.build",
  "void.cat",
  "member.cash",
  "pomf2.lain.la",
  "i.nostrimg.com",
]

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
}

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: CORS })
    }

    if (req.method === "POST") {
      return await handleUpload(req)
    }

    if (req.method == "PUT") {
      return await handleUpload(req)
    }

    if (req.method === "GET" && new URL(req.url).pathname === "/") {
      return new Response(null, {
        status: 307,
        headers: { location: "https://github.com/mdzz-club/media-uploader" },
      })
    }

    if (req.method === "GET") {
      return await handleGetImage(req)
    }

    return new Response(null, { status: 404 })
  },
};

async function handleUpload(req: Request) {
  const filename = req.headers.get("x-filename") || new URL(req.url).pathname.slice(1) || null
  const type = req.headers.get("x-mime-type")

  const blob = await req.blob()
  const fn = Uploaders[Math.floor(Uploaders.length * Math.random())]

  const str = await fn(blob, filename, type)

  const u = new URL(str)
  const cur = new URL(req.url)
  const target = new URL(u.host + u.pathname, cur.origin)

  return new Response(target.href, { headers: CORS })
}

async function handleGetImage(req: Request) {
  const url = new URL(req.url)
  const paramstr = url.pathname.slice(1)
  const [host, ...paths] = paramstr.split("/")

  if (!AllowHosts.includes(host)) {
    return new Response(null, { status: 404 })
  }
  const imgUrl = new URL(paths.join("/"), `https://${host}`)
  const origin = await fetch(imgUrl)

  const res = new Response(origin.body, {
    status: origin.status,
    headers: origin.headers,
  })
  res.headers.set("cache-control", "max-age=31536000")

  return res
}
