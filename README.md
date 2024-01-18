# GraphQL Node.js Project

Welcome to the GraphQL Node.js Project! This repository houses the source code for graphql, a GraphQL-powered web application built using Node.js.

## Schema
```
query Notes {
    notes {
        id
        title
        content
        author
    }
}

mutation CreateNote {
    createNote(
        title: "Boring Day"
        content: "Everyday boring day and i love it!"
        author: "John Doe"
    ) {
        id
        title
        content
        author
    }
    updateNote(id: "1", author: null, content: null, title: null) {
        id
        title
        content
        author
    }
    deleteNote(id: "1") {
        id
        title
        content
        author
    }
}

subscription NoteChanged {
    noteChanged {
        status
        # status: 'ADDED', 'UPDATED' , 'DELETED'
        note {
            id
            title
            content
            author
        }
    }
}
```

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org/) installed on your machine.
- A package manager like [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) installed.


## Getting Started

1. Clone this repository to your local machine: ```git clone https://github.com/aqeelabpro/graphql```
2.  install required dependencies ```@apollo/server and graphql```
3.  start project ```node src/server.js```
