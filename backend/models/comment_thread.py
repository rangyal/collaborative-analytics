from dataclasses import dataclass, field
from uuid import UUID, uuid4

from dataclass_wizard import JSONWizard

from models.chart_data_point import ChartDataPoint
from models.comment import Comment


@dataclass(kw_only=True)
class CommentThread(JSONWizard):
    chart_data_point: ChartDataPoint
    comments_count: int

    id: UUID = field(default_factory=uuid4)


@dataclass
class CommentThreadWithComments(CommentThread):
    comments: list[Comment]
