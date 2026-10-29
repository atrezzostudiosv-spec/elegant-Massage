# Elegant Massage — Fase 4 / Lote fotográfico 01 (integración)
Fecha: 29 de octubre de 2026.

## Producción comprobable
Tres fotografías de stock profesional de **Pexels** con licencia que permite uso comercial, adaptación y publicación web. Se mantienen como recursos **ILUSTRATIVOS** y no se anuncian como fotografías del local, empleados reales o clientes de Elegant Massage. Los originales y los datos de autoría se registran en \`docs/FASE-04-RECURSOS-PRODUCIDOS.json\`.

| Ruta | Fotografía/autor | Desktop | Móvil | Escena |
| --- | --- | --- | --- | --- |
| Foot Reflexology | Pexels 5240640 / Anete Lusina | 1600×900 | 900×1200 | Hero + detalle vertical |
| Couples Massage | Pexels 7365434 / Sergey Torbik | 1600×900 | 900×1200 | Hero + detalle vertical |
| Four Hands Massage | Pexels 5888096 / Gustavo Fring | 1600×900 | 900×1200 | Hero + detalle vertical; fotografía muestra dos terapeutas, no afirma técnica de cuatro manos específica |

Archivos finales: seis WebP en \`assets/images\` y metadata de origen/huella en \`docs/FASE-04-RECURSOS-PRODUCIDOS.json\`.

## Decisiones de dirección artística
- Mantener Home y vídeo cinematográfico **sin modificaciones**.
- Solo actualizar hero y fotografía de detalle de las tres páginas anteriores.
- Garantizar \`background-size: cover\` con enfoque específico para hero móvil y desktop.
- Reemplazar etiquetas genéricas del detalle por textos alternativos concretos, sin insinuar documentación del negocio.
- No modificar las ocho imágenes documentales del establecimiento.
- No agregar tratamientos ni precios nuevos.

## Validación exigida
Revisar con Playwright Chromium 375/768/1024/1440px que las nuevas imágenes devuelvan HTTP 200, descodifiquen con dimensiones adecuadas, tengan el encuadre aceptable y no tapen los textos. Las pruebas funcionales automatizadas no suplen la auditoría visual humana de los recortes.

## Formulario demo
Se conserva \`https://formsubmit.co/atrezzostudiosv@gmail.com\` y el consentimiento informado de que el destinatario es Atrezzo. El envío **real** y la recepción en buzón siguen pendientes de prueba. No reenviar al cliente ni publicar.

## Resto de fotografía
Quedan pendientes Chair Massage, Combination, Ashiatsu, Pregnancy y el refinamiento de las fotos de servicio que aún son de baja resolución. No repetir ni modificar diseños aprobados del Home.
