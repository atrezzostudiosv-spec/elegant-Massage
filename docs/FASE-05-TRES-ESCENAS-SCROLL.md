# ELEGANT MASSAGE — SECUENCIA CINEMATOGRÁFICA BODY / FOOT / COMBINATION
**Intervención solicitada:** 29/10/2026. Modificación focalizada de Home; no se reabren las demás secciones aprobadas.

## Resultado diseñado

- **01 Body Massage:** pantalla completa con imagen única, copia y enlace existentes; zoom lento durante la primera pausa.
- **02 Foot Reflexology:** fotografía full-bleed (se elimina la división previa de columna marfil + imagen), entra **desde arriba** sobre la primera con desplazamiento vertical enlazado al scroll y mantiene su zoom.
- **03 Combination Massage:** imagen fotográfica única (sin collage/díptico), full-bleed. Desciende sobre la segunda. Su zoom continúa durante el tramo final, **antes de que el scroll natural libere la escena** hacia Chair / Couples / Four Hands.
- Las tres usan overlay negro, tipografía editorial V4 y los mismos enlaces de servicio. El usuario nunca pierde la capacidad de desplazar con rueda, trackpad, teclado o móvil.
- **Desktop** >=1024 px de ancho, altura >=650 px y sin motion-reduction: contenedor sticky de 440svh con 3 capítulos a 100svh. Posiciones de entrada derivadas del scroll, sin interceptar wheel ni scroll-lock.
- **Móvil/tablet y movimiento reducido:** las mismas tres escenas completas en flujo vertical nativo; no se obliga a atravesar una secuencia sticky pesada.
- **Sin JavaScript:** las tres fotografías y el contenido siguen apareciendo como bloques full-width.

## Imagen 03: trazabilidad y licencia

Fotografía única de masaje de espalda de **Sergey Torbik (Pexels ID 7365398)**: https://www.pexels.com/photo/a-man-having-a-back-massage-7365398/ . Licencia: https://www.pexels.com/license/ . Se usa únicamente como **ilustración comercial**, sin afirmar que la foto muestre personal, clientes o salas reales de Elegant Massage.

Archivos creados por script reproducible:
- assets/images/elegant-massage-combination-single-desktop.webp (1920×1080)
- assets/images/elegant-massage-combination-single-mobile.webp (900×1200)
- docs/FASE-04-COMBINATION-SINGLE-IMAGE.json conserva URL, autor, hash SHA-256 y peso.

No se altera la página individual de Combination Massage ni su registro de contenido: el cambio de fotografía está solicitado para la sección 03 del **Home**.

## Criterios de aceptación

1. Capturas en 375, 768, 1024, 1440; fotografía ocupa todo el fondo, sin marco ni díptico.
2. Simular scroll real en 0.16, 0.42, 0.79 y 0.995: primer servicio, segundo, tercero, y zoom de tercero ya completado.
3. Comprobar que el inicio de Chair / Couples / Four Hands entra tras la tercera escena y no antes de finalizar el movimiento.
4. Links originales activos, textos sin solapamientos, foco de teclado, reduced motion y fallback sin JS.
5. Confirmar FormSubmit de test a atrezzostudiosv@gmail.com, demo noindex y publicación no autorizada.

**Estado:** pendiente de pruebas GitHub Actions y revisión visual final. No declarar verificado solo por almacenar HTML/CSS/JS.
