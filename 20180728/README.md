# graphql server test


## Install and Start

```
npm install
npm run build
npm run start
```

## Query
### curl

```
curl \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{ "query": "{ author(id: 1) { firstName lastName } }" }' \
  http://localhost:3100/api
```

### graphiql
works on dev mode

```
npm run dev
```

 - http://localhost:3100/api/graphiql

## Reference

https://blog.apollographql.com/4-simple-ways-to-call-a-graphql-api-a6807bcdb355
