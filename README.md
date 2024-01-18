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
