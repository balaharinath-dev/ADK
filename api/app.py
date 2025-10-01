from fastapi import FastAPI

import uvicorn

from pydantic import BaseModel, Field

from root_agent.agent import root_agent

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

from google.genai import types

from dotenv import load_dotenv

import asyncio

load_dotenv()

app = FastAPI()

APP_NAME = "TEST_APP"
USER_ID = "USER_1"
SESSION_ID = "SESSION_1"

class UserPrompt(BaseModel):
    text: str = Field(..., description = "User's prompt text")
    
class AgentResponse(BaseModel):
    text: str = Field(..., description = "Agent's response text")

@app.post("/prompt")
async def get_prompt(user_prompt: UserPrompt) -> AgentResponse:
    user_prompt_text = user_prompt.text
    
    async def run_agent(query: str) -> str:
        session_service = InMemorySessionService()
        session = await session_service.create_session(app_name = APP_NAME,user_id = USER_ID, session_id = SESSION_ID)
        runner = Runner(agent = root_agent, app_name = APP_NAME, session_service = session_service)

        content = types.Content(role = "user", parts = [types.Part(text = query)])
        events = runner.run_async(user_id = USER_ID, session_id = SESSION_ID, new_message = content)
        
        async for event in events:
            print("EVENT:", event)
            if event.is_final_response() and event.content:
                if len(event.content.parts) > 1:
                    print("SESSION STATE:", session.state)
                    return event.content.parts[-1].text.strip()
                print("SESSION STATE:", session.state)
                return event.content.parts[0].text.strip()
                    
    agent_response_text = await run_agent(user_prompt_text)
    agent_response = AgentResponse(text=agent_response_text)
    
    return agent_response
        
if __name__ == "__main__":
    uvicorn.run("app:app", host="localhost", port=8000, reload=True)