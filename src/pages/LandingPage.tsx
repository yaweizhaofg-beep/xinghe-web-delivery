import { useState } from "react";
import {
  Check, ChevronRight, Play, Sparkles, ArrowRight,
  Zap, Users, Film,
  BookOpen, Layers,
  UserCircle2, Megaphone,
} from "lucide-react";
import { Nav } from "../shared";

// ─── Plans (per Figma Make LandingSection.tsx) ───────────────────────────────
import { plansFor, type Plan } from "../billing";

// ─── Plans ────────────────────────────────────────────────────────────────────
// 套餐价格、积分、席位与并发统一以 billing.ts 为唯一数据源，避免多处硬编码不一致。
// 展示层附加字段（排队数、标签）在此派生。
interface LandingPlan extends Omit<Plan, "hot" | "tag"> {
  period: string;
  hot: boolean;
  tag: string | null;
  members: number;
  concurrent: number;
  queue: number;
}

const QUEUE_BY_CONCURRENCY: Record<number, number> = { 4: 1000, 8: 3000 };

function toLandingPlans(scope: "personal" | "team"): LandingPlan[] {
  return plansFor(scope).map(p => ({
    ...p,
    period: "30天",
    hot: p.hot ?? false,
    tag: p.tag ?? null,
    members: p.seats,
    concurrent: p.concurrencyPerSeat,
    queue: QUEUE_BY_CONCURRENCY[p.concurrencyPerSeat] ?? 0,
  }));
}

// ─── Banner Carousel data (Figma Make) ───────────────────────────────────────
const BANNERS = [
  { label: "全新功能", title: "剧目批量生成",      sub: "20分镜一键提交，实时进度追踪",     c1: "#7c3aed", c2: "#4f46e5" },
  { label: "模型接入", title: "Seedance 2.0 Fast", sub: "最高30秒 · 50个参考素材支持",     c1: "#ea6020", c2: "#b45309" },
  { label: "正式上线", title: "AI 分镜管理",        sub: "自动拆章提取实体，费用生成前预览", c1: "#0e7490", c2: "#155e75" },
];

// (FAQ moved into FAQSection — Make source keeps the FAQ list inside the section itself)

// ─── Onboarding Modal ───────────────────────────────────────────────────────────
function OnboardingModal({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const STEPS = [
    { icon: Sparkles, title: "星核耀火是什么？", desc: "AI 视频创作平台，融合剧本解析、分镜规划、批量生图，帮你高效完成视频内容创作。", color: "#ff8c20" },
    { icon: Film, title: "怎么开始创作？", desc: "从剧本导入或剧情解析开始，AI 自动拆解分镜，批量生成视频素材。", color: "#a78bfa" },
    { icon: Users, title: "可以团队协作吗？", desc: "支持多人团队，邀请成员、分配职能、共享项目和资产，协同更高效。", color: "#34d399" },
  ];
  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onDone();
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,.85)", backdropFilter: "blur(16px)" }}>
      <div style={{ width: 480, textAlign: "center" }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center", gap: 8 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 4, borderRadius: 2, background: i === step ? "#ff8c20" : "rgba(255,255,255,.2)", transition: "all .3s" }} />
          ))}
        </div>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: `${STEPS[step].color}22`, border: `1px solid ${STEPS[step].color}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          {(() => { const Icon = STEPS[step].icon; return <Icon style={{ width: 36, height: 36, color: STEPS[step].color } as React.CSSProperties} />; })()}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 12 }}>{STEPS[step].title}</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.7, marginBottom: 36 }}>{STEPS[step].desc}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{ padding: "11px 28px", borderRadius: 12, fontSize: 14, fontWeight: 500, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", cursor: "pointer" }}>
              上一步
            </button>
          )}
          <button onClick={handleNext} style={{ padding: "11px 36px", borderRadius: 12, fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,#ff8c20,#ff5010)", border: "none", color: "black", cursor: "pointer" }}>
            {step < STEPS.length - 1 ? "下一步" : "开始创作"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Accordion ─────────────────────────────────────────────────────────────
function FAQSection({ navigate: _navigate }: { navigate: Nav["navigate"] }) {
  const [open, setOpen] = useState<number | null>(0);
  const FAQS = [
    { q: "1元等于多少星石？", a: "1元=10付费星石。实际任务价格由模型、规格和参数决定，生成前完整展示。" },
    { q: "参考图为什么影响费用？", a: "参考图需额外图像分析处理，数量和分辨率越高费用越大，提交前明细可见。" },
    { q: "任务失败如何处理？", a: "因技术原因失败时，按实际消耗处理退回，账单逐笔可查。" },
    { q: "生成文件保存多久？", a: "默认保存 90 天，团队版本可延长至 180 天。过期前系统会邮件提醒。" },
  ];
  return (
    <section style={{ maxWidth: 900, margin: "0 auto", padding: "60px 32px 80px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 60, alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "white", marginBottom: 16, lineHeight: 1.3 }}>常见问题</h2>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.45)", lineHeight: 1.7, marginBottom: 24 }}>
            还有疑问？我们整理了创作者最常关心的问题。如果没找到答案，可以查看完整使用手册或联系客服。
          </p>
          <button onClick={() => {}} style={{ padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "rgba(255,138,31,.12)", border: "1px solid rgba(255,138,31,.3)", color: "#ff8c20", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            查看使用手册 <ArrowRight style={{ width: 13, height: 13 }} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${open === i ? "rgba(255,138,31,.3)" : "rgba(255,255,255,.07)"}`, borderRadius: 14, overflow: "hidden", transition: "border-color .2s" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left"
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.85)" }}>{f.q}</span>
                <ChevronRight style={{ width: 16, height: 16, color: open === i ? "#ff8c20" : "rgba(255,255,255,.35)", transform: open === i ? "rotate(90deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
              </button>
              {open === i && (
                <div style={{ padding: "0 20px 16px" }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.7 }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, featured = false }: { plan: LandingPlan; featured?: boolean }) {
  if (featured) {
    return (
      <div style={{
        padding: "28px 24px", borderRadius: 20, position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg, #ff8c20 0%, #ff5010 100%)",
        color: "black", boxShadow: "0 20px 60px rgba(255,80,16,.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{plan.name}</div>
          {plan.tag && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(0,0,0,.2)", color: "black" }}>
              {plan.tag}
            </span>
          )}
        </div>
        <div style={{ marginBottom: 8 }}>
          {plan.price > 0 ? (
            <span style={{ fontSize: 36, fontWeight: 800 }}>¥{plan.price}<span style={{ fontSize: 14, fontWeight: 500, opacity: 0.7 }}> / {plan.period}</span></span>
          ) : (
            <span style={{ fontSize: 28, fontWeight: 800 }}>免费体验</span>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 24, opacity: 0.85 }}>
          {plan.stars.toLocaleString()} 星石 · {plan.members}人 · {plan.concurrent}并发 · 排队 {plan.queue}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
          {plan.perks.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Check style={{ width: 14, height: 14, color: "rgba(0,0,0,.85)", flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{p}</span>
            </div>
          ))}
        </div>
        <button style={{ width: "100%", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, background: "rgba(0,0,0,.25)", border: "none", color: "black", cursor: "pointer" }}>
          立即购买
        </button>
      </div>
    );
  }
  return (
    <div style={{
      padding: "24px 22px", borderRadius: 18,
      background: "rgba(255,255,255,.04)",
      border: "1px solid rgba(255,255,255,.08)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{plan.name}</div>
        {plan.tag && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(99,102,241,.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,.3)" }}>
            {plan.tag}
          </span>
        )}
      </div>
      <div style={{ marginBottom: 4 }}>
        {plan.price > 0 ? (
          <span style={{ fontSize: 26, fontWeight: 700, color: "white" }}>¥{plan.price}<span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,.4)", marginLeft: 4 }}>/ {plan.period}</span></span>
        ) : plan.price === 0 ? (
          <span style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>免费</span>
        ) : (
          <span style={{ fontSize: 20, fontWeight: 700, color: "white" }}>商务定价</span>
        )}
      </div>
      <div style={{ fontSize: 12, color: "#ff8c20", fontWeight: 600, marginBottom: 18 }}>
        {plan.stars.toLocaleString()} 星石 · {plan.members}人 · {plan.concurrent}并发
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 20 }}>
        {plan.perks.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Check style={{ width: 12, height: 12, color: "#22c55e", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>{p}</span>
          </div>
        ))}
      </div>
      <button style={{ width: "100%", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "white", cursor: "pointer" }}>
        立即购买
      </button>
    </div>
  );
}

// ─── Banner Carousel (Figma Make) ─────────────────────────────────────────────
function BannerCarousel() {
  const [i, setI] = useState(0);
  const b = BANNERS[i];
  const prev = () => setI((i - 1 + BANNERS.length) % BANNERS.length);
  const next = () => setI((i + 1) % BANNERS.length);
  return (
    <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 32px",
        background: `linear-gradient(90deg, ${b.c1}26 0%, transparent 60%, ${b.c2}26 100%)`,
        transition: "background .5s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: `${b.c1}40`, color: "white", letterSpacing: "0.04em" }}>
            {b.label}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{b.title}</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>· {b.sub}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginRight: 6 }}>{i + 1} / {BANNERS.length}</span>
          <button onClick={prev} aria-label="上一条" style={{ width: 24, height: 24, borderRadius: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronRight style={{ width: 12, height: 12, transform: "rotate(180deg)" }} />
          </button>
          <button onClick={next} aria-label="下一条" style={{ width: 24, height: 24, borderRadius: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronRight style={{ width: 12, height: 12 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Product Mock (right side panel of hero) ──────────────────────────────
function HeroProductMock() {
  return (
    <div style={{
      position: "relative",
      width: "100%",
      aspectRatio: "1.05 / 1",
      background: "linear-gradient(160deg, rgba(20,16,30,.95) 0%, rgba(12,10,18,.95) 100%)",
      border: "1px solid rgba(255,138,31,.18)",
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 30px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,138,31,.06)",
    }}>
      {/* Glow accents */}
      <div style={{ position: "absolute", top: "-20%", right: "-20%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,138,31,.25), transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-15%", left: "-15%", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,80,16,.18), transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />

      {/* Window header */}
      <div style={{ position: "relative", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginLeft: 10, fontWeight: 600 }}>星核耀火 · 漫剧工作台</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["创作", "解析", "画布", "资产"].map(t => (
            <span key={t} style={{ fontSize: 10, color: t === "创作" ? "#ff8c20" : "rgba(255,255,255,.3)", background: t === "创作" ? "rgba(255,138,31,.12)" : "transparent", padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Body grid */}
      <div style={{ position: "relative", padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 8, height: "calc(100% - 41px)" }}>
        {/* Top-left: script parsing */}
        <div style={{ background: "rgba(255,138,31,.06)", border: "1px solid rgba(255,138,31,.2)", borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <BookOpen style={{ width: 11, height: 11, color: "#ff8c20" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "white" }}>剧本拆解</span>
            <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 8, background: "rgba(34,197,94,.15)", color: "#34d399", marginLeft: "auto" }}>● 解析中</span>
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", lineHeight: 1.4 }}>《回声》 12集 · 36场景</div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
            {["S01 走廊独行", "S02 雨中对话", "S03 办公室"].map((s, i) => (
              <div key={s} style={{ fontSize: 9, color: i < 2 ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.3)", padding: "3px 6px", borderRadius: 4, background: i < 2 ? "rgba(255,138,31,.08)" : "transparent", display: "flex", alignItems: "center", gap: 4 }}>
                {i < 2 && <Check style={{ width: 8, height: 8, color: "#22c55e" }} />}
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Top-right: character / scene */}
        <div style={{ background: "rgba(167,139,250,.06)", border: "1px solid rgba(167,139,250,.2)", borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <UserCircle2 style={{ width: 11, height: 11, color: "#a78bfa" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "white" }}>角色与场景</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4, marginTop: 4 }}>
            {[
              { c: "#ff8c20", i: "主" }, { c: "#a78bfa", i: "配" }, { c: "#06b6d4", i: "配" },
              { c: "#f59e0b", i: "角" }, { c: "#ec4899", i: "角" }, { c: "#10b981", i: "角" },
            ].map((x, i) => (
              <div key={i} style={{ aspectRatio: "1/1", borderRadius: 6, background: `linear-gradient(135deg, ${x.c}40, ${x.c}10)`, border: `1px solid ${x.c}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", fontWeight: 700 }}>
                {x.i}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.4)", marginTop: "auto" }}>6个角色 · 8个场景</div>
        </div>

        {/* Bottom-left: storyboard */}
        <div style={{ background: "rgba(6,182,212,.06)", border: "1px solid rgba(6,182,212,.2)", borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Layers style={{ width: 11, height: 11, color: "#06b6d4" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "white" }}>分镜规划</span>
            <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 8, background: "rgba(255,138,31,.15)", color: "#ff8c20", marginLeft: "auto" }}>Seedance</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 3, marginTop: 4 }}>
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} style={{ aspectRatio: "16/9", borderRadius: 4, background: i < 5 ? "rgba(255,138,31,.15)" : "rgba(255,255,255,.04)", border: `1px solid ${i < 5 ? "rgba(255,138,31,.3)" : "rgba(255,255,255,.06)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i < 5 ? <Play style={{ width: 7, height: 7, color: "#ff8c20" }} /> : <span style={{ fontSize: 7, color: "rgba(255,255,255,.3)" }}>{i}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom-right: video gen */}
        <div style={{ background: "rgba(236,72,153,.06)", border: "1px solid rgba(236,72,153,.2)", borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Film style={{ width: 11, height: 11, color: "#ec4899" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "white" }}>批量生视频</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.08)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: "65%", height: "100%", background: "linear-gradient(90deg,#ff8c20,#ff5010)", borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#ff8c20" }}>65%</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: "auto" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", display: "flex", justifyContent: "space-between" }}><span>已生成</span><span style={{ color: "white", fontWeight: 600 }}>26/40</span></div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", display: "flex", justifyContent: "space-between" }}><span>本次消耗</span><span style={{ color: "#ff8c20", fontWeight: 600 }}>382 ⭐</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Landing Page ──────────────────────────────────────────────────────────
export function LandingPage({ navigate }: Nav) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [planTab, setPlanTab] = useState<"personal" | "team">("personal");
  const [featuredTab, setFeaturedTab] = useState<"hot" | "novel" | "character">("hot");
  const [categoryTab, setCategoryTab] = useState("全部");

  const CATEGORIES = ["全部", "国内精选", "国外精选", "逆袭爽剧", "都市豪门", "虐恋情仇", "古装古风", "重生复仇"];

  const FEATURED_ITEMS = [
    { rank: "01", tag: "全站头部爆剧", subTag: "男频玄幻·逆袭",  title: "逆天棋局",     badge: "全网亿级爆品", color: "#ff8c20" },
    { rank: "02", tag: "全网亿级爆品", subTag: "古装重生·虐恋", title: "她在烽火尽头加冕", badge: "全网亿级爆品", color: "#a78bfa" },
    { rank: "03", tag: "垂类头部热剧", subTag: "男频仙侠·逆袭", title: "剑域无双",     badge: "垂类头部热剧", color: "#06b6d4" },
    { rank: "04", tag: "全站头部爆剧", subTag: "民国乱世·都市", title: "旗袍风华",     badge: "全站头部爆剧", color: "#ec4899" },
    { rank: "05", tag: "年度爆款热剧", subTag: "古装·虐恋情仇", title: "双生花",       badge: "年度爆款热剧", color: "#f59e0b" },
    { rank: "06", tag: "千万级爆款剧", subTag: "都市·重生复仇", title: "重生之巅峰",   badge: "千万级爆款剧", color: "#34d399" },
    { rank: "07", tag: "年度爆款热剧", subTag: "古装·虐恋情仇", title: "倾城之恋",     badge: "年度爆款热剧", color: "#a78bfa" },
    { rank: "08", tag: "垂类头部热剧", subTag: "都市豪门·爽剧", title: "霸总的逆袭",   badge: "垂类头部热剧", color: "#ff8c20" },
    { rank: "09", tag: "全站头部爆剧", subTag: "古装武侠·国内精选", title: "山河令",   badge: "全站头部爆剧", color: "#06b6d4" },
    { rank: "10", tag: "全网亿级爆品", subTag: "现代·都市豪门", title: "她的荣耀",     badge: "全网亿级爆品", color: "#ec4899" },
  ];

  const POSTER_GRADIENT = (c: string) => `linear-gradient(160deg, ${c}aa 0%, ${c}33 50%, rgba(10,8,16,.9) 100%)`;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0912", overflow: "auto" }}>

      {/* ─── Nav ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(10,9,18,.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#ff8c20,#ff5010)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles style={{ width: 16, height: 16, color: "black" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>星核耀火</span>
          </div>
          <div className="landing-nav-center" style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {["创作", "解析", "画布", "资产", "工具"].map(t => (
              <button key={t} style={{ background: "none", border: "none", fontSize: 13, color: "rgba(255,255,255,.65)", cursor: "pointer", padding: 0, fontWeight: 500 }}>{t}</button>
            ))}
          </div>
          <div className="landing-nav-extra" style={{ display: "flex", alignItems: "center" }}>
            <button style={{ background: "none", border: "none", fontSize: 13, color: "rgba(255,255,255,.65)", cursor: "pointer", padding: 0, fontWeight: 500 }}>使用手册</button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("login")} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.7)", cursor: "pointer" }}>注册 / 登录</button>
          <button onClick={() => navigate("register")} className="btn-primary" style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", color: "black", cursor: "pointer" }}>注册会员</button>
        </div>
      </nav>

      {/* ─── Banner Carousel (Figma Make) ── */}
      <div style={{ paddingTop: 64 }}>
        <BannerCarousel />
      </div>

      {/* ─── Hero ── */}
      <div style={{ paddingTop: 64, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 32px 60px", display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 100, background: "rgba(255,138,31,.1)", border: "1px solid rgba(255,138,31,.25)", marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff8c20", boxShadow: "0 0 8px #ff8c20" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#ff8c20" }}>AI 漫剧生产平台 · 内测开放中</span>
            </div>
            <h1 style={{ fontSize: 56, fontWeight: 800, color: "white", lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.025em" }}>
              让故事成剧<br />
              <span style={{ background: "linear-gradient(135deg,#ff8c20,#ffad4a 60%,#ffd47a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>让热爱有收获</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.55)", lineHeight: 1.7, marginBottom: 36, maxWidth: 520 }}>
              一站式 AI 漫剧生产平台，贯通剧本拆解、角色与场景资产、分镜、生图、生视频和画质处理，帮助个人创作者与专业团队高效完成整部作品。
            </p>
            <div style={{ display: "flex", gap: 12, marginBottom: 40 }}>
              <button onClick={() => navigate("workspace")} className="btn-primary" style={{ padding: "14px 32px", borderRadius: 14, fontSize: 15, fontWeight: 700, border: "none", color: "black", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 12px 32px rgba(255,138,31,.3)" }}>
                <Zap style={{ width: 16, height: 16 }} />
                去工作台
              </button>
              <button onClick={() => navigate("register")} style={{ padding: "14px 32px", borderRadius: 14, fontSize: 15, fontWeight: 500, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.8)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                免费注册
              </button>
            </div>
            <div style={{ display: "flex", gap: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.06)" }}>
              {[["10x", "创作效率"], ["500+", "活跃创作者"], ["50+", "参考素材支持"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "white" }}>{v}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Right: Product Mock */}
          <div style={{ position: "relative" }}>
            <HeroProductMock />
            {/* Floating badge */}
            <div style={{ position: "absolute", top: -16, right: -16, padding: "10px 16px", borderRadius: 12, background: "rgba(20,16,30,.95)", border: "1px solid rgba(255,138,31,.3)", display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(10px)", boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}>
              <Megaphone style={{ width: 14, height: 14, color: "#ff8c20" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "white" }}>注册即送 30 星石</span>
            </div>
          </div>
        </div>

        {/* ─── Featured Works (作品展示) ── */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 32px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "white", marginBottom: 14 }}>爆款 AI 剧 · 一键改编</h2>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.45)" }}>热门题材库 + AI 改编工具，让爆款生产效率翻倍</p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
            {([
              { id: "hot", label: "爆款AI剧", icon: Film },
              { id: "novel", label: "星推小说", icon: BookOpen },
              { id: "character", label: "明星角色", icon: UserCircle2 },
            ] as const).map(t => {
              const Icon = t.icon;
              const active = featuredTab === t.id;
              return (
                <button key={t.id} onClick={() => setFeaturedTab(t.id)} style={{
                  padding: "10px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: active ? "linear-gradient(135deg,#ff8c20,#ff5010)" : "rgba(255,255,255,.04)",
                  border: `1px solid ${active ? "transparent" : "rgba(255,255,255,.08)"}`,
                  color: active ? "black" : "rgba(255,255,255,.65)",
                  display: "inline-flex", alignItems: "center", gap: 6,
                  boxShadow: active ? "0 8px 20px rgba(255,138,31,.3)" : "none",
                }}>
                  <Icon style={{ width: 14, height: 14 }} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Category filter */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginBottom: 40 }}>
            {CATEGORIES.map(c => {
              const active = categoryTab === c;
              return (
                <button key={c} onClick={() => setCategoryTab(c)} style={{
                  padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: "pointer",
                  background: active ? "rgba(255,138,31,.12)" : "transparent",
                  border: `1px solid ${active ? "rgba(255,138,31,.3)" : "rgba(255,255,255,.06)"}`,
                  color: active ? "#ff8c20" : "rgba(255,255,255,.45)",
                }}>
                  {c}
                </button>
              );
            })}
          </div>

          {/* Cards grid: 1 large + 9 small */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gridTemplateRows: "auto auto auto", gap: 14 }}>
            {/* Large featured (top-left spans 2 rows) */}
            {(() => {
              const f = FEATURED_ITEMS[0];
              return (
                <div style={{
                  gridRow: "1 / 3", gridColumn: "1",
                  position: "relative", borderRadius: 18, overflow: "hidden", cursor: "pointer",
                  background: POSTER_GRADIENT(f.color), border: `1px solid ${f.color}33`,
                  minHeight: 380, padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(255,138,31,.3)", color: "white" }}>★ {f.badge}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,.15)", color: "white" }}>{f.subTag}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 64, fontWeight: 900, color: "rgba(255,255,255,.15)", lineHeight: 1, marginBottom: 12, letterSpacing: "-0.03em" }}>{f.rank}</div>
                    <h3 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8, lineHeight: 1.2 }}>{f.title}</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginBottom: 20 }}>{f.tag}</p>
                    <button className="btn-primary" style={{ padding: "11px 22px", borderRadius: 12, fontSize: 13, fontWeight: 700, border: "none", color: "black", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      立即改编 <ArrowRight style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* 9 small cards */}
            {FEATURED_ITEMS.slice(1, 10).map((f) => (
              <div key={f.rank} style={{
                position: "relative", borderRadius: 14, overflow: "hidden", cursor: "pointer",
                background: POSTER_GRADIENT(f.color), border: `1px solid ${f.color}22`,
                padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 183,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "rgba(255,255,255,.2)", lineHeight: 1 }}>{f.rank}</div>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 10, background: "rgba(255,255,255,.15)", color: "rgba(255,255,255,.85)" }}>{f.subTag.split("·")[1] || f.subTag}</span>
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4, lineHeight: 1.3 }}>{f.title}</h4>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>{f.tag}</span>
                    <button style={{ fontSize: 11, fontWeight: 600, color: "#ff8c20", background: "rgba(255,138,31,.15)", border: "1px solid rgba(255,138,31,.3)", padding: "4px 10px", borderRadius: 8, cursor: "pointer" }}>
                      改编
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Pricing ── */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 100, background: "rgba(255,138,31,.1)", border: "1px solid rgba(255,138,31,.25)", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#ff8c20", letterSpacing: "0.06em" }}>PRICING</span>
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "white", marginBottom: 12 }}>
              选择 <span style={{ color: "#ff8c20" }}>创作能量</span> 等级
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.45)" }}>个人独立创作 · 或组建团队规模生产 · 团队钱包独立不串账</p>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 28, justifyContent: "center" }}>
            {([
              { k: "personal", l: "个人套餐" },
              { k: "team", l: `团队套餐（¥${Math.min(...plansFor("team").map(p => p.price))} 起）` },
            ] as const).map(t => {
              const active = planTab === t.k;
              return (
                <button key={t.k} onClick={() => setPlanTab(t.k)} style={{
                  padding: "9px 22px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: active ? "rgba(255,138,31,.15)" : "rgba(255,255,255,.04)",
                  border: `1px solid ${active ? "rgba(255,138,31,.35)" : "rgba(255,255,255,.07)"}`,
                  color: active ? "#ff8c20" : "rgba(255,255,255,.5)",
                }}>{t.l}</button>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, maxWidth: 1100, margin: "0 auto" }}>
            {toLandingPlans(planTab).map((p, i) => (
              <PlanCard key={i} plan={p} featured={p.hot} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32, padding: "16px 24px", borderRadius: 12, background: "rgba(255,138,31,.06)", border: "1px solid rgba(255,138,31,.2)", maxWidth: 700, margin: "32px auto 0" }}>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.6)", lineHeight: 1.6 }}>
              <span style={{ color: "#ff8c20", fontWeight: 600 }}>1 元 = 10 付费星石</span> · 实际消耗以生成确认页为准 · 价格版本 2026-10-31
            </p>
          </div>
        </section>

        <FAQSection navigate={navigate} />

        {/* ─── Pre-Footer CTA ── */}
        <section style={{ padding: "40px 32px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px", borderRadius: 20, background: "linear-gradient(135deg, rgba(255,138,31,.12), rgba(255,80,16,.08))", border: "1px solid rgba(255,138,31,.2)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 6 }}>还有疑问？</h3>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.55)" }}>查看完整使用手册，了解所有功能与最佳实践</p>
            </div>
            <button onClick={() => {}} style={{ padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 600, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", color: "white", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
              查看使用手册 <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </section>

        {/* ─── Footer ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "60px 32px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#ff8c20,#ff5010)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles style={{ width: 16, height: 16, color: "black" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>星核耀火</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginLeft: 8 }}>
              AI 漫剧生产平台，让每个故事都能成剧。
            </span>
          </div>
          <div style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>© 2026 星核耀火 · 让创作更简单</span>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>京 ICP 备 2026000001 号</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>京公网安备 11010102000000 号</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ─── Modals ── */}
      {showOnboarding && <OnboardingModal onDone={() => { setShowOnboarding(false); navigate("workspace"); }} />}
      {/* ─── Responsive Nav Styles ── */}
      <style>{`
        @media (max-width: 900px) {
          .landing-nav-center { display: none !important; }
        }
        @media (max-width: 640px) {
          .landing-nav-extra { display: none !important; }
        }
        @media (max-width: 480px) {
          .landing-hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .landing-hero-right { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
