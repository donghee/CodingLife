const { ApolloServer, gql, PubSub } = require('apollo-server-express');
const http = require('http');
const express = require('express');

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

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

var app = express();
//server.applyMiddleware({ app });
server.applyMiddleware({ app, path: '/' });

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
});
