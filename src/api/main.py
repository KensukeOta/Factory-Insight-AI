from fastapi import FastAPI

from src.api.routers.dashboard import router as dashboard_router
from src.api.routers.machines import router as machines_router
from src.api.routers.maintenance import router as maintenance_router
from src.api.routers.predictions import router as predictions_router
from src.api.routers.readings import router as readings_router

app = FastAPI(
    title="Factory Insight AI API",
    description="Predictive maintenance and equipment management API",
    version="0.1.0",
)

app.include_router(machines_router)
app.include_router(readings_router)
app.include_router(predictions_router)
app.include_router(maintenance_router)
app.include_router(dashboard_router)


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
