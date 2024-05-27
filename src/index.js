const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');
const { connectMongoDB } = require('./db/mongodb');
const { redisClient } = require('./redis/redisConfig');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']
}));

app.use((req, res, next) => {
    console.log('Request Headers:', req.headers);
    next();
});

const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [{
        requestDidStart() {
            return {
                didResolveOperation({ request, response }) {
                    response.http.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');
                    response.http.headers.set('Access-Control-Allow-Credentials', 'true');
                },
            };
        },
    }],
    cors: false
});

server.start().then(() => {
    server.applyMiddleware({ app, cors: false });
    app.listen(PORT, () => {
        console.log(`Server listening at http://localhost:${PORT}`);
    });
});

connectMongoDB();
