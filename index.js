import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import { createServer } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import bodyParser from 'body-parser';
import cors from 'cors';

const PORT = 4000;
const pubsub = new PubSub();

// In-memory store for notes
let notes = [];
let idCounter = 1;

// Enumeration for note status
const NOTE_STATUS = {
  ADDED: 'ADDED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',
};

// GraphQL Schema
const typeDefs = `#graphql
  type Note {
    id: ID!
    title: String!
    content: String!
    author: String!
  }

  type NoteChange {
    note: Note!
    status: String!
  }

  type Query {
    notes: [Note]
  }

  type Mutation {
    createNote(title: String!, content: String!, author: String!): Note
    updateNote(id: ID!, title: String, content: String, author: String): Note
    deleteNote(id: ID!): Note
  }

  type Subscription {
    noteChanged: NoteChange
  }
`;

const resolvers = {
  Query: {
    notes: () => notes,
  },
  Mutation: {
    createNote: (_, { title, content, author }) => {
      const newNote = { id: String(idCounter++), title, content, author };
      notes.push(newNote);
      const changePayload = { note: newNote, status: NOTE_STATUS.ADDED };
      pubsub.publish('NOTE_CHANGED', { noteChanged: changePayload });
      return newNote;
    },
    updateNote: (_, { id, title, content, author }) => {
      const index = notes.findIndex((note) => note.id === id);
      if (index !== -1) {
        const updatedNote = {
            id,
            title: title !== undefined ? title : notes[index].title,
            content: content !== undefined ? content : notes[index].content,
            author: author !== undefined ? author : notes[index].author,
          };
        notes[index] = updatedNote;
        const changePayload = { note: updatedNote, status: NOTE_STATUS.UPDATED };
        pubsub.publish('NOTE_CHANGED', { noteChanged: changePayload });
        return updatedNote;
      }
      return null;
    },
    deleteNote: (_, { id }) => {
      const index = notes.findIndex((note) => note.id === id);
      if (index !== -1) {
        const deletedNote = notes.splice(index, 1)[0];
        const changePayload = { note: deletedNote, status: NOTE_STATUS.DELETED };
        pubsub.publish('NOTE_CHANGED', { noteChanged: changePayload });
        return deletedNote;
      }
      return null;
    },
  },
  Subscription: {
    noteChanged: {
      subscribe: () => pubsub.asyncIterator(['NOTE_CHANGED']),
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create an Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Set up WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});
const serverCleanup = useServer({ schema }, wsServer);

// Set up ApolloServer
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
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

server.start().then(() => {
  app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server));

  // Listen to the HTTP server
  httpServer.listen(PORT, () => {
    console.log(`🚀 GraphQL server ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 WebSocket server ready at ws://localhost:${PORT}/graphql`);
  });
});
