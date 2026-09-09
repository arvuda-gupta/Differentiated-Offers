from fastapi import FastAPI

from app.routes.concept import router as concept_router
from app.routes.discovery import router as discovery_router
from app.routes.needs import router as needs_router
from app.routes.offer import router as offer_router
from app.routes.prototype import router as prototype_router
from app.routes.workspace import router as workspace_router
from app.routes.workspace_event import router as workspace_event_router

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workspace_router)
app.include_router(discovery_router)
app.include_router(needs_router)
app.include_router(offer_router)
app.include_router(workspace_event_router)
app.include_router(concept_router)
app.include_router(prototype_router)



