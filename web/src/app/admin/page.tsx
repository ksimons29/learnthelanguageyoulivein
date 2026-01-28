"use client";

import { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  Lock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Flame,
  BookOpen,
  Brain,
  Info,
  MessageSquare,
  Bug,
  Lightbulb,
  HelpCircle,
  FileText,
  Volume2,
} from "lucide-react";

// Metric explanations for non-technical users
const METRIC_EXPLANATIONS = {
  dau: {
    what: "Users who opened the app today",
    interpret: "More = more engaged users. Compare to previous weeks.",
    action: "Worry if <50% of signups become active. Check onboarding.",
  },
  d7Retention: {
    what: "% of users still active 7 days after signup",
    interpret: "35%+ is excellent, 20-35% is okay, <20% is poor.",
    action: "Below 20%: Review onboarding, early wins, and notifications.",
  },
  sessions: {
    what: "Total review sessions completed this week",
    interpret: "Healthy users review 3-5x per week. More sessions = habit forming.",
    action: "Low sessions + high DAU = users aren't reviewing. Check reminders.",
  },
  cost: {
    what: "OpenAI API spend for translations and audio",
    interpret: "$0.05-0.10/user is healthy. Spikes mean heavy usage or waste.",
    action: "Above $0.15/user: Check for retry loops or sentence regeneration bugs.",
  },
  words: {
    what: "New words captured this week across all users",
    interpret: "5-10 words/active user/week is healthy engagement.",
    action: "Very low: Users aren't capturing. Check capture UX or prompts.",
  },
  streaks: {
    what: "Users with consecutive daily activity",
    interpret: "Streaks = habit formation. More streaks = stickier product.",
    action: "Low streaks + high DAU = users are sporadic. Add streak incentives.",
  },
};

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
    mastered: number;
    learned: number;
    learning: number;
  };
  audio: {
    successRate: number;
    recentFailed: number;
  };
  reviews: {
    totalSessions: number;
    sessionsLast7Days: number;
    accuracyRate: number;
  };
  gamification: {
    usersWithStreaks: number;
    avgStreak: number;
  };
  productKpis: {
    dau: number;
    wau: number;
    mau: number;
    d1Retention: number;
    d7Retention: number;
    d30Retention: number;
  };
  apiUsage?: {
    costs: {
      last7dUsd: number;
      avgPerActiveUser7d: number;
    };
    successRate: number;
  };
  feedback: {
    bugReports: number;
    last7Days: number;
    recent: Array<{
      id: string;
      type: string;
      message: string;
      pageContext: string | null;
      createdAt: string;
    }>;
  };
}

// Metric explanation component
function MetricInfo({ metric }: { metric: keyof typeof METRIC_EXPLANATIONS }) {
  const [expanded, setExpanded] = useState(false);
  const info = METRIC_EXPLANATIONS[metric];

  return (
    <div className="mt-2 pt-2 border-t border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
      >
        <Info className="h-3 w-3" />
        <span>{expanded ? "Hide info" : "What's this?"}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-1.5 text-xs">
          <p className="text-[var(--text-secondary)]">
            <span className="font-medium">What:</span> {info.what}
          </p>
          <p className="text-[var(--text-secondary)]">
            <span className="font-medium">Read:</span> {info.interpret}
          </p>
          <p className="text-amber-700 bg-amber-50 rounded px-1.5 py-1">
            <span className="font-medium">⚠️ Act:</span> {info.action}
          </p>
        </div>
      )}
    </div>
  );
}

// Health status calculation
function getHealthStatus(stats: AdminStats): {
  status: "healthy" | "warning" | "critical";
  issues: string[];
} {
  const issues: string[] = [];

  // Critical checks
  if (stats.audio.successRate < 80) issues.push("Audio generation failing");
  if ((stats.apiUsage?.successRate || 100) < 90) issues.push("API errors high");
  if (stats.feedback.bugReports > 5) issues.push(`${stats.feedback.bugReports} bug reports`);

  // Warning checks
  if (stats.productKpis.d7Retention < 20) issues.push("D7 retention low");
  if (stats.audio.recentFailed > 0) issues.push(`${stats.audio.recentFailed} failed audio`);
  if ((stats.apiUsage?.costs.avgPerActiveUser7d || 0) > 0.15)
    issues.push("Cost per user high");

  if (issues.length === 0) return { status: "healthy", issues: [] };
  if (issues.some((i) => i.includes("failing") || i.includes("errors high")))
    return { status: "critical", issues };
  return { status: "warning", issues };
}

export default function AdminDashboard() {
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchStats = async (adminSecret: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/stats", {
        headers: { "x-admin-secret": adminSecret },
      });
      if (!response.ok) {
        throw new Error(response.status === 401 ? "Invalid admin secret" : "Failed to fetch");
      }
      const data = await response.json();
      setStats(data);
      setIsAuthenticated(true);
      sessionStorage.setItem("adminSecret", adminSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedSecret = sessionStorage.getItem("adminSecret");
    if (storedSecret) fetchStats(storedSecret);
  }, []);

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--surface-page)]">
        <div className="w-full max-w-sm p-8 rounded-xl border bg-white shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-[var(--accent-nav-light)]">
              <Lock className="h-6 w-6 text-[var(--accent-nav)]" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center mb-6">LLYLI Dashboard</h1>
          <form onSubmit={(e) => { e.preventDefault(); fetchStats(secret); }}>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Admin Secret"
              className="w-full px-4 py-3 rounded-lg border mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--accent-nav)]"
            />
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading || !secret}
              className="w-full py-3 rounded-lg font-medium bg-[var(--accent-nav)] text-white disabled:opacity-50"
            >
              {loading ? "..." : "Access"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const health = stats ? getHealthStatus(stats) : null;

  return (
    <div className="min-h-screen p-4 md:p-6 bg-[var(--surface-page)]">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">LLYLI</h1>
            <p className="text-xs text-[var(--text-muted)]">
              {stats ? new Date(stats.generatedAt).toLocaleString() : ""}
            </p>
          </div>
          <button
            onClick={() => fetchStats(sessionStorage.getItem("adminSecret") || "")}
            disabled={loading}
            className="p-2 rounded-lg border hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {stats && health && (
          <div className="space-y-4">
            {/* Health Status Banner */}
            <div
              className={`p-4 rounded-xl border-2 ${
                health.status === "healthy"
                  ? "bg-green-50 border-green-200"
                  : health.status === "warning"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {health.status === "healthy" ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle
                    className={`h-6 w-6 ${
                      health.status === "critical" ? "text-red-600" : "text-amber-600"
                    }`}
                  />
                )}
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {health.status === "healthy"
                      ? "All Systems Healthy"
                      : health.status === "warning"
                      ? "Needs Attention"
                      : "Critical Issues"}
                  </p>
                  {health.issues.length > 0 && (
                    <p className="text-sm text-[var(--text-muted)]">
                      {health.issues.join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex gap-2">
              <a
                href="https://llyili.sentry.io/issues/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border bg-white hover:border-[var(--accent-nav)] transition-colors"
              >
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Errors</span>
                <ExternalLink className="h-3 w-3 text-[var(--text-muted)]" />
              </a>
              <a
                href="https://github.com/ksimons29/learnthelanguageyoulivein/issues?q=is%3Aopen+label%3AP0-critical%2CP1-high"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border bg-white hover:border-[var(--accent-nav)] transition-colors"
              >
                <CheckCircle2 className="h-4 w-4 text-[var(--accent-nav)]" />
                <span className="text-sm font-medium">Issues</span>
                <ExternalLink className="h-3 w-3 text-[var(--text-muted)]" />
              </a>
            </div>

            {/* Key Metrics - 6 numbers */}
            <div className="grid grid-cols-2 gap-3">
              {/* Users */}
              <div className="p-4 rounded-xl border bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-[var(--accent-nav)]" />
                  <span className="text-xs text-[var(--text-muted)]">Daily Active</span>
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {stats.productKpis.dau}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {stats.users.newLast7Days} new this week
                </p>
                <MetricInfo metric="dau" />
              </div>

              {/* Retention */}
              <div className="p-4 rounded-xl border bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-[var(--accent-nav)]" />
                  <span className="text-xs text-[var(--text-muted)]">D7 Retention</span>
                </div>
                <p
                  className={`text-2xl font-bold ${
                    stats.productKpis.d7Retention >= 35
                      ? "text-green-600"
                      : stats.productKpis.d7Retention >= 20
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {stats.productKpis.d7Retention}%
                </p>
                <p className="text-xs text-[var(--text-muted)]">Target: 35%</p>
                <MetricInfo metric="d7Retention" />
              </div>

              {/* Sessions */}
              <div className="p-4 rounded-xl border bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-[var(--accent-nav)]" />
                  <span className="text-xs text-[var(--text-muted)]">Sessions (7d)</span>
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {stats.reviews.sessionsLast7Days}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {stats.reviews.accuracyRate}% accuracy
                </p>
                <MetricInfo metric="sessions" />
              </div>

              {/* Cost */}
              <div className="p-4 rounded-xl border bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-[var(--accent-nav)]" />
                  <span className="text-xs text-[var(--text-muted)]">Cost (7d)</span>
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  ${(stats.apiUsage?.costs.last7dUsd || 0).toFixed(2)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  ${(stats.apiUsage?.costs.avgPerActiveUser7d || 0).toFixed(3)}/user
                </p>
                <MetricInfo metric="cost" />
              </div>

              {/* Words */}
              <div className="p-4 rounded-xl border bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-[var(--accent-nav)]" />
                  <span className="text-xs text-[var(--text-muted)]">Words Captured</span>
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {stats.words.capturedLast7Days}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {stats.words.total.toLocaleString()} total
                </p>
                <MetricInfo metric="words" />
              </div>

              {/* Streaks */}
              <div className="p-4 rounded-xl border bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-[var(--text-muted)]">Active Streaks</span>
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {stats.gamification.usersWithStreaks}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Avg {stats.gamification.avgStreak} days
                </p>
                <MetricInfo metric="streaks" />
              </div>
            </div>

            {/* User Feedback List */}
            <div className="p-4 rounded-xl border bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[var(--accent-nav)]" />
                  <h3 className="font-medium text-[var(--text-primary)]">User Feedback</h3>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {stats.feedback.last7Days} this week
                </span>
              </div>
              {stats.feedback.recent && stats.feedback.recent.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                  {stats.feedback.recent.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {item.type === "bug_report" && (
                            <Bug className="h-4 w-4 text-red-500" />
                          )}
                          {item.type === "feature_request" && (
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                          )}
                          {item.type === "general_feedback" && (
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                          )}
                          {item.type === "word_issue" && (
                            <FileText className="h-4 w-4 text-purple-500" />
                          )}
                          {item.type === "audio_issue" && (
                            <Volume2 className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                item.type === "bug_report"
                                  ? "bg-red-100 text-red-700"
                                  : item.type === "feature_request"
                                  ? "bg-amber-100 text-amber-700"
                                  : item.type === "word_issue"
                                  ? "bg-purple-100 text-purple-700"
                                  : item.type === "audio_issue"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {item.type === "bug_report"
                                ? "Bug"
                                : item.type === "feature_request"
                                ? "Feature"
                                : item.type === "word_issue"
                                ? "Word Issue"
                                : item.type === "audio_issue"
                                ? "Audio Issue"
                                : "Feedback"}
                            </span>
                            {item.pageContext && (
                              <span className="text-xs text-[var(--text-muted)]">
                                on {item.pageContext}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[var(--text-primary)] break-words">
                            {item.message}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {new Date(item.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-[var(--text-muted)]">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No feedback yet</p>
                  <p className="text-xs">Users can submit feedback via the feedback button</p>
                </div>
              )}
            </div>

            {/* Expand for Details */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-[var(--text-muted)]">
                {showDetails ? "Hide Details" : "Show Details"}
              </span>
              {showDetails ? (
                <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
              )}
            </button>

            {/* Detailed Metrics (collapsed by default) */}
            {showDetails && (
              <div className="space-y-4 pt-2">
                {/* Retention Breakdown */}
                <div className="p-4 rounded-xl border bg-white">
                  <h3 className="font-medium mb-3 text-[var(--text-primary)]">Retention</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        {stats.productKpis.d1Retention}%
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Day 1</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        {stats.productKpis.d7Retention}%
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Day 7</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        {stats.productKpis.d30Retention}%
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Day 30</p>
                    </div>
                  </div>
                </div>

                {/* User Funnel */}
                <div className="p-4 rounded-xl border bg-white">
                  <h3 className="font-medium mb-3 text-[var(--text-primary)]">Users</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        {stats.productKpis.dau}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">DAU</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        {stats.productKpis.wau}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">WAU</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        {stats.productKpis.mau}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">MAU</p>
                    </div>
                  </div>
                </div>

                {/* Mastery Funnel */}
                <div className="p-4 rounded-xl border bg-white">
                  <h3 className="font-medium mb-3 text-[var(--text-primary)]">
                    Mastery Funnel
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        {stats.words.learning.toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Learning</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[var(--accent-nav)]">
                        {stats.words.learned.toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Learned</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {stats.words.mastered.toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Mastered</p>
                    </div>
                  </div>
                </div>

                {/* System Health */}
                <div className="p-4 rounded-xl border bg-white">
                  <h3 className="font-medium mb-3 text-[var(--text-primary)]">
                    System Health
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Audio Success Rate</span>
                      <span
                        className={`font-medium ${
                          stats.audio.successRate >= 95 ? "text-green-600" : "text-amber-600"
                        }`}
                      >
                        {stats.audio.successRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">API Success Rate</span>
                      <span
                        className={`font-medium ${
                          (stats.apiUsage?.successRate || 100) >= 95
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {stats.apiUsage?.successRate || 100}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Bug Reports (7d)</span>
                      <span
                        className={`font-medium ${
                          stats.feedback.last7Days === 0 ? "text-green-600" : "text-amber-600"
                        }`}
                      >
                        {stats.feedback.last7Days}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Links - All */}
                <div className="p-4 rounded-xl border bg-white">
                  <h3 className="font-medium mb-3 text-[var(--text-primary)]">Quick Links</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="https://llyili.sentry.io/issues/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Sentry
                    </a>
                    <a
                      href="https://vercel.com/koossimons-projects/llyli"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Vercel
                    </a>
                    <a
                      href="https://github.com/ksimons29/learnthelanguageyoulivein/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      GitHub
                    </a>
                    <a
                      href="https://platform.openai.com/usage"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      OpenAI
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
