import json

chart_data: list = json.load(open('stub_data/chart_data.json'))


def get_chart_data() -> list:
    return chart_data
