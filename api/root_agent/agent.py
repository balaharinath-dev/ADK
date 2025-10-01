from google.adk.agents import LlmAgent
from google.adk.planners import PlanReActPlanner
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

from pydantic import BaseModel, Field

from datetime import datetime

from google.genai import types

from dotenv import load_dotenv

load_dotenv()

APP_NAME = "TIME_APP"
USER_ID = "USER_1"
SESSION_ID = "SESSION_1"
    
def get_current_time_tool(query: str) -> str:
    return datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    
def get_current_location_tool(query: str) -> str:
    return "Chennai, India"

time_agent = LlmAgent(
    name = "time_agent",
    model = "gemini-2.0-flash",
    description = "An agent that provides the current time.",
    instruction = "You are a helpful assistant that provides the current time when asked.",
    planner = PlanReActPlanner(),
    tools = [get_current_time_tool]
)

location_agent = LlmAgent(
    name = "location_agent",
    model = "gemini-2.0-flash",
    description = "An agent that provides the current location.",
    instruction = "You are a helpful assistant that provides the current location when asked.",
    planner = PlanReActPlanner(),
    tools = [get_current_location_tool]
)

root_agent = LlmAgent(
    name = "root_agent",
    model = "gemini-2.0-flash",
    description = "An agent that provides the current time or location or both the details.",
    instruction = """
                    You are a helpful assistant that provides the current time or location or both the details when asked.
                    You have access to two sub-agents: time_agent and location_agent.
                    Use time_agent to get the current time and location_agent to get the current location.
                    Based on the user's query, decide which sub-agent(s) to call.
                  """,
    planner = PlanReActPlanner(),
    output_key= "current_output",
    sub_agents = [time_agent, location_agent]
)

# session_service = InMemorySessionService()
# session = session_service.create_session(app_name = APP_NAME,user_id = USER_ID, session_id = SESSION_ID)
# runner = Runner(agent = root_agent, app_name = APP_NAME, session_service = session_service)

# def call_agent(query: str) -> str:
#     content = types.Content(role = "user", parts = [types.Part(text = query)])
#     events = runner.run(user_id = USER_ID, session_id = SESSION_ID, new_message = content)
    
#     for event in events:
#         if event.is_final_response() and event.content:
#             print("Final response: ", event.content.parts[0].text.strip())
            
# call_agent("What is the current time?")