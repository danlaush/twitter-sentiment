#!/usr/bin/env python
# encoding: utf-8
from dotenv import load_dotenv
import json
from twitter_client import get_tweets_for_search
from flask import Flask, jsonify, request
from flask_caching import Cache
from sentiment_analysis import analyze_sentiment_of_tweets, calculate_score
load_dotenv()
app = Flask(__name__)

app.config.from_mapping({
    "DEBUG": False,  # run app in debug mode
    "CACHE_TYPE": "SimpleCache",  # Flask-Caching related configs
    "CACHE_DEFAULT_TIMEOUT": 300
})

cache = Cache(app)

@app.route('/')
def root():
  return app.send_static_file('index.html')


@app.route('/api/analyzeSentiment', methods=['GET'])
@cache.cached()
def apiAnalyzeSentiment():
    search = request.args.get('search')
    tweets = get_tweets_for_search(search)
    tweets_analyzed = analyze_sentiment_of_tweets(tweets, search)
    score = calculate_score(tweets_analyzed)
    print('search', search, 'score', score)
    return jsonify({'search': search, 'score': score, 'tweets': tweets_analyzed })

# app.run()


'''
- [x] Given provided hashtag
- [x] Fetch 100 tweets
- [x] Analyze sentiment of tweets
- [x] Process sentiments into score
- [x] Return score
'''
