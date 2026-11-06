"""Fit ATREZZO Cards 01 to the five menu routes and the real studio story."""
from html import escape
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
BOOK = "https://elegantmassage.setmore.com/#services"

PAGES = {
    "massage-services/body-massage/index.html": {
        "heading": "Body massage, considered.",
        "intro": "Find the approach and time that fit your day. Confirm the exact technique when reserving.",
        "cards": [
            ("01 / BODY", "Choose your pace.", "Compare body massage appointments.", "martes/body-editorial.webp", "Illustrative body massage in a bright spa", "../../massage-menu/"),
            ("02 / PRESSURE", "A closer touch.", "Explore the pressure and technique chapters.", "martes/body-detail.webp", "Illustrative back massage treatment", "#body-journey"),
            ("03 / RESERVE", "Make time for you.", "See current availability and booking details.", "elegant-massage-massage-touch-detail.webp", "Illustrative massage detail", BOOK),
        ],
    },
    "massage-services/combination-massage/index.html": {
        "heading": "Two focus areas. One visit.",
        "intro": "Explore how foot and back massage can sit together in a combination appointment.",
        "cards": [
            ("01 / COMBINATION", "Foot & back.", "Discover the combined format.", "elegant-massage-combination-single-desktop.webp", "Illustrative combination massage", "../../massage-menu/"),
            ("02 / FOOT", "The foot focus.", "Learn about attentive foot work.", "martes/foot-detail.webp", "Illustrative foot massage treatment", "../foot-reflexology/"),
            ("03 / BODY", "The back focus.", "Explore body massage approaches.", "martes/body-detail.webp", "Illustrative back massage treatment", "../body-massage/"),
        ],
    },
    "massage-services/couples-massage/index.html": {
        "heading": "Space to unwind together.",
        "intro": "A visual guide to the shared appointment, its setting and your next step.",
        "cards": [
            ("01 / TOGETHER", "A moment for two.", "Compare couples appointments.", "martes/couples-editorial.webp", "Illustrative couples massage in a contemporary spa", "../../massage-menu/"),
            ("02 / EXPERIENCE", "Shared calm.", "Discover the couples format.", "martes/couples-detail.webp", "Illustrative shared massage setting", "#couples-guide"),
            ("03 / RESERVE", "Choose your time.", "See current appointment details.", "martes/two-clients-detail.webp", "Illustrative two-client massage experience", BOOK),
        ],
    },
    "massage-services/chair-massage/index.html": {
        "heading": "A different way to pause.",
        "intro": "Explore the seated format and compare Chair and Chair/Thai booking choices.",
        "cards": [
            ("01 / CHAIR", "Seated comfort.", "Discover the chair massage format.", "martes/chair-editorial.webp", "Illustrative seated chair massage", "#chair-guide"),
            ("02 / TECHNIQUE", "Shoulder focus.", "Read about the seated approach.", "martes/chair-detail.webp", "Illustrative chair massage technique", "#chair-guide"),
            ("03 / CHOOSE", "Compare options.", "Review current appointment categories.", "martes/seated-detail.webp", "Illustrative shoulder massage in a seated position", "../../massage-menu/"),
        ],
    },
    "massage-services/four-hands-massage/index.html": {
        "heading": "A distinct massage format.",
        "intro": "Four Hands is a separate booking category. Explore its description and confirm details before reserving.",
        "cards": [
            ("01 / FOUR HANDS", "Coordinated touch.", "Explore what the format means.", "martes/four-hands-detail.webp", "Illustrative four-hands massage technique", "#four-hands-guide"),
            ("02 / THE EXPERIENCE", "One appointment.", "Read the service guide.", "elegant-massage-four-hands-batch02-desktop.webp", "Illustrative four-hands treatment", "#four-hands-guide"),
            ("03 / RESERVE", "Your time to pause.", "See the current booking category.", "elegant-massage-two-therapists-editorial-desktop.webp", "Illustrative coordinated massage", BOOK),
        ],
    },
    "about/index.html": {
        "heading": "A real place to arrive.",
        "intro": "See Elegant Massage's Flower Mound storefront and treatment spaces before you visit.",
        "cards": [
            ("01 / THE STUDIO", "Step inside.", "See more photographs of the location.", "elegant-massage-flower-mound-reception-desk.webp", "Elegant Massage reception desk in Flower Mound", "../gallery/"),
            ("02 / FIND US", "Know the way.", "Find the address and directions.", "elegant-massage-flower-mound-storefront-exterior.webp", "Elegant Massage storefront in Flower Mound", "../contact/"),
            ("03 / TREATMENTS", "Find your pause.", "Explore the massage formats.", "elegant-massage-flower-mound-treatment-area.webp", "Elegant Massage treatment area", "../massage-services/"),
        ],
        "real": True,
    },
}

def section(data, prefix):
    blocks = []
    for index, (number, title, description, image, alt, href) in enumerate(data["cards"]):
        kind = ("lead", "secondary", "third")[index]
        target = ' target="_blank" rel="noopener noreferrer"' if href.startswith("https://") else ""
        blocks.append(
            f'<a class="atc-mosaic-card atc-mosaic-card--{kind}" href="{escape(href, quote=True)}"{target}>'
            f'<img src="{prefix}assets/images/{escape(image, quote=True)}" alt="{escape(alt, quote=True)}" loading="lazy" width="1600" height="1000">'
            f'<span class="atc-mosaic-top"><span>{escape(number)}</span><span aria-hidden="true">↗</span></span>'
            f'<span class="atc-mosaic-copy"><span>ELEGANT MASSAGE</span><strong>{escape(title)}</strong><span>{escape(description)}</span></span></a>'
        )
    note = "Original photographs of the Flower Mound location." if data.get("real") else "Treatment photographs are illustrative; they do not depict Elegant Massage staff or premises."
    return (f'<section class="em-editorial-section" aria-label="{escape(data["heading"], quote=True)}">'
            f'<div class="em-editorial-shell"><div class="em-editorial-heading"><p>ATREZZO / ELEGANT MASSAGE</p>'
            f'<h2>{escape(data["heading"])}</h2><span>{escape(data["intro"])}</span></div>'
            f'<div class="atc atc-mosaic">{"".join(blocks)}</div><p class="em-editorial-note">{note}</p></div></section>')

for relative, data in PAGES.items():
    path = ROOT / relative
    prefix = "../" * (len(Path(relative).parts) - 1)
    html = path.read_text()
    markup = section(data, prefix)
    if "em-editorial-section" in html:
        html, count = re.subn(r'<section class="em-editorial-section"[\s\S]*?</section>', markup, html, count=1)
    elif "body-massage" in relative:
        html = html.replace('<section class="em-body-cta"', markup + '<section class="em-body-cta"', 1)
        count = 1
    else:
        html, count = re.subn(r'<section class="section section--white">[\s\S]*?</section>', markup, html, count=1)
    if count != 1:
        raise RuntimeError(f"Could not place mosaic in {relative}")
    guide_ids = {
        "massage-services/couples-massage/index.html": "couples-guide",
        "massage-services/chair-massage/index.html": "chair-guide",
        "massage-services/four-hands-massage/index.html": "four-hands-guide",
    }
    if relative in guide_ids and f'id="{guide_ids[relative]}"' not in html:
        html = html.replace('<section class="section">', f'<section class="section" id="{guide_ids[relative]}">', 1)
    if relative == "about/index.html":
        process = '''<section class="em-about-principles"><div class="em-editorial-shell"><div class="em-editorial-heading"><p>ABOUT / THE APPROACH</p><h2>What makes a visit yours.</h2><span>Explore the traditions, treatment choices and real location behind the experience.</span></div><div class="atc atc-process"><details class="atc-process-card"><summary><span class="atc-process-top"><span>01 / TRADITION</span><span class="atc-process-plus" aria-hidden="true">+</span></span><span class="atc-process-title">Chinese massage influences.</span><span class="atc-process-summary">The studio's original story mentions techniques learned and practiced in China.</span><span class="atc-process-action">Read more <span aria-hidden="true">↗</span></span></summary><div class="atc-process-expanded"><p>This tradition informs how Elegant Massage describes its approach to bodywork and relaxation.</p></div></details><details class="atc-process-card"><summary><span class="atc-process-top"><span>02 / CHOICE</span><span class="atc-process-plus" aria-hidden="true">+</span></span><span class="atc-process-title">Different ways to unwind.</span><span class="atc-process-summary">Explore body, foot, combination, couples and chair appointments.</span><span class="atc-process-action">Read more <span aria-hidden="true">↗</span></span></summary><div class="atc-process-expanded"><p>For current categories, lengths and availability, check online booking or call the studio.</p></div></details><details class="atc-process-card"><summary><span class="atc-process-top"><span>03 / LOCATION</span><span class="atc-process-plus" aria-hidden="true">+</span></span><span class="atc-process-title">In Flower Mound.</span><span class="atc-process-summary">See the storefront, reception and treatment areas before you arrive.</span><span class="atc-process-action">Read more <span aria-hidden="true">↗</span></span></summary><div class="atc-process-expanded"><p>The studio is at 2911 Cross Timbers Road, Suite 105, Flower Mound, Texas.</p></div></details></div><a class="em-about-principles__link" href="../massage-services/">Explore treatments <span aria-hidden="true">↗</span></a></div></section>'''
        pattern = r'<section class="em-about-principles">[\s\S]*?</section>' if 'em-about-principles' in html else r'<section class="section">[\s\S]*?</section>'
        html, process_count = re.subn(pattern, process, html, count=1)
        if process_count != 1:
            raise RuntimeError("Could not place About process cards")
    css = f'<link rel="stylesheet" href="{prefix}assets/css/atrezzo-cards-01.css"><link rel="stylesheet" href="{prefix}assets/css/editorial-pages-fit.css">'
    if "atrezzo-cards-01.css" not in html:
        html = html.replace("</head>", css + "</head>", 1)
    path.write_text(html)
    print(relative)
