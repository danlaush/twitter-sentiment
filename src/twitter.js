// const searchEndpoint = "https://api.twitter.com/2/tweets/search/recent"


const searchEndpoint = "https://api.twitter.com/1.1/search/tweets.json?q=%23superbowl&result_type=recent"

/**
 * Twitter API client
 */
const twitter = {
    fetch: async function(search, env) {
        const bearerToken = env.TWITTER_BEARER_TOKEN
        
        try {
            
            const res = await fetch(searchEndpoint, {
                headers: {
                    Authorization: `Bearer Token ${bearerToken}`,
                }
            })
            const json = await res.json()
            console.log('got some json?', JSON.stringify(json, null, 2))

        } catch (error) {
            console.log('error fetching from twitter', error)
        }


        console.log('searching twitter for', search)
        return {
            text: 'found ' + search
        }
    }
}

export default twitter
