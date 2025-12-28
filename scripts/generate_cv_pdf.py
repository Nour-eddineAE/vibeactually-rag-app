#!/usr/bin/env python3
import sys
from pathlib import Path
from typing import List

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem


def load_markdown(md_path: Path) -> List[str]:
    text = md_path.read_text(encoding="utf-8")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    return text.split("\n")


def split_sections(lines: List[str]):
    sections = {}
    current = "header"
    buf: List[str] = []
    for ln in lines:
        if ln.startswith("## "):
            sections[current] = buf
            current = ln[3:].strip().lower()
            buf = []
        else:
            buf.append(ln)
    sections[current] = buf
    return sections


def parse_header(header_lines: List[str]):
    name = ""
    role = ""
    contacts: List[str] = []
    for i, ln in enumerate(header_lines):
        if i == 0 and ln.startswith('# '):
            name = ln[2:].strip()
        elif i == 1 and ln.strip():
            role = ln.strip()
        else:
            if ln.strip():
                contacts.append(ln.strip())
    contacts = [c.replace("  ", "").strip() for c in contacts if c]
    return name, role, contacts


def md_paragraphs(block_lines: List[str]) -> List[str]:
    out: List[str] = []
    buf: List[str] = []
    for ln in block_lines:
        if ln.startswith('- '):
            if buf:
                out.append(" ".join(buf).strip())
                buf = []
            out.append(ln)
        elif ln.strip() == "":
            if buf:
                out.append(" ".join(buf).strip())
                buf = []
        else:
            buf.append(ln.strip())
    if buf:
        out.append(" ".join(buf).strip())
    return out


def bullets_from_lines(lines: List[str]) -> List[str]:
    return [ln[2:].strip() for ln in lines if ln.startswith('- ')]


def build_pdf(md_path: Path, pdf_path: Path):
    lines = load_markdown(md_path)
    sections = split_sections(lines)
    name, role, contacts = parse_header(sections.get('header', []))

    styles = getSampleStyleSheet()
    styles['Normal'].fontName = 'Helvetica'
    styles['Normal'].fontSize = 10.5
    styles['Normal'].leading = 14

    h1 = ParagraphStyle(name='Name', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=20, leading=24, spaceAfter=4)
    subtitle = ParagraphStyle(name='Subtitle', parent=styles['Normal'], fontName='Helvetica', fontSize=12.5, leading=16, textColor='#333333', spaceAfter=8)
    small = ParagraphStyle(name='Small', parent=styles['Normal'], fontSize=9.5, leading=13, textColor='#444444')
    h2 = ParagraphStyle(name='H2', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12.5, leading=16, spaceBefore=10, spaceAfter=4)

    doc = SimpleDocTemplate(str(pdf_path), pagesize=A4, leftMargin=2*cm, rightMargin=2*cm, topMargin=1.8*cm, bottomMargin=1.8*cm)

    story: List = []
    if name:
        story.append(Paragraph(name, h1))
    if role:
        story.append(Paragraph(role, subtitle))
    if contacts:
        story.append(Paragraph(" | ".join(contacts), small))
        story.append(Spacer(1, 6))

    if 'professional summary' in sections:
        story.append(Paragraph('Professional Summary', h2))
        for para in md_paragraphs(sections['professional summary']):
            if para:
                story.append(Paragraph(para, styles['Normal']))
        story.append(Spacer(1, 6))

    if 'core skills' in sections:
        story.append(Paragraph('Core Skills', h2))
        bullets = bullets_from_lines(sections['core skills'])
        if bullets:
            items = [ListItem(Paragraph(b, styles['Normal']), leftIndent=6) for b in bullets]
            story.append(ListFlowable(items, bulletType='bullet', start='circle', leftIndent=6))
            story.append(Spacer(1, 4))

    if 'experience' in sections:
        story.append(Paragraph('Experience', h2))
        block = sections['experience']
        for ln in block:
            if ln.startswith('### '):
                story.append(Spacer(1, 4))
                story.append(Paragraph(f"<b>{ln[4:].strip()}</b>", styles['Normal']))
            elif ln.strip() and not ln.startswith('- '):
                story.append(Paragraph(ln.strip(), small))
        bullets: List[ListItem] = []
        for ln in block:
            if ln.startswith('- '):
                bullets.append(ListItem(Paragraph(ln[2:].strip(), styles['Normal']), leftIndent=6))
            else:
                if bullets:
                    story.append(ListFlowable(bullets, bulletType='bullet', start='circle', leftIndent=6))
                    bullets = []
        if bullets:
            story.append(ListFlowable(bullets, bulletType='bullet', start='circle', leftIndent=6))

    if 'education' in sections:
        story.append(Spacer(1, 6))
        story.append(Paragraph('Education', h2))
        for para in md_paragraphs(sections['education']):
            if para:
                story.append(Paragraph(para, styles['Normal']))

    if 'languages' in sections:
        story.append(Spacer(1, 6))
        story.append(Paragraph('Languages', h2))
        bullets = bullets_from_lines(sections['languages'])
        if bullets:
            items = [ListItem(Paragraph(b, styles['Normal']), leftIndent=6) for b in bullets]
            story.append(ListFlowable(items, bulletType='bullet', start='circle', leftIndent=6))

    doc.build(story)


def main():
    if len(sys.argv) != 3:
        print("Usage: generate_cv_pdf.py <input_md> <output_pdf>")
        sys.exit(1)
    md = Path(sys.argv[1])
    pdf = Path(sys.argv[2])
    pdf.parent.mkdir(parents=True, exist_ok=True)
    build_pdf(md, pdf)
    print(f"Wrote {pdf}")


if __name__ == '__main__':
    main()

