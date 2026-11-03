// ═══════════════════════════════════════════════════════════════════════════════════
// App.tsx - 星核耀火桌面应用
// 对齐 Figma Make 源码（App.tsx + AppLayout.tsx + WorkspacePage + ProjectListPage）
// 重写 Sidebar / Header / WorkspacePage / ProjectsPage / TeamAssetsPage 等
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from "react";
import {
  Flame, X, ChevronRight, ChevronDown, ChevronLeft,
  Plus, Film, PenLine, Package, CreditCard, Search, MoreHorizontal,
  Home, Users, User, Bell, Headphones, MessageSquare, BookOpen, FileText,
  Sparkles, Star, Zap, HelpCircle, Download,
} from "lucide-react";

// Import pages
import LandingPage from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { NewProjectPage } from "./pages/NewProjectPage";
import UserCenterPage from "./pages/UserCenterPage";
import CanvasPage from "./pages/CanvasPage";
import CostConfirmPage from "./pages/CostConfirmPage";
import TeamPage from "./pages/TeamPage";
import BatchPage from "./pages/BatchPage";
import ResultPage from "./pages/ResultPage";
import DeliveryPage from "./pages/DeliveryPage";
import UpgradePage from "./pages/UpgradePage";
import TeamAssetsPage from "./pages/TeamAssetsPage";
import BillingPage from "./pages/BillingPage";
import { USER, PROJECT } from "./shared";
import { getWallet } from "./billing";
import type { Nav as NavType, PageId } from "./shared";

// ─── Sidebar Nav (Make AppLayout SIDEBAR_NAV) ────────────────────────────────
const SIDEBAR_NAV: { id: PageId | null; label: string; icon: typeof Home }[] = [
  { id: "workspace",     label: "创作", icon: Home       },
  { id: "canvas",        label: "画布", icon: PenLine    },
  { id: "team-assets",   label: "资产", icon: Package    },
  { id: "billing",       label: "账单", icon: CreditCard },
  { id: "team",          label: "团队", icon: Users      },
];

const gold = "#FF8A1F";

// ─── Notification Panel (Make 消息通知 4-tab) ────────────────────────────────
type NotifTab = "task" | "invoice" | "activity" | "error";
const NOTIFS: Record<NotifTab, { id: string; title: string; body: string; time: string; read: boolean; level?: "info"|"warn"|"error" }[]> = {
  task: [
    { id: "t1", title: "批量生成完成",   body: "项目「星际孤途」第1-6集资产已全部生成完毕，共生成 148 张图像。", time: "2分钟前",  read: false },
    { id: "t2", title: "脚本解析完成",   body: "《隐秘角落》上传文件解析成功，识别到 12 个场景、8 名角色。",         time: "15分钟前", read: false },
    { id: "t3", title: "音频合成中",     body: "林凯·标准音色正在合成，预计完成时间 3 分钟。",                       time: "23分钟前", read: true  },
    { id: "t4", title: "导出任务完成",   body: "分集剧本 EP01-EP06 已打包完成，点击下载。",                         time: "1小时前",  read: true  },
  ],
  invoice: [
    { id: "i1", title: "发票申请待审核", body: "您于 2026-08-30 申请的 ¥299.00 增值税普通发票正在审核中，预计 3 个工作日内完成。", time: "2天前",  read: false },
    { id: "i2", title: "发票已开具",     body: "¥1999.00 电子发票已开具，发票号 044031900115，已发送至注册邮箱。",                    time: "7天前",  read: true  },
    { id: "i3", title: "发票申请成功",   body: "¥3999.00 制作团队版套餐发票申请已提交，税号已验证。",                                          time: "14天前", read: true  },
  ],
  activity: [
    { id: "a1", title: "限时活动 · 双倍星石", body: "9月1日-9月7日充值享双倍星石奖励，活动剩余 5 天！", time: "刚刚",  read: false, level: "info" },
    { id: "a2", title: "新功能上线 · AI 改写", body: "提示词编辑器新增 AI 智能改写功能，一键优化生成效果。", time: "3天前",  read: false, level: "info" },
    { id: "a3", title: "套餐即将到期",         body: "您的个人创作版套餐将于 9月15日 到期，续费可保留所有历史数据。", time: "5天前",  read: false, level: "warn" },
    { id: "a4", title: "系统维护通知",         body: "2026-09-05 02:00-04:00 进行系统维护，期间服务暂停。",       time: "6天前",  read: true,  level: "info" },
  ],
  error: [
    { id: "e1", title: "生成失败 · 保险箱", body: "资产「保险箱」生成超时，Flux 1.1 Pro 服务异常，已自动重试 3 次。请稍后手动重试。", time: "30分钟前", read: false, level: "error" },
    { id: "e2", title: "上传失败",         body: "文件「剧本_最终版v3.docx」上传失败，文件大小超过 50MB 限制。",                   time: "2小时前",  read: false, level: "error" },
    { id: "e3", title: "支付异常",         body: "订单 #2026083112 支付结果异常，若已扣款请联系客服处理。",                         time: "1天前",    read: true,  level: "warn"  },
  ],
};
const NOTIF_TABS: { k: NotifTab; label: string; icon: string }[] = [
  { k: "task",     label: "任务", icon: "📋" },
  { k: "invoice",  label: "开票", icon: "🧾" },
  { k: "activity", label: "活动", icon: "🎉" },
  { k: "error",    label: "报错", icon: "⚠️" },
];

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<NotifTab>("task");
  const unread = Object.values(NOTIFS).flat().filter(n => !n.read).length;
  return (
    <div style={{
      position: "fixed", left: 72, bottom: 12, zIndex: 199, width: 360, maxHeight: 520,
      background: "#111218", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18,
      boxShadow: "0 24px 80px rgba(0,0,0,.8)", display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 0", gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "white", flex: 1 }}>消息通知</span>
        {unread > 0 && <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)", fontWeight: 500 }}>{unread} 条未读</span>}
        <button onClick={onClose} style={{ width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.4)", cursor: "pointer" }}>
          <X style={{ width: 11, height: 11 }} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 4, padding: "10px 12px 0", flexShrink: 0 }}>
        {NOTIF_TABS.map(t => {
          const cnt = NOTIFS[t.k].filter(n => !n.read).length;
          const active = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "6px 4px", borderRadius: 9, fontSize: 11, fontWeight: active ? 700 : 400, cursor: "pointer",
                background: active ? "rgba(255,138,31,.12)" : "rgba(255,255,255,.04)",
                border: `1px solid ${active ? "rgba(255,138,31,.3)" : "rgba(255,255,255,.07)"}`,
                color: active ? "rgba(255,138,31,.95)" : "rgba(255,255,255,.4)" }}>
              <span style={{ fontSize: 12 }}>{t.icon}</span>
              {t.label}
              {cnt > 0 && <span style={{ minWidth: 14, height: 14, borderRadius: 7, background: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "white", padding: "0 2px" }}>{cnt}</span>}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
        {NOTIFS[tab].length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", fontSize: 13, color: "rgba(255,255,255,.2)" }}>暂无消息</div>
        ) : (
          NOTIFS[tab].map(n => {
            const accentColor =
              n.level === "error" ? "#EF4444" :
              n.level === "warn"  ? "#F59E0B" :
              tab === "invoice"   ? "#60A5FA" :
              tab === "activity"  ? "rgba(255,138,31,.9)" :
                                    "rgba(255,255,255,.55)";
            return (
              <div key={n.id}
                style={{ padding: "10px 12px", borderRadius: 11,
                  background: n.read ? "rgba(255,255,255,.025)" : "rgba(255,255,255,.055)",
                  border: `1px solid ${n.read ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.1)"}`,
                  position: "relative", cursor: "pointer", transition: "background .12s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.075)")}
                onMouseLeave={e => (e.currentTarget.style.background = n.read ? "rgba(255,255,255,.025)" : "rgba(255,255,255,.055)")}>
                {!n.read && <span style={{ position: "absolute", top: 10, right: 10, width: 6, height: 6, borderRadius: "50%", background: accentColor }} />}
                <div style={{ fontSize: 12.5, fontWeight: n.read ? 500 : 700, color: n.read ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.92)", marginBottom: 4, paddingRight: 12 }}>{n.title}</div>
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.38)", lineHeight: 1.65 }}>{n.body}</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.22)", marginTop: 5 }}>{n.time}</div>
              </div>
            );
          })
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,.06)", flexShrink: 0 }}>
        <button style={{ flex: 1, padding: "7px 0", borderRadius: 9, fontSize: 12, cursor: "pointer", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", color: "rgba(255,255,255,.45)" }}>
          全部标记已读
        </button>
        <button style={{ flex: 1, padding: "7px 0", borderRadius: 9, fontSize: 12, cursor: "pointer", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", color: "rgba(255,255,255,.45)" }}>
          查看全部消息
        </button>
      </div>
    </div>
  );
}

// ─── QR Modal (客服微信二维码 — Make) ──────────────────────────────────────────
function QRModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#13151C", border: "1px solid rgba(255,255,255,.09)", borderRadius: 18, padding: "28px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, boxShadow: "0 32px 80px rgba(0,0,0,.7)", minWidth: 240 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#F4F5F7", marginBottom: 4 }}>专属客服</div>
          <div style={{ fontSize: 12, color: "#6F7480" }}>扫码添加微信，7×12小时在线</div>
        </div>
        <svg width="148" height="148" viewBox="0 0 148 148" style={{ display: "block", borderRadius: 10 }}>
          <rect width="148" height="148" fill="#ffffff" rx="8" />
          <rect x="10" y="10" width="42" height="42" fill="#111" rx="4" />
          <rect x="16" y="16" width="30" height="30" fill="#fff" rx="2" />
          <rect x="22" y="22" width="18" height="18" fill="#111" rx="1" />
          <rect x="96" y="10" width="42" height="42" fill="#111" rx="4" />
          <rect x="102" y="16" width="30" height="30" fill="#fff" rx="2" />
          <rect x="108" y="22" width="18" height="18" fill="#111" rx="1" />
          <rect x="10" y="96" width="42" height="42" fill="#111" rx="4" />
          <rect x="16" y="102" width="30" height="30" fill="#fff" rx="2" />
          <rect x="22" y="108" width="18" height="18" fill="#111" rx="1" />
          {[
            [60,10],[66,10],[72,10],[78,10],[84,10],[90,10],
            [60,16],[72,16],[84,16],
            [60,22],[66,22],[78,22],[90,22],
            [60,28],[72,28],[84,28],
            [60,34],[66,34],[72,34],[78,34],[84,34],[90,34],
            [10,60],[16,60],[22,60],[28,60],[34,60],[40,60],[46,60],[52,60],
            [10,66],[22,66],[34,66],[52,66],
            [10,72],[28,72],[46,72],[52,72],
            [10,78],[16,78],[22,78],[40,78],[52,78],
            [10,84],[34,84],[40,84],[52,84],
            [10,90],[16,90],[22,90],[28,90],[34,90],[40,90],[46,90],[52,90],
            [60,60],[72,60],[78,60],[90,60],[96,60],[102,60],[108,60],[120,60],[132,60],
            [60,66],[72,66],[84,66],[96,66],[108,66],[120,66],[132,66],
            [60,72],[66,72],[78,72],[90,72],[102,72],[114,72],[126,72],[132,72],
            [60,78],[72,78],[84,78],[96,78],[108,78],[120,78],
            [60,84],[66,84],[78,84],[90,84],[96,84],[102,84],[108,84],[114,84],[120,84],[132,84],
            [60,90],[72,90],[84,90],[96,90],[120,90],[132,90],
            [60,96],[66,96],[72,96],[78,96],[90,96],[96,96],[108,96],[120,96],
            [66,102],[78,102],[84,102],[90,102],[96,102],[108,102],[114,102],[132,102],
            [60,108],[66,108],[78,108],[84,108],[102,108],[108,108],[114,108],[120,108],[132,108],
            [60,114],[72,114],[84,114],[90,114],[96,114],[102,114],[114,114],[126,114],[132,114],
            [60,120],[66,120],[78,120],[90,120],[96,120],[108,120],[120,120],
            [66,126],[72,126],[78,126],[84,126],[96,126],[108,126],[114,126],[120,126],[132,126],
            [60,132],[66,132],[84,132],[90,132],[102,132],[114,132],[126,132],[132,132],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="5" height="5" fill="#111" rx="0.5" />
          ))}
        </svg>
        <div style={{ fontSize: 11, color: "#6F7480", textAlign: "center", lineHeight: 1.6 }}>
          工作日 9:00–21:00<br />节假日 10:00–18:00
        </div>
        <button onClick={onClose} style={{ padding: "7px 28px", borderRadius: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.09)", color: "#A4A8B3", fontSize: 12, cursor: "pointer" }}>
          关闭
        </button>
      </div>
    </div>
  );
}

// ─── Feedback Modal (Make 提交问题申请反馈) ───────────────────────────────────
function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"bug" | "suggest" | "other">("bug");
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.75)", backdropFilter: "blur(16px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "min(480px,94vw)", background: "#111218", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.85)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <MessageSquare style={{ width: 16, height: 16, color: "rgba(255,138,31,.8)" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "white", flex: 1 }}>提交问题 · 申请反馈</span>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.45)", cursor: "pointer" }}>
            <X style={{ width: 13, height: 13 }} />
          </button>
        </div>
        {sent ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 6 }}>反馈已提交</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 20 }}>感谢你的反馈，我们会尽快跟进处理！</div>
            <button onClick={onClose} style={{ padding: "8px 28px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.6)" }}>
              关闭
            </button>
          </div>
        ) : (
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.4)", fontWeight: 600, marginBottom: 8 }}>反馈类型</div>
              <div style={{ display: "flex", gap: 6 }}>
                {([["bug", "🐛", "报告 Bug"], ["suggest", "💡", "功能建议"], ["other", "💬", "其他问题"]] as const).map(([k, emoji, label]) => (
                  <button key={k} onClick={() => setType(k)}
                    style={{ flex: 1, padding: "7px 4px", borderRadius: 9, fontSize: 12, cursor: "pointer", fontWeight: type === k ? 700 : 400,
                      background: type === k ? "rgba(255,138,31,.1)" : "rgba(255,255,255,.04)",
                      border: `1px solid ${type === k ? "rgba(255,138,31,.3)" : "rgba(255,255,255,.08)"}`,
                      color: type === k ? "rgba(255,138,31,.95)" : "rgba(255,255,255,.4)" }}>
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.4)", fontWeight: 600, marginBottom: 8 }}>
                {type === "bug" ? "问题描述（请尽量详细）" : type === "suggest" ? "建议内容" : "反馈内容"}
              </div>
              <textarea value={text} onChange={e => setText(e.target.value)} autoFocus
                placeholder={type === "bug" ? "请描述问题出现的步骤、页面位置及现象…" : type === "suggest" ? "请描述你希望实现的功能或改进方向…" : "请填写你的问题或意见…"}
                style={{ width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 11, padding: "12px 14px", fontSize: 13, color: "rgba(255,255,255,.85)", outline: "none", resize: "none", lineHeight: 1.75, fontFamily: "inherit", boxSizing: "border-box", height: 130, display: "block" }} />
              <div style={{ textAlign: "right", fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 4 }}>{text.length} / 500</div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.4)", fontWeight: 600, marginBottom: 8 }}>联系方式（选填）</div>
              <input placeholder="邮箱或手机号，方便我们回复你"
                style={{ width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 10, padding: "9px 13px", fontSize: 13, color: "rgba(255,255,255,.8)", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 8, paddingTop: 2 }}>
              <button onClick={onClose}
                style={{ flex: 1, padding: "10px 0", borderRadius: 11, fontSize: 13, cursor: "pointer", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", color: "rgba(255,255,255,.45)" }}>
                取消
              </button>
              <button onClick={() => { if (text.trim()) setSent(true); }} disabled={!text.trim()}
                style={{ flex: 2, padding: "10px 0", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: text.trim() ? "pointer" : "not-allowed",
                  background: text.trim() ? "linear-gradient(135deg,#FF8A1F,#FF5A1F)" : "rgba(255,255,255,.06)",
                  border: "none", color: text.trim() ? "black" : "rgba(255,255,255,.2)" }}>
                提交反馈
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Space Picker Modal (Make 工作空间切换) ──────────────────────────────────
function SpacePickerModal({ currentSpace, onConfirm, onClose }: {
  currentSpace: "personal" | "team";
  onConfirm: (s: "personal" | "team") => void;
  onClose: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.72)", backdropFilter: "blur(12px)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: 480, background: "#13141B", borderRadius: 24, border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 32px 80px rgba(0,0,0,.8)", overflow: "hidden" }}>
        <div style={{ padding: "28px 32px 0", textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FF8A1F", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Flame style={{ width: 18, height: 18, color: "black" }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 6 }}>切换工作空间</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.6 }}>
            切换后，后续生成任务和作品<br />归属将随之改变
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, padding: "24px 28px 28px" }}>
          <button onClick={() => onConfirm("personal")}
            style={{ flex: 1, padding: "22px 18px", borderRadius: 16, cursor: "pointer", textAlign: "left",
              border: `2px solid ${currentSpace === "personal" ? "#60a5fa" : "rgba(255,255,255,.08)"}`,
              background: currentSpace === "personal" ? "rgba(96,165,250,.08)" : "rgba(255,255,255,.03)",
              transition: "all .15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
            onMouseEnter={e => { if (currentSpace !== "personal") { e.currentTarget.style.borderColor = "rgba(96,165,250,.4)"; e.currentTarget.style.background = "rgba(96,165,250,.04)"; } }}
            onMouseLeave={e => { if (currentSpace !== "personal") { e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; e.currentTarget.style.background = "rgba(255,255,255,.03)"; } }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(96,165,250,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User style={{ width: 22, height: 22, color: "#60a5fa" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "white", marginBottom: 4 }}>个人空间</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", lineHeight: 1.5 }}>{USER.name}<br />{getWallet("personal").rechargeStars.toLocaleString()} 充值积分（个人钱包）</div>
            </div>
            {currentSpace === "personal" && (
              <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", background: "rgba(96,165,250,.12)", borderRadius: 100, padding: "3px 10px" }}>当前空间</div>
            )}
          </button>
          <button onClick={() => onConfirm("team")}
            style={{ flex: 1, padding: "22px 18px", borderRadius: 16, cursor: "pointer", textAlign: "left",
              border: `2px solid ${currentSpace === "team" ? "#a78bfa" : "rgba(255,255,255,.08)"}`,
              background: currentSpace === "team" ? "rgba(139,92,246,.08)" : "rgba(255,255,255,.03)",
              transition: "all .15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
            onMouseEnter={e => { if (currentSpace !== "team") { e.currentTarget.style.borderColor = "rgba(139,92,246,.4)"; e.currentTarget.style.background = "rgba(139,92,246,.04)"; } }}
            onMouseLeave={e => { if (currentSpace !== "team") { e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; e.currentTarget.style.background = "rgba(255,255,255,.03)"; } }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(139,92,246,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#a78bfa" }}>
              {USER.team[0]}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "white", marginBottom: 4 }}>{USER.team}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", lineHeight: 1.5 }}>团队空间<br />{getWallet("team").rechargeStars.toLocaleString()} 充值积分（团队钱包）</div>
            </div>
            {currentSpace === "team" && (
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", background: "rgba(139,92,246,.12)", borderRadius: 100, padding: "3px 10px" }}>当前空间</div>
            )}
          </button>
        </div>
        <div style={{ padding: "0 28px 22px", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.2)" }}>
          两个空间的余额独立，互不影响 · 点击外部关闭
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar (Make AppLayout — 68px + 空间切换 + 底部消息/帮助/头像) ──────────
function Sidebar({ currentPage, currentSpace, onNavigate, onSpacePick, onNotifToggle, onHelpToggle, unread, serviceOpen }: {
  currentPage: PageId;
  currentSpace: "personal" | "team";
  onNavigate: (p: PageId) => void;
  onSpacePick: () => void;
  onNotifToggle: () => void;
  onHelpToggle: () => void;
  unread: number;
  serviceOpen: boolean;
}) {
  return (
    <aside style={{
      width: 68, flexShrink: 0,
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "#0E0F14",
      borderRight: "1px solid rgba(255,255,255,0.05)",
      position: "relative",
    }}>
      {/* Logo */}
      <button onClick={() => onNavigate("landing")} title="返回首页"
        style={{ width: "100%", display: "flex", justifyContent: "center", padding: "18px 0 14px", background: "none", border: "none", cursor: "pointer" }}
        onMouseEnter={e => { (e.currentTarget.firstElementChild as HTMLElement).style.opacity = "0.8"; }}
        onMouseLeave={e => { (e.currentTarget.firstElementChild as HTMLElement).style.opacity = "1"; }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "#FF8A1F", transition: "opacity .15s" }}>
          <Flame style={{ width: 15, height: 15, color: "black" }} />
        </div>
      </button>

      {/* Space switcher */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: 6 }}>
        <button onClick={onSpacePick}
          title={currentSpace === "team" ? `团队空间：${USER.team}` : "个人空间"}
          style={{
            width: 40, height: 40, borderRadius: 11, border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
            background: currentSpace === "team" ? "rgba(139,92,246,.15)" : "rgba(96,165,250,.12)",
            transition: "background .15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = currentSpace === "team" ? "rgba(139,92,246,.25)" : "rgba(96,165,250,.22)")}
          onMouseLeave={e => (e.currentTarget.style.background = currentSpace === "team" ? "rgba(139,92,246,.15)" : "rgba(96,165,250,.12)")}>
          {currentSpace === "team"
            ? <Users style={{ width: 14, height: 14, color: "#a78bfa" }} />
            : <User  style={{ width: 14, height: 14, color: "#60a5fa" }} />}
          <span style={{ fontSize: 8, fontWeight: 700, color: currentSpace === "team" ? "#a78bfa" : "#60a5fa", letterSpacing: "0.02em" }}>
            {currentSpace === "team" ? "团队" : "个人"}
          </span>
        </button>
      </div>

      <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 8 }} />

      {/* Nav */}
      <nav style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "0 8px", overflowY: "auto" }}>
        {SIDEBAR_NAV.map(item => {
          const active = !!(item.id && currentPage === item.id);
          const clickable = !!item.id;
          return (
            <button key={item.label} onClick={() => item.id && onNavigate(item.id as PageId)} title={item.label}
              style={{
                width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
                gap: 4, padding: "9px 0", borderRadius: 8,
                border: "none", cursor: clickable ? "pointer" : "default",
                transition: "background .15s",
                background: active ? "rgba(255,138,31,0.10)" : "transparent",
                position: "relative",
                opacity: clickable ? 1 : 0.35,
              }}
              onMouseEnter={e => { if (!active && clickable) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = active ? "rgba(255,138,31,0.10)" : "transparent"; }}>
              {active && (
                <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 2, height: 20, background: "#FF8A1F", borderRadius: "0 2px 2px 0" }} />
              )}
              <item.icon style={{
                width: 17, height: 17,
                strokeWidth: active ? 2 : 1.5,
                color: active ? "#FF8A1F" : "rgba(255,255,255,0.28)",
                transition: "color .15s",
              } as React.CSSProperties} />
              <span style={{
                fontSize: 10, lineHeight: 1,
                fontWeight: active ? 600 : 400,
                color: active ? "#F4F5F7" : "rgba(255,255,255,0.35)",
                letterSpacing: "0.01em",
                transition: "color .15s",
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom — 消息/帮助/头像 */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "8px 8px 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>

        {/* Bell / 消息 */}
        <button title="消息通知" onClick={onNotifToggle}
          style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 0", borderRadius: 8, background: serviceOpen ? "none" : "transparent", border: serviceOpen ? "1px solid transparent" : "1px solid transparent", cursor: "pointer", position: "relative" }}>
          <div style={{ position: "relative" }}>
            <Bell style={{ width: 15, height: 15, color: "rgba(255,255,255,0.28)", strokeWidth: 1.5 } as React.CSSProperties} />
            {unread > 0 && (
              <span style={{ position: "absolute", top: -3, right: -4, minWidth: 14, height: 14, borderRadius: 7, background: "#EF4444", border: "1.5px solid #0E0F14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "white", padding: "0 2px" }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", lineHeight: 1 }}>消息</span>
        </button>

        {/* Help */}
        <button title="帮助中心" onClick={onHelpToggle}
          style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 0", borderRadius: 8, background: "none", border: "1px solid transparent", cursor: "pointer", transition: "background .15s" }}>
          <HelpCircle style={{ width: 15, height: 15, color: "rgba(255,255,255,0.2)", strokeWidth: 1.5 } as React.CSSProperties} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", lineHeight: 1 }}>帮助</span>
        </button>

        {/* Avatar */}
        <button onClick={() => onNavigate("user-center")} title={USER.name}
          style={{ width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,138,31,0.12)", color: "#FF8A1F", fontSize: 11, fontWeight: 700, marginTop: 4, transition: "background .15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,138,31,0.22)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,138,31,0.12)")}>
          {USER.avatar}
        </button>
      </div>
    </aside>
  );
}

// ─── Help Popup (Make 帮助中心 popover) ───────────────────────────────────────
function HelpPopup({ onOpenService, onOpenFeedback, onClose }: {
  onOpenService: () => void;
  onOpenFeedback: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 198 }} onClick={onClose} />
      <div style={{ position: "fixed", left: 72, bottom: 60, zIndex: 199, width: 280, background: "#111218", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,.8)", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 2 }}>帮助中心</div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.3)" }}>遇到问题？我们来帮你</div>
        </div>
        <button onClick={() => { onClose(); onOpenService(); }}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", transition: "background .12s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.04)")}
          onMouseLeave={e => (e.currentTarget.style.background = "none")}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Headphones style={{ width: 16, height: 16, color: "#22C55E" } as React.CSSProperties} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.85)" }}>联系客服</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.35)", marginTop: 1 }}>扫码添加专属客服微信</div>
          </div>
          <ChevronRight style={{ width: 14, height: 14, color: "rgba(255,255,255,.2)", marginLeft: "auto" } as React.CSSProperties} />
        </button>
        <div style={{ height: 1, background: "rgba(255,255,255,.05)", margin: "0 14px" }} />
        <button onClick={() => { onClose(); onOpenFeedback(); }}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", transition: "background .12s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.04)")}
          onMouseLeave={e => (e.currentTarget.style.background = "none")}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,138,31,.1)", border: "1px solid rgba(255,138,31,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MessageSquare style={{ width: 16, height: 16, color: "rgba(255,138,31,.9)" } as React.CSSProperties} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.85)" }}>提交问题 · 申请反馈</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.35)", marginTop: 1 }}>报告 Bug 或提交功能建议</div>
          </div>
          <ChevronRight style={{ width: 14, height: 14, color: "rgba(255,255,255,.2)", marginLeft: "auto" } as React.CSSProperties} />
        </button>
        <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 0", background: "none", border: "none", cursor: "pointer", fontSize: 11.5, color: "rgba(255,255,255,.3)", transition: "color .12s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,.6)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.3)")}>
            <BookOpen style={{ width: 12, height: 12 } as React.CSSProperties} />使用文档
          </button>
          <div style={{ width: 1, background: "rgba(255,255,255,.06)" }} />
          <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 0", background: "none", border: "none", cursor: "pointer", fontSize: 11.5, color: "rgba(255,255,255,.3)", transition: "color .12s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,.6)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.3)")}>
            <FileText style={{ width: 12, height: 12 } as React.CSSProperties} />更新日志
          </button>
        </div>
      </div>
    </>
  );
}

// ─── App Header (Make 状态条 + 会员积分 + 客服) ───────────────────────────────
function AppHeader({ currentSpace, onSpacePick, onOpenService }: {
  currentSpace: "personal" | "team";
  onSpacePick: () => void;
  onOpenService: () => void;
}) {
  return (
    <header style={{
      height: 60, flexShrink: 0, display: "flex", alignItems: "center",
      padding: "0 20px", gap: 8,
      background: "#090A0E",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      {/* Status strip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 7, flexShrink: 0,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8, padding: "0 14px", height: 30,
        whiteSpace: "nowrap",
      }}>
        <button onClick={onSpacePick}
          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          {currentSpace === "team"
            ? <Users style={{ width: 10, height: 10, color: "#a78bfa", flexShrink: 0 } as React.CSSProperties} />
            : <User  style={{ width: 10, height: 10, color: "#60a5fa", flexShrink: 0 } as React.CSSProperties} />}
          <span style={{ fontSize: 11, fontWeight: 600, color: currentSpace === "team" ? "#a78bfa" : "#60a5fa" }}>
            {currentSpace === "team" ? "团队空间" : "个人空间"}
          </span>
          <ChevronDown style={{ width: 9, height: 9, color: currentSpace === "team" ? "rgba(167,139,250,.6)" : "rgba(96,165,250,.6)" } as React.CSSProperties} />
        </button>
        <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>套餐剩余</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#F4F5F7" }}>{USER.planDaysLeft} 天</span>
        <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
        <Zap style={{ width: 10, height: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0 } as React.CSSProperties} />
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>并发</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#F4F5F7" }}>
          {USER.concurrent.used}<span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>/{USER.concurrent.total}</span>
        </span>
        <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
        <Star style={{ width: 10, height: 10, color: "#FF8A1F", flexShrink: 0 } as React.CSSProperties} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#FF8A1F" }}>
          {(currentSpace === "team" ? getWallet("team").rechargeStars : getWallet("personal").rechargeStars).toLocaleString()}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
          {currentSpace === "team" ? "团队钱包" : "个人钱包"}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 8px", height: 28, background: "none", border: "none", color: "#FF8A1F", fontSize: 11.5, fontWeight: 500, cursor: "pointer", opacity: 0.85, transition: "opacity .15s", flexShrink: 0 }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "0.85")}>
        <Sparkles style={{ width: 11, height: 11 } as React.CSSProperties} />
        会员积分
      </button>
      <button onClick={onOpenService}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 8px", height: 28, background: "none", border: "none", color: "rgba(255,255,255,0.38)", fontSize: 11.5, cursor: "pointer", transition: "color .15s", flexShrink: 0 }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}>
        <Headphones style={{ width: 11, height: 11 } as React.CSSProperties} />
        客服
      </button>
    </header>
  );
}

// ─── Workspace Page (Make — 早上好 + 开始创作下拉 + 3-统计 + 继续创作 3-tab + 3:4 卡片) ──
function WorkspacePage({ navigate, onSpacePick }: NavType & { onSpacePick: (dest?: PageId) => void }) {
  const [newOpen, setNewOpen] = useState(false);
  const [ccTab, setCcTab] = useState<"all" | "project" | "canvas">("all");

  const CANVASES = [
    { id: "cv1", name: "星耀制作流程画布", nodes: 7, edges: 6, updated: "今天 14:30", storageDays: 5 },
    { id: "cv2", name: "《星坠》宣传物料",   nodes: 3, edges: 2, updated: "昨天 09:15", storageDays: 19 },
  ];
  const PROJECT_STORAGE_DAYS = 5;

  const showProject = ccTab === "all" || ccTab === "project";
  const showCanvas  = ccTab === "all" || ccTab === "canvas";

  const storageTier = (days: number) =>
    days <= 7  ? { color: "#F87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.25)",  label: `${days}天后清除`, urgent: true  } :
    days <= 14 ? { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)",   label: `${days}天后清除`, urgent: false } :
                 { color: "#6F7480", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", label: `${days}天后清除`, urgent: false };

  const startNew = (dest: PageId) => { navigate(dest); setNewOpen(false); };

  return (
    <div style={{ padding: "24px 28px", width: "100%", boxSizing: "border-box" }} onClick={() => setNewOpen(false)}>
      {/* Welcome + CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F4F5F7", letterSpacing: "-0.03em", margin: 0, lineHeight: 1.15 }}>
          早上好，{USER.name}
        </h1>
        <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
          <button onClick={() => setNewOpen(o => !o)} className="glass-btn"
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#F4F5F7", border: "none", cursor: "pointer" }}>
            <Plus style={{ width: 13, height: 13, color: "rgba(255,255,255,0.65)" } as React.CSSProperties} />
            开始创作
            <ChevronDown style={{ width: 11, height: 11, color: "rgba(255,255,255,0.4)", transition: "transform .15s", transform: newOpen ? "rotate(180deg)" : "rotate(0deg)" } as React.CSSProperties} />
          </button>
          {newOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200, background: "#181B24", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.65)", padding: "6px 0", minWidth: 220 }}>
              {[
                { label: "剧目创作", sub: "剧本 → 分集 → 资产 → 分镜", icon: Film,    color: gold,      action: () => { onSpacePick("new-project"); setNewOpen(false); } },
                { label: "无限画布", sub: "节点编排 · 自由创作",         icon: PenLine, color: "#A78BFA", action: () => { startNew("canvas"); } },
              ].map(opt => (
                <button key={opt.label} onClick={opt.action}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left", transition: "background .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${opt.color}14`, border: `1px solid ${opt.color}22`, flexShrink: 0 }}>
                    <opt.icon style={{ width: 13, height: 13, color: opt.color } as React.CSSProperties} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#F4F5F7" }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: "#6F7480", marginTop: 1 }}>{opt.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: "flex", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 0", marginBottom: 28, gap: 0, flexWrap: "nowrap" }}>
        {([
          { value: "148",   unit: "条", label: "本月视频", color: "#FF8A1F" },
          { value: "3,241", unit: "颗", label: "星石消耗", color: "#FFB84D" },
          { value: "12",    unit: "个", label: "剧目总数", color: "#34D399" },
        ] as const).map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {i > 0 && <div style={{ width: 1, height: 26, background: "rgba(255,255,255,0.07)", flexShrink: 0, margin: "0 20px" }} />}
            <div style={{ whiteSpace: "nowrap" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 1 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.unit}</span>
                <span style={{ fontSize: 10, color: "#6F7480", marginLeft: 2 }}>{s.label}</span>
              </div>
            </div>
          </div>
        ))}
        <div style={{ flex: 1 }} />
      </div>

      {/* Continue creating header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#6F7480", textTransform: "uppercase", letterSpacing: "0.09em" }}>继续创作</span>
          <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "2px" }}>
            {([["all", "全部"], ["project", "剧目"], ["canvas", "画布"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setCcTab(id)}
                style={{ fontSize: 11, padding: "3px 10px", borderRadius: 5, border: "none", cursor: "pointer", transition: "all .15s",
                  background: ccTab === id ? "rgba(255,138,31,0.15)" : "transparent",
                  color: ccTab === id ? gold : "rgba(255,255,255,0.4)", fontWeight: ccTab === id ? 500 : 400 }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => navigate("projects")}
          style={{ fontSize: 11.5, color: gold, display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", opacity: 0.7 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}>
          全部剧目<ChevronRight style={{ width: 11, height: 11 } as React.CSSProperties} />
        </button>
      </div>

      {/* 3:4 Card grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16 }}>

        {showProject && (() => {
          const tier = storageTier(PROJECT_STORAGE_DAYS);
          return (
            <div
              style={{ borderRadius: 12, overflow: "hidden",
                background: "#13151C",
                border: tier.urgent ? "1px solid rgba(248,113,113,0.22)" : "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.35)", transition: "transform .2s, box-shadow .2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.35)"; }}>
              <div style={{ width: "100%", aspectRatio: "3/4", background: "linear-gradient(160deg,#1A1108 0%,#120C04 40%,#0D0A06 100%)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,138,31,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,138,31,0.12)", border: "1px solid rgba(255,138,31,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Film style={{ width: 18, height: 18, color: gold } as React.CSSProperties} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#F4F5F7", letterSpacing: "-0.02em" }}>{PROJECT.name}</span>
                </div>
                <div style={{ position: "absolute", top: 9, right: 9 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 20, background: "rgba(96,165,250,0.15)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.25)", backdropFilter: "blur(4px)" }}>生成中</span>
                </div>
                {tier.urgent && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 48, background: "linear-gradient(to top, rgba(248,113,113,0.15), transparent)", pointerEvents: "none" }} />
                )}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.07)" }}>
                  <div style={{ height: "100%", background: gold, width: `${(PROJECT.storyboards.done / PROJECT.storyboards.total) * 100}%` }} />
                </div>
              </div>
              <div style={{ padding: "12px 14px 13px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#F4F5F7", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{PROJECT.chapter}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#6F7480", whiteSpace: "nowrap" }}>{PROJECT.storyboards.done}/{PROJECT.storyboards.total} 镜</span>
                  <button onClick={e => e.stopPropagation()} title="立即导出，防止丢失"
                    style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, padding: "2px 7px", borderRadius: 20, cursor: "pointer",
                      background: tier.bg, border: `1px solid ${tier.border}`, color: tier.color,
                      fontWeight: tier.urgent ? 700 : 400, transition: "all .15s", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {tier.urgent && <Download style={{ width: 9, height: 9, flexShrink: 0 } as React.CSSProperties} />}
                    {tier.label}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {showCanvas && CANVASES.map(cv => {
          const tier = storageTier(cv.storageDays);
          return (
            <div key={cv.id} onClick={() => navigate("canvas")}
              style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer",
                background: "#13151C",
                border: tier.urgent ? "1px solid rgba(248,113,113,0.22)" : "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.35)", transition: "transform .2s, box-shadow .2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.35)"; }}>
              <div style={{ width: "100%", aspectRatio: "3/4", background: "linear-gradient(160deg,#0E0A14 0%,#090610 40%,#07050D 100%)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(167,139,250,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
                {[[30, 35], [50, 55], [70, 40], [40, 68], [60, 72]].map(([x, y], i) => (
                  <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 4, height: 4, borderRadius: "50%", background: i === 0 ? "#A78BFA" : "rgba(167,139,250,0.35)", transform: "translate(-50%,-50%)" }} />
                ))}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
                  {([[30, 35, 50, 55], [50, 55, 70, 40], [50, 55, 40, 68], [50, 55, 60, 72]] as [number, number, number, number][]).map(([x1, y1, x2, y2], i) => (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(167,139,250,0.18)" strokeWidth="0.8" />
                  ))}
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PenLine style={{ width: 18, height: 18, color: "#A78BFA" } as React.CSSProperties} />
                  </div>
                </div>
                <div style={{ position: "absolute", top: 9, right: 9 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 20, background: "rgba(167,139,250,0.12)", color: "#A78BFA", border: "1px solid rgba(167,139,250,0.22)", backdropFilter: "blur(4px)" }}>画布</span>
                </div>
                {tier.urgent && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 48, background: "linear-gradient(to top, rgba(248,113,113,0.15), transparent)", pointerEvents: "none" }} />
                )}
              </div>
              <div style={{ padding: "12px 14px 13px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#F4F5F7", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cv.name}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#6F7480", whiteSpace: "nowrap" }}>{cv.nodes} 节点 · {cv.updated}</span>
                  <button onClick={e => e.stopPropagation()} title="立即导出"
                    style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, padding: "2px 7px", borderRadius: 20, cursor: "pointer",
                      background: tier.bg, border: `1px solid ${tier.border}`, color: tier.color,
                      fontWeight: tier.urgent ? 700 : 400, transition: "all .15s", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {tier.urgent && <Download style={{ width: 9, height: 9, flexShrink: 0 } as React.CSSProperties} />}
                    {tier.label}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Project List Page (Make 全部剧目 — 行卡 + 搜索) ──────────────────────────
function ProjectListPage({ navigate, onSpacePick }: NavType & { onSpacePick: (dest?: PageId) => void }) {
  const [q, setQ] = useState("");
  const projects = [
    { name: "《镜像》", genre: "都市情感", ep: "第03集《回声》", done: 12, running: 3, queued: 4, failed: 1, total: 20, updated: "今天 10:48", status: "active" },
    { name: "《星坠》", genre: "科幻冒险", ep: "第06集《归零》", done: 18, running: 0, queued: 0, failed: 0, total: 18, updated: "昨天 16:22", status: "done"   },
    { name: "《归途》", genre: "悬疑推理", ep: "第01集《迷雾》", done:  0, running: 0, queued: 0, failed: 0, total: 24, updated: "07-25",    status: "draft"  },
  ].filter(p => p.name.includes(q) || p.genre.includes(q));
  const sb: Record<string, { label: string; cs: string; cb: string }> = {
    active: { label: "生成中", cs: "#60a5fa", cb: "rgba(59,130,246,.15)" },
    done:   { label: "已完成", cs: "#34d399", cb: "rgba(52,211,153,.12)" },
    draft:  { label: "草稿",   cs: "rgba(255,255,255,0.45)", cb: "rgba(255,255,255,0.04)" },
  };

  return (
    <div style={{ padding: "24px 28px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate("workspace")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13, padding: 0 }}>
            <ChevronLeft style={{ width: 14, height: 14 } as React.CSSProperties} />工作台
          </button>
          <span style={{ fontSize: 13, color: "#6F7480" }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#F4F5F7" }}>全部剧目</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>共 {projects.length} 个</span>
        </div>
        <button onClick={() => onSpacePick("new-project")} className="orange-btn" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: 500, color: "black", border: "none" }}>
          <Plus style={{ width: 14, height: 14 } as React.CSSProperties} />新建剧目
        </button>
      </div>
      <div style={{ position: "relative", marginBottom: 16, maxWidth: 360 }}>
        <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "rgba(255,255,255,0.4)" } as React.CSSProperties} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="搜索剧目"
          style={{ width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, padding: "8px 10px 8px 32px", fontSize: 12, color: "white", outline: "none", boxSizing: "border-box" } as React.CSSProperties} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {projects.map(p => {
          const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
          const s = sb[p.status];
          return (
            <div key={p.name}
              style={{ background: "#13151C", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "14px 18px", transition: "border-color .15s, background .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,138,31,0.2)"; e.currentTarget.style.background = "#181B24"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; e.currentTarget.style.background = "#13151C"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(255,138,31,0.1)", border: "1px solid rgba(255,138,31,0.16)" }}>
                  <Film style={{ width: 16, height: 16, color: gold } as React.CSSProperties} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#F4F5F7" }}>{p.name}</span>
                    <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 4, background: s.cb, color: s.cs, border: `1px solid ${s.cb}` }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{p.genre} · {p.ep}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[
                      { v: p.done,    c: "#34D399" },
                      { v: p.running, c: "#60A5FA" },
                      { v: p.queued,  c: "rgba(255,255,255,0.4)" },
                      { v: p.failed,  c: "#F87171" },
                    ].filter(x => x.v > 0).map((x, i) => (
                      <span key={i} style={{ fontSize: 12, color: x.c, fontVariantNumeric: "tabular-nums" }}>{x.v}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
                  <span style={{ fontSize: 11, color: "#6F7480" }}>{p.updated}</span>
                  <button style={{ padding: 4, borderRadius: 6, background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }} onClick={e => e.stopPropagation()}>
                    <MoreHorizontal style={{ width: 14, height: 14 } as React.CSSProperties} />
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 10, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: p.status === "done" ? "#34D399" : gold, borderRadius: 2, transition: "width .3s" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const params = new URLSearchParams(window.location.search);
  const initialPage = (params.get("page") ?? "workspace") as PageId;
  const [currentPage, setCurrentPage] = useState<PageId>(initialPage);

  // App shell state
  const [currentSpace, setCurrentSpace] = useState<"personal" | "team">(USER.currentSpace);
  const [showSpacePicker, setShowSpacePicker] = useState(false);
  const [pendingNav, setPendingNav] = useState<PageId | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const openSpacePicker = (dest?: PageId) => {
    setPendingNav(dest ?? null);
    setShowSpacePicker(true);
  };
  const confirmSpace = (s: "personal" | "team") => {
    setCurrentSpace(s);
    setShowSpacePicker(false);
    if (pendingNav) {
      const dest = pendingNav; setPendingNav(null); navigate(dest);
    }
  };

  const navigate = useCallback((page: PageId) => {
    setCurrentPage(page);
    setNotifOpen(false); setHelpOpen(false);
    window.history.pushState(null, "", "?page=" + page);
  }, []);

  // Browser back/forward support
  useEffect(() => {
    const onPop = () => {
      const p = new URLSearchParams(window.location.search).get("page") as PageId | null;
      if (p) setCurrentPage(p);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const isAppShell =
    currentPage !== "landing" && currentPage !== "register" && currentPage !== "verify" &&
    currentPage !== "onboarding" && currentPage !== "login" && currentPage !== "upgrade" &&
    currentPage !== "canvas";

  const unread = NOTIFS.task.filter(n => !n.read).length + NOTIFS.invoice.filter(n => !n.read).length +
                 NOTIFS.activity.filter(n => !n.read).length + NOTIFS.error.filter(n => !n.read).length;

  const renderPage = () => {
    switch (currentPage) {
      case "landing":           return <LandingPage navigate={navigate} />;
      case "login":             return <AuthPage navigate={navigate} />;
      case "register":          return <RegisterPage navigate={navigate} />;
      case "onboarding":        return <OnboardingPage navigate={navigate} />;
      case "workspace":         return <WorkspacePage navigate={navigate} onSpacePick={openSpacePicker} />;
      case "projects":          return <ProjectListPage navigate={navigate} onSpacePick={openSpacePicker} />;
      case "new-project":       return <NewProjectPage navigate={navigate} />;
      case "canvas":            return <CanvasPage navigate={navigate} />;
      case "team":              return <TeamPage navigate={navigate} />;
      case "batch":             return <BatchPage navigate={navigate} />;
      case "result":            return <ResultPage navigate={navigate} />;
      case "delivery":          return <DeliveryPage navigate={navigate} />;
      case "upgrade":           return <UpgradePage navigate={navigate} />;
      case "cost-confirm":      return <CostConfirmPage navigate={navigate} />;
      case "team-assets":       return <TeamAssetsPage navigate={navigate} />;
      case "assets":            return <TeamAssetsPage navigate={navigate} />;
      case "billing":           return <BillingPage navigate={navigate} />;
      case "user-center":       return <UserCenterPage navigate={navigate} />;
      default:                  return <WorkspacePage navigate={navigate} onSpacePick={openSpacePicker} />;
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", background: "#090A0E", overflow: "hidden" }}>
      {isAppShell ? (
        <>
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            <Sidebar currentPage={currentPage} currentSpace={currentSpace}
              onNavigate={navigate} onSpacePick={() => openSpacePicker()}
              onNotifToggle={() => { setNotifOpen(o => !o); setHelpOpen(false); }}
              onHelpToggle={()  => { setHelpOpen(o  => !o); setNotifOpen(false); }}
              unread={unread} serviceOpen={serviceOpen} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#090A0E", minWidth: 0 }}>
              <AppHeader currentSpace={currentSpace}
                onSpacePick={() => openSpacePicker()}
                onOpenService={() => setServiceOpen(true)} />
              <main style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                {renderPage()}
              </main>
            </div>
          </div>

          {showSpacePicker && (
            <SpacePickerModal currentSpace={currentSpace}
              onConfirm={confirmSpace}
              onClose={() => { setShowSpacePicker(false); setPendingNav(null); }} />
          )}
          {notifOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 198 }} onClick={() => setNotifOpen(false)} />
              <NotificationPanel onClose={() => setNotifOpen(false)} />
            </>
          )}
          {helpOpen && (
            <HelpPopup
              onClose={() => setHelpOpen(false)}
              onOpenService={() => setServiceOpen(true)}
              onOpenFeedback={() => setFeedbackOpen(true)}
            />
          )}
          {serviceOpen && <QRModal onClose={() => setServiceOpen(false)} />}
          {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
        </>
      ) : (
        <>
          {currentPage === "canvas"
            ? <div style={{ flex: 1, overflow: "hidden", position: "relative" }}><CanvasPage navigate={navigate} /></div>
            : renderPage()
          }
        </>
      )}
    </div>
  );
}
