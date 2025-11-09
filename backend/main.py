from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, create_engine, select

# =====================================
# MODELOS (tablas del MVP FINTIVA)
# =====================================
class Usuario(SQLModel, table=True):
    id_usuario: Optional[int] = Field(default=None, primary_key=True)
    nombre_completo: str
    contrasena_hash: str
    sociedad: Optional[str] = None
    dia_nac: Optional[int] = None
    mes_nac: Optional[int] = None
    anio_nac: Optional[int] = None
    curp: Optional[str] = Field(default=None, max_length=18)
    telefono: Optional[str] = None
    calle: Optional[str] = None
    colonia: Optional[str] = None
    municipio: Optional[str] = None
    estado: Optional[str] = None
    persona_referenciada: Optional[str] = None
    telefono_referencia: Optional[str] = None
    creado_en: Optional[datetime] = Field(default_factory=datetime.utcnow)
    actualizado_en: Optional[datetime] = None

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
    gasto_mano_obra: float = 0.0
    gasto_combustible: float = 0.0
    periodo: Optional[str] = None   # e.g. "2025Q4" o "2025-11"

# =====================================
# DB ENGINE / SESSION
# =====================================
DATABASE_URL = "sqlite:///db.sqlite3"
engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)

def create_db_and_tables():
    """
    Si ya creaste la base con SQL, esto no hace daño (CREATE IF NOT EXISTS).
    Mantener por seguridad en dev.
    """
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# =====================================
# APP
# =====================================
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
    create_db_and_tables()

# =====================================
# HEALTH
# =====================================
@app.get("/health")
def health():
    return {"status": "ok"}

# =====================================
# USUARIOS
# =====================================
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
    session: Session = Depends(get_session)
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
    session: Session = Depends(get_session)
):
    obj = session.get(Usuario, id_usuario)
    if not obj:
        raise HTTPException(404, "Usuario no encontrado")
    data = payload.model_dump(exclude_unset=True)
    data.pop("id_usuario", None)
    for k, v in data.items():
        setattr(obj, k, v)
    obj.actualizado_en = datetime.utcnow()
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

# =====================================
# PARCELAS
# =====================================
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
def parcelas_de_usuario(
    id_usuario: int,
    session: Session = Depends(get_session)
):
    stmt = select(Parcela).where(Parcela.id_usuario == id_usuario)
    return session.exec(stmt).all()

# =====================================
# CULTIVOS
# =====================================
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

# =====================================
# GASTOS
# =====================================
@app.post("/gastos", response_model=Gastos, status_code=201)
def crear_gastos(payload: Gastos, session: Session = Depends(get_session)):
    if not session.get(Usuario, payload.id_usuario):
        raise HTTPException(400, "id_usuario inválido")
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload

@app.get("/gastos/{id_gastos}", response_model=Gastos)
def obtener_gasto(id_gastos: int, session: Session = Depends(get_session)):
    obj = session.get(Gastos, id_gastos)
    if not obj:
        raise HTTPException(404, "Registro de gastos no encontrado")
    return obj

@app.get("/usuarios/{id_usuario}/gastos", response_model=List[Gastos])
def gastos_de_usuario(
    id_usuario: int,
    periodo: Optional[str] = Query(None, description="Ej: 2025Q4 o 2025-11"),
    session: Session = Depends(get_session)
):
    stmt = select(Gastos).where(Gastos.id_usuario == id_usuario)
    if periodo:
        stmt = stmt.where(Gastos.periodo == periodo)
    return session.exec(stmt).all()

# =====================================
# JOIN útil (demo): cultivos por usuario
# =====================================
@app.get("/reportes/cultivos-por-usuario")
def reporte_cultivos_por_usuario(session: Session = Depends(get_session)):
    from sqlalchemy import text
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
    # lo regresamos como lista de dicts
    cols = ["id_usuario","nombre_completo","id_parcela","nombre_parcela",
            "id_cultivo","tipo_cultivo","mes_siembra","mes_cosecha"]
    return [dict(zip(cols, r)) for r in rows]

# =====================================
# MAIN
# =====================================
# Ejecuta: uvicorn main:app --reload
