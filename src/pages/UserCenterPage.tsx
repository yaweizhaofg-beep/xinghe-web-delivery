import { useState, useEffect, useRef } from "react";
import {
  Check, Star,
  User, Shield, Bell, CreditCard, KeyRound, LogOut,
} from "lucide-react";
import {
  Nav, USER, TEAM_MEMBERS_INIT, ROLE_STYLE,
  surface, cardShadow, textDim, textMuted, gold,
} from "../shared";
import type { PageId } from "../shared";
import {
  RECHARGE_PACKS, STARS_PER_YUAN, RECHARGE_VALID_DAYS, RECHARGE_VALID_NOTICE,
  RECHARGE_NOTICE, EXPIRED_MEMBERSHIP_NOTICE,
  DEMO_WALLETS, DEMO_RECHARGE_ORDERS, SPACE_NAMES,
  getWallet, subscribeWallet, creditRecharge, setPlanActive,
  PLANS, plansFor, storageLabel, canUpgrade,
  PLAN_PERIOD_DAYS, CONCURRENCY_DISCLAIMER,
  type SpaceKind,
} from "../billing";

type UCTab = "account" | "stars" | "recharge" | "subscription" | "team" | "security";

const UC_TABS: { id: UCTab; label: string }[] = [
  { id: "account",      label: "账号信息" },
  { id: "stars",        label: "积分记录" },
  { id: "recharge",     label: "积分充值" },
  { id: "subscription", label: "套餐订阅" },
  { id: "team",         label: "团队管理" },
  { id: "security",     label: "安全设置" },
];

/** 演示：充值到账后 365 天有效（对应 2026-10-31 演示日期） */
const RECHARGE_EXPIRY_ISO = "2027-10-31";

/** 按空间筛选充值明细 */
function ordersFor(space: SpaceKind) {
  return DEMO_RECHARGE_ORDERS.filter((o) => o.space === space);
}

const STARS_LOG = [
  { date: "2026-08-21", desc: "SB-004 · Seedance 2.0 Fast · 480p 5s",    type: "消耗", amount: -18.55 },
  { date: "2026-08-21", desc: "SB-003 · Seedance 2.0 Fast · 480p 5s",    type: "消耗", amount: -19.80 },
  { date: "2026-08-20", desc: "套餐续费 · 工作室版 30天",                    type: "到账", amount: +21000 },
  { date: "2026-08-20", desc: "SB-011 · 任务失败退回",                     type: "退回", amount: +3.20  },
  { date: "2026-08-19", desc: "SB-002 · Seedance 2.0 Fast · 480p 5s",    type: "消耗", amount: -22.10 },
  { date: "2026-08-18", desc: "SB-001 · Seedance 2.0 Fast · 480p 5s",    type: "消耗", amount: -18.55 },
  { date: "2026-08-15", desc: "注册赠送积分到账",                          type: "活动", amount: +30    },
];

// ─── Recharge Tab ──────────────────────────────────────────────────────────────
function RechargeTab({ navigate }: { navigate: (p: PageId) => void }) {
  const [space, setSpace] = useState<SpaceKind>("personal");
  const [selected, setSelected] = useState(0);
  const [customVal, setCustomVal] = useState("");
  const [method, setMethod] = useState<"alipay" | "wechat" | "card">("alipay");
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<"done" | "cancelled" | "failed" | null>(null);
  const [paid, setPaid] = useState(false);
  // 同步锁：防止重复点击导致重复到账（ref 立即生效，不受 React 批处理影响）
  const paidLock = useRef(false);

  const METHODS = [
    { id: "alipay"  as const, label: "支付宝",   icon: "💙" },
    { id: "wechat"  as const, label: "微信支付", icon: "💚" },
    { id: "card"    as const, label: "银行卡",   icon: "💳" },
  ];

  // 订阅钱包变更，充值到账后余额实时更新
  const [walletTick, setWalletTick] = useState(0);
  useEffect(() => subscribeWallet(() => setWalletTick(t => t + 1)), []);
  void walletTick;
  const wallet = getWallet(space);
  const isCustom = selected === -1;
  const pack = isCustom ? null : RECHARGE_PACKS[selected];
  const customAmount = parseFloat(customVal || "0");
  const totalPrice = isCustom ? customAmount : (pack?.price ?? 0);
  const totalStars = isCustom ? Math.floor(customAmount * STARS_PER_YUAN) : (pack?.stars ?? 0);

  const switchSpace = (s: SpaceKind) => {
    setSpace(s);
    // 切换空间时重置确认与结果态，避免串账
    setConfirming(false);
    setResult(null);
    setPaid(false);
    paidLock.current = false;
  };

  // 重复点击保护：已支付后不再重复到账
  const canPay = totalPrice > 0 && !paid;

  // ── 成功页 ──
  if (result === "done") {
    return (
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "48px 0", boxShadow: cardShadow, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          background: "rgba(255,140,32,.15)", boxShadow: "0 0 30px rgba(255,120,32,.3)" }}>
          <Star style={{ width: 30, height: 30, color: gold }} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 6 }}>充值成功</div>
        <div style={{ fontSize: 14, color: textMuted, marginBottom: 4 }}>
          <span style={{ color: gold, fontWeight: 700 }}>+{totalStars.toLocaleString()}</span> 充值积分已到账 · {SPACE_NAMES[space]}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 4 }}>
          到账起 {RECHARGE_VALID_DAYS} 天有效（至 {RECHARGE_EXPIRY_ISO}）
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.28)", marginBottom: 20 }}>
          当前余额 {wallet.rechargeStars.toLocaleString()} 充值积分 · 会员到期时间未改变（{wallet.planExpiresAt}）· 充值不增加席位、并发、存储
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => { setResult(null); setPaid(false); paidLock.current = false; setSelected(0); setCustomVal(""); }}
            style={{ padding: "9px 28px", borderRadius: 12, fontSize: 14, fontWeight: 600,
              background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)", cursor: "pointer" }}>
            继续充值
          </button>
          <button onClick={() => navigate("billing")}
            style={{ padding: "9px 28px", borderRadius: 12, fontSize: 14, fontWeight: 600,
              background: "linear-gradient(135deg,#ff8c20,#ff5010)", border: "none", color: "black", cursor: "pointer" }}>
            查看充值明细
          </button>
        </div>
      </div>
    );
  }

  // ── 取消 / 失败提示 ──
  if (result === "cancelled" || result === "failed") {
    return (
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "40px 0", boxShadow: cardShadow, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
          background: result === "failed" ? "rgba(248,113,113,.14)" : "rgba(255,255,255,.06)" }}>
          <span style={{ fontSize: 24, color: result === "failed" ? "#f87171" : "rgba(255,255,255,.5)" }}>
            {result === "failed" ? "!" : "×"}
          </span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 6 }}>
          {result === "failed" ? "支付失败" : "已取消支付"}
        </div>
        <div style={{ fontSize: 13, color: textMuted, marginBottom: 4 }}>
          {result === "failed" ? "本次支付未完成，余额未增加。" : "本次支付已取消，余额未增加。"}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.28)", marginBottom: 22 }}>
          {SPACE_NAMES[space]} 充值积分仍为 {wallet.rechargeStars.toLocaleString()}
        </div>
        <button onClick={() => { setResult(null); setPaid(false); paidLock.current = false; }}
          style={{ padding: "9px 28px", borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)", cursor: "pointer" }}>
          返回充值
        </button>
      </div>
    );
  }

  // ── 确认弹窗 ──
  if (confirming) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)", padding: 24 }}
        onClick={() => { setConfirming(false); setResult("cancelled"); }}>
        <div onClick={e => e.stopPropagation()}
          style={{ background: "#13151C", border: "1px solid rgba(255,255,255,.09)", borderRadius: 18, padding: "28px 32px",
            width: "100%", maxWidth: 460, boxShadow: "0 32px 80px rgba(0,0,0,.7)" }}>

          <div style={{ fontSize: 17, fontWeight: 700, color: "white", marginBottom: 4 }}>确认充值</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 20 }}>演示支付 · 不产生真实订单</div>

          {/* 充值目标 */}
          <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12,
            padding: "12px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginBottom: 4 }}>充值目标</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{SPACE_NAMES[space]}</div>
          </div>

          {/* 金额与积分 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            <div>
              <div style={{ fontSize: 11, color: textMuted, marginBottom: 5 }}>付款金额</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: gold }}>¥{totalPrice.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: textMuted, marginBottom: 5 }}>到账积分</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "white" }}>+{totalStars.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{RECHARGE_VALID_NOTICE}</div>
            </div>
          </div>

          {/* 会员状态 */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0",
            borderBottom: "1px solid rgba(255,255,255,.05)" }}>
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,.45)" }}>当前空间会员状态</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: wallet.planActive ? "#34d399" : "#f87171" }}>
              {wallet.planActive ? "生效中" : "已到期"} · 至 {wallet.planExpiresAt}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0",
            borderBottom: "1px solid rgba(255,255,255,.05)" }}>
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,.45)" }}>充值后余额</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>
              {(wallet.rechargeStars + totalStars).toLocaleString()} 充值积分
            </span>
          </div>

          {/* 提示 */}
          <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10,
            padding: "10px 14px", margin: "14px 0 16px", fontSize: 11.5, color: "rgba(255,255,255,.45)", lineHeight: 1.7 }}>
            {RECHARGE_NOTICE}
            {!wallet.planActive && (
              <div style={{ color: "#f87171", marginTop: 6, fontWeight: 600 }}>{EXPIRED_MEMBERSHIP_NOTICE}</div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setConfirming(false); setResult("cancelled"); }}
              style={{ flex: 1, padding: "12px 0", borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.65)" }}>
              取消
            </button>
            <button disabled={paid}
              onClick={() => {
                if (paidLock.current) return;   // 同步锁：已到账则直接忽略
                paidLock.current = true;
                setConfirming(false);
                creditRecharge(space, totalStars);
                setResult("done");
                setPaid(true);
              }}
              style={{ flex: 2, padding: "12px 0", borderRadius: 11, fontSize: 13, fontWeight: 700,
                cursor: paid ? "not-allowed" : "pointer",
                background: paid ? "rgba(255,255,255,.1)" : "linear-gradient(135deg,#ff8c20,#ff5010)",
                border: "none", color: paid ? "rgba(255,255,255,.35)" : "black" }}>
              {paid ? "已处理" : `支付¥${totalPrice.toFixed(0)}，充值${totalStars.toLocaleString()}积分`}
            </button>
          </div>

          {!wallet.planActive && (
            <button onClick={() => navigate("upgrade")}
              style={{ width: "100%", marginTop: 10, padding: "10px 0", borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.25)", color: "#f87171" }}>
              前往续费会员
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 充值目标空间 */}
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "18px 24px" }}>
        <div style={{ fontSize: 11, color: textMuted, marginBottom: 10 }}>充值目标</div>
        <div style={{ display: "flex", gap: 10 }}>
          {(["personal", "team"] as SpaceKind[]).map(s => {
            const isSel = space === s;
            return (
              <button key={s} onClick={() => switchSpace(s)}
                style={{ flex: 1, padding: "12px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                  border: `1px solid ${isSel ? "rgba(255,140,32,.45)" : "rgba(255,255,255,.08)"}`,
                  background: isSel ? "rgba(255,140,32,.08)" : "rgba(255,255,255,.03)", transition: "all .18s" }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: isSel ? gold : "rgba(255,255,255,.75)", marginBottom: 3 }}>
                  {SPACE_NAMES[s]}
                </div>
                <div style={{ fontSize: 11, color: textMuted }}>
                  充值积分 {getWallet(s).rechargeStars.toLocaleString()} · 会员 {getWallet(s).planActive ? "生效中" : "已到期"}
                </div>
              </button>
            );
          })}
        </div>
        {/* 演示开关：模拟会员到期，用于验证到期提示 */}
        <button onClick={() => setPlanActive(space, !wallet.planActive)}
          style={{ marginTop: 10, padding: "5px 12px", borderRadius: 8, fontSize: 11,
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
            color: "rgba(255,255,255,.45)", cursor: "pointer" }}>
          演示：模拟当前空间会员{wallet.planActive ? "到期" : "恢复生效"}
        </button>
      </div>

      {/* 余额 */}
      <div style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(255,140,32,.12), rgba(255,255,255,.03) 70%)",
        border: "1px solid rgba(255,140,32,.2)", borderRadius: 18, padding: "18px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: textMuted, marginBottom: 4 }}>当前余额 · {SPACE_NAMES[space]}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: gold }}>{wallet.rechargeStars.toLocaleString()}</span>
              <span style={{ fontSize: 13, color: textMuted }}>充值积分</span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.28)", marginTop: 4 }}>
              套餐积分 {wallet.planStars.toLocaleString()}（至 {wallet.planExpiresAt}） · 最近到期 {wallet.rechargeNearestExpiry}
            </div>
            {wallet.frozenStars > 0 && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.28)", marginTop: 2 }}>
                冻结 {wallet.frozenStars}（不计入可用余额）
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: textMuted }}>汇率</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.55)" }}>1 元 = {STARS_PER_YUAN} 星石</div>
          </div>
        </div>
      </div>

      {/* 会员到期提示 */}
      {!wallet.planActive && (
        <div style={{ background: "rgba(248,113,113,.09)", border: "1px solid rgba(248,113,113,.25)", borderRadius: 14, padding: "14px 18px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#f87171", marginBottom: 6 }}>{EXPIRED_MEMBERSHIP_NOTICE}</div>
          <button onClick={() => navigate("upgrade")}
            style={{ padding: "7px 18px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: "rgba(248,113,113,.12)", border: "1px solid rgba(248,113,113,.28)", color: "#f87171" }}>
            前往续费会员
          </button>
        </div>
      )}

      {/* Packages */}
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px", boxShadow: cardShadow }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 16 }}>选择充值金额</h3>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${RECHARGE_PACKS.length},1fr)`, gap: 10, marginBottom: 14 }}>
          {RECHARGE_PACKS.map((p, i) => {
            const isSel = selected === i;
            return (
              <button key={i} onClick={() => { setSelected(i); setCustomVal(""); }}
                style={{ position: "relative", padding: "16px 14px", borderRadius: 14, textAlign: "left", cursor: "pointer",
                  border: `1px solid ${isSel ? "rgba(255,140,32,.5)" : "rgba(255,255,255,.08)"}`,
                  background: isSel ? "radial-gradient(ellipse at 30% 30%, rgba(255,120,32,.18), rgba(255,255,255,.04) 70%)" : "rgba(255,255,255,.03)",
                  transition: "all .18s",
                  boxShadow: isSel ? "0 0 0 1px rgba(255,140,32,.25)" : "none" }}>
                {p.hot && (
                  <span style={{ position: "absolute", top: -10, right: 12, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    background: "linear-gradient(90deg,#ff8c20,#ff5010)", color: "black" }}>最划算</span>
                )}
                {isSel && (
                  <span style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg,#ff8c20,#ff5010)" }}>
                    <Check style={{ width: 10, height: 10, color: "black" }} />
                  </span>
                )}
                <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 2 }}>
                  {p.stars.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, color: textMuted }}> 星石</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 4 }}>到账起 {RECHARGE_VALID_DAYS} 天有效</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: isSel ? gold : "rgba(255,255,255,.6)" }}>¥{p.price}</div>
              </button>
            );
          })}
        </div>

        {/* Custom */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setSelected(-1)} style={{ flexShrink: 0, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 500,
            border: `1px solid ${selected === -1 ? "rgba(255,140,32,.4)" : "rgba(255,255,255,.08)"}`,
            background: selected === -1 ? "rgba(255,140,32,.08)" : "rgba(255,255,255,.03)",
            color: selected === -1 ? gold : textMuted, cursor: "pointer" }}>
            自定义金额
          </button>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: textMuted }}>¥</span>
            <input type="number" min="1" placeholder={`输入金额（1 元 = ${STARS_PER_YUAN} 星石）`} value={customVal}
              onChange={e => { setCustomVal(e.target.value); setSelected(-1); }}
              style={{ width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 12, padding: "10px 14px 10px 28px", fontSize: 13, color: "white", outline: "none", boxSizing: "border-box" }} />
            {isCustom && customVal && (
              <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: textMuted }}>
                ≈ {totalStars.toLocaleString()} 星石
              </span>
            )}
          </div>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 12, lineHeight: 1.6 }}>
          充值仅增加积分，不开通或延长会员；生成任务需有效会员。充值按 1:{STARS_PER_YUAN} 实时计算，不设赠送活动。
        </div>
      </div>

      {/* Payment method */}
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>支付方式</h3>
        <div style={{ display: "flex", gap: 10 }}>
          {METHODS.map(m => {
            const isSel = method === m.id;
            return (
              <button key={m.id} onClick={() => setMethod(m.id)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                borderRadius: 12, border: `1px solid ${isSel ? "rgba(255,140,32,.4)" : "rgba(255,255,255,.08)"}`,
                background: isSel ? "rgba(255,140,32,.07)" : "rgba(255,255,255,.03)", cursor: "pointer" }}>
                <span style={{ fontSize: 18 }}>{m.icon}</span>
                <span style={{ fontSize: 13, fontWeight: isSel ? 600 : 400, color: isSel ? "rgba(255,255,255,.9)" : textMuted }}>{m.label}</span>
                {isSel && <Check style={{ width: 13, height: 13, color: gold, marginLeft: "auto" }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div style={{ background: "radial-gradient(ellipse at 80% 0%, rgba(255,120,32,.1), rgba(255,255,255,.03) 65%)",
        border: "1px solid rgba(255,140,32,.2)", borderRadius: 18, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 4 }}>本次充值</div>
            <span style={{ fontSize: 26, fontWeight: 800, color: "white" }}>+{(totalStars || 0).toLocaleString()}</span>
            <span style={{ fontSize: 13, color: textMuted, marginLeft: 6 }}>充值积分</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 4 }}>实付金额</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: gold }}>¥{(totalPrice || 0).toFixed(2)}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,.35)",
          paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)", marginBottom: 16 }}>
          <span>充值后余额 · {SPACE_NAMES[space]}</span>
          <span style={{ color: "rgba(255,255,255,.55)", fontWeight: 500 }}>
            {(wallet.rechargeStars + (totalStars || 0)).toLocaleString()} 充值积分
          </span>
        </div>
        <button disabled={!canPay} onClick={() => setConfirming(true)}
          style={{ width: "100%", height: 48, borderRadius: 13, fontSize: 15, fontWeight: 700,
            background: "linear-gradient(135deg,#ff8c20,#ff5010)", border: "none",
            color: "black", opacity: canPay ? 1 : 0.35, cursor: canPay ? "pointer" : "not-allowed" }}>
          支付¥{(totalPrice || 0).toFixed(0)}，充值{(totalStars || 0).toLocaleString()}积分
        </button>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,.2)", textAlign: "center", marginTop: 10 }}>
          演示支付 · 不产生真实订单 · 充值积分到账起 {RECHARGE_VALID_DAYS} 天有效
        </p>
      </div>

      {/* History */}
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>
          充值明细 · {SPACE_NAMES[space]}
        </h3>
        {ordersFor(space).map((row, i, arr) => (
          <div key={row.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0",
            borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)", marginBottom: 2 }}>
                {row.stars.toLocaleString()} 充值积分
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>
                {row.creditedAt} · {row.spaceName} · 至 {row.expiresAt}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: gold }}>¥{row.amount.toFixed(2)}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: row.status === "成功" ? "#34d399" : "#fbbf24" }}>{row.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stars Log Tab ─────────────────────────────────────────────────────────────
function StarsLogTab() {
  const typeColor = (t: string) => t === "到账" || t === "退回" || t === "活动" ? "#34d399" : t === "消耗" ? "#f87171" : "rgba(255,255,255,.4)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px" }}>
        <div style={{ fontSize: 12, color: textMuted, marginBottom: 10 }}>当前余额 · 个人空间</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {([
            ["套餐可用积分", `${DEMO_WALLETS.personal.planStars.toLocaleString()}`, `至 ${DEMO_WALLETS.personal.planExpiresAt}`],
            ["充值可用积分", `${DEMO_WALLETS.personal.rechargeStars.toLocaleString()}`, `最近到期 ${DEMO_WALLETS.personal.rechargeNearestExpiry}`],
            ["冻结积分", `${DEMO_WALLETS.personal.frozenStars.toLocaleString()}`, "不计入可用余额"],
          ] as const).map(([l, v, note]) => (
            <div key={l} style={{ background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.35)", marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: gold, marginBottom: 2 }}>{v}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>{note}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>全部记录</h3>
        {STARS_LOG.map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            padding: "12px 0", borderBottom: i < STARS_LOG.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.75)", marginBottom: 3 }}>{row.desc}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{row.date}</div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: typeColor(row.type), flexShrink: 0, marginLeft: 16 }}>
              {row.amount > 0 ? "+" : ""}{row.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Team Tab (Read-only) ──────────────────────────────────────────────────────
function TeamTab() {
  const localSurface = "#12101a";
  const localBdr = "rgba(255,255,255,.07)";
  return (
    <div>
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px", marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 3 }}>{USER.team}</h3>
        <p style={{ fontSize: 12, color: textMuted }}>完整团队管理请前往侧边栏「团队管理」</p>
      </div>
      <div style={{ background: localSurface, border: `1px solid ${localBdr}`, borderRadius: 16, overflow: "hidden" }}>
        {TEAM_MEMBERS_INIT.map((m, i) => {
          const rs = ROLE_STYLE[m.role] ?? ROLE_STYLE["制作人"];
          return (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px",
              borderBottom: i < TEAM_MEMBERS_INIT.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: rs.bg, color: rs.color, fontSize: 13, fontWeight: 700 }}>{m.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "white" }}>{m.name}</div>
                <div style={{ fontSize: 11, color: textMuted }}>{m.account}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 100, background: rs.bg, color: rs.color }}>{m.role}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Subscription Tab ─────────────────────────────────────────────────────────
function SubscriptionTab({ navigate }: { navigate: (p: PageId) => void }) {
  const [space, setSpace] = useState<SpaceKind>("personal");
  const wallet = DEMO_WALLETS[space];
  const currentPlan = PLANS.find((p) => p.id === wallet.planId) ?? PLANS[0];
  const alternatives = plansFor(currentPlan.scope).filter((p) => p.id !== currentPlan.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 空间切换 */}
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "16px 24px" }}>
        <div style={{ fontSize: 11, color: textMuted, marginBottom: 10 }}>订阅空间</div>
        <div style={{ display: "flex", gap: 10 }}>
          {(["personal", "team"] as SpaceKind[]).map(s => {
            const isSel = space === s;
            const w = DEMO_WALLETS[s];
            const p = PLANS.find(x => x.id === w.planId);
            return (
              <button key={s} onClick={() => setSpace(s)}
                style={{ flex: 1, padding: "12px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                  border: `1px solid ${isSel ? "rgba(255,140,32,.45)" : "rgba(255,255,255,.08)"}`,
                  background: isSel ? "rgba(255,140,32,.08)" : "rgba(255,255,255,.03)", transition: "all .18s" }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: isSel ? gold : "rgba(255,255,255,.75)", marginBottom: 3 }}>
                  {SPACE_NAMES[s]}
                </div>
                <div style={{ fontSize: 11, color: textMuted }}>
                  {p?.name} · 至 {w.planExpiresAt}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 当前方案 */}
      <div style={{ background: "linear-gradient(135deg,rgba(255,138,32,.12),rgba(255,255,255,.03))",
        border: "1px solid rgba(255,138,32,.25)", borderRadius: 18, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: textMuted, marginBottom: 6 }}>当前方案</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 2 }}>{currentPlan.name}</div>
            <div style={{ fontSize: 12, color: textMuted }}>
              ¥{currentPlan.price} / {PLAN_PERIOD_DAYS}天 · 剩余 {USER.planDaysLeft} 天 · 至 {wallet.planExpiresAt}
            </div>
          </div>
          <span style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
            background: wallet.planActive ? "rgba(255,138,32,.2)" : "rgba(248,113,113,.2)",
            color: wallet.planActive ? "#ff8c20" : "#f87171",
            border: `1px solid ${wallet.planActive ? "rgba(255,138,32,.3)" : "rgba(248,113,113,.3)"}` }}>
            {wallet.planActive ? "生效中" : "已到期"}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)" }}>
          {([
            [currentPlan.stars.toLocaleString(), "套餐积分"],
            [`${currentPlan.seats}`, "席位"],
            [`${currentPlan.concurrencyPerSeat}`, "每席位并发"],
            [storageLabel(currentPlan), "总存储"],
          ] as const).map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: gold }}>{v}</div>
              <div style={{ fontSize: 11, color: textMuted }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.28)", marginTop: 12 }}>
          {CONCURRENCY_DISCLAIMER.replace("{N}", String(currentPlan.concurrencyPerSeat))}
        </div>
      </div>

      {/* 积分构成 */}
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim, marginBottom: 14 }}>积分构成 · {SPACE_NAMES[space]}</h3>
        {([
          ["套餐可用积分", `${wallet.planStars.toLocaleString()}`, `至 ${wallet.planExpiresAt}，随本周期结束失效`],
          ["充值可用积分", `${wallet.rechargeStars.toLocaleString()}`, `最近到期 ${wallet.rechargeNearestExpiry}`],
          ["冻结积分", `${wallet.frozenStars.toLocaleString()}`, "不计入可用余额"],
        ] as const).map(([l, v, note], i, arr) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0",
            borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)" }}>{l}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{note}</div>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: l === "冻结积分" ? "rgba(255,255,255,.5)" : gold }}>
              {v}
            </span>
          </div>
        ))}
      </div>

      {/* 其他方案 */}
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: textDim }}>其他方案</h3>
          <button onClick={() => navigate("upgrade")}
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", cursor: "pointer" }}>
            前往套餐页
          </button>
        </div>
        {alternatives.map((p, i, arr) => {
          const upgradable = canUpgrade(currentPlan.id, p.id);
          const lower = p.price < currentPlan.price;
          return (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0",
              borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "white", marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: textMuted }}>
                  {p.stars.toLocaleString()} 积分 · {p.seats}人席位 · 每席位 {p.concurrencyPerSeat} 并发 · {storageLabel(p)}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.5)" }}>¥{p.price}</span>
                <button onClick={() => navigate("upgrade")}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: upgradable ? "rgba(255,140,32,.15)" : "rgba(255,255,255,.06)",
                    border: `1px solid ${upgradable ? "rgba(255,140,32,.3)" : "rgba(255,255,255,.1)"}`,
                    color: upgradable ? gold : "rgba(255,255,255,.6)", cursor: "pointer" }}>
                  {upgradable ? "立即升级" : lower ? "下周期降级" : "购买"}
                </button>
              </div>
            </div>
          );
        })}
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 12, lineHeight: 1.6 }}>
          提前续费接续下一周期，新周期开始发新积分，不延长旧积分有效期 · 降级下周期生效，当期不退差价。
        </div>
      </div>
    </div>
  );
}

// ─── Security Tab ──────────────────────────────────────────────────────────────
function SecurityTab() {
  const [editingNick, setEditingNick] = useState(false);
  const [nickname, setNickname] = useState(USER.name);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[
        { icon: User,       label: "头像与昵称",  value: USER.name,   action: "编辑", onAction: () => setEditingNick(!editingNick) },
        { icon: KeyRound,   label: "登录密码",    value: "••••••••",  action: "修改" },
        { icon: Bell,       label: "通知设置",    value: "已开启",     action: "管理" },
        { icon: CreditCard, label: "支付方式",    value: "支付宝 ·•2631", action: "管理" },
        { icon: Shield,     label: "隐私设置",    value: "正常",       action: "查看" },
      ].map((item, i) => (
        <div key={i} style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <item.icon style={{ width: 16, height: 16, color: "rgba(255,255,255,.5)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "white", marginBottom: 2 }}>{item.label}</div>
            {editingNick && item.label === "头像与昵称" ? (
              <input value={nickname} onChange={e => setNickname(e.target.value)} autoFocus
                style={{ fontSize: 13, color: textMuted, background: "transparent", border: "none", outline: "none", padding: 0, width: "100%" }} />
            ) : (
              <div style={{ fontSize: 13, color: textMuted }}>{item.value}</div>
            )}
          </div>
          <button onClick={item.onAction}
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", cursor: "pointer" }}>
            {editingNick && item.label === "头像与昵称" ? "保存" : item.action}
          </button>
        </div>
      ))}
      <button style={{ marginTop: 8, padding: "14px", borderRadius: 14, fontSize: 14, fontWeight: 600, background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.2)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <LogOut style={{ width: 16, height: 16 }} />
        退出登录
      </button>
    </div>
  );
}

// ─── Account Tab ──────────────────────────────────────────────────────────────
function AccountTab({ navigate }: Nav) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Profile card */}
      <div style={{ background: surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#ff8a1f,#ffad4a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "black", flexShrink: 0 }}>
            {USER.avatar}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 4 }}>{USER.name}</div>
            <div style={{ fontSize: 12, color: textMuted }}>{USER.team} · {USER.plan}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { label: "并发任务", value: `${USER.concurrent.used}/${USER.concurrent.total}` },
            { label: "排队任务", value: USER.queue.used },
            { label: "套餐剩余", value: `${USER.planDaysLeft}天` },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,.04)", borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => navigate("workspace")} style={{ padding: "13px", borderRadius: 14, fontSize: 14, fontWeight: 600,
        background: "linear-gradient(135deg,#ff8c20,#ff5010)", border: "none", color: "black", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        返回工作空间
      </button>
    </div>
  );
}

// ─── Main UserCenterPage ──────────────────────────────────────────────────────
export default function UserCenterPage({ navigate }: Nav) {
  const [tab, setTab] = useState<UCTab>("account");
  const bdr = "rgba(255,255,255,.1)";

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left sidebar tabs */}
      <div style={{ width: 200, borderRight: `1px solid ${bdr}`, padding: "20px 12px", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.3)", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 10px 10px" }}>设置</div>
        {UC_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
            background: tab === t.id ? "rgba(255,138,31,.1)" : "transparent",
            color: tab === t.id ? "#ff8a1f" : "rgba(255,255,255,.5)",
            transition: "all .15s",
          }}>
            <span style={{ fontSize: 13, fontWeight: tab === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
        <div style={{ maxWidth: 640 }}>
          {tab === "account"      && <AccountTab navigate={navigate} />}
          {tab === "stars"        && <StarsLogTab />}
          {tab === "recharge"     && <RechargeTab navigate={navigate} />}
          {tab === "subscription" && <SubscriptionTab navigate={navigate} />}
          {tab === "team"         && <TeamTab />}
          {tab === "security"     && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}
