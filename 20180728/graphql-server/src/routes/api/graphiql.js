// @flow
import { graphiqlExpress } from 'graphql-server-express';

export default graphiqlExpress({
  endpointURL: '/api',
  query: 'query Author \{\n  author(id: 1) {\n    firstName\n    lastName\n  }\n}'
})
