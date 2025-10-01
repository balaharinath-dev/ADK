from fastapi import FastAPI
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI()

@app.get("/prompt")
async def get_prompt():
    return JSONResponse(content={"prompt": "This is your prompt!"})

if __name__ == "__main__":
    uvicorn.run("app:app", host="localhost", port=8000, reload=True)