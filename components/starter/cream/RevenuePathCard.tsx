import { motion } from "framer-motion";
import { ChevronRight, Clock, Coins, Activity } from "lucide-react";
import type { RevenuePath } from "@/types/revenuePath";

interface RevenuePathCardProps {
  rank: number;
  path: RevenuePath;
  index?: number;
  onView: () => void;
}

function formatIncome(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return String(n);
}

export default function RevenuePathCard({
  rank,
  path,
  index = 0,
  onView,
}: RevenuePathCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onView}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.35, ease: "easeOut" }}
      whileTap={{ scale: 0.985 }}
      className="block w-full text-left"
      style={{
        background: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.04)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7F77DD, #D85A30)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {rank}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              color: "#1D1D1F",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
            }}
          >
            {path.name}
          </div>
          <div
            style={{
              fontSize: 11,
              fontStyle: "italic",
              color: "#8A8A8A",
              marginTop: 2,
            }}
          >
            {path.tagline}
          </div>
        </div>
        <ChevronRight size={18} color="#8A8A8A" style={{ flexShrink: 0, marginTop: 4 }} />
      </div>
      <p
        style={{
          fontSize: 12,
          color: "#4A4A4A",
          lineHeight: 1.5,
          marginTop: 10,
          marginBottom: 0,
        }}
      >
        {path.why_fits_short}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(216,90,48,0.04)",
          padding: "10px 12px",
          borderRadius: 12,
          marginTop: 10,
          gap: 8,
        }}
      >
        <Stat
          icon={<Clock size={12} color="#D85A30" />}
          text={`เห็นเงินใน ${path.timeline_days} วัน`}
        />
        <Stat
          icon={<Coins size={12} color="#D85A30" />}
          text={`฿${formatIncome(path.income_min)}-${formatIncome(path.income_max)}/ด.`}
        />
        <Stat
          icon={<Activity size={12} color="#D85A30" />}
          text={`Effort: ${path.effort_level}`}
        />
      </div>
    </motion.button>
  );
}

function Stat({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        color: "#1D1D1F",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}
