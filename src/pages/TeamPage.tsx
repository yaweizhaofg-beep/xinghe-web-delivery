// ═══════════════════════════════════════════════════════════════════════════════════
// TeamPage - 团队管理页
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { X, Plus, Loader2, CheckCircle, User, Settings } from "lucide-react";
import { 
  TEAM_MEMBERS_INIT, TEAM_ROLES,
  ROLE_STYLE, TEAM_OWNER_ID, colors 
} from "../shared";
import type { Nav as NavType, TeamRole } from "../shared";
import {
  getAllocation, getMemberAvailable, getTotalAllocated, getAssignableBalance,
  allocateToMember, revokeAllocation, allocationStatus, ALLOCATION_STATUS_META,
  TEAM_RESERVED_STARS, getWallet, subscribeWallet,
} from "../billing";
import { useEffect } from "react";

// ─── Team Page ────────────────────────────────────────────────────────────────
// ═══ Allocation Modal ══════════════════════════════════════════════════════════
function AllocationModal({ memberId, value, error, onValue, onError, onClose, onSubmit, onRevoke }: {
  memberId: number | null;
  value: string;
  error: string;
  onValue: (v: string) => void;
  onError: (e: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onRevoke: () => void;
}) {
  if (memberId === null) return null;
  const m = TEAM_MEMBERS_INIT.find(x => x.id === memberId);
  if (!m) return null;
  const a = getAllocation(memberId);
  const avail = getMemberAvailable(memberId);
  const balance = getAssignableBalance();
  const num = Number(value);
  const valid = Number.isFinite(num) && num >= 0;
  const delta = valid ? num - a.allocated : 0;
  const over = delta > balance;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 440, maxWidth: "calc(100vw - 40px)",
          background: colors.bgSurface,
          border: `1px solid ${colors.borderStrong}`,
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(0,0,0,.55)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "16px 20px", borderBottom: `1px solid ${colors.border}`,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: ROLE_STYLE[m.role]?.bg ?? colors.bgHover,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: ROLE_STYLE[m.role]?.color ?? colors.textPrimary,
          }}>
            {m.avatar}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
              分配额度 · {m.name}
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted }}>
              {m.account} · {m.role}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto", width: 28, height: 28, borderRadius: 8,
              background: "transparent", border: "none", color: colors.textMuted,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 20px" }}>
          {/* Current */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16,
          }}>
            {[
              { label: "当前已分配", value: a.allocated, color: colors.accent },
              { label: "已使用", value: a.used, color: colors.info },
              { label: "成员剩余", value: avail, color: colors.success },
            ].map(k => (
              <div key={k.label} style={{
                background: colors.bgSecondary, border: `1px solid ${colors.border}`,
                borderRadius: 11, padding: "11px 13px",
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: k.color }}>{k.value.toLocaleString()}</div>
                <div style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>分配额度（星石）</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: colors.textMuted }}>
                团队待分配 {balance.toLocaleString()}
              </span>
            </div>
            <input
              type="number"
              min={0}
              value={value}
              onChange={e => { onValue(e.target.value); onError(""); }}
              autoFocus
              style={{
                width: "100%", padding: "10px 13px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: colors.bgSecondary, border: `1px solid ${over ? "#f87171" : colors.borderStrong}`,
                color: colors.textPrimary, outline: "none", boxSizing: "border-box",
              }}
            />
            <div style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 6 }}>
              {valid && delta !== 0 && (
                delta > 0
                  ? `将从团队钱包划出 ${delta.toLocaleString()} 星石`
                  : `将释放 ${Math.abs(delta).toLocaleString()} 星石回到团队钱包`
              )}
            </div>
          </div>

          {/* Quick amounts */}
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            {[1000, 2000, 5000, 10000].map(v => (
              <button
                key={v}
                onClick={() => { onValue(String(v)); onError(""); }}
                style={{
                  padding: "5px 12px", borderRadius: 100, fontSize: 11.5,
                  background: colors.bgHover, border: `1px solid ${colors.border}`,
                  color: colors.textSecondary, cursor: "pointer",
                }}
              >
                {v.toLocaleString()}
              </button>
            ))}
            <button
              onClick={() => { onValue(String(a.used)); onError(""); }}
              style={{
                padding: "5px 12px", borderRadius: 100, fontSize: 11.5,
                background: "transparent", border: `1px solid ${colors.border}`,
                color: colors.textMuted, cursor: "pointer",
              }}
            >
              按已用量
            </button>
          </div>

          {error && (
            <div style={{ marginTop: 12, fontSize: 11.5, color: "#f87171" }}>{error}</div>
          )}
          {over && !error && (
            <div style={{ marginTop: 12, fontSize: 11.5, color: "#f87171" }}>
              超出团队待分配额度 {balance.toLocaleString()} 星石
            </div>
          )}

          <div style={{
            marginTop: 14, padding: "10px 12px", borderRadius: 10,
            background: colors.bgSecondary, border: `1px solid ${colors.border}`,
            fontSize: 11, color: colors.textMuted, lineHeight: 1.65,
          }}>
            成员只能使用分配到自己名下的额度，超出部分不可用；团队钱包保留 {TEAM_RESERVED_STARS.toLocaleString()} 星石不参与分配。
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", gap: 10, padding: "14px 20px",
          borderTop: `1px solid ${colors.border}`,
        }}>
          <button
            onClick={onRevoke}
            style={{
              padding: "10px 14px", borderRadius: 11, fontSize: 12.5, fontWeight: 600,
              background: "transparent", border: `1px solid ${colors.borderStrong}`,
              color: colors.textMuted, cursor: "pointer",
            }}
          >
            回收全部
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "10px", borderRadius: 11, fontSize: 13, fontWeight: 600,
              background: colors.bgHover, border: `1px solid ${colors.borderStrong}`,
              color: colors.textPrimary, cursor: "pointer",
            }}
          >
            取消
          </button>
          <button
            onClick={onSubmit}
            disabled={!valid}
            style={{
              flex: 1, padding: "10px", borderRadius: 11, fontSize: 13, fontWeight: 700,
              background: valid && !over ? colors.accent : "rgba(255,255,255,.07)",
              color: valid && !over ? "#000" : "rgba(255,255,255,.3)",
              border: "none", cursor: valid && !over ? "pointer" : "not-allowed",
            }}
          >
            保存分配
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage({ navigate }: NavType) {
  const [showInvite, setShowInvite] = useState(false);
  const [account, setAccount] = useState("");
  const [role, setRole] = useState<TeamRole>("编剧");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<TeamRole>("编剧");
  const [allocId, setAllocId] = useState<number | null>(null);
  const [allocInput, setAllocInput] = useState("");
  const [allocErr, setAllocErr] = useState("");
  const [, forceRender] = useState(0);

  const members = TEAM_MEMBERS_INIT;
  const onlineSet = new Set([1, 2, 3]);
  const MAX = 5;

  // 钱包额度变化时刷新
  useEffect(() => subscribeWallet(() => forceRender(v => v + 1)), []);

  const teamWallet = getWallet("team");

  const handleInvite = () => {
    if (!account.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setShowInvite(false);
        setAccount("");
        setRole("编剧");
      }, 1200);
    }, 1000);
  };

  const handleRemove = (id: number) => {
    setRemoveId(null);
    console.log("移除成员:", id);
  };

  const handleRoleChange = (id: number) => {
    setEditId(null);
    console.log("修改角色:", id, editRole);
  };

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>
            团队管理
          </h1>
          <p style={{ fontSize: 13, color: colors.textMuted }}>
            星耀漫剧工作室 · {members.length} 人 · {members.filter(m => onlineSet.has(m.id)).length} 人在线
          </p>
        </div>
        {members.length < MAX && (
          <button
            onClick={() => setShowInvite(true)}
            className="btn-primary"
            style={{ 
              padding: "10px 20px", 
              borderRadius: 12, 
              fontSize: 13, 
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "none",
            }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            邀请成员
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
        {[
          { label: "总成员", value: members.length, color: colors.accent },
          { label: "在线", value: members.filter(m => onlineSet.has(m.id)).length, color: colors.success },
          { label: "管理员", value: members.filter(m => m.role === "管理员").length, color: colors.purple },
          { label: "剩余席位", value: MAX - members.length, color: colors.info },
        ].map(stat => (
          <div key={stat.label} style={{
            background: colors.bgSurface,
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: 18,
          }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: colors.textMuted }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 团队钱包概览 */}
      <div style={{
        background: colors.bgSurface,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: "18px 22px",
        marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>团队钱包</div>
            <div style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>
              从团队钱包向成员分配额度，成员仅可使用分配到自己的部分
            </div>
          </div>
          <button
            onClick={() => navigate("user-center")}
            style={{
              marginLeft: "auto", padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600,
              background: colors.bgHover, border: `1px solid ${colors.borderStrong}`,
              color: colors.textPrimary, cursor: "pointer",
            }}
          >
            充值团队钱包
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "团队钱包余额", value: teamWallet.rechargeStars, color: colors.accent },
            { label: "已分配", value: getTotalAllocated(), color: colors.info },
            { label: "待分配", value: getAssignableBalance(), color: colors.success },
            { label: "团队保留", value: TEAM_RESERVED_STARS, color: colors.purple },
          ].map(k => (
            <div key={k.label} style={{
              background: colors.bgSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: 12, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.value.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{k.label} · 星石</div>
            </div>
          ))}
        </div>
      </div>

      {/* Member Table */}
      <div style={{
        background: colors.bgSurface,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
      }}>
        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1fr 1fr 1.2fr 120px",
          padding: "14px 20px",
          background: colors.bgSecondary,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          {["成员", "账号", "职能", "状态", "钱包额度", "操作"].map(h => (
            <span key={h} style={{ 
              fontSize: 11, 
              fontWeight: 600, 
              color: colors.textMuted,
              letterSpacing: "0.03em",
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {members.map((m, i) => {
          const rs = ROLE_STYLE[m.role] || { bg: colors.bgHover, color: colors.textMuted };
          const isCreator = m.id === TEAM_OWNER_ID;
          const online = onlineSet.has(m.id);

          return (
            <div key={m.id} style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1.2fr 120px",
              alignItems: "center",
              padding: "16px 20px",
              borderBottom: i < members.length - 1 ? `1px solid ${colors.border}` : "none",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.bgHover)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>

              {/* Name & Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: rs.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: rs.color,
                  }}>
                    {m.avatar}
                  </div>
                  <div style={{
                    position: "absolute",
                    bottom: 0, right: 0,
                    width: 11, height: 11, borderRadius: "50%",
                    background: online ? colors.success : colors.textDisabled,
                    border: `2px solid ${colors.bgSurface}`,
                  }} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{m.name}</span>
                    {isCreator && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: colors.accent,
                        color: "#000",
                      }}>
                        创始人
                      </span>
                    )}
                  </div>
                  {m.id === members[0].id && (
                    <span style={{ fontSize: 10, color: colors.textMuted }}>（我）</span>
                  )}
                </div>
              </div>

              {/* Account */}
              <span style={{ fontSize: 12, color: colors.textMuted }}>
                {m.account}
              </span>

              {/* Role - Editable */}
              <div>
                {editId === m.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <select 
                      value={editRole} 
                      onChange={e => setEditRole(e.target.value as TeamRole)}
                      style={{
                        fontSize: 12,
                        background: colors.bgSecondary,
                        border: `1px solid ${colors.borderStrong}`,
                        color: colors.textPrimary,
                        borderRadius: 8,
                        padding: "6px 10px",
                        outline: "none",
                      }}
                    >
                      {TEAM_ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button 
                        onClick={() => handleRoleChange(m.id)}
                        style={{
                          fontSize: 11,
                          color: colors.accent,
                          background: colors.accentDim,
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 10px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        保存
                      </button>
                      <button 
                        onClick={() => setEditId(null)}
                        style={{
                          fontSize: 11,
                          color: colors.textMuted,
                          background: "transparent",
                          border: "none",
                          padding: "4px 6px",
                          cursor: "pointer",
                        }}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 100,
                      background: rs.bg,
                      color: rs.color,
                      width: "fit-content",
                    }}>
                      {m.role}
                    </span>
                    {!isCreator && (
                      <button 
                        onClick={() => { setEditId(m.id); setEditRole(m.role as TeamRole); }}
                        style={{
                          background: "none",
                          border: "none",
                          color: colors.textDisabled,
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                        }}
                        title="修改职能"
                      >
                        <Settings style={{ width: 12, height: 12 }} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Online Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ 
                  width: 8, height: 8, borderRadius: "50%", 
                  background: online ? colors.success : colors.textDisabled 
                }} />
                <span style={{ 
                  fontSize: 12, 
                  color: online ? colors.success : colors.textMuted 
                }}>
                  {online ? "在线" : "离线"}
                </span>
              </div>

              {/* Wallet Allocation */}
              <div>
                {(() => {
                  const a = getAllocation(m.id);
                  const st = allocationStatus(m.id);
                  const meta = ALLOCATION_STATUS_META[st];
                  const avail = getMemberAvailable(m.id);
                  return (
                    <button
                      onClick={() => { setAllocId(m.id); setAllocInput(String(a.allocated)); setAllocErr(""); }}
                      title="点击分配额度"
                      style={{
                        display: "flex", flexDirection: "column", gap: 4, width: "100%",
                        padding: "7px 11px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                        background: colors.bgHover,
                        border: `1px solid ${st === "none" ? colors.border : `${meta.color}44`}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: a.allocated > 0 ? colors.textPrimary : colors.textMuted }}>
                          {a.allocated.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 10, color: colors.textMuted }}>已分配</span>
                        <span style={{
                          marginLeft: "auto", fontSize: 9.5, fontWeight: 600,
                          padding: "1px 6px", borderRadius: 100,
                          background: meta.bg, color: meta.color,
                        }}>
                          {meta.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 10.5, color: colors.textMuted }}>
                        剩余 {avail.toLocaleString()} · 已用 {a.used.toLocaleString()}
                      </div>
                    </button>
                  );
                })()}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                {!isCreator && (
                  removeId === m.id ? (
                    <>
                      <button 
                        onClick={() => handleRemove(m.id)}
                        style={{
                          fontSize: 11,
                          color: colors.error,
                          background: "rgba(248,113,113,0.1)",
                          border: `1px solid rgba(248,113,113,0.3)`,
                          padding: "5px 12px",
                          borderRadius: 8,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        确认
                      </button>
                      <button 
                        onClick={() => setRemoveId(null)}
                        style={{
                          fontSize: 11,
                          color: colors.textMuted,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        取消
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setRemoveId(m.id)}
                      style={{
                        fontSize: 11,
                        color: colors.textMuted,
                        background: "transparent",
                        border: `1px solid ${colors.border}`,
                        padding: "5px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = colors.error;
                        e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = colors.textMuted;
                        e.currentTarget.style.borderColor = colors.border;
                      }}
                    >
                      移除
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Legend */}
      <div style={{
        background: colors.bgSurface,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: 20,
      }}>
        <h4 style={{ 
          fontSize: 11, 
          fontWeight: 600, 
          color: colors.textMuted, 
          marginBottom: 14,
          letterSpacing: "0.05em",
          textTransform: "uppercase" as const,
        }}>
          职能说明
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px 24px" }}>
          {[
            { role: "管理员", desc: "可邀请成员、管理项目设置" },
            { role: "导演",   desc: "分镜审批与画面质量把控" },
            { role: "编剧",   desc: "剧本创作与剧情结构拆解" },
            { role: "制作人", desc: "统筹进度与资源调配" },
          ].map(item => {
            const rs = ROLE_STYLE[item.role];
            return (
              <div key={item.role}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 100,
                  background: rs.bg,
                  color: rs.color,
                }}>
                  {item.role}
                </span>
                <p style={{ 
                  fontSize: 11.5, 
                  color: colors.textMuted, 
                  marginTop: 6, 
                  lineHeight: 1.5 
                }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
        <p style={{ 
          fontSize: 11, 
          color: colors.textDisabled, 
          marginTop: 14,
          paddingTop: 14,
          borderTop: `1px solid ${colors.border}`,
        }}>
          * 当前版本各职能权限相同，后续版本将逐步开放细粒度权限配置。
        </p>
      </div>

      {/* Invite Modal */}
      <AllocationModal
        memberId={allocId}
        value={allocInput}
        error={allocErr}
        onValue={setAllocInput}
        onError={setAllocErr}
        onClose={() => { setAllocId(null); setAllocErr(""); }}
        onSubmit={() => {
          const n = Number(allocInput);
          if (!Number.isFinite(n) || n < 0) { setAllocErr("请输入有效额度"); return; }
          const ok = allocateToMember(allocId!, Math.round(n));
          if (!ok) { setAllocErr(`超出团队待分配额度 ${getAssignableBalance().toLocaleString()} 星石`); return; }
          setAllocId(null);
          setAllocErr("");
        }}
        onRevoke={() => {
          revokeAllocation(allocId!);
          setAllocId(null);
          setAllocErr("");
        }}
      />

      {showInvite && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowInvite(false); }}
        >
          <div style={{
            width: 460,
            background: colors.bgSecondary,
            border: `1px solid ${colors.borderStrong}`,
            borderRadius: 20,
            padding: 28,
            animation: "fade-up 0.25s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>
                  邀请成员
                </h2>
                <p style={{ fontSize: 12, color: colors.textMuted }}>
                  通过账号邀请对方加入工作室
                </p>
              </div>
              <button 
                onClick={() => setShowInvite(false)} 
                style={{ 
                  background: "none", 
                  border: "none", 
                  color: colors.textMuted, 
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 8 }}>
                账号（邮箱或用户名）
              </label>
              <div style={{ position: "relative" }}>
                <User style={{ 
                  position: "absolute", 
                  left: 14, 
                  top: "50%", 
                  transform: "translateY(-50%)",
                  width: 16, height: 16, 
                  color: colors.textMuted,
                  pointerEvents: "none",
                }} />
                <input
                  value={account}
                  onChange={e => setAccount(e.target.value)}
                  placeholder="对方注册时使用的邮箱或用户名"
                  style={{
                    width: "100%",
                    padding: "13px 14px 13px 40px",
                    borderRadius: 12,
                    fontSize: 14,
                    background: colors.bgSurface,
                    border: `1px solid ${colors.border}`,
                    color: colors.textPrimary,
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = colors.accent + "80")}
                  onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 10 }}>
                分配职能
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {TEAM_ROLES.map(r => {
                  const rs = ROLE_STYLE[r];
                  const isSelected = role === r;
                  return (
                    <button 
                      key={r} 
                      onClick={() => setRole(r)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.15s",
                        background: isSelected ? rs.bg : colors.bgSurface,
                        border: `1px solid ${isSelected ? rs.color + "60" : colors.border}`,
                      }}
                    >
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: isSelected ? rs.color : colors.textDisabled,
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: isSelected ? rs.color : colors.textSecondary,
                      }}>
                        {r}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowInvite(false)}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: 12,
                  fontSize: 14, fontWeight: 500,
                  background: colors.bgSurface,
                  border: `1px solid ${colors.border}`,
                  color: colors.textMuted,
                  cursor: "pointer",
                }}
              >
                取消
              </button>
              <button
                onClick={handleInvite}
                disabled={!account.trim() || sending || sent}
                style={{
                  flex: 2,
                  padding: "13px",
                  borderRadius: 12,
                  fontSize: 14, fontWeight: 700,
                  background: sent 
                    ? "rgba(34,197,94,0.15)" 
                    : "linear-gradient(135deg, #ff8c20, #ff6010)",
                  border: sent ? "1px solid rgba(34,197,94,0.4)" : "none",
                  color: sent ? colors.success : "#000",
                  opacity: !account.trim() ? 0.4 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: !account.trim() ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                }}
              >
                {sending && <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />}
                {sent && <CheckCircle style={{ width: 16, height: 16 }} />}
                {sending ? "发送中…" : sent ? "邀请已发送" : "发送邀请"}
              </button>
            </div>
            
            <p style={{ 
              fontSize: 11, 
              color: colors.textDisabled, 
              textAlign: "center", 
              marginTop: 16 
            }}>
              对方接受邀请后将出现在成员列表中
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
