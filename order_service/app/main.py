import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .api import orders
from .database import engine, get_db
from . import models, crud

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Order Service API",
    description="API для управления заказами в магазине лампочек",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def initialize_reference_data():
    """Initialize reference data on startup"""
    try:
        logger.info("Initializing reference data...")
        db = next(get_db())
        
        # Initialize reference data
        crud.init_reference_data(db)
        logger.info("Reference data initialization completed successfully")
        
        db.close()
        
    except Exception as e:
        logger.error(f"Failed to initialize reference data: {str(e)}")
        raise


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    await initialize_reference_data()


# Include routers
app.include_router(orders.router, prefix="/api/v1/orders", tags=["orders"])


@app.get("/")
def read_root():
    return {"message": "Order Service API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
