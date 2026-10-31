# ATREZZO — Elegant Massage project status

Updated: 2026-10-29. Direct GitHub development; no Gemini.

## Confirmed business instructions
- 13-page multipage structure, using services and facts from the original website and Setmore.
- Full creative authorization for Atrezzo-generated cinematic illustrative photography and a sensory video Home; no invented services, staff, reviews, certifications, claims or prices.
- Keep every Book Now link at https://elegantmassage.setmore.com/.
- Contact form tests route to atrezzostudiosv@gmail.com through FormSubmit; **real delivery not tested**.
- Demo stays noindex until authorized production release.

## Phase register
| Workstream | Status | Verified evidence |
|---|---|---|
| Audit, strategy, editorial structure and art direction | CLOSED | Earlier approved project phases; 13-page architecture in repo takes precedence over later 10-page local draft |
| 13-page implementation | IN VALIDATION | Navigation and 13 routes structurally checked in Playwright |
| Fase 3 — 13-page editorial content and SEO inventory | CLOSED (documentary/editorial scope) | All 13 current pages transcribed and traced in docs/FASE-03-CONTENIDO-EDITORIAL-13-PAGINAS.md and docs/FASE-03-MATRIZ-TRAZABILIDAD.csv; commercial details still need prelaunch verification |
| Home audiovisual compatibility | VERIFIED IN CHROMIUM | VP9 WebM mobile and desktop plays with readyState 4 at 375, 768, 1024 and 1440; MP4 retained as alternate |
| Home layout and responsive | BROWSER QA PASSED, AWAITING VISUAL APPROVAL | No horizontal overflow, header and CTA accessible, H1 visible, scroll reveals tested at four widths |
| Cinematic scroll composition | BROWSER QA PASSED | Photo tiling fixed, native scrolling preserved, reduced-motion fallback checked |
| Gallery | IN VALIDATION | 8 historical real-location optimized photos; photographic currency may still need owner review |
| Service pages | IN VALIDATION | 13 routes include noindex, H1, descriptions, booking links; individual visual composition not yet approved |
| Contact form | IN VALIDATION | Form coded; FormSubmit real inbox receipt NOT verified |
| SEO/public release | BLOCKED | noindex, robots disallow retained; release not authorized |

## Definitive QA evidence
GitHub Actions, Playwright Chromium, run: https://github.com/atrezzostudiosv-spec/elegant-Massage/actions/runs/40747314281
- Result: SUCCESS; 0 automated assertion failures.
- Browser sizes: 375, 768, 1024 and 1440 px.
- Tested: video playback VP9, body/document overflow, hero H1, responsive poster, mobile nav and Escape, Setmore links, all 13 routes, reduced motion, HTML form validity without sending, scroll reveal and JavaScript page errors.
- Screenshot artifacts are attached to the above workflow run.
- No manual Safari/Firefox/device testing or successful FormSubmit send has been claimed.
- Unapproved/decorative site design should not be considered signed off solely from automated tests.

## Next single action
Integrate and review service-specific cinematic photography on the 13 existing routes, preserving approved Home art direction; then run targeted responsive and link regression.


## 2026-10-28 — Additional content direction from business reference
User supplied a screen recording of the **original Elegant Massage site** and a separate Bellissima salon screenshot used as a visual composition reference only. This reopens only editorial depth, image planning, and affected Home/service components; previously closed architecture and technical QA are preserved subject to targeted regression testing.

Original facts retained: massage techniques trained/practiced in China (historical self-description, not verified current staff), eight historic treatments, Flower Mound location, telephone, fax, email, Facebook and Setmore booking. Fake staff/testimonials and old photo prices excluded.

Implementation: expanded Home and 7 service pages plus About, Massage Menu, Services and Contact to provide explanatory content grounded in source. Added intro photo spread, additional listed service entries, and factual trust strip. **No new treatments, discounts or reviews**.
New image assets for reflexology generated locally; their GitHub upload and final responsive use remain separate tasks. New screenshot is inspiration, not a photograph of this business.


## 2026-10-28 — Editorial rewrite + revalidation completed
- Original business video, HTML archive and 2024 menu audited. Bellissima screenshot used only as a design reference, never as a commercial source.
- 13-page structure unchanged; Home and seven service guides enriched with source-based content. Original site fax, Facebook and China-rooted massage heritage recovered appropriately. Site copy refined to visitor-facing English.
- Full source inventory and price provenance: `docs/ATREZZO-RELAX-LUXURY-AUDITORIA-CONTENIDO-Y-ARQUITECTURA.md`.
- Photography guide: `docs/ATREZZO-RELAX-LUXURY-FOTOGRAFIA-SHOT-LIST.md`.
- Visual Playwright regression completed successfully (run https://github.com/atrezzostudiosv-spec/elegant-Massage/actions/runs/40773785743, 13 routes / 375, 768, 1024, 1440 px / reduced motion / video / nav).
- 2 new independent reflexology photos + 2 mobile variants generated as a downloadable ZIP, **not committed** as binary assets.
- Next action: finish and integrate high-resolution service-specific hero photography and inspect internal-page layouts. Demo stays `noindex`; Atrezzo test form delivery remains unverified.


## 2026-10-29 — Fase 3 editorial consolidation (direct GitHub work)
- Compared latest client chat brief with the *actual* repository before editing. The local 10-route design proposal is superseded by the existing 13-route implementation and previously checked navigation; **no route was removed or renamed**.
- Consolidated complete existing 13-page visitor-facing text, SEO titles, descriptions, page links and factual-source caveats: `docs/FASE-03-CONTENIDO-EDITORIAL-13-PAGINAS.md`.
- Added machine-readable route/source/copy matrix: `docs/FASE-03-MATRIZ-TRAZABILIDAD.csv`.
- Applied precise copy-only fixes to `massage-services/specialty-techniques/index.html`, `gallery/index.html`, and `massage-menu/index.html`; no layout, animation, Home video, CTA booking destination, palette or photograph changed.
- Existing gallery images and past QA remain preserved. New code regressions must still be checked in the latest GitHub Actions run; previous successful QA does not automatically certify this commit.
- Pending owner reconfirmation: live Setmore catalog/durations/prices (especially Couples and specialty techniques), current hours, former staff narrative and vintage gallery photography. Historical Menu2024 prices are not displayed as current.
- Demo remains `noindex,nofollow` and `robots.txt` restricted; contact form still routes to Atrezzo and real delivery has not been tested.


## 2026-10-29 — Fase 4 / Photography batch 01
- **Visual production in progress**, source assets now in repo: 3 licensed stock originals cropped to 6 responsive WebP (1600×900 and 900×1200), image sources, authors and hashes documented in \`docs/FASE-04-RECURSOS-PRODUCIDOS.json\`.
- Integrated only Foot Reflexology, Couples Massage and Four Hands Massage **hero + portrait detail**; original Home, videos and authentic gallery images preserved. New alt labels specify illustrative stock, not real staff/facilities.
- Traceable implementation \`docs/FASE-04-INTEGRACION-LOTE-01.md\`. Four Hands photo represents two practitioners with one client and is **illustrative**, not evidence of the business's exact choreography.
- Form test action remains \`https://formsubmit.co/atrezzostudiosv@gmail.com\`. Recipient is Atrezzo for tests, not Elegant Massage. Actual inbox delivery not verified.
- This batch requires new GitHub Actions visual regression. Do not close Fase 4 until all remaining service imagery and responsive visual checks are complete.


## 2026-10-29 — Fase 4 photo batch 01: QA and visual judgment
- Browser automation **SUCCESS** on commit \`f04c654\`: https://github.com/atrezzostudiosv-spec/elegant-Massage/actions/runs/40859554532. It checks all 13 routes, Home, and new 3-service image decoding/crop selection, no horizontal overflow, Setmore CTA, 375/768/1024/1440px screenshot pairs.
- Screen captures inspected: Foot Reflexology compositions acceptable in this first set; **Couples mobile hero/portrait only show one guest clearly**, weakening two-person storytelling; **Four Hands currently shows two therapists, but does not demonstrate simultaneous four-hand back technique convincingly and has a clinical-lighting mismatch.** These are **open artistic defects** for the next targeted photo pass, not declared finished.
- Photos must remain labeled as illustrative; do not mistake automation PASS for complete aesthetic sign-off. FormSubmit test inbox receipt remains unverified. Fase 4 stays **IN PROGRESS**.


## 2026-10-29 — Phase 4 / Photography batch 02 integration
- Batch02 source-provenance WebP assets produced in repository using GitHub Actions, contact sheet manually reviewed. Manifest: \`docs/FASE-04-LOTE-02-MANIFEST.json\`.
- Integrated new Couples Massage (two guests visible in mobile diptych), Four Hands (two practitioners & one client; clinical-setting mismatch remains visually under review), Combination Massage (distinct coordinated foot and back images). Kept Foot Reflexology and previously closed Home unchanged.
- Chair Massage candidate NOT integrated, despite successful asset build, because corporate-office photograph is visually off-brand. This route remains photo-incomplete.
- Exact implementation and constraints \`docs/FASE-04-LOTE-02-INTEGRACION-Y-QA.md\`.
- Updated visual QA script to require four photo routes at all four widths, correct responsive selection/decoding and Setmore. The run triggered by this commit must be checked before claiming verification.
- Contact demo continues to use Atrezzo test mailbox only; real submission/delivery remains unverified. Keep noindex.


## 2026-10-29 — Phase 4 batch02 browser evidence / critical visual review
- GitHub Actions run \`40862242303\`: **SUCCESS** on actual integration commit \`acfa902\` (all 13 routes, 375/768/1024/1440 viewport checks, service asset decoding and required desktop/mobile mapping, no horizontal overflow, Setmore).
- Screenshots of Couples, Four Hands and Combination hero were **visually inspected** at 375 and 1440 px. Couples mobile now shows both guests; Combination shows two clearly separated foot/back scenes and readable CTA; Four Hands depicts two practitioners with one client and keeps text legible, but backdrop remains more clinical than boutique, so art direction remains **IN VALIDATION**.
- Chair Massage still has no new approved hero; intentionally excluded its corporate-toned candidate. Priority next: produce an authentic-looking illustrative seated massage in a suitable wellness atmosphere, then integrate and verify at four widths.
- These results close batch02 technical integration, **NOT entire Phase 4**. Keep demo noindex; FormSubmit test mailbox remains Atrezzo, actual inbox delivery unverified.


## 2026-10-29 — Fase 4 / Chair Massage original image production
- AI-generated single-scene Chair Massage photograph produced at 1536×1024; manually visually assessed: realistic seated ergonomics, hands at shoulders, warm boutique environment; no textual overlay.
- Prepared responsive **1600×900 WebP (144,540 B)** and **900×1200 WebP (104,496 B)** in local handoff ZIP plus image provenance metadata.
- GitHub \`scripts/atrezzo_ingest_chair_massage.py\` and \`docs/FASE-04-CHAIR-MASSAGE-PRODUCCION.md\` added. **Binary image assets NOT YET COMMITTED**, because connected GitHub editing actions do not accept generated local image file references. Chair CSS/HTML intentionally not switched to nonexistent URLs.
- Remaining gate: actual binary transfer, CSS integration, and browser visual QA at 375/768/1024/1440. Home still untouched.
- Contact demo action remains \`https://formsubmit.co/atrezzostudiosv@gmail.com\`, not client address; real email delivery remains unverified. Demo stays noindex.


## 2026-10-29 — Auditoría visual y rediseño editorial V3
- Usuario solicitó aplicar la calidad compositiva de Thaissage/Ranchman, nunca su identidad, colores o arquitectura literal. El alcance reabre Home y sistema visual común de 13 páginas.
- Diagnóstico y decisiones: docs/FASE-05-AUDITORIA-UX-REDISENO-EDITORIAL.md.
- Home transformado: hero vídeo conservado; introducción asimétrica; tres composiciones de servicio diferenciadas y tres tratamientos en índice tipográfico; una secuencia corta de 3 capítulos; fotos reales de local; FAQ; CTA final único.
- Nuevo CSS assets/css/atrezzo-editorial-v3.css y JS assets/js/atrezzo-experience-v3.js en las 13 rutas. Booking móvil persiste enlazando al Setmore existente.
- Se eliminaron sólo las transiciones genéricas YOUR NEXT STEP de los interiores, nunca contenido de servicios. Reparadas rutas de footer en páginas profundas.
- Formulario test mantiene atrezzostudiosv@gmail.com; envío real no verificado. Demo continúa noindex. Chair WebP aún por integrar. QA y revisión visual de nuevo diseño pendientes de evidencia.

## 2026-10-29 — Editorial V3 responsive regression and visual inspection
- Visual QA on code commit dd954a23: **SUCCESS**, zero automated assertions failed: https://github.com/atrezzostudiosv-spec/elegant-Massage/actions/runs/40876720762.
- Automated scope: all 13 routes at 375, 768, 1024 and 1440px; no horizontal overflow; hero headings within viewport; new CSS loaded; Setmore URLs intact; fixed bottom mobile booking bar; Home has 3 distinct features + 3 secondary services, three native-scroll photo scenes, real local proof and three grounded FAQs; deep footer routes resolve correctly; prior visual/video and photo checks preserved.
- Visual evidence/screenshots downloaded and manually reviewed for Home 375/768/1440 plus representative Body and Contact mobile heroes. One tablet 7px overflow was found and corrected by confining an offset editorial border to the viewport (CSS commit dd954a23).
- GitHub Pages deployment for dd954a23: SUCCESS; same preview address https://atrezzostudiosv-spec.github.io/elegant-Massage/.
- Visual refinement (not functional blocker): the real storefront signage competes somewhat with the Contact hero headline; evaluate photographic crop/overlay only after selective art review. High-resolution Chair hero remains to be integrated; other low-resolution legacy photos to be checked individually. Do not claim complete Phase 4 approval.
- Demo still noindex; FormSubmit action still routes test submissions to atrezzostudiosv@gmail.com but actual delivery remains UNTESTED; public launch not approved.

## 2026-10-29 — Editorial V4: segunda auditoría de tipografía y composición
- Evidencia: capturas completas del V3 a 375/768/1440 + inspección de código y principios de Thaissage/Ranchman. Hallazgos: jerarquía tipográfica excesiva (H1 11vw, tratamiento H2 9vw), repeticiones de fotografía, ritmo de secciones muy grandes, bloque sticky redundante y Contact signage compitiendo con texto.
- Intervención focalizada: `assets/css/atrezzo-editorial-v4.css` conectado después del v3 en todas las 13 rutas; H1/H2 y servicios con escala más refinada, espaciado y alturas calmadas, Contact scrim corregido.
- Home: `em-ritual` repetido de tres escenas sustituido por pausa de elección con pressure/focus/timing, sin bloquear scroll; intro utiliza fotografía histórica REAL del local, no repite imagen de hero. Reglas de autenticidad conservadas.
- Informe detallado: `docs/FASE-05-SEGUNDA-AUDITORIA-DIRECCION-ARTISTICA-V4.md`. QA visual/responsive de esta revisión pendiente de ejecutar y cerrar.
- CTA sigue en Setmore, formulario de demo en atrezzostudiosv@gmail.com sin recepción real probada, `noindex` conservado. Chair visual high-res aún por integrar.

- Revisión manual V4 inicial: el recorte auténtico de sala vacía al comienzo disminuía cohesión; sustituido por detalle de masaje ilustrativo en Intro, con descripción y caption honestos. Se mantiene la fotografía auténtica de recepción en la sección local. Requiere QA posterior.

- Segunda inspección visual de las páginas interiores: About y Body repetían exactamente imágenes entre hero y fotografía de contenido. About conserva hero de recepción y presenta una **foto original diferente de espera**; Body conserva hero y muestra detalle ilustrativo de aceite. Copy introductorio About sustituye texto genérico por información de servicios reales, sin afirmar datos de empleados.

## 2026-10-29 — V4 final responsive review and release of design checkpoint
- **Final QA PASS** on commit `521d773`, GitHub Actions https://github.com/atrezzostudiosv-spec/elegant-Massage/actions/runs/40880877395; GitHub Pages deploy also **SUCCESS**: https://github.com/atrezzostudiosv-spec/elegant-Massage/actions/runs/40880878175.
- **87 QA records, 0 failures**, including 13 pages, four viewports 375/768/1024/1440px, video/Setmore/responsive/no-overflow, 4 photo routes, test form target and full-page interior screenshots at 375 and 1440px.
- Inspected Home complete layout at 1440/375, Body Massage / About / Contact / service directory 1440; changes verified: less aggressive serif scale, proper editorial pacing, fewer duplicate large photo scenes and unique About/Body imagery.
- No user visual approval yet: `Understated Wellness Editorial` V4 is delivered for review, not client-published. Remaining visual concerns: real facility photographs are visibly less polished than cinematic scenes, Chair hero replacement not yet uploaded, and not all service screenshots were individually art-approved.
- Demo remains `noindex`; booking goes to Setmore. Form test recipient still `atrezzostudiosv@gmail.com`, delivery not verified.


## 2026-10-29 — Home: three full-bleed service scenes (user-approved request)
- User explicitly requested Body → Foot → Combination to pause full screen, slow zoom, following scene drops over previous, and last scene continues zoom until release. This intentionally reopens ONLY Home featured treatments composition.
- 3 featured service copy blocks and links preserved. Foot no longer has split ivory/photo; every scene is one full background.
- Combination image 03 is a new single licensed illustrative photo (Pexels / Sergey Torbik 7365398), NOT diptych; responsive assets generated in repo with manifest SHA-256. Do not present as actual Elegant Massage employee or facility.
- Three-scene CSS/JS use native scroll, sticky on desktop, reversible downward scroll, reduced-motion and mobile normal-flow fallbacks. No wheel interception. Existing V3 zoom logic gated to prevent conflict.
- Technical/visual acceptance and source provenance: docs/FASE-05-TRES-ESCENAS-SCROLL.md. Await QA and browser screenshots to mark validated.
- No changes to form destination (atrezzostudiosv@gmail.com test, actual email unverified), Setmore booking, other 12 routes, Home header/video or noindex.


## 2026-10-29 — Home 3-scene scroll: VERIFIED / review checkpoint
- GitHub Actions **SUCCESS** on commit \`08f226d6\`: https://github.com/atrezzostudiosv-spec/elegant-Massage/actions/runs/40892163753. GitHub Pages deployment for same commit also **SUCCESS**: https://github.com/atrezzostudiosv-spec/elegant-Massage/actions/runs/40892163115.
- Browser Playwright verified: 13 routes; 375 / 768 / 1024 / 1440px; full-bleed Home photo #01/#02/#03, scroll order 1→2→3, second and third panels descending from top, zoom still increasing through 79%→99.5% of third phase, sticky release to next section only after last zoom, and normal-flow fallback mobile/reduced-motion.
- Visually inspected desktop screenshots at 16%, 42%, 79%, 100% timeline and mobile Combination at 375/768; single new image fills background with readable caption/CTA. Last scene is NOT a diptych. Source/licensing and responsive WebP hashes documented in \`docs/FASE-04-COMBINATION-SINGLE-IMAGE.json\`.
- No service details/prices changed. Setmore intact, form still test-targeted at atrezzostudiosv@gmail.com (real receipt not verified), demo stays noindex. Other site-wide pending tasks remain open as before; this Home section only is technically verified, awaiting client visual review.


## 2026-10-29 — Chair Massage / asset handoff after Home scroll closure
- Last Home featured-services 3-scene scroll remains **technically VERIFIED** (run 40892163753); no reopening or alteration.
- Prepared new Atrezzo illustrative Chair Massage original, visually inspected 1600×900 (83,490 bytes) and 900×1200 (67,204 bytes) responsive WebP crops with source checksums. Handoff ZIP delivered through conversation; detail: `docs/FASE-04-CHAIR-HANDOFF-2026-10-29.md`.
- Ingestion script focal points corrected (especially mobile crop to keep guest/practitioner). Both binary resources **NOT COMMITTED**; current Chair page CSS remains on existing fallback, not misdirected to nonexistent new files.
- **Phase 4: IN PROGRESS**. Single next action: transfer the 2 WebP binaries, integrate Chair CSS/alt and verify in browser at 375/768/1024/1440 px. Previous live form receipt still UNVERIFIED. Demo remains noindex.


## 2026-10-29 — Chair Massage integration staged, blocked on actual WebP transfer
- Isolated branch: `feature/chair-cinematic-photo-integration`. Draft PR: https://github.com/atrezzostudiosv-spec/elegant-Massage/pull/1.
- **CODE STAGED (not merged):** Chair-only hero/portrait desktop/mobile CSS, accurate illustration accessible label, strict 375/768/1024/1440 asset-decoding and Setmore checks.
- **BLOCKED:** exact 2 WebP binary assets are verified in conversation ZIP but have not been transferred to GitHub, so the feature branch is intentionally not deployed or browser-certified. Paths, sizes and SHA-256 in `docs/FASE-04-CHAIR-INTEGRACION-STAGING.md` on the branch.
- **MAIN UNCHANGED VISUALLY:** existing chair photo remains as safe fallback. Previously verified Home three-scene scroll and 13 routes remain untouched. Contact receipt unverified; demo noindex.
- Next action: upload two exact WebP bytes to the feature branch and run Playwright Visual QA against that branch. Merge only after success and visual inspection.


## 2026-10-29 — Fase 4 Chair Massage: INTEGRATED / VERIFIED (supersedes staging block)
- **Binary transfer RESOLVED:** exact 1600×900 and 900×1200 optimized WebP photos delivered to Github and verified with Git object hashes equal to the locally produced originals. The temporary Library transfer files and folder were deleted after transfer.
- Chair-only HTML accessible illustration label, desktop/mobile CSS hero/portrait mappings and responsive Playwright tests merged via PR #1 into `main`, squash commit `69b52a4`. Home, other service layouts, real gallery photographs, booking and form remain unchanged.
- **Branch visual QA: PASS**, run https://github.com/atrezzostudiosv-spec/elegant-Massage/actions/runs/40901362075; **93 QA records, 0 failures**, Chair image decode + correct responsive mappings + no overflow + Setmore at 375/768/1024/1440.
- **Manual visual inspection completed** of Chair 375/768/1024/1440 hero/detail captures: image demonstrates seated shoulder work, coherent boutique wellness styling, readable text and visible reservation action. Owner aesthetic sign-off not claimed.
- **Main post-merge QA: PASS**, run https://github.com/atrezzostudiosv-spec/elegant-Massage/actions/runs/40902383422. **GitHub Pages deploy: SUCCESS**, run https://github.com/atrezzostudiosv-spec/elegant-Massage/actions/runs/40902382091.
- Site remains **demo noindex**; this is **NOT** a public-release approval. FormSubmit receipt still untested, current treatment availability/prices/hours still pending owner verification.
- **Fase 4 overall remains IN VALIDATION** for outstanding separate photographic art review (notably Four Hands clinical backdrop and historical imagery quality). **Next one action:** targeted Four Hands photo art-direction correction; do not reopen verified Chair or Home.


## 2026-10-30 — Home V6 / user-approved strategy, implementation in isolated review branch
- User **REJECTED Home V5** and approved UX V6 with a mandatory six-category explorer, including **Foot Reflexology** clearly marked as an unconfirmed independent booking.
- Implementation branch `feature/home-v6-service-explorer` and DRAFT PR #2: https://github.com/atrezzostudiosv-spec/elegant-Massage/pull/2. **MAIN IS UNCHANGED. DO NOT MERGE before user visual approval.**
- Home-only changes: six decision-led sections; premium photo-and-content changing six-service selector; current booking destination `https://elegantmassage.setmore.com/#services` on Home; explicit price/duration checks on Setmore; original studio photos with illustration labels elsewhere; full SVG action icons in Home; natural photographs without CSS color filters.
- The original responsive hero film and Body → Foot → Combination 3-scene scroll JS/CSS remain on this branch, including 440svh. Story copy now explains treatment differences, with direct bypass to booking and current prices. No original Home cinema files modified. The UX length of 440svh still requires measurement and art approval.
- `assets/css/atrezzo-home-v6.css` and `assets/js/atrezzo-home-v6.js` are isolated to the Home; the other 12 HTML and their layouts remain untouched.
- A feature-branch-only Playwright workflow covers 375/390/430/768/1024/1440, selector keyboard/mouse, image selection, scroll, bypass, no JS/reduced-motion, noindex and 13-route regression, with screenshot artifacts. **QA is scheduled, not yet declared PASS.**
- Previous verified Chair and cinematic Home behavior are protected. Four Hands photo still uses the old illustrative clinical-setting source pending independent visual approval.
- Owner confirmation of actual prices, treatment availability, business hours and live form receipt remains pending. Demo stays `noindex`; no launch authorization.
- **NEXT SINGLE ACTION:** inspect V6 six-viewport browser artifacts, resolve demonstrated defects in the isolated branch, then present screenshots and draft PR for user visual approval.


## 2026-10-31 — Home V6.1 refined / BROWSER QA VERIFIED; awaiting owner art approval
- **Only branch** `feature/home-v6-service-explorer`. **Draft PR #2** https://github.com/atrezzostudiosv-spec/elegant-Massage/pull/2. `main` untouched; no new demo publication or merge. All 12 internal HTML routes unchanged.
- **Skip Story root cause investigated:** original six failures were premature/incorrect Playwright assertions, not broken links. Native anchor navigation landed consistently at ~178px below viewport top, consistent with `scroll-padding-top:90px` plus `scroll-margin-top:88px`. Tests now wait for actual target scroll offset. Regression PASS.
- Mobile cinematic hero uses an existing massage-treatment photograph `elegant-massage-massage-touch-detail.webp`, no generated premises and no floral mobile video; desktop video stays unchanged.
- **Service Explorer:** six modalities, Foot independent session explicitly call-to-confirm; desktop tab panel vs mobile inline accessible accordion (panel immediately after its choice), Arrow/Home/End keyboard controls, full no-JS readable links. Dedicated source/frame for explorer: warm oil, foot detail, educational two-zone Combination, existing illustrated four-hands detail, plus Chair/Couples; the three flagship cinema photographs are not reused as identical explorer scenes. No chromatic photography filters.
- **Conversion:** all Home booking/pricing links use `https://elegantmassage.setmore.com/#services`; footer-fixed mobile booking removed on Home because persistent header + Hero already offer booking. Internal-page booking behavior unchanged. Existing form still test-targeted, receipt NOT confirmed.
- **Human customer-facing copy:** no internal labels such as "Book online category" or five "Confirm availability" badges. Additional historically mentioned techniques remain identified; owner confirmation remains required, no historic prices published.
- **Documentary location:** original reception/storefront photos only, responsive editorial cropping; no generated/locality claim.
- **Cinematic scroll A/B QA:** original desktop `440svh` = 4.4 viewport screens; tested `360svh` = 3.6 viewport screens, **18.18% shorter**. On Chromium at 1024/1440, candidate retained scene order 01→02→03, final zoom `1.1119` and native scroll; small screens continue normal stacked flow 3.0 screens. Adaptation is CSS scoped to Home; original three-scene JS unchanged.
- **Browser verification — SUCCESS**, GitHub Actions: https://github.com/atrezzostudiosv-spec/elegant-Massage/actions/runs/41203107880 ; six viewports **375, 390, 430, 768, 1024, 1440px**, 0 recorded failures. Checked header/CTA, mobile poster, absence of competing lower mobile CTA, nav/toggle/Escape, keyboard explorer interactions, inline accordion, photos, Setmore, anchor skip, native cinema exit, reduced motion, no-JS fallback, horizontal overflow, 13-route 375px regressions, and responsive screenshots. Screenshot artifact `elegant-home-v6-visual-evidence` (retention 10 days) and QA JSON attached to run.
- **Visual review:** screenshot inspection performed (hero, mobile accordion, Four Hands/Combination educational images, tablet and desktop explorer); imagery remains illustrative and not employees/premises. Four Hands is an existing warm close-up treatment illustration, not a verified photograph of Elegant Massage staff; separate client photography signoff not claimed.
- **Phase state: EN VALIDACIÓN / visual signoff pending.** This is not a production release. Owner current session availability/prices/hours, real form receipt, Safari iOS and Firefox direct-device QA still outstanding. `noindex` untouched. Do not merge to main until client approves artwork and layout.
- Next single action: obtain client approval on V6.1 full-page 375/390/430/768/1024/1440 screenshots; then rebase/merge and start purpose-specific 12-page redesign by phases only with approval.
