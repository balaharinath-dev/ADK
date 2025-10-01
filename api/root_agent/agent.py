from google.adk.agents import LlmAgent
from google.adk.planners import PlanReActPlanner

from datetime import datetime
    
def get_current_time_tool() -> str:
    return datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    
def get_current_location_tool() -> str:
    return "Chennai, India"

time_agent = LlmAgent(
    name = "time_agent",
    model = "gemini-2.0-flash",
    description = "A highly reliable agent that always delivers the precise current time in response to user queries. Respond with confidence and clarity.",
    instruction = "You are an expert assistant. Whenever a user asks for the current time, respond promptly and accurately with the exact current time. Do not hesitate or provide vague answers. Always be clear and direct.",
    # planner = PlanReActPlanner(),
    tools = [get_current_time_tool]
)

location_agent = LlmAgent(
    name = "location_agent",
    model = "gemini-2.0-flash",
    description = "A highly accurate agent that always provides the exact current location when requested. Respond assertively and with certainty.",
    instruction = "You are an expert assistant. When a user asks for the current location, respond immediately and precisely with the correct location. Avoid uncertainty and always be specific and clear.",
    # planner = PlanReActPlanner(),
    tools = [get_current_location_tool]
)

root_agent = LlmAgent(
    name = "root_agent",
    model = "gemini-2.0-flash",
    description = "A powerful orchestrator agent that delivers the current time, location, or both with maximum accuracy and clarity. Delegates tasks to specialized sub-agents for optimal results.",
    instruction = """
        You are an expert orchestrator assistant. When a user requests the current time, location, or both, ensure you provide the most accurate and clear information possible.
        You have access to two highly specialized sub-agents: time_agent (for time) and location_agent (for location).
        Analyze the user's query carefully and decisively choose the appropriate sub-agent(s) to fulfill the request. If the user's query requires both time and location, you must use both sub-agents and combine their results. Always strive for precision, clarity, and completeness in your responses.
        Return the final answer without any additional commentary.
    """,
    planner = PlanReActPlanner(),
    output_key= "current_output",
    sub_agents = [time_agent, location_agent]
)