import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
const https = require("https");

const fs = require("fs");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");
require('dotenv').config();
import typeDefs from "./graphql/typeDef";
import resolvers from "./graphql/resolvers";
import "./models/database";

import cors from 'cors';


const app = express();
const configurations: any = {
    // Note: You may need sudo to run on port 443
    production: { ssl: true, port: 443, hostname: 'example.com' },
    development: { ssl: true, port: 443, hostname: 'localhost' },
};
const environment: any = process.env.NODE_ENV || 'production';
console.log(environment);
const config = configurations[environment];
const httpServer = https.createServer(
    {
        key: fs.readFileSync(path.join(__dirname, "./androidcert/test.key")),
        cert: fs.readFileSync(path.join(__dirname, "./androidcert/test.crt")),
    }, app);
const schema = makeExecutableSchema({ typeDefs, resolvers });
// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
});
// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer({ schema }, wsServer);
const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })
        ,

    // Proper shutdown for the WebSocket server.
    {
        async serverWillStart() {
            return {
                async drainServer() {
                    await serverCleanup.dispose();
                },
            };
        },
    },
    ],
});

async function startServer() {

    await server.start();

    app.use(
        '/graphql',

        cors<cors.CorsRequest>({
            origin: "*", methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: false,
            optionsSuccessStatus: 204,
        }),

        express.json(),
        expressMiddleware(server),
    );
    app.use(
        "/tiles",
        createProxyMiddleware({
            target: "https://a.tile.openstreetmap.org",
            changeOrigin: true,
            pathRewrite: {
                "^/tiles": "",
            },
        })
    );

    await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log('🚀 Server ready at', `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}/graphql`);
}
startServer();