from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from pydantic import BaseModel

# Existing imports and schemas...

class Message(BaseModel):
    message: str

# Todo Schemas
class TodoBase(BaseModel):
    task: Optional[str] = None
    completed: Optional[bool] = None
    datetime: Optional[datetime] = None

class TodoCreate(TodoBase):
    id: str
    user_id: int

class Todo(TodoBase):
    id: str
    user_id: int

    class Config:
        orm_mode = True

# User Schemas
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    display_name: Optional[str] = None
    profile_pic: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    display_name: Optional[str] = None
    profile_pic: Optional[str] = None
    todos: List[Todo] = []

    class Config:
        orm_mode = True
