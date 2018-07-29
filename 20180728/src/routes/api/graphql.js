import { graphqlExpress } from 'graphql-server-express';

import schema from './schema'

export default graphqlExpress(req => {
  return {
    schema,
    context: {req}
  }
})
