from typing import List, Optional
from pathlib import Path
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlmodel import SQLModel, Field, Session, create_engine, select

# === Seguridad (hash y JWT) ===
from passlib.context import CryptContext
from jose import jwt
from pydantic import BaseModel, EmailStr

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "CAMBIA-ESTE-VALOR-LARGO-Y-ALEATORIO"  # usa variable de entorno en prod
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

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
    contrasena: str
    curp: Optional[str] = None
    telefono: Optional[str] = None
    estado: Optional[str] = None

class LoginIn(BaseModel):
    identificador: str  # teléfono o CURP
    contrasena: str

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
    "http://localhost:3000",
    "http://localhost:5173",
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
    print(">>> DB path:", (BASE_DIR / "db.sqlite3").resolve())
    create_db_and_tables()

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
# AUTH (registro + login)
# =========================
@app.post("/auth/register", response_model=UsuarioOut, status_code=201)
def registrar_usuario(payload: RegistrarUsuarioIn, session: Session = Depends(get_session)):
    # Evita duplicados por teléfono o CURP si se proporcionan
    if payload.telefono:
        dup_tel = session.exec(select(Usuario).where(Usuario.telefono == payload.telefono)).first()
        if dup_tel:
            raise HTTPException(409, "Teléfono ya registrado")
    if payload.curp:
        dup_curp = session.exec(select(Usuario).where(Usuario.curp == payload.curp)).first()
        if dup_curp:
            raise HTTPException(409, "CURP ya registrada")

    user = Usuario(
        nombre_completo=payload.nombre_completo,
        contrasena_hash=hash_password(payload.contrasena),
        curp=payload.curp,
        telefono=payload.telefono,
        estado=payload.estado,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user  # pydantic lo transforma a UsuarioOut

@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginIn, session: Session = Depends(get_session)):
    # Buscar por teléfono o CURP
    user = session.exec(
        select(Usuario).where( (Usuario.telefono == payload.identificador) | (Usuario.curp == payload.identificador) )
    ).first()

    if not user or not verify_password(payload.contrasena, user.contrasena_hash):
        # Respuesta genérica para no filtrar qué falló
        raise HTTPException(401, "Credenciales inválidas")

    token = create_access_token({"sub": str(user.id_usuario), "name": user.nombre_completo})
    return TokenResponse(access_token=token)

# =========================
# USUARIOS (CRUD)
# =========================
@app.post("/usuarios", response_model=Usuario, status_code=201)
def crear_usuario(payload: Usuario, session: Session = Depends(get_session)):
    # Ojo: este endpoint crea usuarios esperando contrasena_hash directamente.
    # Para alta normal, usa /auth/register.
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
    # Si te mandan contrasena_hash nuevo (ya hasheado) se respeta.
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
# GASTOS (dos formas)
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
    print("POST /gastos payload:", payload.model_dump())
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
    print(f"POST /usuarios/{id_usuario}/gastos payload:", payload.model_dump())
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
