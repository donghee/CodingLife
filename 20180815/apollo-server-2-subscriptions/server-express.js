const { ApolloServer, gql, PubSub } = require('apollo-server-express');
const http = require('http');
const express = require('express');
const { makeExecutableSchema } = require('graphql-tools');

const pubsub = new PubSub();
const SOMETHING_CHANGED_TOPIC = 'something_changed';

const typeDefs = gql`
  type Query {
    hello: String
  }
  type Subscription {
    newMessage: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'hello',
  },
  Subscription: {
    newMessage: {
      subscribe: () => pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC),
    },
  },
};


// const server = new ApolloServer({
//   schema: makeExecutableSchema({
//     typeDefs: typeDefs,
//     resolvers: resolvers
//   })
// });

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs: typeDefs,
    resolvers: resolvers
  }),
  subscriptions: {
    path: '/api/graphql',
    onConnect: (connectionParams, webSocket, context) => {
      console.log('connect...');
    },
    onDisconnect: (webSocket, context) => {
      console.log('disconnect...');
    },
  },
});

var app = express();
// server.applyMiddleware({ app });
server.applyMiddleware({ app, path: '/api/graphql' });

//publish events every second
setInterval(
  () =>
    pubsub.publish(SOMETHING_CHANGED_TOPIC, {
      newMessage: new Date().toString(),
    }),
  1000,
);

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 4000 }, () => {
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  console.log(`🚀 Subscriptions ready at ws://localhost:4000${server.subscriptionsPath}`);
});
