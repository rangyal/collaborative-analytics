import dataclasses
import json
from uuid import UUID, uuid4
import uuid

from fastapi.testclient import TestClient

from main import app
from models.chart_data_feature import ChartDataFeature
from models.chart_data_point import ChartDataPoint
from models.comment import Comment
from models.comment_thread import CommentThreadWithComments, CommentThread
from models.country import Country
from models.requests.create_thread_request import CreateThreadRequest
from models.requests.respond_to_thread_request import RespondToThreadRequest


chart_data = json.load(open("./stub_data/chart_data.json"))
initial_comment_threads = json.load(open("./stub_data/initial_comments.json"))

with TestClient(app) as client:

    def test_get_chart_data():
        """
        Chart data is returned correctly
        """
        response = client.get("/chart/data")
        assert response.status_code == 200

        assert response.json() == chart_data

    def test_get_initial_chart_threads():
        """
        Chart threads are returned correctly
        """
        response = client.get("/chart/comment_threads")
        assert response.status_code == 200

        response_threads = CommentThread.from_list(response.json())

        for index, thread in enumerate(initial_comment_threads):
            assert UUID(thread["id"]) == response_threads[index].id
            assert thread["comments_count"] == response_threads[index].comments_count

    def test_get_chart_comment_thread():
        """
        Comments within thread are returned correctly
        """
        first_thread = CommentThreadWithComments.from_dict(initial_comment_threads[0])

        response = client.get(f"/chart/comment_threads/{first_thread.id}")
        assert response.status_code == 200

        response_thread = CommentThreadWithComments.from_dict(response.json())

        assert response_thread.id == first_thread.id
        assert response_thread.comments_count == first_thread.comments_count
        assert response_thread.comments == first_thread.comments

    def test_respond_to_existing_thread():
        """
        When adding comment to a data point which had comments, comment should be added to a thread
        """
        first_thread = CommentThreadWithComments.from_dict(initial_comment_threads[0])

        new_comment = Comment(user_name="Tony", text="Best fries are in Belgium")
        response = client.post(
            f"/chart/comment_threads/{first_thread.id}/respond",
            json=dataclasses.asdict(RespondToThreadRequest(new_comment)),
        )
        assert response.status_code == 200

        updated_threads = CommentThread.from_list(
            client.get("/chart/comment_threads").json()
        )

        assert len(initial_comment_threads) == len(updated_threads)

        updated_first_thread_json = client.get(
            f"/chart/comment_threads/{first_thread.id}"
        ).json()

        updated_first_thread = CommentThreadWithComments.from_dict(
            updated_first_thread_json
        )
        assert len(updated_first_thread.comments) == len(first_thread.comments) + 1
        assert updated_first_thread.comments[-1].user_name == new_comment.user_name
        assert updated_first_thread.comments[-1].text == new_comment.text

    def test_respond_to_existing_thread_bad_id():
        """
        When adding comment to an inexistent thread server should return an error
        """
        new_comment = Comment(user_name="Tony", text="Best fries are in Belgium")
        response = client.post(
            f"/chart/comment_threads/{uuid4()}/respond",
            json=dataclasses.asdict(RespondToThreadRequest(new_comment)),
        )
        assert response.status_code == 400

    def test_respond_to_existing_thread_bad_comment():
        """
        When adding a bad comment to an existing thread server should return an error
        """
        first_thread = CommentThreadWithComments.from_dict(initial_comment_threads[0])

        new_comment = Comment(user_name="Tony", text="Best fries are in Belgium")
        request = dataclasses.asdict(RespondToThreadRequest(new_comment))
        request["comment"].pop("text")

        response = client.post(
            f"/chart/comment_threads/{first_thread.id}/respond",
            json=request,
        )
        assert response.status_code == 422

    def test_create_new_thread():
        """
        When adding comment to a data point which had no comments a new thread is created
        """
        new_thread_request = CreateThreadRequest(
            comment=Comment(
                user_name="Tony",
                text="Best fries are in Belgium",
            ),
            data_point=ChartDataPoint(
                feature=ChartDataFeature.FRIES,
                country=Country.BE,
            ),
        )

        response = client.post(
            "/chart/comment_threads", json=dataclasses.asdict(new_thread_request)
        )
        assert response.status_code == 200

        updated_threads = CommentThread.from_list(
            client.get("/chart/comment_threads").json()
        )

        initial_thread_ids = list(
            map(lambda thread: thread["id"], initial_comment_threads)
        )
        new_threads = list(
            filter(
                lambda thread: str(thread.id) not in initial_thread_ids, updated_threads
            )
        )
        assert len(new_threads) == 1

        new_thread_response = client.get(
            f"/chart/comment_threads/{new_threads[0].id}"
        ).json()

        new_thread = CommentThreadWithComments.from_dict(new_thread_response)
        assert len(new_thread.comments) == 1
        assert new_thread.comments[0].user_name == new_thread_request.comment.user_name
        assert new_thread.comments[0].text == new_thread_request.comment.text

    def test_create_new_thread_bad_datapoint():
        """
        When adding comment to an inexistent data point server should return an error
        """
        new_thread_request = CreateThreadRequest(
            comment=Comment(
                user_name="Tony",
                text="Best fries are in Belgium",
            ),
            data_point=ChartDataPoint(
                feature=ChartDataFeature.FRIES,
                country=Country.BE,
            ),
        )

        request = dataclasses.asdict(new_thread_request)
        request["data_point"]["feature"] = "COLA"

        response = client.post("/chart/comment_threads", json=request)
        assert response.status_code == 422

    def test_create_new_thread_bad_comment():
        """
        When adding a bad comment to a new thread server should return an error
        """
        new_thread_request = CreateThreadRequest(
            comment=Comment(
                user_name="Tony",
                text="Best fries are in Belgium",
            ),
            data_point=ChartDataPoint(
                feature=ChartDataFeature.FRIES,
                country=Country.BE,
            ),
        )

        request = dataclasses.asdict(new_thread_request)
        request["comment"].pop("text")

        response = client.post("/chart/comment_threads", json=request)
        assert response.status_code == 422

    def test_get_share_token():
        """
        It should return a UUIDv4 share token
        """
        response = client.get("/share")

        tokenUUID = uuid.UUID(response.json()["token"])

        assert tokenUUID != None

    def test_get_shared_data():
        """
        It should return a shared chart data when correct token is passed
        """
        response = client.get("/share")

        response = client.get(f"/chart/shared/{response.json()['token']}")
        assert response.status_code == 200

        assert response.json() == chart_data

    def test_get_shared_data_failure():
        """
        It should return 404 error for chart data when incorrect token is passed
        """
        response = client.get(f"/chart/shared/bad_token")
        assert response.status_code == 404
