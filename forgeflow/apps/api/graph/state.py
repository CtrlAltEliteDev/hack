from typing import TypedDict, Optional, Any

class WorkflowState(TypedDict):
    # Input
    project_id: str
    idea: str
    stack: str
    team_size: int
    deadline: str
    constraints: str

    # Agent outputs — accumulated as workflow progresses
    parsed_input: Optional[dict]      # Intake Agent
    scope: Optional[dict]             # PM Agent
    architecture: Optional[dict]      # Architect Agent
    scaffold: Optional[dict]          # Scaffold Agent
    review: Optional[dict]            # Reviewer Agent
    delivery: Optional[dict]          # Delivery Agent

    # Control
    current_step: str
    error: Optional[str]
