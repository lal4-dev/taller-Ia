---
name: openspec
description: Guía y estándares para mantener, actualizar y validar especificaciones OpenSpec (OpenAPI 3.1) en el proyecto.
---

# 📖 OpenSpec Management Skill

Esta habilidad define cómo gestionar y sincronizar las especificaciones OpenSpec/OpenAPI del proyecto.

## 📌 Ubicación de Archivos OpenSpec
- **Especificación YAML:** `docs/openspec.yaml`
- **Especificación JSON:** `docs/openspec.json`
- **Endpoint API:** `/api/openapi`

## 🛠️ Reglas de Mantenimiento
1. Cada vez que se agregue o modifique un servicio en `src/services/` o un endpoint de base de datos en Supabase, actualizar los esquemas en `docs/openspec.yaml` y `docs/openspec.json`.
2. Mantener la compatibilidad estricta con **OpenAPI 3.1.0**.
3. Documentar parámetros de consulta, códigos de respuesta HTTP (`200`, `201`, `400`, `401`, `404`) y referencias de seguridad JWT (`BearerAuth`).
