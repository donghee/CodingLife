import { Router } from 'express';

const apiRouter = Router();

// graphql indspector
import graphiql from './graphiql';

const IS_PROD = (process.env.NODE_ENV === 'production')
if (!IS_PROD) {
  apiRouter.use('/graphiql', graphiql)
}

import graphql from './graphql';
apiRouter.use('/', graphql);

export default apiRouter;
