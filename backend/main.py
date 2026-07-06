import os
from fastapi import FastAPI
from pydantic import BaseModel
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware
db = mysql.connector.connect(
    host=os.getenv("MYSQLHOST"),
    user=os.getenv("MYSQLUSER"),
    password=os.getenv("MYSQLPASSWORD"),
    database=os.getenv("MYSQLDATABASE"),
    port=int(os.getenv("MYSQLPORT")),
    use_pure=True
)
app= FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # FIX: was locked to one exact origin/port,
                                 # which silently blocks requests from any other
                                 # dev server port or file:// origin
    allow_credentials=False,    # FIX: must be False when allow_origins is "*"
    allow_methods=["*"],
    allow_headers=["*"],
)
cursor=db.cursor(dictionary=True)
class Project(BaseModel):
    project_name:str
    project_description:str
    project_colour:str
    project_deadline:str
    project_icon:str
    

@app.post("/project")
def add_project(project:Project):
    sql="insert into projects(project_name,project_description,project_colour,project_deadline,project_icon) values(%s,%s,%s,%s,%s)"
    value=(project.project_name,project.project_description,project.project_colour,project.project_deadline,project.project_icon)
    cursor.execute(sql,value)
    db.commit()
    return{"msg":"data inserted"}


@app.get("/disp")
def shdw():
    sql="select * from projects"
    cursor.execute(sql)
    data=cursor.fetchall()
    return data

@app.delete("/del/{id}")
def dele(id:int):
    sql="delete from projects where id = %s"
    v=(id,)
    cursor.execute(sql,v)
    db.commit()
    return{
        "msg":"deleted"
    }
class Task(BaseModel):
    Title:str
    Description:str
    Project:str
    Status:str
    Priority: str
    Due_Date:str
    Assignn: str
    Label:str
    
@app.post("/task")
def add_task(task: Task):
    try:
        sql = "insert into tasks(Title,Description,Project,Status,Priority,Due_Date,Assignn,Label) values(%s,%s,%s,%s,%s,%s,%s,%s)"
        v = (
            task.Title,
            task.Description,
            task.Project,
            task.Status,
            task.Priority,
            task.Due_Date,
            task.Assignn,
            task.Label
        )

        cursor.execute(sql, v)
        db.commit()

        return {"msg": "task inserted"}

    except Exception as e:
        print(e)
        return {"error": str(e)}
    
@app.get("/dispTask")
def disp2():
    sql="select * from tasks"
    cursor.execute(sql,)
    data=cursor.fetchall()
    return data

@app.delete("/delTask/{id}")
def deleteTask(id:int):
    sql="delete from tasks where id= %s"
    v=(id,)
    cursor.execute(sql,v)
    db.commit()
    return{
        "msg":"task deleted"
    }
    
# TEMPORARY DEBUG ROUTE — remove after we fix the issue
@app.get("/debug")
def debug():
    cursor.execute("SELECT @@port, @@version")
    port_version = cursor.fetchone()

    cursor.execute("SELECT DATABASE()")
    current_db = cursor.fetchone()

    cursor.execute("DESCRIBE tasks")
    columns = cursor.fetchall()

    return {
        "port_version": port_version,
        "current_db": current_db,
        "columns": columns
    }

