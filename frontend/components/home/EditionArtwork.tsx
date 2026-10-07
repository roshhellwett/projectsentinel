"use client";

import { useId } from "react";
import { Layers3, ShieldCheck } from "lucide-react";
import { MaterialIcon } from "@/components/visual/MaterialIcon";

/** A local, resolution-independent illustration of the cross-reference process. */
export function EditionArtwork() {
  const id = useId();
  return (
    <figure className="edition-art" aria-label="Multiple source reports becoming one cross-referenced story">
      <div className="edition-art__chip edition-art__chip--top" aria-hidden="true"><MaterialIcon icon={Layers3} tone="sky" size="sm" /><span><strong>Every angle matters.</strong><small>Multiple sources. One perspective.</small></span></div>
      <svg viewBox="0 0 460 360" fill="none" aria-hidden="true">
        <defs>
          <filter id={`${id}-shadow`} x="-30%" y="-30%" width="170%" height="180%">
            <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#252820" floodOpacity="0.08" />
          </filter>
          <pattern id={`${id}-dots`} width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="#c8cbc0" />
          </pattern>
        </defs>
        <circle cx="239" cy="177" r="145" fill="#f5f8fa" opacity="0.6" />
        <path d="M47 231h35M64 214v35M380 79h28M394 65v28" stroke="#bfc4b6" strokeWidth="1" />
        <rect x="73" y="83" width="92" height="195" fill={`url(#${id}-dots)`} />
        <g className="edition-art__page edition-art__page--back">
          <g transform="rotate(-15 206 177)" filter={`url(#${id}-shadow)`}>
            <rect x="114" y="53" width="176" height="237" rx="10" fill="#e6eff6" stroke="#c7d6e1" />
            <path d="M132 80h96M132 91h65M132 112h140M132 122h140M132 132h114" stroke="#b6b9aa" strokeWidth="3" />
            <rect x="132" y="151" width="61" height="57" fill="#dfe3d6" />
            <path d="M203 155h67M203 167h67M203 179h54M203 191h61M132 229h135M132 242h118M132 254h128" stroke="#c2c5b7" strokeWidth="3" />
          </g>
        </g>
        <g className="edition-art__page edition-art__page--middle">
          <g transform="rotate(13 276 178)" filter={`url(#${id}-shadow)`}>
            <rect x="188" y="51" width="176" height="238" rx="10" fill="#eaf1e9" stroke="#c8d6c7" />
            <path d="M208 80h112M208 91h78" stroke="#a6ae99" strokeWidth="4" />
            <path d="M208 119h136M208 131h136M208 143h117M208 165h136M208 177h129M208 189h136M208 201h111M208 229h136M208 241h112M208 253h120" stroke="#d0d4c5" strokeWidth="3" />
          </g>
        </g>
        <g className="edition-art__page">
          <g transform="rotate(-4 235 190)" filter={`url(#${id}-shadow)`}>
            <path d="M146 77h145l27 27v208H146V77Z" fill="white" stroke="#a4ac9c" />
            <path d="M291 77v27h27" fill="#efeee6" stroke="#a4ac9c" />
            <text x="165" y="110" fill="#626858" fontSize="8" fontFamily="monospace" letterSpacing="2">INDIA / VERIFIED</text>
            <path d="M165 124h96" stroke="#1f211f" strokeWidth="1" />
            <text x="165" y="150" fill="#262b24" fontSize="23" fontFamily="Georgia, serif">A clearer</text>
            <text x="165" y="177" fill="#262b24" fontSize="23" fontFamily="Georgia, serif">point of view.</text>
            <path d="M165 196h134M165 207h119M165 218h129M165 229h93" stroke="#d4d8cc" strokeWidth="3" />
            <path d="M165 251h45" stroke="#b73a25" strokeWidth="2" />
            <text x="165" y="272" fill="#767b70" fontSize="8" fontFamily="monospace">SOURCES. CONTEXT. CLARITY.</text>
            <path d="M165 291h60M272 291h24" stroke="#d4d8cc" />
          </g>
        </g>
        <g transform="rotate(10 337 249)">
          <rect x="292" y="204" width="90" height="90" rx="45" fill="#faf4ee" stroke="#b73a25" strokeWidth="1.4" />
          <circle cx="337" cy="249" r="38" stroke="#b73a25" strokeDasharray="1 3" />
          <path className="edition-art__check" d="m320 247 12 12 25-28" stroke="#b73a25" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="337" y="278" textAnchor="middle" fill="#b73a25" fontFamily="monospace" fontSize="7" letterSpacing="1.4">CROSS-CHECKED</text>
        </g>
        <path d="M48 319h361" stroke="#d9ddd2" />
        <text x="60" y="340" fill="#6e7466" fontFamily="monospace" fontSize="8" letterSpacing="1">01 / COLLECT</text>
        <path d="M152 337h20m-4-3 4 3-4 3" stroke="#b73a25" />
        <text x="186" y="340" fill="#6e7466" fontFamily="monospace" fontSize="8" letterSpacing="1">02 / COMPARE</text>
        <path d="M283 337h20m-4-3 4 3-4 3" stroke="#b73a25" />
        <text x="314" y="340" fill="#6e7466" fontFamily="monospace" fontSize="8" letterSpacing="1">03 / CLARIFY</text>
      </svg>
      <div className="edition-art__chip edition-art__chip--bottom" aria-hidden="true"><MaterialIcon icon={ShieldCheck} tone="sage" size="sm" /><span><strong>Clarity, with context.</strong><small>The evidence stays in view.</small></span></div>
    </figure>
  );
}
