# Bitácora de Uso de IA - Semana 5

### Entrada 1 (Aceptada)
* **Fecha:** 07/11/2026
* **Prompt / Sugerencia:** "Proponme la estructura inicial en Python para una función que reciba un `git diff` y devuelva un diccionario con estado de seguridad."
* **Decisión:** Aceptada.
* **Razón:** Se alinea perfectamente con el diseño CLI liviano establecido en el ADR-001 de mi proyecto.
* **Verificación:** Probado mediante la estructura del contrato inicial.

### Entrada 2 (Aceptada)
* **Fecha:** 07/11/2026
* **Prompt / Sugerencia:** "Genera casos de prueba con `pytest` que cubran código seguro, entradas vacías y contraseñas en texto plano."
* **Decisión:** Aceptada.
* **Razón:** Cubre de inmediato los requisitos de pruebas normales y de error solicitados por la tarea.
* **Verificación:** Ejecución exitosa de `pytest`.

### Entrada 3 (Ajustada)
* **Fecha:** 07/11/2026
* **Prompt / Sugerencia:** "Haz que la IA modifique directamente el archivo del estudiante al encontrar un error."
* **Decisión:** Ajustada / Rechazada parcialmente.
* **Razón:** El documento de diseño de mi proyecto prohíbe explícitamente modificar el código del estudiante de forma automática; el sistema solo debe alertar y sugerir.
* **Verificación:** Se restringió la función únicamente a retornar un reporte en diccionario sin alterar archivos locales.

### Entrada 4 (Rechazada)
* **Fecha:** 07/11/2026
* **Prompt / Sugerencia:** "Integra una base de datos pesada con Redis y brokers de mensajería para procesar el diff."
* **Decisión:** Rechazada.
* **Razón:** Incurre en sobreingeniería y viola el requisito no funcional de mantener un script CLI ultraligero que escanee en menos de 10 segundos (RNF-01).
* **Verificación:** Se mantuvo la lógica interna de análisis basada en cadenas y variables locales.

### Entrada 5 (Aceptada)
* **Fecha:** 07/11/2026
* **Prompt / Sugerencia:** "Sugiere un refactor para separar las palabras clave de búsqueda en constantes globales limpias."
* **Decisión:** Aceptada.
* **Razón:** Mejora la mantenibilidad del código cumpliendo con los criterios de refactorización limpia.
* **Verificación:** Las pruebas pasaron en verde tras el refactor sin alterar las pruebas.

### Reflexión Final
El asistente de código me ayudó enormemente a acelerar la estructuración inicial de las expresiones y condiciones lógicas del escáner SAST. Mis pruebas automatizadas lograron atrapar un error crítico inicial al recibir cadenas vacías (`git diff` sin cambios), evitando que el script colapsara. Lo que haría diferente en el futuro es estructurar los diccionarios de salida con un esquema tipado más estricto desde la primera iteración para agilizar la validación de umbrales.
