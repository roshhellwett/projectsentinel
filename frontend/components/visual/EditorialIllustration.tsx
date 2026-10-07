"use client";

import { useId } from "react";
import { cn } from "@/lib/utils/cn";

export type IllustrationVariant = "search" | "saved" | "verify" | "assistant" | "privacy" | "contact";

/** Shared lighting and materials keep each original SVG scene in one visual family. */
export function EditorialIllustration({ variant, className = "" }: { variant: IllustrationVariant; className?: string }) {
  const id = useId().replace(/:/g, "");
  const paint = (name: string) => `url(#${id}-${name})`;
  return (
    <div className={cn("editorial-illustration", `editorial-illustration--${variant}`, className)} aria-hidden="true">
      <svg viewBox="0 0 340 260" fill="none" focusable="false">
        <defs>
          <linearGradient id={`${id}-paper`} x1="70" y1="55" x2="270" y2="225" gradientUnits="userSpaceOnUse"><stop stopColor="white" /><stop offset="1" stopColor="#edf1ef" /></linearGradient>
          <linearGradient id={`${id}-glass`} x1="65" y1="45" x2="270" y2="230" gradientUnits="userSpaceOnUse"><stop stopColor="white" stopOpacity="0.9" /><stop offset="0.5" stopColor="#eef6ff" stopOpacity="0.5" /><stop offset="1" stopColor="#c6def5" stopOpacity="0.75" /></linearGradient>
          <linearGradient id={`${id}-coral`} x1="140" y1="45" x2="225" y2="220" gradientUnits="userSpaceOnUse"><stop stopColor="#f5bea5" /><stop offset="0.55" stopColor="#d97b5b" /><stop offset="1" stopColor="#ad472f" /></linearGradient>
          <linearGradient id={`${id}-sage`} x1="100" y1="55" x2="240" y2="220" gradientUnits="userSpaceOnUse"><stop stopColor="#bedcca" /><stop offset="0.5" stopColor="#79ad91" /><stop offset="1" stopColor="#357657" /></linearGradient>
          <linearGradient id={`${id}-violet`} x1="115" y1="55" x2="250" y2="205" gradientUnits="userSpaceOnUse"><stop stopColor="#eee4ff" /><stop offset="0.55" stopColor="#c3ace3" /><stop offset="1" stopColor="#8260ac" /></linearGradient>
          <linearGradient id={`${id}-metal`} x1="170" y1="55" x2="250" y2="205" gradientUnits="userSpaceOnUse"><stop stopColor="#e7edf0" /><stop offset="0.35" stopColor="white" /><stop offset="0.55" stopColor="#bcc9d0" /><stop offset="1" stopColor="#7f939f" /></linearGradient>
          <filter id={`${id}-shadow`} x="-50%" y="-40%" width="200%" height="220%"><feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#526672" floodOpacity="0.13" /></filter>
          <filter id={`${id}-ambient`} x="-60%" y="-80%" width="220%" height="260%"><feGaussianBlur stdDeviation="12" /></filter>
        </defs>
        <ellipse cx="174" cy="228" rx="89" ry="10" fill="#beced0" opacity="0.26" filter={paint("ambient")} />
        <circle cx="169" cy="128" r="99" fill={variant === "saved" || variant === "verify" ? "#edf5ef" : variant === "assistant" ? "#f2eef9" : "#eff5fb"} opacity="0.7" />
        <path d="M39 149h16m-8-8v16M287 70h14m-7-7v14" stroke="#a6bab8" strokeWidth="1.1" />
        <circle cx="274" cy="198" r="4" fill="#e5b29e" /><circle cx="66" cy="75" r="3" fill="#bacbdc" />

        {variant === "search" && <>
          <g className="illustration-float" filter={paint("shadow")} transform="rotate(-9 144 133)">
            <rect x="78" y="43" width="146" height="172" rx="12" fill={paint("paper")} stroke="white" strokeWidth="2" />
            <rect x="96" y="62" width="33" height="33" rx="8" fill="#d5e5f8" />
            <path d="M141 72h58M141 84h40M96 115h96M96 129h105M96 143h81M96 175h107M96 189h77" stroke="#b8c8cb" strokeWidth="4" strokeLinecap="round" />
            <path d="M96 157h53" stroke="#d88469" strokeWidth="4" strokeLinecap="round" />
          </g>
          <g className="illustration-float illustration-float--late" filter={paint("shadow")}>
            <path d="m223 158 46 46" stroke={paint("metal")} strokeWidth="21" strokeLinecap="round" />
            <path d="m226 157 44 44" stroke="white" strokeOpacity="0.65" strokeWidth="3" strokeLinecap="round" />
            <circle cx="198" cy="130" r="50" fill={paint("glass")} stroke="#8faec3" strokeWidth="9" />
            <circle cx="198" cy="130" r="46" stroke="white" strokeOpacity="0.9" strokeWidth="2" />
            <path d="M172 112c8-14 25-17 39-12" stroke="white" strokeWidth="5" strokeLinecap="round" />
          </g>
        </>}

        {variant === "saved" && <>
          <g className="illustration-float illustration-float--late" transform="rotate(-13 135 130)" filter={paint("shadow")}><rect x="75" y="53" width="127" height="163" rx="11" fill="#dcebe0" stroke="white" strokeWidth="2" /><path d="M95 84h77M95 98h56M95 141h79M95 155h73M95 169h60" stroke="#acc3b3" strokeWidth="4" strokeLinecap="round" /></g>
          <g className="illustration-float" transform="rotate(7 192 132)" filter={paint("shadow")}><rect x="123" y="40" width="138" height="173" rx="13" fill={paint("paper")} stroke="white" strokeWidth="2" /><rect x="139" y="62" width="36" height="36" rx="8" fill="#e8dac6" /><path d="M188 72h49M188 85h38M141 121h96M141 137h86M141 153h93M141 181h65" stroke="#becbc1" strokeWidth="4" strokeLinecap="round" /><path d="M200 40h31v76l-15-13-16 13V40Z" fill={paint("coral")} /><path d="M204 45v60l12-9 11 9V45" stroke="white" strokeOpacity="0.45" /></g>
          <g filter={paint("shadow")}><circle cx="102" cy="191" r="24" fill="white" /><path d="m91 191 7 7 14-16" stroke="#438764" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></g>
        </>}

        {variant === "verify" && <>
          <g className="illustration-float illustration-float--late" transform="rotate(-12 170 142)" filter={paint("shadow")}><rect x="99" y="58" width="145" height="158" rx="12" fill={paint("paper")} stroke="white" strokeWidth="2" /><path d="M117 85h81M117 98h102M117 164h89M117 179h99M117 193h70" stroke="#becdc6" strokeWidth="4" strokeLinecap="round" /></g>
          <g className="illustration-float" filter={paint("shadow")}><path d="m175 43 59 22v61c0 39-26 64-59 80-34-16-59-41-59-80V65l59-22Z" fill={paint("sage")} stroke="#edf8ef" strokeWidth="3" /><path d="m175 55 47 17v55c0 29-19 52-47 67-29-15-47-38-47-67V72l47-17Z" stroke="white" strokeOpacity="0.6" /><path d="m150 122 18 18 34-39" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /><path d="m139 76 23-9" stroke="white" strokeOpacity="0.6" strokeWidth="4" strokeLinecap="round" /></g>
          <rect x="217" y="158" width="57" height="39" rx="11" fill={paint("glass")} stroke="white" strokeWidth="2" /><path d="M231 177h29m-25-7h21" stroke="#728ea0" strokeWidth="2" strokeLinecap="round" />
        </>}

        {variant === "assistant" && <>
          <g className="illustration-float illustration-float--late" filter={paint("shadow")}><path d="M87 64h118c11 0 19 8 19 19v66c0 11-8 19-19 19h-78l-35 24v-25c-13 0-24-8-24-20V83c0-11 8-19 19-19Z" fill={paint("glass")} stroke="white" strokeWidth="2" /><path d="M96 92h87M96 107h61M96 122h77" stroke="#a4bdcd" strokeWidth="4" strokeLinecap="round" /></g>
          <g className="illustration-float" filter={paint("shadow")}><path d="M156 108h102c13 0 22 10 22 23v54c0 13-9 23-22 23h-15v22l-29-22h-58c-13 0-23-10-23-23v-54c0-13 10-23 23-23Z" fill={paint("violet")} stroke="#faf5ff" strokeWidth="2" /><path d="M156 125h67" stroke="white" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" /><circle cx="172" cy="159" r="7" fill="white" /><circle cx="205" cy="159" r="7" fill="white" /><circle cx="238" cy="159" r="7" fill="white" /></g>
        </>}

        {variant === "privacy" && <>
          <g className="illustration-float illustration-float--late" transform="rotate(-12 164 134)" filter={paint("shadow")}><rect x="93" y="57" width="143" height="152" rx="13" fill={paint("glass")} stroke="white" strokeWidth="2" /><path d="M113 82h62M113 96h101M113 167h101M113 181h83" stroke="#b3c8d6" strokeWidth="4" strokeLinecap="round" /></g>
          <g className="illustration-float" filter={paint("shadow")}><path d="M139 117V85a39 39 0 0 1 78 0v32" stroke={paint("metal")} strokeWidth="16" /><path d="M140 105V85a37 37 0 0 1 56-32" stroke="white" strokeWidth="3" strokeLinecap="round" /><rect x="124" y="108" width="109" height="96" rx="19" fill={paint("coral")} stroke="#ffdccb" strokeWidth="2" /><circle cx="178" cy="149" r="12" fill="#fff5e9" /><path d="M174 154h8l4 18h-16l4-18Z" fill="#fff5e9" /><path d="M139 121h59" stroke="white" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" /></g>
        </>}

        {variant === "contact" && <>
          <g className="illustration-float illustration-float--late" transform="rotate(-10 170 140)" filter={paint("shadow")}><rect x="100" y="47" width="140" height="151" rx="12" fill={paint("paper")} stroke="white" strokeWidth="2" /><path d="M120 76h88M120 91h99M120 106h76" stroke="#bacbd1" strokeWidth="4" strokeLinecap="round" /><path d="M120 125h49" stroke="#d28c70" strokeWidth="4" strokeLinecap="round" /></g>
          <g className="illustration-float" filter={paint("shadow")}><rect x="79" y="111" width="185" height="102" rx="14" fill={paint("glass")} stroke="white" strokeWidth="2" /><path d="m83 116 88 64 89-64" fill="#e6eff4" stroke="white" strokeWidth="2" /><path d="m83 207 61-58M259 207l-61-58" stroke="#c4d6e0" strokeWidth="2" /><circle cx="251" cy="105" r="28" fill={paint("coral")} stroke="#fff0e7" strokeWidth="2" /><path d="m240 107 18-10-7 20-4-9-7-1Z" fill="white" /></g>
        </>}
      </svg>
    </div>
  );
}
