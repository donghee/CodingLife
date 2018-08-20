import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloLink, split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { BrowserRouter } from 'react-router-dom'
import { AUTH_TOKEN } from './constants'
import { setContext } from 'apollo-link-context'

import { Link, Route, Redirect } from 'react-router-dom'
import Login from './Login'
import App from './App';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
    //connectionParams: {
       //authToken: localStorage.getItem(AUTH_TOKEN),
    //},
    // connectionParams() {
    //   return {
    //     authToken: localStorage.getItem(AUTH_TOKEN),
    //   }
    // },
    connectionParams() {
      const token = localStorage.getItem(AUTH_TOKEN)
      return {
        authorization: token ? `Bearer ${token}` : '',
      }
    },
  },
});

const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return (
      kind === 'OperationDefinition' && operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

const link = ApolloLink.from([terminatingLink]);

const cache = new InMemoryCache();

const client = new ApolloClient({
  link,
  cache,
});


ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      {/* <App /> */}
      <Route exact path="/" component={App} />
      <Route path="/login" component={Login} />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root'),
);
