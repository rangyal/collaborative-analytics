from dataclasses import dataclass

from dataclass_wizard import JSONWizard

from models.comment import Comment


@dataclass
class RespondToThreadRequest(JSONWizard):
    comment: Comment
