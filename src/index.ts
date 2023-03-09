/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { memberCashUpload, nostrBuildUpload, voidCatUpload } from "./uploader";

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
]

export default {
	async fetch(req: Request): Promise<Response> {
		if (req.method !== "POST" && req.method !== "PUT") {
			return new Response(null, { status: 404 })
		}

		const filename = req.headers.get("x-filename") || new URL(req.url).pathname.slice(1) || null
		const type = req.headers.get("x-mime-type")

		const blob = await req.blob()
		const fn = Uploaders[Math.floor(Uploaders.length * Math.random())]

		const str = await fn(blob, filename, type)
		return new Response(str)
	},
};
