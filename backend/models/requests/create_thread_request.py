from dataclasses import dataclass

from dataclass_wizard import JSONWizard

from models.chart_data_point import ChartDataPoint
from models.comment import Comment


@dataclass
class CreateThreadRequest(JSONWizard):
    comment: Comment
    data_point: ChartDataPoint
