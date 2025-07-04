# Sample Documentation

## What is this chatbot?

This is an embedded chatbot system that uses Retrieval-Augmented Generation (RAG) to answer questions based on a knowledge base. The system consists of:

- A FastAPI backend that serves the chat API
- A vector database using ChromaDB for document storage and retrieval
- Integration with OpenAI's GPT models for generating responses
- Support for embedding into websites and WordPress

## Key Features

- **Document Ingestion**: Automatically processes Markdown files and creates embeddings
- **Secure Authentication**: Uses Azure AD for access control
- **CORS Support**: Configured for cross-origin requests
- **Streamlit Interface**: Provides a simple testing interface
- **WordPress Integration**: Includes plugins for easy website embedding

## How it works

1. Documents are processed and stored as vector embeddings
2. User queries are converted to embeddings and matched against the knowledge base
3. Relevant context is retrieved and passed to GPT for response generation
4. The system returns contextually-aware answers based on your documentation
