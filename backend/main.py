from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, create_engine, select
import uvicorn

# ==============================
# MODELOS (SQLModel + Pydantic)
# ==============================
class FruitBase(SQLModel):
    name: str

class Fruit(FruitBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class FruitCreate(FruitBase):
    pass

class FruitRead(FruitBase):
    id: int

class FruitUpdate(SQLModel):
    name: Optional[str] = None

# ==============================
# DB ENGINE / SESSION
# ==============================
DATABASE_URL = "sqlite:///db.sqlite3"
# check_same_thread=False para evitar problemas con SQLite en apps ASGI
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# ==============================
# APP
# ==============================
app = FastAPI(title="Fintiva API")

origins = [
    "http://localhost:3000",  # CRA
    "http://localhost:5173",  # Vite
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# ==============================
# ENDPOINTS
# ==============================
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/fruits", response_model=List[FruitRead])
def list_fruits(
    name: Optional[str] = Query(None, description="Filtro por nombre contiene"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    session: Session = Depends(get_session),
):
    stmt = select(Fruit)
    if name:
        # filtro simple "contains" (LIKE)
        stmt = stmt.where(Fruit.name.contains(name))
    stmt = stmt.offset(skip).limit(limit)
    return session.exec(stmt).all()

@app.get("/fruits/{fruit_id}", response_model=FruitRead)
def get_fruit(fruit_id: int, session: Session = Depends(get_session)):
    fruit = session.get(Fruit, fruit_id)
    if not fruit:
        raise HTTPException(404, "Fruit not found")
    return fruit

@app.post("/fruits", response_model=FruitRead, status_code=201)
def create_fruit(payload: FruitCreate, session: Session = Depends(get_session)):
    fruit = Fruit(**payload.model_dump())
    session.add(fruit)
    session.commit()
    session.refresh(fruit)
    return fruit

@app.patch("/fruits/{fruit_id}", response_model=FruitRead)
def update_fruit(fruit_id: int, payload: FruitUpdate, session: Session = Depends(get_session)):
    fruit = session.get(Fruit, fruit_id)
    if not fruit:
        raise HTTPException(404, "Fruit not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(fruit, k, v)
    session.add(fruit)
    session.commit()
    session.refresh(fruit)
    return fruit

@app.delete("/fruits/{fruit_id}", status_code=204)
def delete_fruit(fruit_id: int, session: Session = Depends(get_session)):
    fruit = session.get(Fruit, fruit_id)
    if not fruit:
        raise HTTPException(404, "Fruit not found")
    session.delete(fruit)
    session.commit()
    return

if __name__ == "__main__":
    # Ejecuta: uvicorn main:app --reload
    uvicorn.run(app, host="0.0.0.0", port=8000)
