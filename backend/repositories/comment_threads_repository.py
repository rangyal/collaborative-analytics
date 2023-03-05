import json
import os
from threading import Lock
from uuid import UUID, uuid4

from fastapi import HTTPException

from models.chart_data_point import ChartDataPoint
from models.comment import Comment
from models.comment_thread import CommentThreadWithComments, CommentThread

initial_threads: list[CommentThreadWithComments] = list(
    map(
        lambda thread: CommentThreadWithComments.from_dict(thread),
        json.load(open(os.path.dirname(__file__) + "/../stub_data/initial_comments.json")),
    )
)

threads: dict[UUID, CommentThreadWithComments] = {}


def load_initial_values():
    for thread in initial_threads:
        threads[thread.id] = thread


def get_all() -> list[CommentThread]:
    return list(map(lambda thread: CommentThread(
        chart_data_point=thread.chart_data_point,
        comments_count=thread.comments_count,
        id=thread.id
    ), threads.values()))


def get(thread_id: UUID) -> CommentThreadWithComments | None:
    return threads.get(thread_id, None)


def get_by_data_point(
    chart_data_point: ChartDataPoint,
) -> CommentThreadWithComments | None:
    return next(
        (
            thread
            for thread in list(threads.values())
            if thread.chart_data_point == chart_data_point
        ),
        None,
    )


def create_thread(
    chart_data_point: ChartDataPoint, first_comment: Comment
) -> CommentThreadWithComments | None:
    thread_id = uuid4()
    if threads.get(thread_id, None) is not None:
        # same id generated twice, extremely unlikely, not worth handling within the test task scope
        raise HTTPException(500, "ID generation failed")

    new_thread = CommentThreadWithComments(
        id=thread_id,
        chart_data_point=chart_data_point,
        comments_count=1,
        comments=[first_comment],
    )

    threads[thread_id] = new_thread

    return new_thread


update_lock = Lock()


def add_comment_to_thread(
    thread: CommentThreadWithComments, comment: Comment
) -> CommentThreadWithComments | None:
    with update_lock:
        thread.comments.append(comment)
        thread.comments_count += 1

    return thread
