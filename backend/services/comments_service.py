from threading import Lock
from uuid import UUID

from fastapi import HTTPException

from models.chart_data_point import ChartDataPoint
from models.comment import Comment
from models.comment_thread import CommentThread, CommentThreadWithComments
from repositories import comment_threads_repository


def get_all_comment_threads() -> list[CommentThread]:
    return comment_threads_repository.get_all()


def get_comment_thread(thread_id: UUID) -> CommentThreadWithComments:
    thread = comment_threads_repository.get(thread_id)

    if thread is None:
        raise HTTPException(400, "Thread with id {} not found".format(thread_id))

    return thread


create_lock = Lock()


def create_thread(
    chart_data_point: ChartDataPoint, comment: Comment
) -> CommentThreadWithComments:
    with create_lock:
        thread = comment_threads_repository.get_by_data_point(chart_data_point)

        if thread is not None:
            return comment_threads_repository.add_comment_to_thread(thread, comment)

        return comment_threads_repository.create_thread(chart_data_point, comment)


def respond_to_thread(thread_id: UUID, comment: Comment) -> CommentThreadWithComments:
    thread = get_comment_thread(thread_id)

    return comment_threads_repository.add_comment_to_thread(thread, comment)
