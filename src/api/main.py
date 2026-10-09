from fastapi import FastAPI

from src.api.routers.machines import router as machines_router

app = FastAPI(
    title="Factory Insight AI API",
    description="Predictive maintenance and equipment management API",
    version="0.1.0",
)

app.include_router(machines_router)


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
