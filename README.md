# How angry is Twitter today?

A Python+Flask app for playing around with sentiment analysis.

## Development

```
python3 application.py
```

## Deployment

```
az webapp up --runtime PYTHON:3.9 --sku B1 --logs --name danlaush-twitter-sentiment
```