import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NexShop API',
      version: '1.0.0',
      description: 'Enterprise-grade e-commerce API with recommendations, orders, and admin analytics.',
    },
    servers: [{ url: 'http://localhost:5000' }],
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
