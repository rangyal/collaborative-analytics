from dataclasses import dataclass, field

from dataclass_wizard import JSONWizard

from models.chart_data_feature import ChartDataFeature
from models.country import Country


@dataclass
class ChartDataPoint(JSONWizard):
    feature: ChartDataFeature
    country: Country
