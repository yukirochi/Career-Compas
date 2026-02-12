import sqlite3
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow the client dev server (Vite) to access this API during development
origins = [
    "https://career-compas-5ty7.vercel.app",
    'http://localhost:5173',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Allow your specific URLs
    allow_credentials=True,
    allow_methods=["*"],             # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],             # Allow all headers
)

#sqlite connection and cursor creation
connection = sqlite3.connect('job_list.db', check_same_thread=False)    
cursor = connection.cursor()



class JobSearchRequest(BaseModel):
    skill: str
    
@app.get("/")
def read_root():
    return {"HELLO": "WORLD"}    

@app.post("/search_jobs")
def search_jobs(request: JobSearchRequest):
    input_skill = request.skill.lower().strip()
    input_split = input_skill.split()
    result = []
    
    for skill in input_split:
        query = "SELECT * FROM job_list WHERE required_skills LIKE ?"
        sql_result = pd.read_sql_query(query, connection, params=(f'%{skill}%',))
        if not sql_result.empty:
            result.append(sql_result)

    if result:
        skill = pd.concat(result, ignore_index=True).drop_duplicates(subset=['job_title'])
        return skill.to_dict(orient='records')
@app.get("/all_jobs")
def get_all_jobs():
    query = "SELECT * FROM job_list"
    sql_result = pd.read_sql_query(query, connection)
    return sql_result.to_dict(orient='records')     