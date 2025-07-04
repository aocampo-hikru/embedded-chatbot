"""Build the secure Chroma index from Markdown files in ./docs-secure and combine with public content."""

from __future__ import annotations

from pathlib import Path
from dotenv import load_dotenv

from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma

# Load environment variables
load_dotenv()

PERSIST_DIR_PUBLIC = "./data"
PERSIST_DIR_SECURE = "./data-secure"
DOCS_DIR_PUBLIC = Path(__file__).resolve().parents[1] / "docs"
DOCS_DIR_SECURE = Path(__file__).resolve().parents[1] / "docs-secure"


def main() -> None:
    """Build secure vector store that includes both public and secure documents."""
    print("Building secure vector store with public and confidential content...")
    
    documents = []
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    
    # Load public documents
    print("Loading public documents...")
    for md_file in DOCS_DIR_PUBLIC.glob("*.md"):
        loader = TextLoader(str(md_file))
        docs = loader.load()
        # Add metadata to identify as public content
        for doc in docs:
            doc.metadata["access_level"] = "public"
            doc.metadata["source_type"] = "public_docs"
        documents.extend(splitter.split_documents(docs))
    
    # Load secure documents
    print("Loading secure documents...")
    for md_file in DOCS_DIR_SECURE.glob("*.md"):
        loader = TextLoader(str(md_file))
        docs = loader.load()
        # Add metadata to identify as secure content
        for doc in docs:
            doc.metadata["access_level"] = "secure"
            doc.metadata["source_type"] = "secure_docs"
        documents.extend(splitter.split_documents(docs))
    
    # Create secure vector store with all documents
    embedding = OpenAIEmbeddings()
    Chroma.from_documents(documents, embedding, persist_directory=PERSIST_DIR_SECURE)
    
    public_count = sum(1 for doc in documents if doc.metadata.get("access_level") == "public")
    secure_count = sum(1 for doc in documents if doc.metadata.get("access_level") == "secure")
    
    print(f"Secure vector store created with {len(documents)} total chunks:")
    print(f"  - {public_count} public chunks")
    print(f"  - {secure_count} secure chunks")


if __name__ == "__main__":
    main()
