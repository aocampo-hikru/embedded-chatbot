"""Streamlit-backed FastAPI app for a RAG chatbot.

Run with `uvicorn backend.app:app` or `streamlit run backend/app.py`.
"""

from __future__ import annotations

import os
from typing import Dict

import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jwt import PyJWKClient
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
import streamlit as st

load_dotenv()

# Azure AD config for validating JWT access tokens
TENANT_ID = os.getenv("AZURE_TENANT_ID")
API_CLIENT_ID = os.getenv("AZURE_API_CLIENT_ID")
JWKS_URL = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"

# Initialise persistent Chroma store and retrieval chain
PERSIST_DIR = "./data"
embedding = OpenAIEmbeddings()
vectordb = Chroma(persist_directory=PERSIST_DIR, embedding_function=embedding)
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    chain_type="stuff",
    retriever=vectordb.as_retriever(),
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


def verify_token(authorization: str | None = Header(default=None)) -> Dict:
    """Verify Azure AD access token sent in the Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split()[1]
    try:
        jwks_client = PyJWKClient(JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=API_CLIENT_ID,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    if "chat.access" not in payload.get("scp", "").split():
        raise HTTPException(status_code=403, detail="Missing scope")
    return payload


@app.post("/chat")
async def chat(body: Dict[str, str], _token: Dict = Depends(verify_token)) -> Dict[str, str]:
    """Answer questions using the retrieval chain."""
    query = body.get("query", "")
    answer = qa_chain.run(query)
    return {"answer": answer}


# Simple Streamlit screen for manual testing
if st.runtime.exists():  # Script is running under Streamlit
    st.title("Chat API")
    st.write("POST queries to `/chat` with a valid bearer token.")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
