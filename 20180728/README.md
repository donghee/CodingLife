# graphql server test

## Install and Start

```
npm install
npm run build
npm run start
```

## GraphQL


### Query

HTTP GET or POST

```
# GET
curl -g -GET 'http://localhost:3100/api?query=query+{author(id:1){firstName+lastName+posts+{votes}}}'

# POST
curl \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{ "query": "{ author(id: 1) { firstName lastName posts { votes } } }" }' \
  http://localhost:3100/api

```

## Mutation

HTTP POST
```
curl \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{ "query": "mutation { upvotePost(postId: 1) { id votes } }" }' \
  http://localhost:3100/api
```

### GraphQL playground: graphiql

works on dev mode

```
npm run dev
```

 - http://localhost:3100/api/graphiql

## Reference

https://blog.apollographql.com/4-simple-ways-to-call-a-graphql-api-a6807bcdb355
