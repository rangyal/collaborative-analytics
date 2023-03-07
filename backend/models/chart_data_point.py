from dataclasses import dataclass, field

from dataclass_wizard import JSONWizard

from models.chart_data_feature import ChartDataFeature
from models.country import Country


@dataclass
class ChartDataPoint(JSONWizard):
    feature: ChartDataFeature
    country: Country

    def __eq__(self, other):
        if isinstance(other, ChartDataPoint):
            return self.feature == other.feature and self.country == other.country
        return NotImplemented
