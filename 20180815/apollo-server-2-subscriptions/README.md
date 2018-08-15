# apollo-server 와 apollo-server-express 의 subscription 구현

15 Aug 2018

## apollo-server
 - code: server.js
 - endpoint http://localhost:4000
 - subscriptions 잘동작. 

## apollo-server-express
 - code: server-express.js
 - endpoint http://localhost:4000
 - subscriptions 잘동작. 

구현의 차이점 
apollo-server에httpServer Subscription Handlers 설치해야 apollo-server-express에서 subscription 이 잘동작. 
```
server.installSubscriptionHandlers(httpServer);
```

### apollo-server-express graphql url 수정

graphql playground: http://localhost:4000/api/graphql

graphql query mutation endpoint http://localhost:4000/api/graphql
graphql subscription endpoint http://localhost:4000/api/graphql


# 참고
 - https://github.com/rwieruch/fullstack-apollo-subscription-example/blob/master/server/src/index.js
