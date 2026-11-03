// ═══════════════════════════════════════════════════════════════════════════════════
// BillingPage — 对齐 Figma Make BillingPage（App.tsx 内联源码）
// 面包屑 + 标题 + 付费/活动星石汇总 + 近7天消耗柱状图
// 4 tab（全部/实际消耗/充值与订单/退回）+ 9 列表格 + 任务ID点击 + 订单勾选
// 开具发票 modal + CSV 导出
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { ChevronRight, X, Download, FileText, Check } from "lucide-react";
import { USER } from "../shared";
import type { Nav as NavType } from "../shared";

// ═══ Design tokens ════════════════════════════════════════════════════════════
const gold       = "#FF8A1F";
const surface    = "linear-gradient(145deg,rgba(255,255,255,.055) 0%,transparent 45%),rgba(14,11,22,.97)";
const bdr        = "rgba(255,255,255,0.07)";
const cardShadow = "inset 0 1px 0 rgba(255,255,255,0.11), 0 8px 32px rgba(0,0,0,0.45)";
const textDim    = "rgba(255,255,255,0.6)";
const textMuted  = "rgba(255,255,255,0.45)";

// ═══ BillRecord type ════════════════════════════════════════════════════════
type BillRecord = {
  id: string;
  type: string;
  model: string;
  frozen: number;
  actual: number;
  refund: number;
  balance: number;
  time: string;
  amount?: number;
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function BillingPage({ navigate }: NavType) {
  const [tab, setTab] = useState("全部");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [invoiceDone, setInvoiceDone] = useState(false);

  // Make BillingPage line 2249-2256 — 演示数据，固定 9 条
  const ALL_RECORDS: BillRecord[] = [
    { id: "TASK-20260821-1048", type: "视频生成", model: "Seedance 2.0 Fast", frozen: 18.55, actual: 18.22, refund: 0.33, balance: 2486.0,  time: "2026-08-21 10:52" },
    { id: "TASK-20260821-1045", type: "视频生成", model: "Seedance 2.0 Fast", frozen: 22.10, actual: 22.10, refund: 0,    balance: 2504.22, time: "2026-08-21 10:45" },
    { id: "TASK-20260821-1032", type: "视频生成", model: "Seedance 2.0 Fast", frozen: 19.80, actual: 19.40, refund: 0.40, balance: 2526.32, time: "2026-08-21 10:32" },
    { id: "ORDER-20260821-001", type: "套餐购买", model: "工作室版",           frozen: 0,     actual: 0,     refund: 0,    balance: 2545.72, time: "2026-08-21 09:00", amount: 1999 },
    { id: "ORDER-20260715-003", type: "套餐购买", model: "个人创作版",          frozen: 0,     actual: 0,     refund: 0,    balance: 5624.72, time: "2026-07-15 14:30", amount: 299 },
    { id: "ORDER-20260601-011", type: "星石充值", model: "自定义充值",         frozen: 0,     actual: 0,     refund: 0,    balance: 5524.72, time: "2026-06-01 10:00", amount: 200 },
    { id: "TASK-20260820-2240", type: "视频生成", model: "Wan 2.1 I2V",       frozen: 15.60, actual: 15.60, refund: 0,    balance: 5324.72, time: "2026-08-20 22:40" },
    { id: "TASK-20260820-1818", type: "图片生成", model: "Flux 1.1 Pro",       frozen: 4.20,  actual: 4.00,  refund: 0.20, balance: 5340.32, time: "2026-08-20 18:18" },
    { id: "TASK-20260819-0955", type: "视频生成", model: "Seedance 2.0 Fast", frozen: 21.30, actual: 21.30, refund: 0,    balance: 5344.32, time: "2026-08-19 09:55" },
  ];

  const isOrder = (r: BillRecord) => r.id.startsWith("ORDER");
  const filtered = ALL_RECORDS.filter(r => {
    if (tab === "实际消耗")   return !isOrder(r);
    if (tab === "充值与订单") return isOrder(r);
    if (tab === "退回")       return r.refund > 0;
    return true;
  });
  const orderRows    = filtered.filter(isOrder);
  const allOrderIds  = orderRows.map(r => r.id);
  const selectedOrders = allOrderIds.filter(id => selectedIds.has(id));
  const invoiceAmount = ALL_RECORDS.filter(r => selectedIds.has(r.id)).reduce((s, r) => s + (r.amount ?? 0), 0);
  const showCheckbox = tab === "充值与订单" || tab === "全部";

  const toggleRow = (id: string) => setSelectedIds(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const toggleAll = () => {
    if (selectedOrders.length === allOrderIds.length) {
      setSelectedIds(prev => { const n = new Set(prev); allOrderIds.forEach(id => n.delete(id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); allOrderIds.forEach(id => n.add(id)); return n; });
    }
  };

  // Make line 2287-2292 — 导出 CSV（按当前筛选范围）
  const exportCSV = () => {
    const headers = ["ID","类型","模型/套餐","预计冻结","实际结算","退回","余额","时间","金额(元)"];
    const rows = filtered.map(r => [r.id, r.type, r.model, r.frozen || "—", r.actual || "—", r.refund || "—", r.balance, r.time, r.amount ?? "—"].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = `账单_${tab}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const submitInvoice = () => {
    // 演示反馈：仅展示成功提示，不声称真实开票服务已生效
    setInvoiceDone(true);
  };

  const iStyle = { width: "100%", background: "rgba(255,255,255,.05)", border: `1px solid ${bdr}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "white", outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const } as const;
  const labelS = { fontSize: 11, color: textMuted, marginBottom: 4, display: "block" as const } as const;

  return (
    <div style={{ padding: 24, maxWidth: 1080, margin: "0 auto", position: "relative" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: textMuted, marginBottom: 16 }}>
        <button onClick={() => navigate("delivery")} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer" }}>下载交付</button>
        <ChevronRight style={{ width: 13, height: 13 }} />
        <span style={{ color: "rgba(255,255,255,.7)", fontWeight: 500 }}>消耗账单</span>
      </div>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 20 }}>账单与消耗</h1>

      {/* Compact summary row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: surface, border: `1px solid ${bdr}`, borderRadius: 12, padding: "14px 20px", marginBottom: 16, boxShadow: cardShadow }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: gold }}>{USER.paidStars.toLocaleString()}</span>
          <span style={{ fontSize: 11, color: textMuted }}>付费星石</span>
        </div>
        <div style={{ width: 1, height: 20, background: bdr }} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,138,31,.55)" }}>{USER.activeStars}</span>
          <span style={{ fontSize: 11, color: textMuted }}>活动星石</span>
          <span style={{ fontSize: 10, color: "rgba(251,191,36,.65)", marginLeft: 2 }}>{USER.activeStarsExpiry}</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: textMuted, marginRight: 6 }}>近7天消耗</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32 }}>
          {[320, 480, 240, 560, 380, 420, 291].map((v, i) => (
            <div key={i} style={{ width: 16, borderRadius: 3, background: i === 3 ? gold : "rgba(255,138,31,0.2)", height: `${(v / 560) * 28}px` }} />
          ))}
        </div>
      </div>

      {/* Tabs + toolbar */}
      <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${bdr}`, marginBottom: 0 }}>
        <div style={{ display: "flex", flex: 1 }}>
          {["全部", "实际消耗", "充值与订单", "退回"].map(t => (
            <button key={t} onClick={() => { setTab(t); setSelectedIds(new Set()); }}
              style={{ padding: "10px 18px", fontSize: 13, background: "none", border: "none", cursor: "pointer", transition: "all .2s",
                ...(tab === t ? { borderBottom: `2px solid ${gold}`, color: gold, fontWeight: 600 } : { color: textMuted }) }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8 }}>
          {selectedOrders.length > 0 && (
            <span style={{ fontSize: 12, color: textMuted }}>已选 <b style={{ color: gold }}>{selectedOrders.length}</b> 条</span>
          )}
          <button onClick={() => { setInvoiceDone(false); setInvoiceOpen(true); }}
            disabled={selectedOrders.length === 0}
            title={selectedOrders.length === 0 ? "请先勾选订单记录" : "对选中订单开具发票（演示）"}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: selectedOrders.length === 0 ? "not-allowed" : "pointer",
              background: selectedOrders.length === 0 ? "rgba(255,138,31,.04)" : "rgba(255,138,31,.10)",
              border: `1px solid ${selectedOrders.length === 0 ? "rgba(255,138,31,.15)" : "rgba(255,138,31,.28)"}`,
              color: selectedOrders.length === 0 ? "rgba(255,138,31,.4)" : gold }}>
            <FileText style={{ width: 12, height: 12 }} />开具发票
          </button>
          <button onClick={exportCSV}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 13px", borderRadius: 7, fontSize: 12, cursor: "pointer",
              background: "rgba(255,255,255,.05)", border: `1px solid ${bdr}`, color: textMuted }}>
            <Download style={{ width: 11, height: 11 }} />导出
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: surface, border: `1px solid ${bdr}`, borderTop: "none", borderRadius: "0 0 16px 16px", overflow: "hidden", boxShadow: cardShadow }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "rgba(255,255,255,.02)", borderBottom: `1px solid ${bdr}` }}>
            <tr>
              {showCheckbox && (
                <th style={{ padding: "11px 14px", width: 36 }}>
                  <input type="checkbox" checked={allOrderIds.length > 0 && selectedOrders.length === allOrderIds.length}
                    ref={(el: HTMLInputElement | null) => { if (el) el.indeterminate = selectedOrders.length > 0 && selectedOrders.length < allOrderIds.length; }}
                    onChange={toggleAll} style={{ cursor: "pointer", accentColor: gold, width: 14, height: 14 }} />
                </th>
              )}
              {["任务/订单ID", "类型", "模型/套餐", "预计冻结", "实际结算", "退回", "余额", "时间", "金额"].map(h => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 500, color: textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const selectable = isOrder(r) && showCheckbox;
              const checked = selectedIds.has(r.id);
              return (
                <tr key={r.id} onClick={() => selectable && toggleRow(r.id)}
                  style={{ borderBottom: "1px solid rgba(255,255,255,.03)", cursor: selectable ? "pointer" : "default",
                    background: checked ? "rgba(255,138,31,.04)" : "transparent", transition: "background .1s" }}>
                  {showCheckbox && (
                    <td style={{ padding: "11px 14px" }}>
                      {selectable && <input type="checkbox" checked={checked} onChange={() => toggleRow(r.id)}
                        onClick={e => e.stopPropagation()} style={{ cursor: "pointer", accentColor: gold, width: 14, height: 14 }} />}
                    </td>
                  )}
                  <td style={{ padding: "11px 14px" }}>
                    <button onClick={e => { e.stopPropagation(); if (!isOrder(r)) navigate("result"); }}
                      style={{ fontSize: 11, fontFamily: "monospace", color: isOrder(r) ? textMuted : "#60a5fa", background: "none", border: "none", cursor: isOrder(r) ? "default" : "pointer" }}>{r.id}</button>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: textDim }}>{r.type}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: textMuted }}>{r.model}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: textMuted }}>{r.frozen > 0 ? r.frozen : "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "rgba(255,255,255,.75)" }}>{r.actual > 0 ? r.actual : "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "#34d399" }}>{r.refund > 0 ? `+${r.refund}` : "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "rgba(255,255,255,.65)" }}>{r.balance.toLocaleString()}</td>
                  <td style={{ padding: "11px 14px", fontSize: 11, color: textMuted }}>{r.time}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: r.amount ? gold : textMuted, fontWeight: r.amount ? 600 : 400 }}>
                    {r.amount ? `¥${r.amount}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Demo notice */}
      <div style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,.25)", textAlign: "center" }}>
        演示界面 — 账单数据为静态展示，开具发票与扣费操作未连接真实服务
      </div>

      {/* Invoice modal */}
      {invoiceOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)" }}
          onClick={() => setInvoiceOpen(false)}>
          <div style={{ width: 480, background: "#111318", border: `1px solid ${bdr}`, borderRadius: 16,
            boxShadow: "0 32px 96px rgba(0,0,0,.8)", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>开具发票</div>
                <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>已选 {selectedOrders.length} 笔订单 · 开票金额 <span style={{ color: gold, fontWeight: 700 }}>¥{invoiceAmount}</span></div>
              </div>
              <button onClick={() => setInvoiceOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, padding: 4 }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {invoiceDone ? (
              <div style={{ padding: "48px 32px", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(52,211,153,.12)", border: "1px solid rgba(52,211,153,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Check style={{ width: 24, height: 24, color: "#34d399" }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 6 }}>申请已提交</div>
                <div style={{ fontSize: 13, color: textMuted, lineHeight: 1.7, marginBottom: 24 }}>
                  发票将在 3-5 个工作日内发送至<br /><span style={{ color: textDim }}>{invoiceEmail || "您的邮箱"}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,138,31,.7)", background: "rgba(255,138,31,.08)", border: "1px solid rgba(255,138,31,.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 16, display: "inline-block" }}>
                  演示反馈 · 实际开票未连接服务
                </div>
                <div><button onClick={() => setInvoiceOpen(false)}
                  style={{ padding: "8px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: "rgba(255,255,255,.06)", border: `1px solid ${bdr}`, color: textDim }}>关闭</button></div>
              </div>
            ) : (
              <div style={{ padding: "22px 22px 0" }}>
                <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: gold, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,.75)", fontWeight: 500 }}>增值税普通发票</span>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelS}>发票抬头 <span style={{ color: "#f87171" }}>*</span></label>
                  <input value={invoiceTitle} onChange={e => setInvoiceTitle(e.target.value)} placeholder="公司名称或个人姓名" style={iStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelS}>接收邮箱 <span style={{ color: "#f87171" }}>*</span></label>
                  <input value={invoiceEmail} onChange={e => setInvoiceEmail(e.target.value)} placeholder="发票将发送至此邮箱" style={iStyle} />
                </div>

                <div style={{ background: "rgba(255,255,255,.025)", border: `1px solid ${bdr}`, borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: textMuted, marginBottom: 8, fontWeight: 600 }}>开票明细</div>
                  {ALL_RECORDS.filter(r => selectedIds.has(r.id)).map(r => (
                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                      <span style={{ color: textDim }}>{r.model} <span style={{ color: textMuted, fontSize: 11 }}>({r.time.slice(0, 10)})</span></span>
                      <span style={{ color: gold, fontWeight: 600 }}>¥{r.amount}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingTop: 8, marginTop: 2 }}>
                    <span style={{ color: textDim, fontWeight: 600 }}>合计</span>
                    <span style={{ color: gold, fontWeight: 700 }}>¥{invoiceAmount}</span>
                  </div>
                </div>

                <div style={{ padding: "0 0 22px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => setInvoiceOpen(false)}
                    style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "rgba(255,255,255,.05)", border: `1px solid ${bdr}`, color: textMuted }}>取消</button>
                  <button onClick={submitInvoice} disabled={!invoiceTitle || !invoiceEmail}
                    style={{ padding: "9px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                      background: !invoiceTitle || !invoiceEmail ? "rgba(255,138,31,.3)" : `linear-gradient(135deg,${gold},#FF6A1A)`,
                      border: "none", color: "white", opacity: !invoiceTitle || !invoiceEmail ? .5 : 1 }}>
                    提交申请
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
