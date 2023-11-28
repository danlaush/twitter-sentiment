# How angry is Twitter today?

A Node app for playing around with sentiment analysis. Works on AWS AI thing.

- [x] Cloudflare Workers AI 
- [x] basic sentiment analysis endpoint
- [ ] ~~twitter API - get recent tweets from hashtag~~
- [x] reddit API - get recent posts and top comments from subreddit
- [x] tie it all together
- [ ] cache results in KV, use if present


## Development

```
pnpm start
```

## Deployment

```
npx wrangler deploy
```