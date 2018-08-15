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


