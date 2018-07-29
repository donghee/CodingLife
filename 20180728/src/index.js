const debug = require('debug')('api');

debug('Server starting...');
debug('logging with debug enabled!');

import { createServer } from 'http';
import express from 'express';

import { ApolloEngine } from 'apollo-engine';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3100;

const app = express();

// TODO: EXTRACT middlewares
// REF https://github.com/withspectrum/spectrum/blob/alpha/api/routes/middlewares/index.js
import { Router } from 'express';
const middlewares = Router();
import bodyParser from 'body-parser';
middlewares.use(bodyParser.json());
app.use(middlewares);

import apiRoutes from './routes/api';
app.use('/api', apiRoutes);

const server = createServer(app);

server.listen(PORT);

debug(`GraphQL server running at http://localhost:${PORT}/api`);
