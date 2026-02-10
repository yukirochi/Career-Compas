import sqlite3
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

#sqlite connection and cursor creation
connection = sqlite3.connect('data.db', check_same_thread=False)    
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
        query = "SELECT * FROM jobs_table WHERE required_skills LIKE ?"
        sql_result = pd.read_sql_query(query, connection, params=(f'%{skill}%',))
        if not sql_result.empty:
            result.append(sql_result)

    if result:
        combined_result = pd.concat(result, ignore_index=True).drop_duplicates(subset=['job_title'])
        return {"jobs": combined_result.to_dict(orient="records")}