from copy import deepcopy
from unittest import IsolatedAsyncioTestCase
from unittest.mock import patch
from uuid import uuid4

from fastapi import HTTPException

from models.chart_data_feature import ChartDataFeature
from models.chart_data_point import ChartDataPoint
from models.comment import Comment
from models.comment_thread import CommentThreadWithComments
from models.country import Country
from repositories.comment_threads_repository import initial_threads
from services.comments_service import (
    get_all_comment_threads,
    get_comment_thread,
    create_thread, respond_to_thread,
)


class CommentsServiceTest(IsolatedAsyncioTestCase):
    @patch("repositories.comment_threads_repository.get_all")
    async def test_get_all_comment_threads_should_call_thread_repository_list(
        self, get_all
    ):
        get_all.return_value = initial_threads

        result = get_all_comment_threads()

        get_all.assert_called_once_with()
        self.assertEqual(result, initial_threads)

    @patch("repositories.comment_threads_repository.get")
    async def test_get_comment_thread_should_call_thread_repository_get(self, get):
        thread = initial_threads[0]
        get.return_value = thread

        result = get_comment_thread(thread.id)

        get.assert_called_once_with(thread.id)
        self.assertEqual(result, thread)

    @patch("repositories.comment_threads_repository.get")
    async def test_get_threads_should_throw_if_id_is_not_found(self, get):
        get.return_value = None

        with self.assertRaises(HTTPException) as error:
            get_comment_thread(uuid4())

        self.assertEqual(error.exception.status_code, 400)

    @patch("repositories.comment_threads_repository.create_thread")
    @patch("repositories.comment_threads_repository.get_by_data_point")
    async def test_create_thread_should_call_thread_repository_create_if_datapoint_is_new(
        self, get_by_data_point, repo_create_thread
    ):
        comment = Comment(user_name="Josh", text="Testing")
        data_point = ChartDataPoint(country=Country.ES, feature=ChartDataFeature.HOTDOG)

        get_by_data_point.return_value = None
        repo_create_thread.return_value = CommentThreadWithComments(
            id=uuid4(),
            chart_data_point=data_point,
            comments_count=1,
            comments=[comment],
        )

        result = create_thread(chart_data_point=data_point, comment=comment)

        get_by_data_point.assert_called_once_with(data_point)
        repo_create_thread.assert_called_once_with(data_point, comment)

        self.assertEqual(result.comments_count, 1)
        self.assertEqual(result.comments, [comment])
        self.assertEqual(result.chart_data_point, data_point)

    @patch("repositories.comment_threads_repository.add_comment_to_thread")
    @patch("repositories.comment_threads_repository.get_by_data_point")
    async def test_create_thread_should_switch_to_add_comment_if_thread_exists(
        self, get_by_data_point, add_comment
    ):
        comment = Comment(user_name="Josh", text="Testing")
        data_point = ChartDataPoint(country=Country.ES, feature=ChartDataFeature.HOTDOG)
        existing_thread = CommentThreadWithComments(
            id=uuid4(),
            chart_data_point=data_point,
            comments_count=1,
            comments=[comment],
        )

        get_by_data_point.return_value = existing_thread

        create_thread(chart_data_point=data_point, comment=comment)

        get_by_data_point.assert_called_once_with(data_point)
        add_comment.assert_called_once_with(existing_thread, comment)

    @patch("repositories.comment_threads_repository.add_comment_to_thread")
    @patch("repositories.comment_threads_repository.get")
    async def test_respond_to_thread_should_call_add_comment(self, get, add_comment):
        comment = Comment(user_name="Josh", text="Testing")
        comment2 = Comment(user_name="Josh2", text="Testing2")
        data_point = ChartDataPoint(country=Country.ES, feature=ChartDataFeature.HOTDOG)
        existing_thread = CommentThreadWithComments(
            id=uuid4(),
            chart_data_point=data_point,
            comments_count=1,
            comments=[comment],
        )
        updated_thread = deepcopy(existing_thread)
        updated_thread.comments_count = 1
        updated_thread.comments = [comment, comment2]

        get.return_value = existing_thread
        add_comment.return_value = updated_thread

        result = respond_to_thread(existing_thread.id, comment=comment2)

        get.assert_called_once_with(existing_thread.id)
        add_comment.assert_called_once_with(existing_thread, comment2)

        self.assertEqual(result, updated_thread)

    @patch("repositories.comment_threads_repository.get")
    async def test_respond_to_thread_should_throw_if_thread_does_not_exist(self, get):
        comment = Comment(user_name="Josh", text="Testing")
        get.return_value = None

        with self.assertRaises(HTTPException) as error:
            respond_to_thread(uuid4(), comment=comment)

        self.assertEqual(error.exception.status_code, 400)
