"""Build the persistent Chroma index from Markdown files in ./docs."""

from __future__ import annotations

from pathlib import Path
from dotenv import load_dotenv

from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma

# Load environment variables
load_dotenv()

PERSIST_DIR = "./data"
DOCS_DIR = Path(__file__).resolve().parents[1] / "docs"


def main() -> None:
    documents = []
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    for md_file in DOCS_DIR.glob("*.md"):
        loader = TextLoader(str(md_file))
        docs = loader.load()
        documents.extend(splitter.split_documents(docs))
    embedding = OpenAIEmbeddings()
    Chroma.from_documents(documents, embedding, persist_directory=PERSIST_DIR)
    print(f"Indexed {len(documents)} chunks")


if __name__ == "__main__":
    main()
