from fastapi import FastAPI, Path, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel

app = FastAPI()

origins = ["*"]

app.add_middleware( #handle CORS
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

todos = {}

class Todo(BaseModel):
    id: Optional[str] = None
    task: Optional[str] = None
    completed: Optional[bool] = None
    datetime: Optional[str] = None
    userId: Optional[str] = None

@app.get("/")
def index():
    return {"message": "Welcome to todolist FastAPI!"}

# Get all todos by user id
@app.get("/todos/all/{user_id}")
def get_todos_by_userid(
    user_id: str = Path(..., description="The ID of the user owning the list.")
):
    todoRes = [todo for todo in todos.values() if todo.userId == user_id]
    if todoRes:
        return todoRes
    else:
        return {"Error": f"Todos with User ID {user_id} doesn't exist."}

# Get todo by task
@app.get("/todos/{task}")
def get_todos_by_task(
    task: str = Path(..., description="The task name.")
):
    todoRes = [todo for todo in todos.values() if todo.task == task]
    if todoRes:
        return todoRes
    else:
        return {"Error": f"Task doesn't exist"}

# Post todos (create new todos object in list)
@app.post("/todos/create")
def create_todos(newTodo: Todo):
    todoRes = [todo for todo in todos.values() if todo.id == newTodo.id]
    if todoRes: 
        return {"Error": "Task exists."}
    newTodo.completed = bool(0)
    todos[newTodo.id] = newTodo
    return todos[newTodo.id]

# Update todos
@app.put("/todos/edit/{todo_id}")
def update_todos(todo_id: str, updated_todo: Todo):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail=f"ID {todo_id} does not exist.")

    current_todo = todos[todo_id]

    if updated_todo.task is not None:
        current_todo.task = updated_todo.task
    if updated_todo.completed is not None:
        current_todo.completed = updated_todo.completed
    if updated_todo.datetime is not None:
        current_todo.datetime = updated_todo.datetime
    if updated_todo.userId is not None:
        current_todo.userId = updated_todo.userId

    todos[todo_id] = current_todo  
    return todos[todo_id]

# Delete todos by id
@app.delete("/todos/delete/{todos_id}")
def delete_todos(todos_id: str):
    if todos_id not in todos:
        return {"Error": f"ID {todos_id} does not exist."}
    del todos[todos_id]
    return {"Message": "Task deleted successfully."}