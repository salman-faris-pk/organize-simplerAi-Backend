import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ISOLogger } from './iso-logger.service';

export function registerFastifyLogger(
  fastify: FastifyInstance,
  logger: ISOLogger,
) {
  
  logger.setContext('HTTP Request');

  fastify.addHook('onRequest', (req:FastifyRequest, _reply:FastifyReply, done) => {
    (req as any).startTime = Date.now();
    done();
  });

  fastify.addHook('onResponse', (req:FastifyRequest, reply:FastifyReply, done) => {
    const duration =
      Date.now() - ((req as any).startTime ?? Date.now());

    logger.log(
      `${req.method} ${req.url} ${reply.statusCode} - ${duration}ms`,
    );

    done();
  });
};
