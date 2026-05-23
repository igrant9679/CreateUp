import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import PDFDocument from "pdfkit";
import { requireMembership } from "@/lib/acl";
import { db } from "@/lib/db";

// FR-PUB-01 — Export script as Word (.docx) or PDF.
// GET /api/scripts/[id]/export?format=docx|pdf

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { workspace } = await requireMembership();
  const script = await db.script.findFirst({
    where: { id, channel: { workspaceId: workspace.id } },
    include: { channel: true },
  });
  if (!script) return new NextResponse("Not found", { status: 404 });

  const format = req.nextUrl.searchParams.get("format") ?? "docx";
  const filename = sanitize(script.title) + (format === "pdf" ? ".pdf" : ".docx");

  if (format === "pdf") {
    const buf = await renderPDF(script.title, script.channel.name, script.body ?? "");
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const buf = await renderDocx(script.title, script.channel.name, script.body ?? "");
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

async function renderDocx(title: string, channel: string, body: string): Promise<Buffer> {
  const blocks: Paragraph[] = [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ children: [new TextRun({ text: channel, italics: true })] }),
    new Paragraph({ text: "" }),
  ];
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      blocks.push(new Paragraph({ text: "" }));
      continue;
    }
    const bold = /^\*\*.+\*\*$/.test(trimmed) || /^#+\s/.test(trimmed);
    blocks.push(new Paragraph({
      children: [new TextRun({ text: trimmed.replace(/^\*\*|\*\*$|^#+\s+/g, ""), bold })],
    }));
  }
  const doc = new Document({ sections: [{ children: blocks }] });
  return await Packer.toBuffer(doc);
}

function renderPDF(title: string, channel: string, body: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 60 });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).text(title, { paragraphGap: 4 });
    doc.fontSize(11).fillColor("#666").text(channel, { paragraphGap: 16 });
    doc.fillColor("#000").fontSize(12);

    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) { doc.moveDown(0.5); continue; }
      const isHeader = /^\*\*.+\*\*$/.test(trimmed) || /^#+\s/.test(trimmed);
      if (isHeader) {
        doc.moveDown(0.4);
        doc.font("Helvetica-Bold").fontSize(13).text(trimmed.replace(/^\*\*|\*\*$|^#+\s+/g, ""), { paragraphGap: 4 });
        doc.font("Helvetica").fontSize(12);
      } else {
        doc.text(trimmed, { paragraphGap: 4 });
      }
    }

    doc.end();
  });
}

function sanitize(name: string): string {
  return name.replace(/[^a-z0-9_\- ]/gi, "").trim().replace(/\s+/g, "_").slice(0, 80) || "script";
}
