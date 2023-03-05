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
from services import share_service
from services.comments_service import (
    get_all_comment_threads,
    get_comment_thread,
    create_thread,
    respond_to_thread,
)


class ShareServiceTest(IsolatedAsyncioTestCase):
    async def test_successful_validation(self):
        """
        It should successfully validate issued token
        """
        token = share_service.get_share_token()

        result = share_service.validate_token(token)

        self.assertIsNone(result)

    async def test_failed_validation(self):
        """
        It should throw 404 error if worng token is passed
        """
        with self.assertRaises(HTTPException) as error:
            share_service.validate_token("bad_token")

        self.assertEqual(error.exception.status_code, 404)
