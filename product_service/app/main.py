from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import products

app = FastAPI(title="Product Management Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api/v1/products", tags=["products"])

# Add health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Handle OPTIONS requests for CORS preflight
@app.options("/{path:path}")
async def options_handler():
    return {"message": "OK"}
