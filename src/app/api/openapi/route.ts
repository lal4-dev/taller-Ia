/**
 * ==============================================================================
 * RUTA DE API: ESPECIFICACIÓN OPENAPI / OPENSPEC
 * ==============================================================================
 * Este archivo actúa como un endpoint de API (Route Handler) en Next.js.
 * Expone la documentación formal del proyecto en formato JSON para que cualquier
 * herramienta externa (Swagger UI, Postman, otros agentes de IA) pueda
 * consultar la arquitectura y contratos de datos disponibles.
 * 
 * Ruta accesible: GET /api/openapi
 */

import { NextResponse } from 'next/server';
import openSpecData from '../../../../docs/openspec.json';

/**
 * Manejador HTTP GET para entregar la especificación OpenSpec.
 * 
 * @returns {Promise<NextResponse>} Respuesta con el archivo JSON y cabeceras CORS.
 */
export async function GET() {
  // Retorna el JSON de la especificación con cabeceras que permiten la consulta desde cualquier origen (CORS)
  return NextResponse.json(openSpecData, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Permite que navegadores y herramientas externas consuman este endpoint sin bloqueos de seguridad CORS
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}
