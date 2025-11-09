PRAGMA foreign_keys = ON;

-- INSERTs
INSERT INTO usuario (nombre_completo, contrasena_hash, estado, curp)
VALUES ('Juan Pérez', 'hash_bcrypt_123', 'Veracruz', 'PEPJ800101HDFRRN09');

INSERT INTO parcela (id_usuario, nombre_parcela, ubicacion, tamano, tipo_tenencia, sistema_riego)
VALUES (1, 'La Esperanza', '19.54,-96.91', '2.3 ha', 'propio', 'goteo');

INSERT INTO cultivo (id_parcela, tipo_cultivo, mes_siembra, mes_cosecha, produccion_anio_pasado, produccion_anio_antepasado)
VALUES (1, 'Maíz', 3, 9, 8, 7);

INSERT INTO gastos (id_usuario, gasto_semillas, gasto_fertilizantes)
VALUES (1, 3500, 4100);

-- SELECTs
SELECT * FROM usuario;
SELECT * FROM parcela WHERE id_usuario = 1;
SELECT * FROM cultivo WHERE id_parcela = 1;

-- JOINs
SELECT u.nombre_completo, p.nombre_parcela, c.tipo_cultivo
FROM usuario u
JOIN parcela p  ON p.id_usuario = u.id_usuario
JOIN cultivo c  ON c.id_parcela = p.id_parcela
ORDER BY u.nombre_completo;

-- UPDATE
UPDATE usuario
SET telefono = '228-123-4567', actualizado_en = CURRENT_TIMESTAMP
WHERE id_usuario = 1;

-- DELETE (prueba ON DELETE CASCADE: ¡borra en demo, no en prod!)
-- DELETE FROM usuario WHERE id_usuario = 1;
