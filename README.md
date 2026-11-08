# Sistema de Análisis Estático de Seguridad (SAST) - Proyecto Final

## Funcionalidad de la semana 5

### 1. Historia de Usuario (HU-01)
* **Como** sistema de análisis SAST,
* **quiero** procesar el fragmento de código modificado (`git diff`) de un commit estudiantil 
* **para** detectar vulnerabilidades OWASP Top 10 y calcular el porcentaje de seguridad.

**Criterio de aceptación:** Si el código contiene contraseñas en texto plano o vulnerabilidades críticas, el porcentaje disminuye y se rechaza el commit; si es seguro, aprueba el umbral mínimo (>= 80%).

### 2. Contrato de la Función
* **Nombre de la función:** `evaluar_seguridad_commit(git_diff: str, umbral_minimo: int = 80) -> dict`
* **Qué recibe (Entrada):** 
  * `git_diff` (str): Cadena de texto con las diferencias del commit.
  * `umbral_minimo` (int): Porcentaje mínimo requerido para aprobar (por defecto 80).
* **Qué devuelve (Salida):** Un diccionario (`dict`) que contiene:
  * `porcentaje_seguridad` (float)
  * `estado` (str: "Aprobado" o "Rechazado")
  * `vulnerabilidades` (list)
* **Casos límite:** 
  * Un `git diff` vacío (sin cambios).
  * Un umbral límite exactamente igual al porcentaje calculado.
* **Ejemplos:**
  * *Entrada:* `git_diff = "+ print('Hola mundo')"` -> *Salida:* `{"porcentaje_seguridad": 100.0, "estado": "Aprobado", "vulnerabilidades": []}`
  * *Entrada:* `git_diff = "+ password = '123456'"` -> *Salida:* `{"porcentaje_seguridad": 40.0, "estado": "Rechazado", "vulnerabilidades": ["Contraseña o credencial en texto plano"]}`
  * *Entrada:* `git_diff = ""` -> *Salida:* `{"porcentaje_seguridad": 100.0, "estado": "Aprobado", "vulnerabilidades": []}`

### 3. Cómo ejecutar las pruebas
Asegúrate de tener instalado `pytest` y ejecuta el siguiente comando en la terminal:
```bash
pytest
```
