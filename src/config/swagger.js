const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Agendamento',
    version: '1.0.0',
    description: 'Documentação da API WORKGATE COMPLETA',
  },
  servers: [
    {
      url: 'http://localhost:3000', // Altere para a URL do seu servidor em produção
      description: 'Servidor de Desenvolvimento',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  // Caminhos para os arquivos de rotas da sua API
  apis: ['./src/routes/*.js', './src/models/*.js'], // Ajuste conforme a estrutura do seu projeto
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
