
import { Buffer } from 'node:buffer';
const atob = (ascii) => Buffer.from(ascii).toString('base64');
const USER_AGENT = 'DanlaushApiTest'

/**
 * Gets the top 10 posts from the data and the top 10 comments on each post
 */
export default async function getRedditData(env, subreddit = 'CasualUK') {
	console.log('[debug] getRedditData()', subreddit)
	const bearerToken = await getBearerToken(env.REDDIT_CLIENT_ID, env.REDDIT_CLIENT_SECRET)
	
	let topPosts = []
	try {
		topPosts = await getTopPosts(subreddit, bearerToken);

	} catch (error) {
		console.error('error fetching top posts', error)
	}

	let comments = []
	try {
		comments = (await Promise.all(
			topPosts.map(post => 
				getCommentsForPost(subreddit, post.id, bearerToken)
			)
		)).flat()
		console.log('got the comments')
	} catch (error) {
		console.error('Failed to get comments for', subreddit, error)
	}

	return [
		// this is a monstrosity - flatten/inline the title and optional
		// selftext from each post into the return array
		...topPosts.map(p => ([p.title, ...(p.selftext ? [p.selftext] : [])])).flat(),
		...comments,
	]
}

async function getTopPosts(subreddit, bearerToken) {
	const res = await redditOauthApiRequest(`/r/${subreddit}/top?t=day&limit=10`, bearerToken);
	return res.data.children.map(({data}) => ({
		id: data.id,
		title: data.title,
		selftext: data?.selftext,
	}))
}

async function getCommentsForPost(subreddit, postId, bearerToken) {
	try {
		
		const params = new URLSearchParams({
			sort: 'top',
			limit: 10,
			depth: 0,
			context: 0,
			threaded: false,
			showmedia: false,
			showmore: false,
			showtitle: false,
			showedits: false,
		})
		const res = await redditOauthApiRequest(`/r/${subreddit}/comments/${postId}?${params.toString()}`, bearerToken)
		const comments = res[1].data.children.map(comment => comment.data.body)
		return comments
	} catch (error) {
		console.error('Failed to fetch comments for post', postId, error)
		return []
	}
}

async function getBearerToken(clientId, clientSecret) {
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

async function redditOauthApiRequest(endpoint, bearerToken) {
	// console.log('[debug] redditOauthApiRequest()', endpoint)
	try {
		const headers = new Headers()
		headers.append('Authorization', `Bearer ${bearerToken}`)
		headers.append('User-Agent', USER_AGENT)
		const res = await fetch(`https://oauth.reddit.com${endpoint}`, {
			headers,
		}).then(resOk).then(res => res.json())
		// console.log('success?', JSON.stringify(res, null, 2))
		return res;
	} catch (error) {
		console.error('Failed to fetch from reddit', error)
	}
}

function resOk(response) {
	if(!response.ok) {
		console.log('response', JSON.stringify(response, null, 2))
		throw new Error(`Response not ok: ${response.status}, ${response.statusText}`)
	}
	return response
}
