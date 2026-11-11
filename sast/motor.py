# sast/motor.py

PALABRAS_CLAVE_PASSWORD = ["password", "passwd", "secret", "api_key"]
FUNCIONES_INSEGURAS = ["eval(", "exec("]

def evaluar_seguridad_commit(git_diff: str, umbral_minimo: int = 80) -> dict:
    """
    Analiza de forma ligera el git diff detectando credenciales y funciones de riesgo.
    """
    vulnerabilidades = []
    porcentaje = 100.0

    if not git_diff or not git_diff.strip():
        return {"porcentaje_seguridad": 100.0, "estado": "Aprobado", "vulnerabilidades": []}

    diff_lower = git_diff.lower()

    for palabra in PALABRAS_CLAVE_PASSWORD:
        if palabra in diff_lower:
            vulnerabilidades.append("Contraseña o credencial en texto plano")
            porcentaje -= 60.0

    for func in FUNCIONES_INSEGURAS:
        if func in diff_lower:
            vulnerabilidades.append(f"Uso de función insegura {func}")
            porcentaje -= 30.0

    porcentaje = max(0.0, porcentaje)
    estado = "Aprobado" if porcentaje >= umbral_minimo else "Rechazado"

    return {
        "porcentaje_seguridad": porcentaje,
        "estado": estado,
        "vulnerabilidades": vulnerabilidades
    }
