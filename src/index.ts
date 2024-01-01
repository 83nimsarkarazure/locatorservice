const { ApolloServer } = require("@apollo/server");
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
const { startStandaloneServer } = require("@apollo/server/standalone");
import typeDefs from "./graphql/typeDef";
import resolvers from "./graphql/resolvers";
const cors = require("cors");
import express from "express";
const https = require("https");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3001;

import "./models/database";

const server = new ApolloServer({ typeDefs, resolvers });
const options = {
  key: fs.readFileSync(path.join(__dirname, "./certs/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "./certs/cert.pem")),
};
startStandaloneServer(server, {
  listen: { port: 4000, https: options },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});

app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: "*", // Replace with your React app's origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.post("/save-image", (req, res) => {
  try {
    const { imgData } = req.body;

    // Create a buffer from the base64 image data
    const buffer = Buffer.from(imgData.split(",")[1], "base64");

    // Generate a unique filename for each image
    const filename = `captured-image-${Date.now()}.png`;

    // Save the image to the server
    const filePath = path.join(__dirname, "images", filename);
    fs.writeFile(filePath, buffer, "base64", (error) => {
      if (error) {
        console.error("Error saving image:", error);
        res.status(500).send("Error saving image.");
      } else {
        console.log("Image saved as:", filename);
        res.status(200).send("Image saved successfully.");
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving image.");
  }
});

const apiServer = https.createServer(options, app);

apiServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
