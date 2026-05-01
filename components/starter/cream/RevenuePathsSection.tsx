import { motion } from "framer-motion";
import { Sparkles, RotateCw, Lock } from "lucide-react";
import type { RevenuePath } from "@/types/revenuePath";
import RevenuePathCard from "./RevenuePathCard";

interface RevenuePathsSectionProps {
  paths: RevenuePath[];
  onRefresh: () => void;
  canRefresh: boolean;
  lastRefreshed: Date | null;
  loading?: boolean;
  onPathClick: (id: string) => void;
}

const LOCK_DAYS = 14;

function daysSince(d: Date | null): number {
  if (!d) return 0;
  const ms = Date.now() - d.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function daysUntil(d: Date | null, lockDays = LOCK_DAYS): number {
  if (!d) return 0;
  return Math.max(0, lockDays - daysSince(d));
}

export default function RevenuePathsSection({
  paths,
  onRefresh,
  canRefresh,
  lastRefreshed,
  loading = false,
  onPathClick,
}: RevenuePathsSectionProps) {
  const sinceDays = daysSince(lastRefreshed);
  const untilDays = daysUntil(lastRefreshed);

  let refreshLabel: React.ReactNode;
  if (loading) {
    refreshLabel = (
      <>
        <RotateCw size={12} className="animate-spin" color="#6B6B6B" />
        <span>AI กำลังวิเคราะห์...</span>
      </>
    );
  } else if (canRefresh) {
    refreshLabel = (
      <>
        <RotateCw size={12} color="#1D1D1F" />
        <span>{lastRefreshed ? `อัปเดต ${sinceDays} วัน · รีเฟรช` : "รีเฟรช"}</span>
      </>
    );
  } else {
    refreshLabel = (
      <>
        <Lock size={11} color="#8A8A8A" />
        <span style={{ color: "#8A8A8A" }}>รีเฟรชได้อีก {untilDays} วัน</span>
      </>
    );
  }

  return (
    <section style={{ marginBottom: 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <Sparkles size={16} color="#D85A30" />
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#1D1D1F",
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            ทางหารายได้ของคุณ
          </h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={!canRefresh || loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 999,
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 500,
            color: "#1D1D1F",
            cursor: canRefresh && !loading ? "pointer" : "not-allowed",
            opacity: !canRefresh && !loading ? 0.85 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {refreshLabel}
        </button>
      </div>
      <p
        style={{
          fontSize: 12,
          color: "#6B6B6B",
          marginTop: -6,
          marginBottom: 12,
        }}
      >
        MITA+ คัด 3 ทางที่ตรงกับช่องคุณที่สุด
      </p>
      {loading && paths.length === 0 ? (
        <SkeletonCards />
      ) : (
        <div>
          {paths.map((p, i) => (
            <RevenuePathCard
              key={p.id}
              rank={p.rank}
              path={p}
              index={i}
              onView={() => onPathClick(p.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SkeletonCards() {
  return (
    <div>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }}
          style={{
            height: 140,
            background: "#FFFFFF",
            borderRadius: 18,
            marginBottom: 10,
            border: "1px solid rgba(0,0,0,0.04)",
          }}
        />
      ))}
    </div>
  );
}
