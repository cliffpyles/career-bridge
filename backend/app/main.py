"""
FastAPI application factory.
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routers import applications, auth, dashboard, experiences, health, resumes

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan — startup and shutdown hooks."""
    # Startup
    yield
    # Shutdown


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global exception handler for unhandled errors
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        if settings.debug:
            raise exc
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred. Please try again."},
        )

    # Routers
    app.include_router(health.router, prefix="/api")
    app.include_router(auth.router, prefix="/api")
    app.include_router(experiences.router, prefix="/api")
    app.include_router(resumes.router, prefix="/api")
    app.include_router(applications.router, prefix="/api")
    app.include_router(dashboard.router, prefix="/api")

    return app


app = create_app()
