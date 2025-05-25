# Create a virtual environment (if you haven't already):
python -m venv .venv
# Activate the virtual environment
.venv\Scripts\Activate
# Install dependencies:
pip install -r requirements.txt
# Init alembic
docker-compose run --rm api alembic revision --autogenerate -m "Initial migration"
docker-compose run --rm api alembic upgrade head