from functools import total_ordering
from transformers import pipeline
from datetime import datetime

sentiment = pipeline('sentiment-analysis')

def analyze_sentiment_of_tweets(tweets, search):
  time_start = datetime.now()
  tweet_analysis = []
  for tweet in tweets:
    result = sentiment(tweet['text'])[0]
    id = tweet['id']
    label = result['label']
    score = result['score']
    analysis = {
      'id': id,
      'text': tweet['text'],
      'sentiment': label,
      'score': score
    }
    # print(f'Analysed tweet {id} {label} confidence {score}')
    if(score > 0.90):
      tweet_analysis.append(analysis)
    else:
      print('low confidence tweet', score, tweet['text'])
  percent_high_confidence_sentiments = len(tweet_analysis) / len(tweets) * 100
  time_end = datetime.now()
  time_taken = time_end - time_start
  print(f'Analysing {search} took {time_taken}. {percent_high_confidence_sentiments}% high confidence sentiments')
  return tweet_analysis

def calculate_score(tweets_analyzed):
  count_negative = 0
  for tweet in tweets_analyzed:
    if(tweet['sentiment'] == "NEGATIVE"):
        count_negative += 1
  percent = count_negative / len(tweets_analyzed)
  return percent

  '''
  score = {
    score: int
    counts: {
      positive: int,
      neutral: int,
      negative: int,
    }
  }

  10 total
  3 positive
  7 negative

  '''
