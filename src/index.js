/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Ai } from '@cloudflare/ai'
import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import getRedditData from './reddit'

const app = new Hono()

// app.get('/', (c) => c.text('Hono!'))
app.get('/', serveStatic({ path: './index.html' }));
app.get('/api', async ({req: { raw: request }, env}) => {
    if(!env) {
        throw new Error('Missing env binding');
    }
    const ai = new Ai(env.AI);

    const response = await ai.run('@cf/huggingface/distilbert-sst-2-int8', {
        text: "get tae fuck ye absolute numpty"
    });

    return new Response(JSON.stringify(response));
})
app.get('/reddit', async (c, env) => {
    // extract query
	// const search = c.req.query('search')
	// if(!search) {
	// 	throw new Error('No search value provided')
	// }
    // request from twitter module
    const res = await getRedditData(env)
    // return result
    return new Response(JSON.stringify({what: 'hello'}))
})

export default app;

// export interface Env {
// 	AI: any;
// 	TWITTER_BEARER_TOKEN: String;

// 	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
// 	// MY_KV_NAMESPACE: KVNamespace;
// 	//
// 	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
// 	// MY_DURABLE_OBJECT: DurableObjectNamespace;
// 	//
// 	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
// 	// MY_BUCKET: R2Bucket;
// 	//
// 	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
// 	// MY_SERVICE: Fetcher;
// 	//
// 	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
// 	// MY_QUEUE: Queue;
// }
