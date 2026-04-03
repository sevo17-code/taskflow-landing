from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=140)
    priority: Literal["low", "medium", "high"] = "medium"


class TodoUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=140)
    priority: Literal["low", "medium", "high"] | None = None
    done: bool | None = None


class Todo(TodoCreate):
    id: str
    done: bool = False


class BoardCardCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=140)
    tag: str = Field(..., min_length=1, max_length=40)


class BoardMove(BaseModel):
    source: Literal["backlog", "building", "launched"]
    destination: Literal["backlog", "building", "launched"]


class PomodoroSettings(BaseModel):
    focus: int = Field(..., ge=5, le=60)
    short: int = Field(..., ge=3, le=30)
    long: int = Field(..., ge=5, le=45)


app = FastAPI(
    title="TaskFlow API",
    version="0.1.0",
    description="Starter backend for tasks, kanban cards, and pomodoro settings.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

todos: list[Todo] = [
    Todo(id="t1", title="Draft launch checklist", priority="high", done=False),
    Todo(id="t2", title="Write onboarding copy", priority="medium", done=False),
    Todo(id="t3", title="Review focus mode UX", priority="low", done=True),
]

board: dict[str, list[dict[str, str]]] = {
    "backlog": [
        {"id": "c1", "title": "Competitive research summary", "tag": "Research"},
        {"id": "c2", "title": "Billing upsell experiment", "tag": "Growth"},
    ],
    "building": [
        {"id": "c3", "title": "Marketing site polish", "tag": "Design"},
        {"id": "c4", "title": "Reminder automation", "tag": "Automation"},
    ],
    "launched": [
        {"id": "c5", "title": "Workspace bootstrap", "tag": "Ops"},
    ],
}

pomodoro = PomodoroSettings(focus=25, short=5, long=15)


def calculate_stats() -> dict[str, int]:
    total = len(todos)
    completed = len([todo for todo in todos if todo.done])
    active = total - completed
    high_priority = len(
        [todo for todo in todos if todo.priority == "high" and not todo.done]
    )

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "active_tasks": active,
        "high_priority_open_tasks": high_priority,
        "board_cards": sum(len(cards) for cards in board.values()),
    }


def get_todo_or_404(todo_id: str) -> Todo:
    for todo in todos:
        if todo.id == todo_id:
            return todo
    raise HTTPException(status_code=404, detail="Todo not found")


def get_card_or_404(card_id: str) -> tuple[str, dict[str, str]]:
    for column, cards in board.items():
        for card in cards:
            if card["id"] == card_id:
                return column, card
    raise HTTPException(status_code=404, detail="Card not found")


@app.get("/")
def root() -> dict[str, str]:
    return {
        "message": "TaskFlow FastAPI is running",
        "docs": "/docs",
        "health": "/health",
        "dashboard_endpoint": "/api/dashboard",
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/dashboard")
def get_dashboard() -> dict[str, object]:
    return {
        "stats": calculate_stats(),
        "todos": todos,
        "board": board,
        "pomodoro": pomodoro,
    }


@app.get("/api/todos", response_model=list[Todo])
def list_todos() -> list[Todo]:
    return todos


@app.post("/api/todos", response_model=Todo, status_code=status.HTTP_201_CREATED)
def create_todo(payload: TodoCreate) -> Todo:
    todo = Todo(id=str(uuid4()), title=payload.title, priority=payload.priority, done=False)
    todos.insert(0, todo)
    return todo


@app.patch("/api/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: str, payload: TodoUpdate) -> Todo:
    todo = get_todo_or_404(todo_id)
    update_data = payload.model_dump(exclude_unset=True)
    updated = todo.model_copy(update=update_data)
    index = todos.index(todo)
    todos[index] = updated
    return updated


@app.delete("/api/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: str) -> Response:
    todo = get_todo_or_404(todo_id)
    todos.remove(todo)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/api/board")
def get_board() -> dict[str, list[dict[str, str]]]:
    return board


@app.post("/api/board/{column}", status_code=status.HTTP_201_CREATED)
def create_board_card(
    column: Literal["backlog", "building", "launched"], payload: BoardCardCreate
) -> dict[str, str]:
    card = {"id": str(uuid4()), "title": payload.title, "tag": payload.tag}
    board[column].append(card)
    return card


@app.post("/api/board/{card_id}/move")
def move_board_card(card_id: str, payload: BoardMove) -> dict[str, object]:
    source_column, card = get_card_or_404(card_id)

    if source_column != payload.source:
        raise HTTPException(
            status_code=400,
            detail="Card source does not match the current board location",
        )

    if payload.source == payload.destination:
        return {"message": "Card already in the requested column", "board": board}

    board[payload.source] = [
        existing for existing in board[payload.source] if existing["id"] != card_id
    ]
    board[payload.destination].append(card)
    return {"message": "Card moved", "board": board}


@app.get("/api/pomodoro", response_model=PomodoroSettings)
def get_pomodoro() -> PomodoroSettings:
    return pomodoro


@app.put("/api/pomodoro", response_model=PomodoroSettings)
def update_pomodoro(payload: PomodoroSettings) -> PomodoroSettings:
    global pomodoro
    pomodoro = payload
    return pomodoro
