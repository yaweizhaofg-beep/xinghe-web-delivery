// ═══════════════════════════════════════════════════════════════════════════════════
// ResultPage - 结果详情（查看/后处理）
// 设计来源：Figma Make ResultPage (LandingSection.tsx)
// 标记为：设计补全（非原稿还原，基于 Make 源码适配本地 token）
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import {
  Play, Download, ChevronRight, Scissors, Sparkles, RefreshCw
} from "lucide-react";
import { PROJECT, TASK, STORYBOARDS } from "../shared";
import type { PageId } from "../shared";

interface NavType { navigate: (p: PageId) => void; }

const gold = "#ffac30";
const surface = "linear-gradient(145deg,rgba(255,255,255,.055) 0%,transparent 45%),rgba(14,11,22,.97)";
const bdr = "rgba(210,205,230,.14)";
const cardShadow = "inset 0 1px 0 rgba(255,255,255,.11), 0 8px 32px rgba(0,0,0,.45)";
const textDim = "rgba(255,255,255,.6)";
const textMuted = "rgba(255,255,255,.45)";

export default function ResultPage({ navigate }: NavType) {
  const [av, setAv] = useState(0); // active version A/B/C
  const selectedSB = STORYBOARDS.find(s => s.status === "done") ?? STORYBOARDS[0];

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: textMuted, marginBottom: 16 }}>
        <button onClick={() => navigate("batch")}
          style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", padding: 0 }}>
          批量生成
        </button>
        <ChevronRight style={{ width: 13, height: 13 }} />
        <span style={{ color: "rgba(255,255,255,.7)", fontWeight: 500 }}>结果详情</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "white" }}>
            {selectedSB.id} · 结果详情
          </h1>
          <p style={{ fontSize: 13, color: textMuted, marginTop: 3 }}>{PROJECT.name} · {PROJECT.chapter}</p>
        </div>
        <button onClick={() => navigate("delivery")}
          style={{
            padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
            color: "#34d399", background: "rgba(52,211,153,.12)",
            border: "1px solid rgba(52,211,153,.2)", cursor: "pointer",
          }}>
          加入交付清单
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>

        {/* Video preview */}
        <div>
          <div style={{
            background: "#090A0E", border: `1px solid ${bdr}`, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            aspectRatio: "9/16", maxHeight: 480,
          }}>
            <div style={{ textAlign: "center" }}>
              <Play style={{ width: 48, height: 48, color: "rgba(255,255,255,.12)", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>
                版本 {String.fromCharCode(65 + av)}（主采用）
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.2)", marginTop: 4 }}>
                {TASK.spec}
              </div>
            </div>
          </div>

          {/* Version selector */}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            {(["版本 A（主采用）", "版本 B", "版本 C"] as const).map((v, i) => (
              <button key={v} onClick={() => setAv(i)}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 12, fontWeight: 500,
                  cursor: "pointer", transition: "all .2s",
                  ...(av === i
                    ? { background: "rgba(255,138,31,.12)", border: "1px solid rgba(255,138,31,.3)", color: gold }
                    : { background: surface, border: `1px solid ${bdr}`, color: textMuted }),
                }}>
                {v}
              </button>
            ))}
          </div>

          {/* 后处理 */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 8 }}>
              后处理（确认费用后执行）
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {([
                { icon: Scissors, l: "字幕擦除" },
                { icon: Sparkles, l: "画质增强" },
                { icon: Play, l: "抽取帧" },
                { icon: RefreshCw, l: "重新生成" },
              ] as const).map(b => (
                <button key={b.l} onClick={() => navigate("cost-confirm")}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 13px",
                    borderRadius: 10, fontSize: 12, color: textDim, border: "none",
                    background: "rgba(255,255,255,.04)", cursor: "pointer",
                  }}>
                  <b.icon style={{ width: 13, height: 13 }} />{b.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Task info */}
          <div style={{
            background: surface, border: `1px solid ${bdr}`, borderRadius: 16,
            padding: 18, boxShadow: cardShadow,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>
              任务信息
            </div>
            {([
              ["任务ID", TASK.id],
              ["模型", TASK.model],
              ["规格", TASK.spec],
              ["价格版本", TASK.priceVersion],
            ] as const).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: textMuted, marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.75)", fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Cost breakdown */}
          <div style={{
            background: surface, border: `1px solid ${bdr}`, borderRadius: 16,
            padding: 18, boxShadow: cardShadow,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>
              费用明细
            </div>
            {([
              ["预计冻结", `${TASK.estimatedStars.toFixed(2)} 星石`, ""],
              ["实际结算", `${(TASK.estimatedStars * 0.98).toFixed(2)} 星石`, ""],
              ["退回", `+${(TASK.estimatedStars * 0.02).toFixed(2)} 星石`, "#34d399"],
            ] as const).map(([k, v, c]) => (
              <div key={k} style={{
                display: "flex", justifyContent: "space-between", marginBottom: 9, fontSize: 13,
              }}>
                <span style={{ color: textMuted }}>{k}</span>
                <span style={{ color: (c as string) || "rgba(255,255,255,.75)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Download */}
          <button
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "11px 0", borderRadius: 12, fontSize: 13,
              background: "rgba(255,255,255,.04)", border: "none", color: textDim, cursor: "pointer",
            }}>
            <Download style={{ width: 15, height: 15 }} />
            下载当前版本
          </button>
        </div>
      </div>
    </div>
  );
}
