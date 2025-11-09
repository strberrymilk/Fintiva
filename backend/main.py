from typing import List, Optional
from pathlib import Path
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, func, Integer, DateTime, Column
from sqlmodel import SQLModel, Field, Session, create_engine, select

# === JWT (solo para sesiones) ===
from jose import jwt
from pydantic import BaseModel

SECRET_KEY = "CAMBIA-ESTE-VALOR-LARGO-Y-ALEATORIO"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

def create_access_token(data: dict, minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(minutes=minutes)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# =========================
# MODELOS (tablas)
# =========================
class Usuario(SQLModel, table=True):
    id_usuario: Optional[int] = Field(default=None, primary_key=True)
    nombre_completo: str
    # Guardado en TEXTO PLANO por requerimiento
    contrasena_hash: str
    sociedad: Optional[str] = None
    dia_nac: Optional[int] = None
    mes_nac: Optional[int] = None
    anio_nac: Optional[int] = None
    curp: Optional[str] = Field(default=None, max_length=18, index=True)
    telefono: Optional[str] = Field(default=None, index=True)
    calle: Optional[str] = None
    colonia: Optional[str] = None
    municipio: Optional[str] = None
    estado: Optional[str] = None
    persona_referenciada: Optional[str] = None
    telefono_referencia: Optional[str] = None

class Parcela(SQLModel, table=True):
    id_parcela: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuario.id_usuario")
    nombre_parcela: str
    ubicacion: Optional[str] = None
    tamano: Optional[str] = None
    tipo_tenencia: Optional[str] = None
    sistema_riego: Optional[str] = None

class Cultivo(SQLModel, table=True):
    id_cultivo: Optional[int] = Field(default=None, primary_key=True)
    id_parcela: int = Field(foreign_key="parcela.id_parcela")
    tipo_cultivo: str
    mes_siembra: Optional[int] = None
    mes_cosecha: Optional[int] = None
    produccion_anio_pasado: Optional[int] = None
    produccion_anio_antepasado: Optional[int] = None

class Gastos(SQLModel, table=True):
    id_gastos: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuario.id_usuario")
    gasto_agua: float = 0.0
    gasto_gas: float = 0.0
    gasto_luz: float = 0.0
    gasto_semillas: float = 0.0
    gasto_fertilizantes: float = 0.0
    gasto_mantenimiento: float = 0.0
    gasto_combustible: float = 0.0
    # NUEVO: columna usada para agrupar por trimestre (mapeada al modelo)
    creado_en: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    )

# =========================
# Schemas (entradas/salidas)
# =========================
class UsuarioOut(BaseModel):
    id_usuario: int
    nombre_completo: str
    curp: Optional[str] = None
    telefono: Optional[str] = None
    estado: Optional[str] = None
    class Config:
        from_attributes = True

class RegistrarUsuarioIn(BaseModel):
    nombre_completo: str
    contrasena: str                 # TEXTO PLANO
    curp: Optional[str] = None
    telefono: Optional[str] = None
    estado: Optional[str] = None

class LoginIn(BaseModel):
    identificador: str  # teléfono o CURP
    contrasena: str     # TEXTO PLANO

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class GastosIn(SQLModel):
    id_usuario: Optional[int] = None
    gasto_agua: Optional[float] = 0.0
    gasto_gas: Optional[float] = 0.0
    gasto_luz: Optional[float] = 0.0
    gasto_semillas: Optional[float] = 0.0
    gasto_fertilizantes: Optional[float] = 0.0
    gasto_mantenimiento: Optional[float] = 0.0
    gasto_combustible: Optional[float] = 0.0

# =========================
# DB ENGINE / SESSION
# =========================
BASE_DIR = Path(__file__).resolve().parent
DB_FILE = (BASE_DIR / "db.sqlite3").as_posix()
DATABASE_URL = f"sqlite:///{DB_FILE}"

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# =========================
# APP
# =========================
app = FastAPI(title="FINTIVA API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://fintiva.onrender.com",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ÚNICA función de startup
@app.on_event("startup")
def on_startup():
    print(">>> DB path:", (BASE_DIR / "db.sqlite3").resolve())
    create_db_and_tables()
    # Garantiza la columna 'creado_en' si la DB ya existía
    with engine.connect() as conn:
        try:
            conn.exec_driver_sql(
                "ALTER TABLE gastos ADD COLUMN creado_en DATETIME DEFAULT (CURRENT_TIMESTAMP);"
            )
        except Exception:
            pass  # ya existe

# =========================
# ROOT & HEALTH
# =========================
@app.get("/")
def root():
    return {"ok": True}

@app.get("/health")
def health():
    return {"status": "ok"}

# =========================
# AUTH (registro + login) – SIN HASHES
# =========================
@app.post("/auth/register", response_model=UsuarioOut, status_code=201)
def registrar_usuario(payload: RegistrarUsuarioIn, session: Session = Depends(get_session)):
    if payload.telefono:
        if session.exec(select(Usuario).where(Usuario.telefono == payload.telefono)).first():
            raise HTTPException(409, "Teléfono ya registrado")
    if payload.curp:
        if session.exec(select(Usuario).where(Usuario.curp == payload.curp)).first():
            raise HTTPException(409, "CURP ya registrada")

    user = Usuario(
        nombre_completo=payload.nombre_completo,
        contrasena_hash=payload.contrasena,   # TEXTO PLANO
        curp=payload.curp,
        telefono=payload.telefono,
        estado=payload.estado,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginIn, session: Session = Depends(get_session)):
    user = session.exec(
        select(Usuario).where(
            (Usuario.telefono == payload.identificador) | (Usuario.curp == payload.identificador)
        )
    ).first()

    # Comparación en TEXTO PLANO
    if not user or (user.contrasena_hash or "") != payload.contrasena:
        raise HTTPException(401, "Credenciales inválidas")

    token = create_access_token({"sub": str(user.id_usuario), "name": user.nombre_completo})
    return TokenResponse(access_token=token)

# =========================
# USUARIOS (CRUD)
# =========================
@app.post("/usuarios", response_model=Usuario, status_code=201)
def crear_usuario(payload: Usuario, session: Session = Depends(get_session)):
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload

@app.get("/usuarios", response_model=List[Usuario])
def listar_usuarios(
    q: Optional[str] = Query(None, description="Busca por nombre (contains)"),
    estado: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    session: Session = Depends(get_session),
):
    stmt = select(Usuario)
    if q:
        stmt = stmt.where(Usuario.nombre_completo.contains(q))
    if estado:
        stmt = stmt.where(Usuario.estado == estado)
    stmt = stmt.offset(skip).limit(limit)
    return session.exec(stmt).all()

@app.get("/usuarios/{id_usuario}", response_model=Usuario)
def obtener_usuario(id_usuario: int, session: Session = Depends(get_session)):
    obj = session.get(Usuario, id_usuario)
    if not obj:
        raise HTTPException(404, "Usuario no encontrado")
    return obj

@app.patch("/usuarios/{id_usuario}", response_model=Usuario)
def actualizar_usuario(
    id_usuario: int,
    payload: Usuario,
    session: Session = Depends(get_session),
):
    obj = session.get(Usuario, id_usuario)
    if not obj:
        raise HTTPException(404, "Usuario no encontrado")
    data = payload.model_dump(exclude_unset=True)
    data.pop("id_usuario", None)
    for k, v in data.items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@app.delete("/usuarios/{id_usuario}", status_code=204)
def borrar_usuario(id_usuario: int, session: Session = Depends(get_session)):
    obj = session.get(Usuario, id_usuario)
    if not obj:
        raise HTTPException(404, "Usuario no encontrado")
    session.delete(obj)
    session.commit()
    return

# =========================
# PARCELAS
# =========================
@app.post("/parcelas", response_model=Parcela, status_code=201)
def crear_parcela(payload: Parcela, session: Session = Depends(get_session)):
    if not session.get(Usuario, payload.id_usuario):
        raise HTTPException(400, "id_usuario inválido")
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload

@app.get("/parcelas/{id_parcela}", response_model=Parcela)
def obtener_parcela(id_parcela: int, session: Session = Depends(get_session)):
    obj = session.get(Parcela, id_parcela)
    if not obj:
        raise HTTPException(404, "Parcela no encontrada")
    return obj

@app.get("/usuarios/{id_usuario}/parcelas", response_model=List[Parcela])
def parcelas_de_usuario(id_usuario: int, session: Session = Depends(get_session)):
    stmt = select(Parcela).where(Parcela.id_usuario == id_usuario)
    return session.exec(stmt).all()

# =========================
# CULTIVOS
# =========================
@app.post("/cultivos", response_model=Cultivo, status_code=201)
def crear_cultivo(payload: Cultivo, session: Session = Depends(get_session)):
    if not session.get(Parcela, payload.id_parcela):
        raise HTTPException(400, "id_parcela inválido")
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload

@app.get("/cultivos/{id_cultivo}", response_model=Cultivo)
def obtener_cultivo(id_cultivo: int, session: Session = Depends(get_session)):
    obj = session.get(Cultivo, id_cultivo)
    if not obj:
        raise HTTPException(404, "Cultivo no encontrado")
    return obj

@app.get("/parcelas/{id_parcela}/cultivos", response_model=List[Cultivo])
def cultivos_de_parcela(id_parcela: int, session: Session = Depends(get_session)):
    stmt = select(Cultivo).where(Cultivo.id_parcela == id_parcela)
    return session.exec(stmt).all()

# =========================
# GASTOS
# =========================
def _coerce_gastos_dict(d: dict) -> dict:
    for k in list(d.keys()):
        if k.startswith("gasto_"):
            val = d[k]
            if val is None:
                d[k] = 0.0
            else:
                try:
                    d[k] = float(val)
                except Exception:
                    d[k] = 0.0
    return d

@app.post("/gastos", response_model=Gastos, status_code=201)
def crear_gastos(payload: GastosIn, session: Session = Depends(get_session)):
    if not payload.id_usuario:
        raise HTTPException(422, "Falta id_usuario")
    if not session.get(Usuario, payload.id_usuario):
        raise HTTPException(400, "id_usuario inválido")
    data = _coerce_gastos_dict(payload.model_dump())
    obj = Gastos(**data)  # type: ignore
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@app.post("/usuarios/{id_usuario}/gastos", response_model=Gastos, status_code=201)
def crear_gastos_para_usuario(id_usuario: int, payload: GastosIn, session: Session = Depends(get_session)):
    if not session.get(Usuario, id_usuario):
        raise HTTPException(400, "id_usuario inválido")
    data = _coerce_gastos_dict(payload.model_dump())
    data["id_usuario"] = id_usuario
    obj = Gastos(**data)  # type: ignore
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@app.get("/gastos/{id_gastos}", response_model=Gastos)
def obtener_gasto(id_gastos: int, session: Session = Depends(get_session)):
    obj = session.get(Gastos, id_gastos)
    if not obj:
        raise HTTPException(404, "Registro de gastos no encontrado")
    return obj

@app.get("/usuarios/{id_usuario}/gastos", response_model=List[Gastos])
def gastos_de_usuario(id_usuario: int, session: Session = Depends(get_session)):
    stmt = select(Gastos).where(Gastos.id_usuario == id_usuario)
    return session.exec(stmt).all()

# =========================
# MÉTRICAS
# =========================
@app.get("/metrics/parcelas-cultivos/{id_usuario}")
def parcelas_cultivos(id_usuario: int, session: Session = Depends(get_session)):
    rows = session.exec(
        select(
            Parcela.id_parcela,
            Parcela.nombre_parcela,
            func.count(Cultivo.id_cultivo)
        )
        .join(Cultivo, Cultivo.id_parcela == Parcela.id_parcela, isouter=True)
        .where(Parcela.id_usuario == id_usuario)
        .group_by(Parcela.id_parcela, Parcela.nombre_parcela)
        .order_by(Parcela.nombre_parcela)
    ).all()

    data = [
        {"id_parcela": r[0], "parcela": r[1], "cultivos": int(r[2])}
        for r in rows
    ]
    return {"items": data}

@app.get("/metrics/gastos-trimestrales/{id_usuario}")
def gastos_trimestrales(id_usuario: int, session: Session = Depends(get_session)):
    total_expr = (
        func.coalesce(Gastos.gasto_agua, 0)
        + func.coalesce(Gastos.gasto_gas, 0)
        + func.coalesce(Gastos.gasto_luz, 0)
        + func.coalesce(Gastos.gasto_semillas, 0)
        + func.coalesce(Gastos.gasto_fertilizantes, 0)
        + func.coalesce(Gastos.gasto_mantenimiento, 0)
        + func.coalesce(Gastos.gasto_combustible, 0)
    )

    # Q = ((mes-1)//3)+1
    month_num = func.cast(func.strftime("%m", Gastos.creado_en), Integer)
    q_expr = ((month_num - 1) / 3 + 1).label("q")

    rows = session.exec(
        select(
            q_expr,
            func.sum(total_expr).label("total")
        )
        .where(Gastos.id_usuario == id_usuario)
        .group_by(q_expr)
        .order_by(q_expr)
    ).all()

    qmap = {int(q): float(total or 0) for (q, total) in rows}
    data = [
        {"trimestre": "Q1", "total": qmap.get(1, 0.0)},
        {"trimestre": "Q2", "total": qmap.get(2, 0.0)},
        {"trimestre": "Q3", "total": qmap.get(3, 0.0)},
        {"trimestre": "Q4", "total": qmap.get(4, 0.0)},
    ]
    return {"items": data}

# =========================
# Reporte demo
# =========================
@app.get("/reportes/cultivos-por-usuario")
def reporte_cultivos_por_usuario(session: Session = Depends(get_session)):
    sql = text("""
        SELECT u.id_usuario, u.nombre_completo,
               p.id_parcela, p.nombre_parcela,
               c.id_cultivo, c.tipo_cultivo, c.mes_siembra, c.mes_cosecha
        FROM usuario u
        JOIN parcela p  ON p.id_usuario = u.id_usuario
        JOIN cultivo c  ON c.id_parcela = p.id_parcela
        ORDER BY u.nombre_completo, p.nombre_parcela
    """)
    rows = session.exec(sql).all()
    cols = ["id_usuario","nombre_completo","id_parcela","nombre_parcela",
            "id_cultivo","tipo_cultivo","mes_siembra","mes_cosecha"]
    return [dict(zip(cols, r)) for r in rows]
