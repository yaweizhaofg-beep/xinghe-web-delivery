// ═══════════════════════════════════════════════════════════════════════════════════
// AuthPage - 登录页（单登录态，1:1 还原 Figma Make AuthPage 登录部分）
// 路由：/login → AuthPage
// 注册入口 → navigate("register")
// ═══════════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import {
  Eye, EyeOff, Loader2, Sparkles, ArrowLeft,
} from "lucide-react";
import type { Nav } from "../shared";

// ─── Left Brand Panel（对齐 Make AuthPage BrandPanel） ──────────────────────────
function BrandPanel() {
  return (
    <div style={{
      position: "relative",
      flex: 1,
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 30% 30%, #3a1810 0%, #1a0c08 50%, #0a0608 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "60px 64px",
      overflow: "hidden",
    }}>
      {/* Glow blobs */}
      <div style={{
        position: "absolute", top: "20%", left: "10%", width: 480, height: 480,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(255,138,31,.35) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "0%", width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(255,80,16,.25) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Logo */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "linear-gradient(135deg,#ff8c20,#ff5010)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Sparkles style={{ width: 22, height: 22, color: "#000" }} />
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: "white", letterSpacing: "0.02em" }}>
          星核耀火
        </span>
      </div>

      {/* Hero copy */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 480 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 14px", borderRadius: 100,
          background: "rgba(255,138,31,.12)", border: "1px solid rgba(255,138,31,.3)",
          marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff8c20", boxShadow: "0 0 8px #ff8c20" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#ff8c20" }}>AI 视频创作平台 · 内测中</span>
        </div>
        <h1 style={{
          fontSize: 52, fontWeight: 800, color: "white", lineHeight: 1.1,
          marginBottom: 24, letterSpacing: "-0.025em",
        }}>
          AI 视频创作<br />
          <span style={{
            background: "linear-gradient(135deg,#ff8c20,#ffad4a 60%,#ffd47a)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>从剧本到成片</span>
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", lineHeight: 1.7, marginBottom: 40 }}>
          剧本智能解析、AI 分镜规划、批量视频生成，一站式完成你的影视创作。接入 Seedance 2.0，效率提升 10 倍。
        </p>
        {/* Stats row */}
        <div style={{ display: "flex", gap: 40 }}>
          {[["10x", "创作效率"], ["500+", "活跃创作者"], ["50+", "参考素材"]].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 2 }}>{v}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "relative", zIndex: 1, fontSize: 12, color: "rgba(255,255,255,.3)" }}>
        © 2026 星核耀火 · 让创作更简单
      </div>
    </div>
  );
}

// ─── Login Card ────────────────────────────────────────────────────────────────
function LoginCard({ navigate }: { navigate: Nav["navigate"] }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !pw) { setErr("请填写邮箱和密码"); return; }
    setLoading(true); setErr("");
    // 演示：模拟登录
    setTimeout(() => { setLoading(false); navigate("workspace"); }, 1000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 14,
    background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
    color: "white", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };
  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.borderColor = "rgba(255,138,31,.5)");
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.borderColor = "rgba(255,255,255,.1)");

  return (
    <div style={{
      width: 460, padding: 40,
      background: "#14111f",
      border: "1px solid rgba(255,255,255,.08)",
      borderRadius: 24,
      boxShadow: "0 40px 100px rgba(0,0,0,.6)",
    }}>
      {/* Title */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 6 }}>
          欢迎回来
        </h2>
        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.45)" }}>
          登录继续你的创作之旅
        </p>
      </div>

      {/* Email */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.55)", marginBottom: 8 }}>
          邮箱
        </label>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={inputStyle}
          onFocus={inputFocus}
          onBlur={inputBlur}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />
      </div>

      {/* Password */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.55)" }}>
            密码
          </label>
          <a href="#" style={{ fontSize: 11.5, color: "#ff8c20", textDecoration: "none", fontWeight: 500 }}>
            忘记密码？
          </a>
        </div>
        <div style={{ position: "relative" }}>
          <input
            value={pw}
            onChange={e => setPw(e.target.value)}
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            style={{ ...inputStyle, paddingRight: 44 }}
            onFocus={inputFocus}
            onBlur={inputBlur}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
          <button
            onClick={() => setShowPw(!showPw)}
            style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "rgba(255,255,255,.35)",
              cursor: "pointer", display: "flex",
            }}>
            {showPw
              ? <EyeOff style={{ width: 16, height: 16 }} />
              : <Eye    style={{ width: 16, height: 16 }} />}
          </button>
        </div>
      </div>

      {err && (
        <p style={{ fontSize: 12, color: "#f87171", marginBottom: 14 }}>{err}</p>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: "100%", padding: "13px", borderRadius: 12, fontSize: 14, fontWeight: 700,
          background: loading
            ? "rgba(255,138,31,.6)"
            : "linear-gradient(135deg,#ff8c20,#ff5010)",
          border: "none", color: "black",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          cursor: "pointer",
          boxShadow: loading ? "none" : "0 8px 20px rgba(255,138,31,.3)",
        }}>
        {loading && <Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />}
        {loading ? "登录中…" : "登录"}
      </button>

      <p style={{ textAlign: "center", fontSize: 12.5, color: "rgba(255,255,255,.4)", marginTop: 18 }}>
        没有账号？
        <button
          onClick={() => navigate("register")}
          style={{
            background: "none", border: "none", color: "#ff8c20",
            cursor: "pointer", fontSize: 12.5, fontWeight: 600,
          }}>
          立即注册
        </button>
      </p>
    </div>
  );
}

// ─── Auth Page（Full-screen two-column）────────────────────────────────────────
export function AuthPage({ navigate }: Nav) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", background: "#0a0912", fontFamily: "inherit",
    }}>
      {/* Left brand panel */}
      <BrandPanel />

      {/* Right form area */}
      <div style={{
        flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg, #100d1a 0%, #0a0710 100%)",
        padding: "40px 32px", position: "relative",
      }}>
        {/* Top bar */}
        <div style={{ position: "absolute", top: 24, right: 32, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
            还没有账号？
          </span>
          <button
            onClick={() => navigate("register")}
            style={{
              padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "rgba(255,138,31,.12)", border: "1px solid rgba(255,138,31,.3)",
              color: "#ff8c20", cursor: "pointer",
            }}>
            立即注册
          </button>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate("landing")}
          style={{
            position: "absolute", top: 24, left: 32,
            padding: "8px 14px", borderRadius: 10, fontSize: 12.5,
            background: "transparent", border: "1px solid rgba(255,255,255,.08)",
            color: "rgba(255,255,255,.5)",
            display: "flex", alignItems: "center", gap: 4, cursor: "pointer",
          }}>
          <ArrowLeft style={{ width: 13, height: 13 }} />
          返回首页
        </button>

        <LoginCard navigate={navigate} />
      </div>
    </div>
  );
}

export default AuthPage;
