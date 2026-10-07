import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const router = Router();

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MeetSync Backend API',
      version: '1.0.0',
    },
  },
  apis: ['../src/routes/*.ts'],
});

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
