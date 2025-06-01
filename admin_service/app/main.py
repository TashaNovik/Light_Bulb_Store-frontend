from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .core.config import settings
from .api import auth, users, audit, proxy

app = FastAPI(
    title="Admin Service API",
    description="Admin panel microservice for Light Bulb Store",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/admin", tags=["Admin Users"])
app.include_router(audit.router, prefix="/admin/audit", tags=["Audit Logs"])
app.include_router(proxy.router, prefix="/admin", tags=["Resource Management"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Admin Service API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )
