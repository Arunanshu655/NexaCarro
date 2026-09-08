// Main backend entry point placeholder
import express from "express";
import { ApolloServer } from "apollo-server-express";
import {Server} from 'socket.io';
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import schema from "./graphql/schema.js";
import jwt from "jsonwebtoken";

const port = process.env.PORT || 4000;
const app = express();
const httpServer = http.createServer(app)
const io = new Server(httpServer,{
  cors:{
    origin:"*"
  }
})

app.get('/',(req,res)=>{
  res.send("Hi I am listening")
})

app.get('/test',(req,res)=>{
  console.log(req.header)
})

io.on("connection",(socket)=>{
  console.log("user connected : ", socket.id)

  // join chat room
  socket.on("join_chat", (chatId) => {

    socket.join(chatId);

    console.log(`Socket ${socket.id} joined room ${chatId}`);
  });

  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
  });

   // receive message from frontend
  socket.on("send_message", (data) => {
      // console.log(data)
      io.to(data.chatId).emit("receive_message", {
      chatId: data.chatId,
      message: data.message,
    });
  });
  socket.on("disconnect",()=>{
    console.log("disconnected user : ",socket.id)
  })
})

const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    const raw = req.headers.authorization || "";
    const token = raw.split(" ").length > 1 ? raw.split(" ")[1] : raw
    console.log("Received token:", token);
    
    try{
      
      const user = jwt.verify(token, process.env.JWT_SECRET);
      console.log("from User:", user);
      return { user };

    }catch(err){
      console.log("Error occurred while verifying token:", err);
      return { user: null };
    }
  }
});

await server.start();
server.applyMiddleware({ app });
console.log("Connecting to MongoDB...");
await mongoose.connect(process.env.MONGO_URI);
httpServer.listen(port, () => {
  console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
});