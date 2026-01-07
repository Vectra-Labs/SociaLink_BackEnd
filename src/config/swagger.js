import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SociaLink API",
      version: "1.0.0",
      description: "API documentation for SociaLink backend",
    },
    servers: [
      {
        url: "http://localhost:5001",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"], // where swagger reads comments
};

export const swaggerSpec = swaggerJSDoc(options);
