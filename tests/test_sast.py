# tests/test_sast.py
import pytest
from sast.motor import evaluar_seguridad_commit

def test_git_diff_seguro():
    diff = "+ def sumar(a, b):\n+     return a + b"
    resultado = evaluar_seguridad_commit(diff)
    assert resultado["estado"] == "Aprobado"
    assert resultado["porcentaje_seguridad"] == 100.0

def test_git_diff_vulnerabilidad_menor():
    diff = "+ eval(usuario_input)"
    resultado = evaluar_seguridad_commit(diff)
    assert resultado["porcentaje_seguridad"] >= 50.0

def test_git_diff_vacio():
    diff = ""
    resultado = evaluar_seguridad_commit(diff)
    assert resultado["estado"] == "Aprobado"
    assert resultado["porcentaje_seguridad"] == 100.0

def test_git_diff_umbral_exacto():
    diff = "+ pass"
    resultado = evaluar_seguridad_commit(diff, umbral_minimo=100)
    assert resultado["porcentaje_seguridad"] <= 100.0

def test_git_diff_password_texto_plano():
    diff = "+ db_password = 'super_secret_password_123'"
    resultado = evaluar_seguridad_commit(diff)
    assert resultado["estado"] == "Rechazado"
    assert "Contraseña o credencial en texto plano" in resultado["vulnerabilidades"]
