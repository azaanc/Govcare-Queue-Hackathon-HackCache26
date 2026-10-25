import { Accessibility, MoveUpRight } from "lucide-react";
import { useHospital, type DepartmentId } from "./store";
import { cn } from "../utils/cn";

export type MapZoneId = "leftUpper" | "leftLower" | "rightUpper" | "rightLower";

type MapZone = {
  label: string;
  detail: string;
  deptId?: DepartmentId;
};

export const floorLabels: Record<number, Record<MapZoneId, MapZone>> = {
  0: {
    leftUpper: { label: "Pharmacy", detail: "A-G08", deptId: "pharmacy" },
    rightUpper: { label: "Laboratory", detail: "B-G04", deptId: "laboratory" },
    leftLower: { label: "Registration", detail: "Patient desk" },
    rightLower: { label: "Sample collection", detail: "B-G06" },
  },
  1: {
    leftUpper: { label: "General OPD", detail: "A-102", deptId: "opd" },
    rightUpper: { label: "Radiology", detail: "B-101", deptId: "radiology" },
    leftLower: { label: "Consult rooms", detail: "A-104–110" },
    rightLower: { label: "Day clinic", detail: "B-108" },
  },
  2: {
    leftUpper: { label: "Pediatrics", detail: "A-210", deptId: "pediatrics" },
    rightUpper: { label: "Cardiology", detail: "C-204", deptId: "cardiology" },
    leftLower: { label: "Quiet room", detail: "A-216" },
    rightLower: { label: "Specialist clinics", detail: "C-208–214" },
  },
};

const zoneCoordinates: Record<MapZoneId, { x: number; y: number; w: number; h: number; centerX: number; centerY: number }> = {
  leftUpper: { x: 82, y: 74, w: 238, h: 112, centerX: 201, centerY: 130 },
  rightUpper: { x: 500, y: 74, w: 238, h: 112, centerX: 619, centerY: 130 },
  leftLower: { x: 82, y: 276, w: 238, h: 108, centerX: 201, centerY: 330 },
  rightLower: { x: 500, y: 276, w: 238, h: 108, centerX: 619, centerY: 330 },
};

export function floorForDepartment(id: DepartmentId) {
  return id === "laboratory" || id === "pharmacy" ? 0 : id === "cardiology" || id === "pediatrics" ? 2 : 1;
}

export function zoneForDepartment(id: DepartmentId): MapZoneId {
  if (id === "pharmacy" || id === "opd" || id === "pediatrics") return "leftUpper";
  if (id === "laboratory" || id === "radiology" || id === "cardiology") return "rightUpper";
  return "rightUpper";
}

const statusColor = {
  normal: "#277c55",
  busy: "#ae761f",
  critical: "#b53426",
} as const;

const statusFill = {
  normal: "#eef7f2",
  busy: "#fdf7ec",
  critical: "#fbeeec",
} as const;

const statusBorder = {
  normal: "#b8d7c6",
  busy: "#e4cda7",
  critical: "#dfb0a9",
} as const;

function ZoneShape({
  zone,
  currentZone,
  routeActive,
  heatmap,
  deptLabel,
}: {
  zone: MapZoneId;
  currentZone: MapZone;
  routeActive: boolean;
  heatmap: boolean;
  deptLabel: (id: DepartmentId) => { status: "normal" | "busy" | "critical"; wait: number; count: number };
}) {
  const coords = zoneCoordinates[zone];
  const snapshot = currentZone.deptId ? deptLabel(currentZone.deptId) : null;
  const isCritical = heatmap && snapshot?.status === "critical";

  return (
    <g>
      <rect
        x={coords.x}
        y={coords.y}
        width={coords.w}
        height={coords.h}
        rx="1.5"
        fill={heatmap && snapshot ? statusFill[snapshot.status] : routeActive ? "#eef5fa" : "#ffffff"}
        stroke={
          heatmap && snapshot
            ? statusBorder[snapshot.status]
            : routeActive
              ? "#6b9ebe"
              : "#d5e0e8"
        }
        strokeWidth={routeActive && !heatmap ? 1.6 : 1}
      />
      {routeActive && !heatmap && (
        <rect
          x={coords.x + 4}
          y={coords.y + 4}
          width={coords.w - 8}
          height={coords.h - 8}
          fill="none"
          stroke="#a8c7da"
          strokeWidth="0.75"
          strokeDasharray="2 3"
        />
      )}
      <text
        x={coords.x + 14}
        y={coords.y + 27}
        fill="#183243"
        fontSize="12.5"
        fontWeight="600"
        letterSpacing="-0.2"
        fontFamily="Inter, sans-serif"
      >
        {currentZone.label}
      </text>
      <text
        x={coords.x + 14}
        y={coords.y + 44}
        fill="#6d7c88"
        fontSize="9.5"
        fontWeight="500"
        fontFamily="Inter, sans-serif"
      >
        {currentZone.detail}
      </text>

      {heatmap && snapshot && (
        <>
          <g transform={`translate(${coords.x + coords.w - 102}, ${coords.y + 16})`}>
            <rect width="88" height="23" rx="1" fill="#ffffff" stroke={statusBorder[snapshot.status]} />
            <circle
              cx="10"
              cy="11.5"
              r="3.2"
              fill={statusColor[snapshot.status]}
              className={isCritical ? "map-critical-pulse" : undefined}
            />
            <text
              x="19"
              y="15"
              fill={statusColor[snapshot.status]}
              fontSize="8.5"
              fontWeight="700"
              letterSpacing="0.3"
              fontFamily="Inter, sans-serif"
            >
              {snapshot.status === "normal" ? "NORMAL" : snapshot.status === "busy" ? "BUSY" : "OVERLOADED"}
            </text>
          </g>
          <text
            x={coords.x + 14}
            y={coords.y + coords.h - 18}
            fill="#526571"
            fontSize="9.5"
            fontFamily="Inter, sans-serif"
          >
            {snapshot.count} waiting · ~{snapshot.wait} min
          </text>
        </>
      )}

      {!heatmap && routeActive && (
        <g transform={`translate(${coords.x + 14}, ${coords.y + coords.h - 27})`}>
          <circle cx="4" cy="4" r="4" fill="#0b527e" />
          <text x="13" y="7.5" fill="#0b527e" fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif">
            DESTINATION
          </text>
        </g>
      )}
    </g>
  );
}

type HospitalMapProps = {
  floor: number;
  mode: "route" | "heatmap";
  destination?: DepartmentId;
  className?: string;
  compact?: boolean;
};

export function HospitalMap({ floor, mode, destination, className, compact = false }: HospitalMapProps) {
  const { getSnapshot, getDepartment } = useHospital();
  const zones = floorLabels[floor] ?? floorLabels[0];
  const deptLabel = (id: DepartmentId) => {
    const snapshot = getSnapshot(id);
    return {
      status: snapshot.status,
      wait: snapshot.waitMinutes,
      count: snapshot.queued.length,
    };
  };
  const destinationZone = destination ? zoneForDepartment(destination) : null;
  const target = destination ? zoneCoordinates[destinationZone ?? "leftUpper"] : null;
  const destinationDepartment = destination ? getDepartment(destination) : null;
  const start = floor === 0 ? { x: 410, y: 15 } : { x: 410, y: 316 };
  const routePath =
    target && destinationZone
      ? floor === 0
        ? `M 410 30 L 410 236 L ${target.centerX} 236 L ${target.centerX} ${target.y + target.h - 6}`
        : `M 410 316 L 410 236 L ${target.centerX} 236 L ${target.centerX} ${target.y + target.h - 6}`
      : "";

  return (
    <div className={cn("relative w-full overflow-hidden border border-[#d8e3eb] bg-[#f7fafc]", className)}>
      <svg
        viewBox="0 0 820 430"
        role="img"
        aria-label={
          mode === "heatmap"
            ? `Hospital live bottleneck map for level ${floor}`
            : `Hospital floor plan for level ${floor} showing a step-free route to ${destinationDepartment?.name ?? "your destination"}`
        }
        className="block h-auto w-full"
      >
        <defs>
          <pattern id="map-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#e8eff4" />
          </pattern>
          <marker id="map-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0b527e" />
          </marker>
        </defs>

        <rect width="820" height="430" fill="#f8fbfd" />
        <rect width="820" height="430" fill="url(#map-grid)" />

        <rect x="52" y="48" width="716" height="352" rx="2" fill="#ffffff" stroke="#c8d7e2" strokeWidth="1.2" />
        <rect x="322" y="48" width="176" height="352" fill="#f2f7fa" stroke="#dce7ef" />
        <rect x="52" y="196" width="716" height="62" fill="#fbfdfe" stroke="#e1eaf1" />

        <g fontFamily="Inter, sans-serif">
          <text x="410" y="218" textAnchor="middle" fill="#687985" fontSize="9" fontWeight="600" letterSpacing="1.2">
            MAIN CORRIDOR
          </text>
          <text x="410" y="104" textAnchor="middle" fill="#537183" fontSize="10.5" fontWeight="600">
            Atrium
          </text>
          <text x="410" y="120" textAnchor="middle" fill="#8796a1" fontSize="8">
            {floor === 0 ? "Entrance & information" : floor === 1 ? "Lift lobby" : "Quiet waiting"}
          </text>

          <rect x="374" y="152" width="72" height="34" rx="1.5" fill="#e9f2f8" stroke="#c6dae7" />
          <text x="410" y="173" textAnchor="middle" fill="#315e7b" fontSize="8.5" fontWeight="600">
            LIFT A
          </text>
          <rect x="374" y="265" width="72" height="34" rx="1.5" fill="#eef5f9" stroke="#d4e3ed" />
          <text x="410" y="286" textAnchor="middle" fill="#5e7787" fontSize="8" fontWeight="500">
            LIFT B
          </text>

          {(Object.keys(zoneCoordinates) as MapZoneId[]).map((zone) => (
            <ZoneShape
              key={zone}
              zone={zone}
              currentZone={zones[zone]}
              routeActive={Boolean(destination && destinationZone === zone && floor === destinationDepartment?.floor)}
              heatmap={mode === "heatmap"}
              deptLabel={deptLabel}
            />
          ))}

          <g transform="translate(391, 4)">
            <rect width="38" height="20" rx="1" fill="#0b3f6b" />
            <text x="19" y="13.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="600" letterSpacing="0.4">
              ENTRY
            </text>
          </g>

          {mode === "route" && routePath && floor === destinationDepartment?.floor && (
            <>
              <path d={routePath} fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d={routePath}
                fill="none"
                stroke="#0b527e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="9 7"
                markerEnd="url(#map-arrow)"
                className="map-route-line"
              />
              <circle cx={start.x} cy={start.y} r="7" fill="#ffffff" stroke="#0b527e" strokeWidth="3" />
              <circle cx={start.x} cy={start.y} r="2.3" fill="#0b527e" />
            </>
          )}

          {mode === "route" && destinationZone && target && floor === destinationDepartment?.floor && (
            <g transform={`translate(${target.centerX - 31}, ${target.y + target.h + 8})`}>
              <rect width="62" height="18" rx="1" fill="#0b3f6b" />
              <text x="31" y="12.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="600">
                {destinationDepartment?.room}
              </text>
            </g>
          )}

          <text x="70" y="416" fill="#8a98a2" fontSize="8" fontFamily="Inter, sans-serif">
            GovCare Queue main campus · schematic floor plan
          </text>
          <text x="752" y="416" textAnchor="end" fill="#8a98a2" fontSize="8" fontFamily="Inter, sans-serif">
            {floor === 0 ? "Ground floor" : `Level ${floor}`} · not to scale
          </text>
        </g>
      </svg>

      {mode === "heatmap" && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#e0e8ee] bg-white px-3 py-2 text-[9.5px] text-[#5b6b77]">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#277c55]" /> Normal
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#ae761f]" /> Busy
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#b53426] map-critical-pulse" /> Overloaded
          </span>
          <span className="ml-auto hidden items-center gap-1.5 sm:flex">
            <Accessibility size={11} strokeWidth={1.8} aria-hidden="true" /> Lift access on every level
          </span>
        </div>
      )}

      {compact && mode === "route" && (
        <div className="absolute bottom-2 right-2 hidden items-center gap-1.5 border border-[#cbdce8] bg-white/95 px-2 py-1 text-[9px] font-medium text-brand sm:flex">
          <MoveUpRight size={11} strokeWidth={2} aria-hidden="true" />
          Step-free route
        </div>
      )}
    </div>
  );
}
