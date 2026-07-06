import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector

load_dotenv()


def get_db():
    return mysql.connector.connect(
        host=os.getenv("MYSQLHOST"),
        user=os.getenv("MYSQLUSER"),
        password=os.getenv("MYSQLPASSWORD"),
        database=os.getenv("MYSQLDATABASE"),
        port=int(os.getenv("MYSQLPORT")),
        use_pure=True
    )


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create tables once when app starts
db = get_db()
cursor = db.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS projects(
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255),
    project_description TEXT,
    project_colour VARCHAR(100),
    project_deadline DATE,
    project_icon VARCHAR(255)
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS tasks(
    id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255),
    Description TEXT,
    Project VARCHAR(255),
    Status VARCHAR(100),
    Priority VARCHAR(100),
    Due_Date DATE,
    Assignn VARCHAR(255),
    Label VARCHAR(255)
)
""")

db.commit()
cursor.close()
db.close()
class Project(BaseModel):
    project_name: str
    project_description: str
    project_colour: str
    project_deadline: str
    project_icon: str


@app.post("/project")
def add_project(project: Project):

    db = get_db()
    cursor = db.cursor(dictionary=True)

    sql = """
    INSERT INTO projects
    (project_name,project_description,project_colour,project_deadline,project_icon)
    VALUES(%s,%s,%s,%s,%s)
    """

    value = (
        project.project_name,
        project.project_description,
        project.project_colour,
        project.project_deadline,
        project.project_icon
    )

    cursor.execute(sql, value)
    db.commit()

    cursor.close()
    db.close()

    return {"msg": "data inserted"}


@app.get("/disp")
def shdw():

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM projects")
    data = cursor.fetchall()

    cursor.close()
    db.close()

    return data

@app.delete("/del/{id}")
def dele(id: int):

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("DELETE FROM projects WHERE id=%s", (id,))
    db.commit()

    cursor.close()
    db.close()

    return {"msg": "deleted"}
class Task(BaseModel):
    Title: str
    Description: str
    Project: str
    Status: str
    Priority: str
    Due_Date: str
    Assignn: str
    Label: str


@app.post("/task")
def add_task(task: Task):

    db = get_db()
    cursor = db.cursor(dictionary=True)

    sql = """
    INSERT INTO tasks
    (Title,Description,Project,Status,Priority,Due_Date,Assignn,Label)
    VALUES(%s,%s,%s,%s,%s,%s,%s,%s)
    """

    value = (
        task.Title,
        task.Description,
        task.Project,
        task.Status,
        task.Priority,
        task.Due_Date,
        task.Assignn,
        task.Label
    )

    cursor.execute(sql, value)
    db.commit()

    cursor.close()
    db.close()

    return {"msg": "task inserted"}
    
@app.get("/dispTask")
def disp2():

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM tasks")
    data = cursor.fetchall()

    cursor.close()
    db.close()

    return data

@app.delete("/delTask/{id}")
def deleteTask(id: int):

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("DELETE FROM tasks WHERE id=%s", (id,))
    db.commit()

    cursor.close()
    db.close()

    return {"msg": "task deleted"}
    
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

