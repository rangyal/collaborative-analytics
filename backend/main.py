from uuid import UUID

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from models.requests.create_thread_request import CreateThreadRequest
from models.requests.respond_to_thread_request import RespondToThreadRequest
from repositories.comment_threads_repository import load_initial_values
from services import data_service, share_service, comments_service

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/chart/data")
def get_chart_data():
    return data_service.get_chart_data()


@app.get("/chart/comment_threads")
def get_deployment():
    return list(
        map(
            lambda thread: thread.to_dict(),
            comments_service.get_all_comment_threads(),
        )
    )


@app.get("/chart/comment_threads/{thread_id}")
def get_deployment(thread_id: str):
    return comments_service.get_comment_thread(UUID(thread_id)).to_dict()


@app.post("/chart/comment_threads")
def create_thread(request: CreateThreadRequest):
    return comments_service.create_thread(
        chart_data_point=request.data_point, comment=request.comment
    ).to_dict()


@app.post("/chart/comment_threads/{thread_id}/respond")
def create_thread(thread_id: str, request: RespondToThreadRequest):
    return comments_service.respond_to_thread(
        thread_id=UUID(thread_id), comment=request.comment
    ).to_dict()


@app.get("/share")
def get_share_link():
    return {"token": share_service.get_share_token()}


@app.get("/chart/shared/{token}")
def get_shared_chart(token: str):
    share_service.validate_token(token)
    return data_service.get_chart_data()


@app.on_event("startup")
def init_app():
    load_initial_values()


if __name__ == "__main__":
    uvicorn.run("__main__:app", host="0.0.0.0", port=8000, reload=True)
