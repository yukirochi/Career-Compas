import sqlite3
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

origins = [
    'http://localhost:5173',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           
    allow_credentials=True,
    allow_methods=["*"],             
    allow_headers=["*"],            
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
    input_skill = request.skill.lower().strip().replace('|'," ").replace(","," ").replace("-"," ")
    input_split = input_skill.split()
    phrases = []
    
    limit = min(len(input_split), 3)
    
    for x in range(1, limit + 1):
        for i in range(len(input_split) - x + 1):
            phrase = " ".join(input_split[i:i + x])
            phrases.append(f"|{phrase}|")
    def search_to_sql(table_column):
        conditions = []  
        for res in phrases:
            conditions.append(f" {table_column} LIKE '%{res}%'")

        where_clause = " OR ".join(conditions)   
        query = f"SELECT * FROM job_list WHERE {where_clause}"  
        sql_res = pd.read_sql_query(query, connection)
        return sql_res.to_dict(orient='records')
    
    search_results = []
    for col in ['required_skills', 'tools_used', 'related_words']:
        search_results += search_to_sql(col)

    return search_results

@app.get("/all_jobs")   
def get_all_jobs():
    query = "SELECT * FROM job_list"
    sql_result = pd.read_sql_query(query, connection)
    return sql_result.to_dict(orient='records')     

