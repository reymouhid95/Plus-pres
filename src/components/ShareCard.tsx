"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

type ShareCardProps = {
  percentage: number;
  totalRounds: number;
  matchedRounds: number;
  totalSessions: number;
  byLevel: { level: number; label: string; percentage: number }[];
  date: string;
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const BG = "#141013";
const FG = "#F3E9EC";
const MUTED = "#A3959C";
const ACCENT = "#C7973E";
const LINE = "#3A3237";

/**
 * Carte de résultat exportable en PNG.
 *
 * Tout est écrit en attributs SVG inline (jamais de classe Tailwind, jamais de
 * variable CSS) : la carte doit rester autonome une fois sérialisée, sinon le
 * rendu hors navigateur perdrait couleurs et typographies.
 */
export default function ShareCard({
  percentage,
  totalRounds,
  matchedRounds,
  totalSessions,
  byLevel,
  date,
}: ShareCardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [exporting, setExporting] = useState(false);

  async function download() {
    const svg = svgRef.current;
    if (!svg || exporting) return;
    setExporting(true);

    try {
      const markup = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n`, markup], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("SVG illisible"));
        image.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas indisponible");

      context.fillStyle = BG;
      context.fillRect(0, 0, 1080, 1080);
      context.drawImage(image, 0, 0, 1080, 1080);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `plus-pres-${date}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast("Carte enregistrée dans vos téléchargements.", "success");
    } catch {
      toast("L'export n'a pas fonctionné sur ce navigateur.", "error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <svg
        ref={svgRef}
        data-testid="share-card"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 800"
        width="100%"
        role="img"
        aria-label={`Carte de résultat : ${percentage} % d'alignement`}
      >
        <rect x="0" y="0" width="800" height="800" fill={BG} />
        <rect
          x="18"
          y="18"
          width="764"
          height="764"
          rx="40"
          fill="none"
          stroke={ACCENT}
          strokeOpacity="0.4"
          strokeWidth="2"
        />

        <text x="64" y="104" fontFamily={SANS} fontSize="24" fontWeight="700" letterSpacing="7" fill={ACCENT}>
          PLUS PRÈS
        </text>
        <text x="64" y="142" fontFamily={SANS} fontSize="18" letterSpacing="2" fill={MUTED}>
          Notre compatibilité
        </text>

        <text x="64" y="330" fontFamily={SERIF} fontSize="180" fontWeight="700" fill={FG}>
          {percentage}
        </text>
        <text x={64 + String(percentage).length * 108 + 16} y="330" fontFamily={SERIF} fontSize="72" fill={ACCENT}>
          %
        </text>
        <text x="66" y="378" fontFamily={SANS} fontSize="22" fill={MUTED}>
          {matchedRounds} réponse{matchedRounds > 1 ? "s" : ""} alignée
          {matchedRounds > 1 ? "s" : ""} sur {totalRounds} manche{totalRounds > 1 ? "s" : ""}
        </text>

        <line x1="64" y1="424" x2="736" y2="424" stroke={LINE} strokeWidth="2" />

        <g fontFamily={SANS}>
          <text x="64" y="480" fontSize="42" fontWeight="700" fill={FG}>
            {totalRounds}
          </text>
          <text x="64" y="510" fontSize="16" letterSpacing="1.5" fill={MUTED}>
            MANCHES
          </text>

          <text x="300" y="480" fontSize="42" fontWeight="700" fill={FG}>
            {matchedRounds}
          </text>
          <text x="300" y="510" fontSize="16" letterSpacing="1.5" fill={MUTED}>
            ALIGNÉES
          </text>

          <text x="536" y="480" fontSize="42" fontWeight="700" fill={FG}>
            {totalSessions}
          </text>
          <text x="536" y="510" fontSize="16" letterSpacing="1.5" fill={MUTED}>
            PARTIES
          </text>
        </g>

        <g fontFamily={SANS}>
          {byLevel.slice(0, 3).map((level, index) => {
            const y = 576 + index * 62;
            return (
              <g key={level.level}>
                <text x="64" y={y} fontSize="19" fill={FG}>
                  {level.label}
                </text>
                <text x="736" y={y} fontSize="19" fontWeight="700" fill={FG} textAnchor="end">
                  {level.percentage} %
                </text>
                <rect x="64" y={y + 12} width="672" height="8" rx="4" fill={LINE} />
                <rect
                  x="64"
                  y={y + 12}
                  width={Math.max(8, (672 * level.percentage) / 100)}
                  height="8"
                  rx="4"
                  fill={ACCENT}
                />
              </g>
            );
          })}
        </g>

        <text x="64" y="744" fontFamily={SANS} fontSize="17" fill={MUTED}>
          plus-pres · {date}
        </text>
      </svg>

      <button
        type="button"
        onClick={download}
        disabled={exporting}
        data-testid="download-card"
        className="btn btn-secondary btn-block mt-4 disabled:opacity-60"
      >
        <Download className="size-4" />
        {exporting ? "Création de l'image…" : "Télécharger l'image"}
      </button>
    </div>
  );
}
