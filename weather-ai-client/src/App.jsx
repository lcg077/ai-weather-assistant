import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function SkeletonLine({ w = "w-full" }) {
  return <div className={`h-3 ${w} animate-pulse rounded bg-slate-200`} />;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <SkeletonLine w="w-28" />
      <div className="mt-4 space-y-2">
        <SkeletonLine w="w-40" />
        <SkeletonLine w="w-56" />
        <SkeletonLine w="w-48" />
        <div className="h-20 w-full animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function App() {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("2026-02-16");
  const [endDate, setEndDate] = useState("2026-02-20");

  const [result, setResult] = useState(null);
  const [forecast, setForecast] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState("");

  const canAsk = useMemo(
    () => Boolean(result || (forecast?.days && forecast.days.length > 0)),
    [result, forecast],
  );

  async function fetchHistory() {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/requests`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  async function submit() {
    setError("");
    setAskError("");
    setAnswer("");

    setResult(null);
    setForecast(null);

    const loc = location.trim();
    if (!loc) {
      setError("Please enter a city.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Invalid date range: start date must be before end date.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: loc, startDate, endDate }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404)
          setError("City not found. Please check spelling.");
        else if (res.status === 400) setError("Invalid date range.");
        else setError("Weather service temporarily unavailable.");
        return;
      }

      setResult(data);

      const f = await fetch(
        `${API_BASE}/api/forecast?location=${encodeURIComponent(
          loc,
        )}&startDate=${startDate}&endDate=${endDate}`,
      );
      const fData = await f.json();
      if (f.ok) setForecast(fData);

      fetchHistory();
    } catch {
      setError("Service temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function askAI() {
    setAskError("");
    setAnswer("");

    const q = question.trim();
    if (!q) {
      setAskError("Please enter a question.");
      return;
    }
    if (!canAsk) {
      setAskError("Please get weather first so I have context.");
      return;
    }

    setAskLoading(true);
    try {
      const context = {
        locationInput: location.trim(),
        locationName: result?.locationName,
        lat: result?.lat,
        lon: result?.lon,
        current: result?.weatherData,
        forecast: forecast?.days,
        startDate,
        endDate,
      };

      const res = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, context }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAskError(data?.error || "AI service temporarily unavailable.");
        return;
      }

      setAnswer(data?.answer || "No answer.");
    } catch {
      setAskError("AI service temporarily unavailable.");
    } finally {
      setAskLoading(false);
    }
  }

  async function clearHistory() {
    setError("");
    setAskError("");
    setAnswer("");

    setClearLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/requests`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        setError("Failed to clear history.");
        return;
      }
      await fetchHistory();
    } catch {
      setError("Failed to clear history.");
    } finally {
      setClearLoading(false);
    }
  }

  const current = result?.weatherData;
  const desc = current?.weather?.[0]?.description;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            AI Weather Assistant
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Weather + forecast + maps + AI advice, with persistence and export.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Search</h2>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-600">
                Location
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
                placeholder='Try "Tokyo"'
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading || askLoading || clearLoading}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Start date
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading || askLoading || clearLoading}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                End date
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading || askLoading || clearLoading}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={submit}
              disabled={loading || clearLoading}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Getting weather...
                </span>
              ) : (
                "Get Weather"
              )}
            </button>

            <button
              disabled={loading || clearLoading}
              onClick={() =>
                window.open(`${API_BASE}/api/requests/export?format=csv`)
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          (result || (forecast?.days && forecast.days.length > 0)) && (
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">
                  Current
                </h2>

                {result ? (
                  <div className="mt-3 space-y-1 text-sm text-slate-700">
                    <div className="font-medium text-slate-900">
                      {result.locationName}
                    </div>
                    <div className="capitalize">{desc}</div>
                    <div>Temp: {current?.main?.temp}°C</div>
                    <div>Humidity: {current?.main?.humidity}%</div>
                    <div>Wind: {current?.wind?.speed} m/s</div>

                    <div className="pt-3">
                      <div className="text-sm font-semibold text-slate-900">
                        AI Advice
                      </div>
                      <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                        {result.aiAdvice}
                      </pre>
                    </div>

                    {result.extraData?.mapUrl && (
                      <a
                        href={result.extraData.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block pt-2 text-sm font-medium text-slate-900 underline underline-offset-4"
                      >
                        Open in Google Maps
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">No result yet.</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">
                  Forecast
                </h2>

                {forecast?.days?.length ? (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                    <div className="grid grid-cols-4 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                      <div>Day</div>
                      <div>Min</div>
                      <div>Max</div>
                      <div>Description</div>
                    </div>

                    {forecast.days.map((d) => (
                      <div
                        key={d.day}
                        className="grid grid-cols-4 border-t border-slate-100 px-3 py-2 text-xs text-slate-700"
                      >
                        <div className="font-medium text-slate-900">
                          {d.day}
                        </div>
                        <div>{d.min}°C</div>
                        <div>{d.max}°C</div>
                        <div className="capitalize">{d.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">
                    No forecast available.
                  </p>
                )}
              </div>
            </div>
          )
        )}

        {/* Ask AI */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Ask AI</h2>
          <p className="mt-1 text-sm text-slate-600">
            Ask about clothing, planning, or choosing the best day based on
            forecast.
          </p>

          {!canAsk && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Get weather first, then ask a question here.
            </div>
          )}

          {askError && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {askError}
            </div>
          )}

          <div className="mt-3 flex flex-col gap-3">
            <textarea
              className="min-h-[90px] w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
              placeholder='Example: "Is Feb 19 or Feb 20 better for outdoor sightseeing? Why?"'
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={askLoading || !canAsk || clearLoading}
            />

            <div className="flex items-center gap-3">
              <button
                onClick={askAI}
                disabled={askLoading || !canAsk || clearLoading}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {askLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Asking...
                  </span>
                ) : (
                  "Ask"
                )}
              </button>

              <button
                onClick={() => {
                  setQuestion("");
                  setAnswer("");
                  setAskError("");
                }}
                disabled={askLoading || clearLoading}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>
            </div>

            {answer && (
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-800 whitespace-pre-wrap">
                {answer}
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">History</h2>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchHistory}
                disabled={historyLoading || clearLoading}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {historyLoading ? "Refreshing..." : "Refresh"}
              </button>

              <button
                onClick={clearHistory}
                disabled={
                  clearLoading || historyLoading || history.length === 0
                }
                className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {clearLoading ? "Clearing..." : "Clear"}
              </button>
            </div>
          </div>

          <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {historyLoading ? (
              <div className="px-3 py-3">
                <div className="space-y-2">
                  <SkeletonLine w="w-40" />
                  <SkeletonLine w="w-64" />
                </div>
              </div>
            ) : history.length === 0 ? (
              <div className="px-3 py-3 text-sm text-slate-600">
                No records yet.
              </div>
            ) : (
              history.map((h) => (
                <div key={h.id} className="px-3 py-3 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">
                    {h.locationName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {h.startDate} → {h.endDate}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
