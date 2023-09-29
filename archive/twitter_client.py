import requests
import os

bearer_token = os.environ.get("TWITTER_BEARER_TOKEN")

search_url = "https://api.twitter.com/2/tweets/search/recent"

def bearer_oauth(r):
  """
  Method required by bearer token authentication.
  """
  r.headers["Authorization"] = f"Bearer {bearer_token}"
  r.headers["User-Agent"] = "v2RecentSearchPython"
  return r


def connect_to_endpoint(url, params):
  response = requests.request("GET", url, auth=bearer_oauth, params=params)
  if response.status_code != 200:
    raise Exception(response.status_code, response.text)
  return response.json()

def get_tweets_for_search(search):
  # Optional params: start_time,end_time,since_id,until_id,max_results,next_token,
  # expansions,tweet.fields,media.fields,poll.fields,place.fields,user.fields
  query_params = {
    'query': f'{search} -is:retweet',
    'max_results': 100
  }
  print('search', search)
  json_response = connect_to_endpoint(search_url, query_params)
  return json_response['data']
