"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Volume2,
  Brain,
  Flame,
  MessageSquare,
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Lock,
  FlaskConical,
  ShieldAlert,
  Sparkles,
  DollarSign,
} from "lucide-react";

interface AdminStats {
  generatedAt: string;
  users: {
    total: number;
    newLast7Days: number;
    newLast30Days: number;
    activeLast7Days: number;
  };
  words: {
    total: number;
    capturedToday: number;
    capturedLast7Days: number;
    capturedLast30Days: number;
    mastered: number;
    learned: number;
    learning: number;
    avgReviewsPerWord: number;
    avgLapsesPerWord: number;
  };
  audio: {
    totalWords: number;
    withAudio: number;
    pendingAudio: number;
    failedAudio: number;
    recentTotal: number;
    recentWithAudio: number;
    recentFailed: number;
    successRate: number;
  };
  reviews: {
    totalSessions: number;
    totalReviews: number;
    totalCorrect: number;
    accuracyRate: number;
    sessionsLast7Days: number;
    avgWordsPerSession: number;
  };
  gamification: {
    usersWithStreaks: number;
    avgStreak: number;
    maxStreakEver: number;
    usersWith7PlusStreak: number;
    usersWith30PlusStreak: number;
  };
  feedback: {
    total: number;
    bugReports: number;
    featureRequests: number;
    generalFeedback: number;
    last7Days: number;
    recent: Array<{
      id: string;
      type: string;
      message: string;
      pageContext: string;
      createdAt: string;
    }>;
  };
  languagePairs: Array<{
    sourceLang: string;
    targetLang: string;
    wordCount: number;
    userCount: number;
  }>;
  productKpis: {
    dau: number;
    wau: number;
    mau: number;
    sessionCompletionRate: number;
    avgSessionMinutes: number;
    medianSessionMinutes: number;
    d1Retention: number;
    d7Retention: number;
    d30Retention: number;
  };
  dataQualityNotes?: {
    testUsers: string;
    audioSuccessRate: string;
    sessionDuration: string;
    retention: string;
    languagePairs: string;
    userCounts: string;
  };
  masteryFunnel: {
    learning: number;
    learned: number;
    mastered: number;
    conversionToLearned: number;
    conversionToMastered: number;
  };
  scienceMetrics?: {
    fsrsHealth: {
      intervalDistribution: {
        under1Day: number;
        days1to7: number;
        days7to30: number;
        days30to90: number;
        over90Days: number;
      };
      avgStabilityByStatus: {
        learning: number;
        learned: number;
        mastered: number;
      };
      totalReviewedWords: number;
    };
    masteryValidation: {
      avgReviewsToLearned: number;
      avgReviewsToMastered: number;
      wordsStuckInLearning: number;
      wordsWithLapses: number;
      avgLapseCount: number;
      masteredUnder3Reviews: number;
    };
    sessionQuality: {
      under5Min: number;
      optimal5to15Min: number;
      over15Min: number;
      optimalSessionPct: number;
      avgWordsPerSession: number;
      sessionsOver25Words: number;
    };
    guardrails: {
      wordsIntervalOverYear: number;
      usersZeroAccuracy: number;
      oldWordsNeverReviewed: number;
      usersOverloaded: number;
    };
  };
  scienceNotes?: {
    fsrsHealth: string;
    masteryValidation: string;
    sessionQuality: string;
    guardrails: string;
  };
  sentences?: {
    total: number;
    generatedToday: number;
    generated7d: number;
    generated30d: number;
    used: number;
    preGenerated: number;
    usageRate: number;
    wordDistribution: {
      twoWords: number;
      threeWords: number;
      fourWords: number;
    };
    avgWordsPerSentence: number;
    exerciseTypeDistribution: {
      fillBlank: number;
      multipleChoice: number;
      typeTranslation: number;
    };
  };
  apiUsage?: {
    totalCalls: number;
    callsToday: number;
    calls7d: number;
    calls30d: number;
    callsByType: {
      translation: number;
      tts: number;
      sentenceGeneration: number;
      languageDetection: number;
    };
    callsByType7d: {
      translation: number;
      tts: number;
      sentenceGeneration: number;
    };
    tokenUsage: {
      total: number;
      prompt: number;
      completion: number;
      last7d: number;
    };
    ttsCharacters: {
      total: number;
      last7d: number;
    };
    costs: {
      totalUsd: number;
      todayUsd: number;
      last7dUsd: number;
      last30dUsd: number;
      avgPerActiveUser7d: number;
    };
    successRate: number;
    successfulCalls: number;
    failedCalls: number;
  };
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  alert,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  alert?: boolean;
}) {
  return (
    <div
      className="rounded-lg p-4 border"
      style={{
        backgroundColor: alert ? "rgba(234, 88, 12, 0.05)" : "var(--surface-card)",
        borderColor: alert ? "var(--state-hard)" : "var(--notebook-line)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {title}
          </p>
          <p
            className="text-2xl font-bold mt-1"
            style={{ color: alert ? "var(--state-hard)" : "var(--text-primary)" }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="p-2 rounded-lg"
          style={{
            backgroundColor: alert
              ? "rgba(234, 88, 12, 0.1)"
              : "var(--accent-nav-light)",
          }}
        >
          <Icon
            className="h-5 w-5"
            style={{ color: alert ? "var(--state-hard)" : "var(--accent-nav)" }}
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />
      <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
    </div>
  );
}

export default function AdminDashboard() {
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (adminSecret: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/stats", {
        headers: {
          "x-admin-secret": adminSecret,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid admin secret");
        }
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
      setIsAuthenticated(true);
      // Store in sessionStorage for refresh
      sessionStorage.setItem("adminSecret", adminSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Check for stored secret on mount
  useEffect(() => {
    const storedSecret = sessionStorage.getItem("adminSecret");
    if (storedSecret) {
      fetchStats(storedSecret);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats(secret);
  };

  const handleRefresh = () => {
    const storedSecret = sessionStorage.getItem("adminSecret");
    if (storedSecret) {
      fetchStats(storedSecret);
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--surface-page)" }}
      >
        <div
          className="w-full max-w-md p-8 rounded-lg border"
          style={{
            backgroundColor: "var(--surface-card)",
            borderColor: "var(--notebook-line)",
          }}
        >
          <div className="flex items-center justify-center mb-6">
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: "var(--accent-nav-light)" }}
            >
              <Lock className="h-8 w-8" style={{ color: "var(--accent-nav)" }} />
            </div>
          </div>
          <h1
            className="text-2xl font-bold text-center mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Admin Dashboard
          </h1>
          <p
            className="text-center mb-6"
            style={{ color: "var(--text-muted)" }}
          >
            Enter your admin secret to access platform analytics
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Admin Secret"
              className="w-full px-4 py-3 rounded-lg border mb-4"
              style={{
                backgroundColor: "var(--surface-input)",
                borderColor: "var(--notebook-line)",
                color: "var(--text-primary)",
              }}
            />
            {error && (
              <p className="text-sm mb-4" style={{ color: "var(--state-hard)" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !secret}
              className="w-full py-3 rounded-lg font-medium transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: "var(--accent-nav)",
                color: "white",
              }}
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--surface-page)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              LLYLI Admin Dashboard
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Last updated: {stats ? new Date(stats.generatedAt).toLocaleString() : "—"}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
            style={{
              borderColor: "var(--notebook-line)",
              color: "var(--text-primary)",
            }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {stats && (
          <div className="space-y-8">
            {/* Product KPIs Section - Key Business Metrics */}
            <section>
              <SectionHeader title="Product KPIs" icon={TrendingUp} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="DAU"
                  value={stats.productKpis.dau}
                  subtitle="Daily Active Users"
                  icon={Users}
                />
                <StatCard
                  title="WAU"
                  value={stats.productKpis.wau}
                  subtitle="Weekly Active Users"
                  icon={Users}
                />
                <StatCard
                  title="MAU"
                  value={stats.productKpis.mau}
                  subtitle="Monthly Active Users"
                  icon={Users}
                />
                <StatCard
                  title="DAU/MAU"
                  value={stats.productKpis.mau > 0 ? `${Math.round(100 * stats.productKpis.dau / stats.productKpis.mau)}%` : "—"}
                  subtitle="Stickiness ratio"
                  icon={TrendingUp}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <StatCard
                  title="D1 Retention"
                  value={`${stats.productKpis.d1Retention || 0}%`}
                  subtitle="Return day after signup"
                  icon={TrendingUp}
                  alert={stats.productKpis.d1Retention < 40}
                />
                <StatCard
                  title="D7 Retention"
                  value={`${stats.productKpis.d7Retention || 0}%`}
                  subtitle="Active after 1 week"
                  icon={TrendingUp}
                  alert={stats.productKpis.d7Retention < 20}
                />
                <StatCard
                  title="D30 Retention"
                  value={`${stats.productKpis.d30Retention || 0}%`}
                  subtitle="Active after 1 month"
                  icon={TrendingUp}
                  alert={stats.productKpis.d30Retention < 10}
                />
                <StatCard
                  title="Session Completion"
                  value={`${stats.productKpis.sessionCompletionRate}%`}
                  subtitle={`Median ${stats.productKpis.medianSessionMinutes || 0} min (avg ${stats.productKpis.avgSessionMinutes || 0})`}
                  icon={CheckCircle2}
                />
              </div>
            </section>

            {/* Mastery Funnel - Learning Quality */}
            <section>
              <SectionHeader title="Mastery Funnel (3-Recall Rule)" icon={Brain} />
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: "var(--surface-card)",
                  borderColor: "var(--notebook-line)",
                }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Learning */}
                  <div className="text-center flex-1">
                    <div
                      className="text-3xl font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {stats.masteryFunnel.learning.toLocaleString()}
                    </div>
                    <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Learning
                    </div>
                    <div
                      className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
                      style={{ backgroundColor: "rgba(12, 107, 112, 0.1)", color: "var(--accent-nav)" }}
                    >
                      0-1 recalls
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="hidden md:block text-2xl" style={{ color: "var(--text-muted)" }}>→</div>
                  {/* Learned */}
                  <div className="text-center flex-1">
                    <div
                      className="text-3xl font-bold"
                      style={{ color: "var(--accent-nav)" }}
                    >
                      {stats.masteryFunnel.learned.toLocaleString()}
                    </div>
                    <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Learned
                    </div>
                    <div
                      className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
                      style={{ backgroundColor: "rgba(12, 107, 112, 0.1)", color: "var(--accent-nav)" }}
                    >
                      2 recalls ({stats.masteryFunnel.conversionToLearned}%)
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="hidden md:block text-2xl" style={{ color: "var(--text-muted)" }}>→</div>
                  {/* Mastered */}
                  <div className="text-center flex-1">
                    <div
                      className="text-3xl font-bold"
                      style={{ color: "var(--state-easy)" }}
                    >
                      {stats.masteryFunnel.mastered.toLocaleString()}
                    </div>
                    <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Ready to Use
                    </div>
                    <div
                      className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
                      style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "var(--state-easy)" }}
                    >
                      3+ recalls ({stats.masteryFunnel.conversionToMastered}%)
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Science Verification - Proof the algorithms work */}
            {stats.scienceMetrics && (
              <section>
                <SectionHeader title="Science Verification" icon={FlaskConical} />
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  Validates that our research-backed approach is working correctly.
                </p>

                {/* FSRS Health */}
                <div
                  className="rounded-lg border p-4 mb-4"
                  style={{
                    backgroundColor: "var(--surface-card)",
                    borderColor: "var(--notebook-line)",
                  }}
                >
                  <h3 className="font-medium mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Brain className="h-4 w-4" style={{ color: "var(--accent-nav)" }} />
                    FSRS Algorithm Health
                  </h3>
                  <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                    Stability should increase: learning → learned → mastered
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                        {stats.scienceMetrics.fsrsHealth.avgStabilityByStatus.learning || 0}d
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>Learning</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ color: "var(--accent-nav)" }}>
                        {stats.scienceMetrics.fsrsHealth.avgStabilityByStatus.learned || 0}d
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>Learned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ color: "var(--state-easy)" }}>
                        {stats.scienceMetrics.fsrsHealth.avgStabilityByStatus.mastered || 0}d
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>Mastered</div>
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Interval distribution: {stats.scienceMetrics.fsrsHealth.intervalDistribution.under1Day} (&lt;1d) |{" "}
                    {stats.scienceMetrics.fsrsHealth.intervalDistribution.days1to7} (1-7d) |{" "}
                    {stats.scienceMetrics.fsrsHealth.intervalDistribution.days7to30} (7-30d) |{" "}
                    {stats.scienceMetrics.fsrsHealth.intervalDistribution.days30to90} (30-90d) |{" "}
                    {stats.scienceMetrics.fsrsHealth.intervalDistribution.over90Days} (&gt;90d)
                  </div>
                </div>

                {/* Session Quality */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <StatCard
                    title="Optimal Sessions"
                    value={`${stats.scienceMetrics.sessionQuality.optimalSessionPct}%`}
                    subtitle="5-15 min (ideal)"
                    icon={Clock}
                    alert={stats.scienceMetrics.sessionQuality.optimalSessionPct < 30}
                  />
                  <StatCard
                    title="Avg Reviews to Master"
                    value={stats.scienceMetrics.masteryValidation.avgReviewsToMastered || "—"}
                    subtitle="Target: 3-6"
                    icon={Brain}
                    alert={stats.scienceMetrics.masteryValidation.avgReviewsToMastered > 10}
                  />
                  <StatCard
                    title="Words Stuck"
                    value={stats.scienceMetrics.masteryValidation.wordsStuckInLearning}
                    subtitle=">30d, >5 reviews"
                    icon={AlertCircle}
                    alert={stats.scienceMetrics.masteryValidation.wordsStuckInLearning > 10}
                  />
                  <StatCard
                    title="Lapse Rate"
                    value={`${stats.scienceMetrics.masteryValidation.avgLapseCount}`}
                    subtitle="Avg lapses/word"
                    icon={TrendingUp}
                  />
                </div>

                {/* Data Quality Guardrails */}
                <div
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: stats.scienceMetrics.masteryValidation.masteredUnder3Reviews > 0 ||
                      stats.scienceMetrics.guardrails.usersZeroAccuracy > 0
                      ? "rgba(234, 88, 12, 0.05)"
                      : "var(--surface-card)",
                    borderColor: stats.scienceMetrics.masteryValidation.masteredUnder3Reviews > 0 ||
                      stats.scienceMetrics.guardrails.usersZeroAccuracy > 0
                      ? "var(--state-hard)"
                      : "var(--notebook-line)",
                  }}
                >
                  <h3 className="font-medium mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <ShieldAlert className="h-4 w-4" style={{ color: "var(--state-hard)" }} />
                    Data Quality Guardrails
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div
                        className="font-medium"
                        style={{
                          color: stats.scienceMetrics.masteryValidation.masteredUnder3Reviews > 0
                            ? "var(--state-hard)"
                            : "var(--text-primary)",
                        }}
                      >
                        {stats.scienceMetrics.masteryValidation.masteredUnder3Reviews}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Mastered &lt;3 reviews (bug)
                      </div>
                    </div>
                    <div>
                      <div
                        className="font-medium"
                        style={{
                          color: stats.scienceMetrics.guardrails.usersZeroAccuracy > 0
                            ? "var(--state-hard)"
                            : "var(--text-primary)",
                        }}
                      >
                        {stats.scienceMetrics.guardrails.usersZeroAccuracy}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Users 0% accuracy
                      </div>
                    </div>
                    <div>
                      <div className="font-medium" style={{ color: "var(--text-primary)" }}>
                        {stats.scienceMetrics.guardrails.oldWordsNeverReviewed}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Never reviewed (&gt;7d)
                      </div>
                    </div>
                    <div>
                      <div
                        className="font-medium"
                        style={{
                          color: stats.scienceMetrics.guardrails.usersOverloaded > 0
                            ? "var(--state-hard)"
                            : "var(--text-primary)",
                        }}
                      >
                        {stats.scienceMetrics.guardrails.usersOverloaded}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Users overloaded (&gt;50 due)
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Users Section */}
            <section>
              <SectionHeader title="User Growth" icon={Users} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Users"
                  value={stats.users.total}
                  icon={Users}
                />
                <StatCard
                  title="Active (7d)"
                  value={stats.users.activeLast7Days}
                  subtitle={`${Math.round((stats.users.activeLast7Days / Math.max(stats.users.total, 1)) * 100)}% of total`}
                  icon={TrendingUp}
                />
                <StatCard
                  title="New (7d)"
                  value={stats.users.newLast7Days}
                  icon={Users}
                />
                <StatCard
                  title="New (30d)"
                  value={stats.users.newLast30Days}
                  icon={Users}
                />
              </div>
            </section>

            {/* Words Section */}
            <section>
              <SectionHeader title="Word Captures" icon={BookOpen} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Words"
                  value={stats.words.total.toLocaleString()}
                  icon={BookOpen}
                />
                <StatCard
                  title="Captured Today"
                  value={stats.words.capturedToday}
                  icon={Clock}
                />
                <StatCard
                  title="Last 7 Days"
                  value={stats.words.capturedLast7Days}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Avg Reviews/Word"
                  value={stats.words.avgReviewsPerWord}
                  icon={Brain}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <StatCard
                  title="Mastered"
                  value={stats.words.mastered}
                  subtitle="Ready to use"
                  icon={CheckCircle2}
                />
                <StatCard
                  title="Learned"
                  value={stats.words.learned}
                  subtitle="In long-term memory"
                  icon={Brain}
                />
                <StatCard
                  title="Learning"
                  value={stats.words.learning}
                  subtitle="Still being learned"
                  icon={Clock}
                />
              </div>
            </section>

            {/* Audio Health Section - KEY METRIC */}
            <section>
              <SectionHeader title="Audio Generation Health" icon={Volume2} />
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                Success rate based on last 7 days only (excludes bulk imports without audio).
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Success Rate (7d)"
                  value={`${stats.audio.successRate}%`}
                  subtitle={`${stats.audio.recentWithAudio} of ${stats.audio.recentTotal} recent`}
                  icon={CheckCircle2}
                  alert={stats.audio.successRate < 85}
                />
                <StatCard
                  title="With Audio"
                  value={stats.audio.withAudio.toLocaleString()}
                  subtitle={`of ${stats.audio.totalWords.toLocaleString()} total`}
                  icon={Volume2}
                />
                <StatCard
                  title="Pending"
                  value={stats.audio.pendingAudio}
                  subtitle="Still generating"
                  icon={Clock}
                />
                <StatCard
                  title="Failed (7d)"
                  value={stats.audio.recentFailed}
                  subtitle="Need retry"
                  icon={AlertCircle}
                  alert={stats.audio.recentFailed > 0}
                />
              </div>
            </section>

            {/* Reviews Section */}
            <section>
              <SectionHeader title="Review Sessions" icon={Brain} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Sessions"
                  value={stats.reviews.totalSessions.toLocaleString()}
                  icon={Brain}
                />
                <StatCard
                  title="Total Reviews"
                  value={stats.reviews.totalReviews.toLocaleString()}
                  icon={CheckCircle2}
                />
                <StatCard
                  title="Accuracy Rate"
                  value={`${stats.reviews.accuracyRate}%`}
                  subtitle={`${stats.reviews.totalCorrect} correct`}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Sessions (7d)"
                  value={stats.reviews.sessionsLast7Days}
                  subtitle={`Avg ${stats.reviews.avgWordsPerSession} words/session`}
                  icon={Clock}
                />
              </div>
            </section>

            {/* Gamification Section */}
            <section>
              <SectionHeader title="Gamification & Streaks" icon={Flame} />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard
                  title="Users w/ Streaks"
                  value={stats.gamification.usersWithStreaks}
                  icon={Flame}
                />
                <StatCard
                  title="Avg Streak"
                  value={`${stats.gamification.avgStreak} days`}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Max Streak Ever"
                  value={`${stats.gamification.maxStreakEver} days`}
                  icon={Flame}
                />
                <StatCard
                  title="7+ Day Streaks"
                  value={stats.gamification.usersWith7PlusStreak}
                  icon={CheckCircle2}
                />
                <StatCard
                  title="30+ Day Streaks"
                  value={stats.gamification.usersWith30PlusStreak}
                  icon={CheckCircle2}
                />
              </div>
            </section>

            {/* Language Pairs */}
            <section>
              <SectionHeader title="Language Pairs" icon={Globe} />
              <div
                className="rounded-lg border overflow-hidden"
                style={{
                  backgroundColor: "var(--surface-card)",
                  borderColor: "var(--notebook-line)",
                }}
              >
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "var(--surface-page-aged)" }}>
                      <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                        Source → Target
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                        Words
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                        Users
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.languagePairs.map((lp, i) => (
                      <tr
                        key={i}
                        style={{
                          borderTop: "1px solid var(--notebook-line)",
                        }}
                      >
                        <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                          {lp.sourceLang} → {lp.targetLang}
                        </td>
                        <td className="text-right px-4 py-3" style={{ color: "var(--text-primary)" }}>
                          {lp.wordCount.toLocaleString()}
                        </td>
                        <td className="text-right px-4 py-3" style={{ color: "var(--text-muted)" }}>
                          {lp.userCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Feedback Section */}
            <section>
              <SectionHeader title="User Feedback" icon={MessageSquare} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <StatCard
                  title="Total Feedback"
                  value={stats.feedback.total}
                  icon={MessageSquare}
                />
                <StatCard
                  title="Bug Reports"
                  value={stats.feedback.bugReports}
                  icon={AlertCircle}
                  alert={stats.feedback.bugReports > 0}
                />
                <StatCard
                  title="Feature Requests"
                  value={stats.feedback.featureRequests}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Last 7 Days"
                  value={stats.feedback.last7Days}
                  icon={Clock}
                />
              </div>

              {/* Recent Feedback List */}
              {stats.feedback.recent.length > 0 && (
                <div
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: "var(--surface-card)",
                    borderColor: "var(--notebook-line)",
                  }}
                >
                  <h3 className="font-medium mb-3" style={{ color: "var(--text-primary)" }}>
                    Recent Feedback
                  </h3>
                  <div className="space-y-3">
                    {stats.feedback.recent.map((f) => (
                      <div
                        key={f.id}
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: "var(--surface-page-aged)" }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor:
                                f.type === "bug_report"
                                  ? "rgba(234, 88, 12, 0.1)"
                                  : f.type === "feature_request"
                                  ? "rgba(12, 107, 112, 0.1)"
                                  : "rgba(0, 0, 0, 0.05)",
                              color:
                                f.type === "bug_report"
                                  ? "var(--state-hard)"
                                  : f.type === "feature_request"
                                  ? "var(--accent-nav)"
                                  : "var(--text-muted)",
                            }}
                          >
                            {f.type.replace("_", " ")}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {new Date(f.createdAt).toLocaleDateString()}
                          </span>
                          {f.pageContext && (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              on {f.pageContext}
                            </span>
                          )}
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                          {f.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Sentence Generation - Core Differentiator */}
            {stats.sentences && (
              <section>
                <SectionHeader title="Sentence Generation (Core Feature)" icon={Sparkles} />
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  LLYLI&apos;s key differentiator: AI combines 2-4 words in never-repeating sentences.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <StatCard
                    title="Total Sentences"
                    value={stats.sentences.total.toLocaleString()}
                    subtitle="All time"
                    icon={Sparkles}
                  />
                  <StatCard
                    title="Generated (7d)"
                    value={stats.sentences.generated7d}
                    subtitle={`${stats.sentences.generatedToday} today`}
                    icon={Clock}
                  />
                  <StatCard
                    title="Usage Rate"
                    value={`${stats.sentences.usageRate}%`}
                    subtitle={`${stats.sentences.used.toLocaleString()} used / ${stats.sentences.preGenerated.toLocaleString()} pre-gen`}
                    icon={TrendingUp}
                    alert={stats.sentences.usageRate < 30}
                  />
                  <StatCard
                    title="Avg Words/Sentence"
                    value={stats.sentences.avgWordsPerSentence}
                    subtitle="Target: 2-4 words"
                    icon={Brain}
                  />
                </div>

                {/* Word Distribution */}
                <div
                  className="rounded-lg border p-4 mb-4"
                  style={{
                    backgroundColor: "var(--surface-card)",
                    borderColor: "var(--notebook-line)",
                  }}
                >
                  <h3 className="font-medium mb-3" style={{ color: "var(--text-primary)" }}>
                    Word Count Distribution
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {stats.sentences.wordDistribution.twoWords}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        2 words
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: "var(--accent-nav)" }}>
                        {stats.sentences.wordDistribution.threeWords}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        3 words (ideal)
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {stats.sentences.wordDistribution.fourWords}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        4 words
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exercise Type Distribution */}
                <div className="grid grid-cols-3 gap-4">
                  <StatCard
                    title="Fill-in-Blank"
                    value={stats.sentences.exerciseTypeDistribution.fillBlank}
                    icon={BookOpen}
                  />
                  <StatCard
                    title="Multiple Choice"
                    value={stats.sentences.exerciseTypeDistribution.multipleChoice}
                    icon={CheckCircle2}
                  />
                  <StatCard
                    title="Type Translation"
                    value={stats.sentences.exerciseTypeDistribution.typeTranslation}
                    icon={Brain}
                  />
                </div>
              </section>
            )}

            {/* API Usage & Costs - Operational Metrics */}
            {stats.apiUsage && (
              <section>
                <SectionHeader title="OpenAI API Usage & Costs" icon={DollarSign} />
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  Track OpenAI API consumption for cost monitoring and optimization.
                </p>

                {/* Cost Overview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <StatCard
                    title="Total Cost"
                    value={`$${stats.apiUsage.costs.totalUsd.toFixed(2)}`}
                    subtitle="All time"
                    icon={DollarSign}
                  />
                  <StatCard
                    title="Cost Today"
                    value={`$${stats.apiUsage.costs.todayUsd.toFixed(4)}`}
                    icon={Clock}
                  />
                  <StatCard
                    title="Cost (7d)"
                    value={`$${stats.apiUsage.costs.last7dUsd.toFixed(2)}`}
                    icon={TrendingUp}
                  />
                  <StatCard
                    title="Cost (30d)"
                    value={`$${stats.apiUsage.costs.last30dUsd.toFixed(2)}`}
                    subtitle="Monthly burn rate"
                    icon={TrendingUp}
                    alert={stats.apiUsage.costs.last30dUsd > 100}
                  />
                  <StatCard
                    title="Per Active User (7d)"
                    value={`$${stats.apiUsage.costs.avgPerActiveUser7d.toFixed(4)}`}
                    subtitle="Avg cost per user"
                    icon={Users}
                  />
                </div>

                {/* API Calls Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <StatCard
                    title="Total API Calls"
                    value={stats.apiUsage.totalCalls.toLocaleString()}
                    subtitle="All time"
                    icon={RefreshCw}
                  />
                  <StatCard
                    title="Calls (7d)"
                    value={stats.apiUsage.calls7d.toLocaleString()}
                    subtitle={`${stats.apiUsage.callsToday} today`}
                    icon={Clock}
                  />
                  <StatCard
                    title="Success Rate"
                    value={`${stats.apiUsage.successRate}%`}
                    subtitle={`${stats.apiUsage.failedCalls} failed`}
                    icon={CheckCircle2}
                    alert={stats.apiUsage.successRate < 95}
                  />
                  <StatCard
                    title="Tokens (7d)"
                    value={(stats.apiUsage.tokenUsage.last7d / 1000).toFixed(1) + "K"}
                    subtitle={`${(stats.apiUsage.tokenUsage.total / 1_000_000).toFixed(2)}M total`}
                    icon={Brain}
                  />
                </div>

                {/* API Usage by Type */}
                <div
                  className="rounded-lg border p-4 mb-4"
                  style={{
                    backgroundColor: "var(--surface-card)",
                    borderColor: "var(--notebook-line)",
                  }}
                >
                  <h3 className="font-medium mb-3" style={{ color: "var(--text-primary)" }}>
                    API Calls by Type (Last 7 Days)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {stats.apiUsage.callsByType7d.translation.toLocaleString()}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Translation (GPT-4o-mini)
                      </div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {stats.apiUsage.callsByType.translation.toLocaleString()} all-time
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold" style={{ color: "var(--accent-nav)" }}>
                        {stats.apiUsage.callsByType7d.tts.toLocaleString()}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Text-to-Speech (TTS-1)
                      </div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {stats.apiUsage.callsByType.tts.toLocaleString()} all-time · {(stats.apiUsage.ttsCharacters.last7d / 1000).toFixed(1)}K chars (7d)
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold" style={{ color: "var(--state-easy)" }}>
                        {stats.apiUsage.callsByType7d.sentenceGeneration.toLocaleString()}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Sentence Generation (GPT-4o-mini)
                      </div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {stats.apiUsage.callsByType.sentenceGeneration.toLocaleString()} all-time
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Reference */}
                <div
                  className="rounded-lg border p-3"
                  style={{
                    backgroundColor: "rgba(12, 107, 112, 0.03)",
                    borderColor: "var(--accent-nav-light)",
                  }}
                >
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    <strong>Pricing (Jan 2025):</strong> GPT-4o-mini: $0.150/1M input tokens, $0.600/1M output tokens | TTS-1: $15.00/1M characters
                  </p>
                </div>
              </section>
            )}

            {/* Data Quality Notes - Help PMs understand the metrics */}
            {stats.dataQualityNotes && (
              <section>
                <SectionHeader title="Understanding These Metrics" icon={AlertCircle} />
                <div
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: "rgba(12, 107, 112, 0.03)",
                    borderColor: "var(--accent-nav-light)",
                  }}
                >
                  <ul className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
                    <li><strong>Test Users:</strong> {stats.dataQualityNotes.testUsers}</li>
                    <li><strong>Audio Success Rate:</strong> {stats.dataQualityNotes.audioSuccessRate}</li>
                    <li><strong>Session Duration:</strong> {stats.dataQualityNotes.sessionDuration}</li>
                    <li><strong>Retention:</strong> {stats.dataQualityNotes.retention}</li>
                    <li><strong>Language Pairs:</strong> {stats.dataQualityNotes.languagePairs}</li>
                    <li><strong>User Counts:</strong> {stats.dataQualityNotes.userCounts}</li>
                  </ul>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
