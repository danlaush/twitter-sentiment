/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import getRedditData from './reddit'
import analyzeContent from './sentiment'
import { HTTPException } from 'hono/http-exception'

const app = new Hono()

// app.get('/', (c) => c.text('Hono!'))
app.get('/', serveStatic({ path: './index.html' }));
app.get('/index.css', serveStatic({ path: './index.css' }));
app.get('/sentiment', async ({req, env}) => {
	try {
		// get subreddit to analyse
		const search = req.query('search')
		if(!search) {
			return
		}
		// get data for subreddit
		const redditData = await getRedditData(env, search)

		const analyzedContent = await analyzeContent(env, redditData)

		const countPositive = analyzedContent.filter(c => c.sentiment === 'NEGATIVE').length
		const score = countPositive / analyzedContent.length

		return new Response(JSON.stringify({
			search,
			score,
			content: analyzedContent
		}))
	} catch (error) {
		const errorResponse = new Response(`Failed to analyse sentiment: ${error}`, {
			status: 500,
			
		  })
		throw new HTTPException(500, { res: errorResponse })
	}
})
// app.get('/api', async ({req: { raw: request }, env}) => {
// 	const ai = new Ai(env.AI);

//     const response = await ai.run('@cf/huggingface/distilbert-sst-2-int8', {
//         text: "Been anxiously waiting to hear from son all week at freshers week. Sends update on peanut butter situation"
//     });

//     return new Response(JSON.stringify(response));
// })
// app.get('/reddit', async (c, env) => {
//     // extract query
// 	const search = c.req.query('search')
// 	if(!search) {
// 		throw new Error('No search value provided')
// 	}
//     // request from twitter module
//     const res = await getRedditData(env)
//     // return result
//     return new Response(JSON.stringify({what: 'hello'}))
// })

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
