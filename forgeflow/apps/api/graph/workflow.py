from langgraph.graph import StateGraph, END
from graph.state import WorkflowState
from agents.intake import intake_agent
from agents.pm import pm_agent
from agents.architect import architect_agent
from agents.scaffold import scaffold_agent
from agents.reviewer import reviewer_agent
from agents.delivery import delivery_agent


def build_graph() -> StateGraph:
    graph = StateGraph(WorkflowState)

    graph.add_node("intake", intake_agent)
    graph.add_node("pm", pm_agent)
    graph.add_node("architect", architect_agent)
    # Node names must not match WorkflowState keys (LangGraph restriction).
    graph.add_node("scaffold_agent", scaffold_agent)
    graph.add_node("reviewer", reviewer_agent)
    graph.add_node("delivery_agent", delivery_agent)

    graph.set_entry_point("intake")
    graph.add_edge("intake", "pm")
    graph.add_edge("pm", "architect")
    graph.add_edge("architect", "scaffold_agent")
    graph.add_edge("scaffold_agent", "reviewer")
    graph.add_edge("reviewer", "delivery_agent")
    graph.add_edge("delivery_agent", END)

    return graph.compile()


compiled_graph = build_graph()


async def run_workflow(
    project_id: str,
    idea: str,
    stack: str,
    team_size: int,
    deadline: str,
    constraints: str,
) -> WorkflowState:
    initial: WorkflowState = {
        "project_id": project_id,
        "idea": idea,
        "stack": stack,
        "team_size": team_size,
        "deadline": deadline,
        "constraints": constraints,
        "parsed_input": None,
        "scope": None,
        "architecture": None,
        "scaffold": None,
        "review": None,
        "delivery": None,
        "current_step": "start",
        "error": None,
    }
    result = await compiled_graph.ainvoke(initial)
    return result
