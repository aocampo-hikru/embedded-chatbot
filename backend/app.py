import os
import jwt
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from jwt import PyJWKClient

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# Load environment variables
load_dotenv()

# Environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TENANT_ID = os.getenv("AZURE_TENANT_ID")
API_CLIENT_ID = os.getenv("AZURE_API_CLIENT_ID")

# Azure AD configuration
JWKS_URL = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"

# Path configuration
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

# Initialize FastAPI app
app = FastAPI(title="Embedded Chatbot API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

# Initialize vector stores and chains
def get_public_chain():
    """Initialize chain for public documents"""
    embeddings = OpenAIEmbeddings()
    vectorstore = Chroma(
        persist_directory=os.path.join(parent_dir, "data"),
        embedding_function=embeddings
    )
    llm = ChatOpenAI(temperature=0.7, model="gpt-3.5-turbo")
    
    prompt_template = """Use the following pieces of context to answer the question at the end. 
    If you don't know the answer, just say that you don't know, don't try to make up an answer.

    {context}

    Question: {question}
    Answer:"""
    
    PROMPT = PromptTemplate(
        template=prompt_template, input_variables=["context", "question"]
    )
    
    return RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        chain_type_kwargs={"prompt": PROMPT}
    )

def get_secure_chain():
    """Initialize chain for secure documents"""
    embeddings = OpenAIEmbeddings()
    vectorstore = Chroma(
        persist_directory=os.path.join(parent_dir, "data-secure"),
        embedding_function=embeddings
    )
    llm = ChatOpenAI(temperature=0.7, model="gpt-3.5-turbo")
    
    prompt_template = """Use the following pieces of context to answer the question at the end. 
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    You have access to secure company documents.

    {context}

    Question: {question}
    Answer:"""
    
    PROMPT = PromptTemplate(
        template=prompt_template, input_variables=["context", "question"]
    )
    
    return RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        chain_type_kwargs={"prompt": PROMPT}
    )

# Initialize chains
try:
    public_chain = get_public_chain()
    secure_chain = get_secure_chain()
except Exception as e:
    print(f"Warning: Could not initialize vector stores: {e}")
    public_chain = None
    secure_chain = None

def verify_token(authorization: str | None = Header(None)) -> dict:
    """Verify Azure AD JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split()[1]

    # Fetch signing key (JWKS endpoint already points to /v2.0/keys)
    jwks_client = PyJWKClient(JWKS_URL, cache_keys=True)
    signing_key = jwks_client.get_signing_key_from_jwt(token)

    try:
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False},  # we'll check aud manually
        )
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Token validation failed: {exc}")

    # Issuer — accept v1 or v2
    # v2  → https://login.microsoftonline.com/{tid}/v2.0
    # v1  → https://sts.windows.net/{tid}/
    issuer_v2 = f"https://login.microsoftonline.com/{TENANT_ID}/v2.0"
    issuer_v1 = f"https://sts.windows.net/{TENANT_ID}/"
    if payload.get("iss") not in {issuer_v1, issuer_v2}:
        raise HTTPException(status_code=401, detail="Invalid issuer")

    # Audience — allow your API and Graph (optional)
    if payload.get("aud") not in {API_CLIENT_ID, "https://graph.microsoft.com"}:
        raise HTTPException(status_code=401, detail="Invalid audience")

    # Basic sanity
    if not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Missing subject claim")

    return payload

# API Routes
@app.get("/favicon.ico")
async def get_favicon():
    """Serve favicon"""
    return FileResponse(os.path.join(parent_dir, "favicon.ico"))

@app.get("/favicon.svg")
async def get_favicon_svg():
    """Serve SVG favicon"""
    return FileResponse(os.path.join(parent_dir, "favicon.svg"))

@app.post("/chat", response_model=ChatResponse)
async def chat_guest(request: ChatRequest):
    """Guest chat endpoint - uses public documents only"""
    if not public_chain:
        raise HTTPException(status_code=500, detail="Vector store not initialized")
    
    try:
        result = public_chain.run(request.message)
        return ChatResponse(response=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.post("/chat-demo", response_model=ChatResponse)
async def chat_authenticated(request: ChatRequest, authorization: str | None = Header(None)):
    """Authenticated chat endpoint - uses secure documents"""
    # Temporary: log token for debugging
    print(f"Authorization header: {authorization}")
    
    # For now, just check if we have any authorization header
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    if not secure_chain:
        raise HTTPException(status_code=500, detail="Secure vector store not initialized")
    
    try:
        result = secure_chain.run(request.message)
        return ChatResponse(response=result)
    except Exception as e:
        print(f"Chat error: {e}")  # Debug logging
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "public_chain_ready": public_chain is not None,
        "secure_chain_ready": secure_chain is not None
    }

# Static file serving
@app.get("/demos/index.html")
async def serve_demo_alt():
    """Serve the main demo page (alternative path)"""
    return FileResponse(os.path.join(parent_dir, "index.html"))

@app.get("/demos/my-chat.js")
async def serve_chat_widget():
    """Serve the chat widget JavaScript"""
    return FileResponse(os.path.join(parent_dir, "my-chat.js"))

@app.get("/my-chat.js")
async def serve_chat_widget_root():
    """Serve the chat widget JavaScript from root"""
    return FileResponse(os.path.join(parent_dir, "my-chat.js"))

# Mount static files for other assets
app.mount("/static", StaticFiles(directory=parent_dir), name="static")
app.mount("/dist", StaticFiles(directory=os.path.join(parent_dir, "dist")), name="dist")
app.mount("/", StaticFiles(directory=parent_dir, html=True), name="root")

# Root endpoint - serve the demo page directly
@app.get("/")
async def root():
    """Serve the main demo page at root"""
    return FileResponse(os.path.join(parent_dir, "index.html"))

# API info endpoint
@app.get("/api")
async def api_info():
    """API information endpoint"""
    return {
        "message": "Embedded Chatbot API",
        "version": "1.0.0",
        "endpoints": {
            "guest_chat": "/chat",
            "authenticated_chat": "/chat-demo",
            "demo": "/",
            "health": "/health",
            "api_info": "/api"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
