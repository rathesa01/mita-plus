import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Coins,
  Activity,
  Smartphone,
  ShoppingBag,
  Camera,
  PlayCircle,
  Radio,
  DollarSign,
  ExternalLink,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { RevenuePathDetail, RevenuePathId } from "@/types/revenuePath";

interface RevenuePathDetailPageProps {
  path: RevenuePathDetail;
  onBack: () => void;
}

const CATEGORY_ICON: Record<RevenuePathId, LucideIcon> = {
  affiliate: ShoppingBag,
  ugc: Camera,
  youtube_auto: PlayCircle,
  live_tips: Radio,
  adsense: DollarSign,
};

function formatIncome(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return String(n);
}

function getLucideIcon(name: string): LucideIcon {
  const Comp = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  return Comp || Wrench;
}

export default function RevenuePathDetailPage({
  path,
  onBack,
}: RevenuePathDetailPageProps) {
  const HeroIcon = CATEGORY_ICON[path.id] || ShoppingBag;
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFAF5",
        color: "#1D1D1F",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif",
        paddingBottom: 96,
      }}
    >
      {/* A — Top Nav */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(255,250,245,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: 460,
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onBack}
            aria-label="ย้อนกลับ"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.06)",
              background: "#FFFFFF",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={16} color="#1D1D1F" />
          </button>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1D1D1F",
              letterSpacing: "-0.01em",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {path.name}
          </div>
        </div>
      </div>

      <main
        style={{
          maxWidth: 460,
          margin: "0 auto",
          padding: "16px 16px 0",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* B — Hero */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={cardStyle(22)}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(216,90,48,0.08)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <HeroIcon size={36} color="#D85A30" />
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#1D1D1F",
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {path.name}
          </h1>
          <p
            style={{
              fontStyle: "italic",
              fontSize: 13,
              color: "#6B6B6B",
              marginTop: 6,
              marginBottom: 16,
            }}
          >
            {path.tagline}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            <HeroStat
              icon={<Clock size={14} color="#D85A30" />}
              label="เห็นเงินใน"
              value={`${path.timeline_days} วัน`}
            />
            <HeroStat
              icon={<Coins size={14} color="#D85A30" />}
              label="รายได้"
              value={`฿${formatIncome(path.income_min)}-${formatIncome(path.income_max)}/ด.`}
            />
            <HeroStat
              icon={<Activity size={14} color="#D85A30" />}
              label="Effort"
              value={path.effort_level}
            />
            <HeroStat
              icon={<Smartphone size={14} color="#D85A30" />}
              label="มือถือ"
              value={path.mobile_only ? "✓ ทำได้" : "✗ ต้องคอม"}
            />
          </div>
        </motion.section>

        {/* C — Why fits */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          style={{
            background: "rgba(127,119,221,0.05)",
            border: "1px solid rgba(127,119,221,0.12)",
            borderRadius: 18,
            padding: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <Sparkles size={14} color="#7F77DD" />
            <span
              style={{
                color: "#7F77DD",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              ทำไมเหมาะกับคุณ
            </span>
          </div>
          <p
            style={{
              fontSize: 12,
              color: "#4A4A4A",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {path.why_fits_long}
          </p>
        </motion.section>

        {/* D — Steps */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          style={cardStyle(18)}
        >
          <h3 style={sectionHeading}>ขั้นตอนทำ</h3>
          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: "12px 0 0",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {path.steps.map((step, i) => {
              const isLast = i === path.steps.length - 1;
              return (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: isLast ? 12 : 0,
                    border: isLast ? "1px solid rgba(216,90,48,0.25)" : "none",
                    borderRadius: isLast ? 14 : 0,
                    background: isLast ? "rgba(216,90,48,0.04)" : "transparent",
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#D85A30",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1D1D1F",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {step.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6B6B6B",
                        lineHeight: 1.5,
                        marginTop: 2,
                      }}
                    >
                      {step.body}
                    </div>
                    {isLast && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#D85A30",
                        }}
                      >
                        💡 หลังขั้นนี้ คุณจะเริ่มเห็นเงิน
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </motion.section>

        {/* E — Tools */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          style={cardStyle(18)}
        >
          <h3 style={sectionHeading}>เครื่องมือที่ใช้</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 12,
            }}
          >
            {path.tools.map((tool, i) => {
              const Icon = getLucideIcon(tool.icon);
              return (
                <div
                  key={i}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.05)",
                    borderRadius: 12,
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(216,90,48,0.08)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} color="#D85A30" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#1D1D1F",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {tool.name}
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#D85A30",
                            background: "rgba(216,90,48,0.08)",
                            padding: "3px 8px",
                            borderRadius: 999,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tool.cost}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6B6B6B",
                          marginTop: 2,
                          lineHeight: 1.45,
                        }}
                      >
                        {tool.description}
                      </div>
                    </div>
                  </div>
                  <a
                    href={tool.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      alignSelf: "flex-start",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#D85A30",
                      border: "1px solid rgba(216,90,48,0.4)",
                      borderRadius: 999,
                      padding: "5px 10px",
                      textDecoration: "none",
                    }}
                  >
                    {tool.cta_text}
                    <ExternalLink size={11} />
                  </a>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* F — Case study */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          style={cardStyle(16)}
        >
          <h3 style={sectionHeading}>ตัวอย่าง creator ไทย</h3>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7F77DD, #D85A30)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {path.case_study.creator_name.slice(0, 1)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1D1D1F",
                  letterSpacing: "-0.01em",
                }}
              >
                {path.case_study.creator_name}
              </div>
              <div style={{ fontSize: 11, color: "#8A8A8A" }}>
                {path.case_study.handle}
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              color: "#6B6B6B",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span>{path.case_study.niche}</span>
            <Dot />
            <span>
              {path.case_study.follower.toLocaleString("th-TH")} follower
            </span>
            <Dot />
            <span style={{ color: "#D85A30", fontWeight: 700 }}>
              ฿{path.case_study.monthly_income.toLocaleString("th-TH")}/เดือน
            </span>
          </div>
          <p
            style={{
              fontStyle: "italic",
              fontSize: 12,
              color: "#6B6B6B",
              lineHeight: 1.6,
              marginTop: 10,
              marginBottom: 0,
              borderLeft: "2px solid rgba(216,90,48,0.3)",
              paddingLeft: 10,
            }}
          >
            &ldquo;{path.case_study.quote}&rdquo;
          </p>
        </motion.section>
      </main>

      {/* G — Sticky CTA */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
          background:
            "linear-gradient(to top, rgba(255,250,245,1) 70%, rgba(255,250,245,0))",
          zIndex: 50,
        }}
      >
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          <a
            href={path.first_step.action_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #7F77DD, #D85A30)",
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(216,90,48,0.25)",
            }}
          >
            {path.first_step.action_text || "เริ่มทำเดี๋ยวนี้"}
          </a>
        </div>
      </div>
    </div>
  );
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "rgba(216,90,48,0.04)",
        borderRadius: 12,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 10,
          color: "#8A8A8A",
          fontWeight: 500,
        }}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#1D1D1F",
          marginTop: 4,
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Dot() {
  return (
    <span
      style={{
        width: 3,
        height: 3,
        borderRadius: "50%",
        background: "#D1D1D1",
        display: "inline-block",
      }}
    />
  );
}

const sectionHeading: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#1D1D1F",
  letterSpacing: "-0.01em",
  margin: 0,
};

function cardStyle(padding: number): React.CSSProperties {
  return {
    background: "#FFFFFF",
    borderRadius: 18,
    padding,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    border: "1px solid rgba(0,0,0,0.04)",
  };
}
