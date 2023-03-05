from dataclasses import dataclass

from dataclass_wizard import JSONWizard


@dataclass
class Comment(JSONWizard):
    user_name: str
    text: str
