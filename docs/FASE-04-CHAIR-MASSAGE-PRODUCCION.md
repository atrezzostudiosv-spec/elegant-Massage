# Elegant Massage — Fase 4 / Chair Massage: dirección fotográfica y producción

**Fecha:** 29 de octubre de 2026 · **Estado:** imagen original creada y versiones WebP optimizadas; **integración binaria en GitHub pendiente**.

## Dirección artística

- Fotografías anteriores de Chair Massage en el repositorio: demasiado pequeñas y estéticamente corporativas; no sustituyen la toma final.
- Nuevo recurso original generado para Atrezzo mediante IA, referencia: \`bf6ee824-4a5a-4614-8ecc-9e6ae10c2601\`.
- Descripción: escena editorial de masaje sobre silla ergonómica con soporte de rostro y brazos, cliente inclinado hacia delante, profesional aplicando presión sobre hombros; materiales reales de lino y madera, verde oscuro, luz de tarde cálida.
- NO presentar esta imagen como fotografía documental de Elegant Massage ni de su personal; es ilustrativa y no implica que el negocio disponga exactamente del equipamiento representado.
- Imagen descartada: primera generación tipo collage publicitario; no reutilizar los textos, beneficios de salud ni logotipos inventados.

## Recursos ya producidos y verificados localmente

1. \`elegant-massage-chair-massage-cinematic-desktop.webp\`, **1600 × 900**, **144,540 bytes** — hero panorámico.
2. \`elegant-massage-chair-massage-cinematic-mobile.webp\`, **900 × 1200**, **104,496 bytes** — hero recortado y fotografía vertical secundaria.
3. Archivo master AVIF y manifest de origen/cálculo de hashes incluidos en el ZIP entregado por la conversación.

**SEO alt para imagen secundaria:** “Illustrative massage therapist applying pressure to a client's shoulders while seated on a padded chair.”

Los dos WebP se han abierto y comprobado localmente. Esta verificación no equivale a un test de navegación del sitio.

## Integración cuando estén presentes los recursos binarios

1. Guardar los dos WebP **exactamente** en \`assets/images/\`.
2. En \`assets/css/styles.css\`, agregar los selectores \`body[data-page="chair"] .hero__background\` y \`body[data-page="chair"] .scene--detail.scene--portrait\` al final del archivo, con referencias a los recursos nuevos, más una variante \`@media(max-width:640px)\` para usar el recorte móvil.
3. Sustituir en \`massage-services/chair-massage/index.html\` el texto alternativo genérico del \`role="img"\` por el texto SEO anterior.
4. Extender las pruebas automáticas de imágenes de servicios en \`tests/visual-qa.cjs\` para incluir \`/massage-services/chair-massage/\` y ambos WebP.
5. Verificar a **375, 768, 1024 y 1440 px**, inspeccionando screenshots y preservando la posibilidad de hacer scroll normal.

**No se ha ejecutado (1–5) en GitHub:** el conector disponible permite crear y actualizar código, pero no admite subir los bytes de los WebP desde los archivos generados en el entorno de esta conversación. No dejar \`url(...)\` rotas. El sitio conserva la imagen previamente integrada hasta que los recursos se incorporen de forma verificable.

## Reglas preservadas

- No modificar el Home, el vídeo, las imágenes reales del establecimiento ni las 13 rutas.
- No añadir precios, testimonios, supuestos miembros del equipo o certificaciones.
- Reservas siguen en \`https://elegantmassage.setmore.com/\`.
- Contact demo: **\`https://formsubmit.co/atrezzostudiosv@gmail.com\`**; recepción real aún no verificada.
- Demo: \`noindex,nofollow\`, publicación final no autorizada.
