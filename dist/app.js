"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const driver = neo4j_driver_1.default.driver('bolt://localhost:7687', neo4j_driver_1.default.auth.basic('neo4j', 'neo4j'));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Hello, Express with TypeScript!');
});
// Define a route to create a person and relationship in Neo4j
app.post('/createPerson', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('running');
    const { name, relation } = req.body;
    const session = driver.session();
    try {
        const result = yield session.run(`
            CREATE (p:Person {name: $name})
            RETURN p
            `, { name });
        // Create a relationship
        const relationship = yield session.run(`
            MATCH (a:Person {name: $name}), (b:Person {name: $relation})
            CREATE (a)-[:${relation}]->(b)
            `, { name, relation });
        console.log(result);
        console.log(relationship);
        res.status(201).json({ message: 'Person and relationship created successfully' });
    }
    catch (error) {
        console.log('error');
        res.status(500).json({ message: 'error' });
    }
}));
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
