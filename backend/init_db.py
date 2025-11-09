# init_db.py — crea db.sqlite3 usando fintiva_schema.sql (o lo genera si no existe)
import sqlite3, pathlib

DB_PATH = "db.sqlite3"
SCHEMA_FILE = "fintiva_schema.sql"

# Si no existe el schema, lo creamos con el esquema básico y relaciones
DEFAULT_SCHEMA = r"""
PRAGMA foreign_keys = ON;

-- Tabla: usuario
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario            INTEGER PRIMARY KEY,
  nombre_completo       VARCHAR(200) NOT NULL,
  contrasena_hash       VARCHAR(255) NOT NULL,
  sociedad              VARCHAR(120),
  dia_nac               INTEGER,
  mes_nac               INTEGER,
  anio_nac              INTEGER,
  curp                  VARCHAR(18),
  telefono              VARCHAR(30),
  calle                 VARCHAR(200),
  colonia               VARCHAR(200),
  municipio             VARCHAR(200),
  estado                VARCHAR(120),
  persona_referenciada  VARCHAR(200),
  telefono_referencia   VARCHAR(30),
  creado_en             DATETIME DEFAULT CURRENT_TIMESTAMP,
  actualizado_en        DATETIME
);

CREATE INDEX IF NOT EXISTS idx_usuario_curp ON usuario(curp);
CREATE INDEX IF NOT EXISTS idx_usuario_estado ON usuario(estado);

-- Parcela (N:1 con usuario)
CREATE TABLE IF NOT EXISTS parcela (
  id_parcela     INTEGER PRIMARY KEY,
  id_usuario     INTEGER NOT NULL,
  nombre_parcela VARCHAR(120) NOT NULL,
  ubicacion      VARCHAR(255),
  tamano         VARCHAR(60),
  tipo_tenencia  VARCHAR(60),
  sistema_riego  VARCHAR(80),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_parcela_usuario ON parcela(id_usuario);

-- Cultivo (N:1 con parcela)
CREATE TABLE IF NOT EXISTS cultivo (
  id_cultivo                  INTEGER PRIMARY KEY,
  id_parcela                  INTEGER NOT NULL,
  tipo_cultivo                VARCHAR(100) NOT NULL,
  mes_siembra                 INTEGER,
  mes_cosecha                 INTEGER,
  produccion_anio_pasado      INTEGER,
  produccion_anio_antepasado  INTEGER,
  FOREIGN KEY (id_parcela) REFERENCES parcela(id_parcela) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_cultivo_parcela ON cultivo(id_parcela);

-- Gastos (N:1 con usuario)
CREATE TABLE IF NOT EXISTS gastos (
  id_gastos           INTEGER PRIMARY KEY,
  id_usuario          INTEGER NOT NULL,
  gasto_agua          REAL DEFAULT 0,
  gasto_gas           REAL DEFAULT 0,
  gasto_luz           REAL DEFAULT 0,
  gasto_semillas      REAL DEFAULT 0,
  gasto_fertilizantes REAL DEFAULT 0,
  gasto_mantenimiento REAL DEFAULT 0,
  gasto_combustible   REAL DEFAULT 0,
  periodo             VARCHAR(20),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_periodo ON gastos(id_usuario, periodo);
"""

schema_path = pathlib.Path(SCHEMA_FILE)
if not schema_path.exists():
    schema_path.write_text(DEFAULT_SCHEMA, encoding="utf-8")

con = sqlite3.connect(DB_PATH)
cur = con.cursor()
# Ejecuta el schema (el tuyo si existe, o el DEFAULT_SCHEMA recién creado)
cur.executescript(schema_path.read_text(encoding="utf-8"))
con.commit()

# Listado de tablas para confirmar
tables = cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()
print("Tablas creadas:", ", ".join(name for (name,) in tables))
con.close()
print("Listo. Base creada en:", DB_PATH)
