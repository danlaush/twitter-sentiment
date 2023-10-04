
import { Buffer } from 'node:buffer';
const atob = (ascii: String) => Buffer.from(ascii).toString('base64');
const USER_AGENT = 'DanlaushApiTest'

type RedditTopApiResponse = {
	data: {
		children: Array<RedditApiPost>
	}
}

type RedditApiPost = {
	data: RedditPost;
}

type RedditData = Array<RedditPost>;

type RedditPost = {
	id: number;
	title: string;
	selftext?: string;
	permalink: string;
	url: string;
}

type RedditComment = {
	id: number;
	text: string;
}

/**
 * Gets the top 10 posts from the data and the top 10 comments on each post
 * @param env 
 */
export default async function getRedditData(env:any):Promise<RedditData> {

	console.log('[debug] getRedditData()')
	const bearerToken = await getBearerToken(env.REDDIT_CLIENT_ID, env.REDDIT_CLIENT_SECRET)
	
	try {
		const topPosts = await redditOauthApiRequest(`/r/CasualUK/top?t=day`, bearerToken);
		
		const postComments = await Promise.all(topPosts.data.children.map(async ({data: {id}}) => getCommentsForPost(id, bearerToken)))

		// console.log('success?', JSON.stringify(res, null, 2))
	} catch (error) {
		console.error('error fetching posts', error)
	}
	
}

async function getCommentsForPost(postId:number, bearerToken:string):Promise<Array<RedditComment>> {
	
	return []
}

async function getBearerToken(clientId:string, clientSecret:string):Promise<string> {
	var myHeaders = new Headers();
	// const basicAuth = atob(`${clientId}:${clientSecret}`);
	// console.log('basic auth', {
	// 	computed: basicAuth,
	// 	providedByPostman: 'WUhVWFNCMzd0Rm1id2NHSjE2c1Q0dzpzRzg5MlZFSHFMQkMtRXlsOGhXVzJKOWkzQllyUkE='
	// })
	// WUhVWFNCMzd0Rm1id2NHSjE2c1Q0dzpzRzg5MlZFSHFMQkMtRXlsOGhXVzJKOWkzQllyUkE=
	myHeaders.append('Authorization', `Basic WUhVWFNCMzd0Rm1id2NHSjE2c1Q0dzpzRzg5MlZFSHFMQkMtRXlsOGhXVzJKOWkzQllyUkE=`);
	myHeaders.append('User-Agent', USER_AGENT)

	var formdata = new FormData();
	formdata.append('grant_type', 'client_credentials');

	var requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: formdata,
	};

	try {
		const token = await fetch('https://www.reddit.com/api/v1/access_token', requestOptions)
			.then(resOk)
			.then(async (response) => await response.json())
			.then(res => res.access_token)
		return token
	} catch (error) {
		console.error('Error fetching access token', error)
		return 'no_token'
	}
}

async function redditOauthApiRequest(endpoint:string, bearerToken:string) {
	try {
		const headers = new Headers()
		headers.append('Authorization', `Bearer ${bearerToken}`)
		headers.append('User-Agent', USER_AGENT)
		const res:RedditApiResponse = await fetch(`https://oauth.reddit.com${endpoint}`, {
			headers,
		}).then(resOk).then(res => res.json())
		// console.log('success?', JSON.stringify(res, null, 2))
		return res;
	} catch (error) {
		console.error('Failed to fetch from reddit', error)
	}
}

function resOk(response: Response) {
	if(!response.ok) {
		throw new Error(`Response not ok: ${response.status}, ${response.statusText}`)
	}
	return response
}
