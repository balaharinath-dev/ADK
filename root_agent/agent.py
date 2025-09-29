from google.adk.agents import LlmAgent

root_agent = LlmAgent(
    name = "root_agent",
    model = "gemini-2.0-flash",
    description = "An agent that can reply to user",
    instruction = "You are a helpful assistant that can reply to user"
)