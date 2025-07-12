'use client';

import { useEffect, useState } from "react";

interface VisitorLog {
  id: number;
  uniqueIdentifier: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceType: string | null;
  browser: string | null;
  operatingSystem: string | null;
  country: string | null;
  city: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  timezone: string | null;
  language: string | null;
  referrer: string | null;
  pageVisited: string | null;
  isMobile: boolean;
  firstVisitAt: string;
  lastVisitAt: string;
  totalVisits: number;
}

function getStats(logs: VisitorLog[]) {
  const totalUnique = logs.length;
  const totalVisits = logs.reduce((sum, l) => sum + (l.totalVisits || 0), 0);
  const countryCount: Record<string, number> = {};
  const pageCount: Record<string, number> = {};
  let mobile = 0, desktop = 0;
  logs.forEach(l => {
    if (l.country) countryCount[l.country] = (countryCount[l.country] || 0) + 1;
    if (l.pageVisited) pageCount[l.pageVisited] = (pageCount[l.pageVisited] || 0) + 1;
    if (l.isMobile) mobile++; else desktop++;
  });
  const topCountry = Object.entries(countryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  const topPage = Object.entries(pageCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  return { totalUnique, totalVisits, topCountry, topPage, mobile, desktop };
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/logs/visitors");
        if (!res.ok) throw new Error("Failed to fetch visitor logs");
        const data = await res.json();
        setLogs(data.visitors || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const stats = getStats(logs);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Logs</h1>
      <p className="text-earth-700 mb-6">Recent visitor activity logs.</p>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : logs.length === 0 ? (
        <div className="border rounded-lg p-6 bg-gray-50 text-gray-500">
          <p>No logs to display yet.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-forest-50 border rounded-lg p-4">
              <div className="text-lg font-semibold text-forest-700">Total Unique Visitors</div>
              <div className="text-2xl font-bold">{stats.totalUnique}</div>
            </div>
            <div className="bg-blue-50 border rounded-lg p-4">
              <div className="text-lg font-semibold text-blue-700">Total Visits</div>
              <div className="text-2xl font-bold">{stats.totalVisits}</div>
            </div>
            <div className="bg-orange-50 border rounded-lg p-4">
              <div className="text-lg font-semibold text-orange-700">Top Country</div>
              <div className="text-2xl font-bold">{stats.topCountry}</div>
            </div>
            <div className="bg-purple-50 border rounded-lg p-4">
              <div className="text-lg font-semibold text-purple-700">Top Page</div>
              <div className="text-2xl font-bold break-all">{stats.topPage}</div>
            </div>
            <div className="bg-green-50 border rounded-lg p-4">
              <div className="text-lg font-semibold text-green-700">Mobile</div>
              <div className="text-2xl font-bold">{stats.mobile}</div>
            </div>
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="text-lg font-semibold text-gray-700">Desktop</div>
              <div className="text-2xl font-bold">{stats.desktop}</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 border">ID</th>
                  <th className="px-2 py-1 border">Unique ID</th>
                  <th className="px-2 py-1 border">IP</th>
                  <th className="px-2 py-1 border">User Agent</th>
                  <th className="px-2 py-1 border">Device</th>
                  <th className="px-2 py-1 border">Browser</th>
                  <th className="px-2 py-1 border">OS</th>
                  <th className="px-2 py-1 border">Country</th>
                  <th className="px-2 py-1 border">City</th>
                  <th className="px-2 py-1 border">Lat</th>
                  <th className="px-2 py-1 border">Lng</th>
                  <th className="px-2 py-1 border">Timezone</th>
                  <th className="px-2 py-1 border">Lang</th>
                  <th className="px-2 py-1 border">Referrer</th>
                  <th className="px-2 py-1 border">Page</th>
                  <th className="px-2 py-1 border">Mobile</th>
                  <th className="px-2 py-1 border">First Visit</th>
                  <th className="px-2 py-1 border">Last Visit</th>
                  <th className="px-2 py-1 border">Visits</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="even:bg-gray-50">
                    <td className="px-2 py-1 border">{log.id}</td>
                    <td className="px-2 py-1 border">{log.uniqueIdentifier}</td>
                    <td className="px-2 py-1 border">{log.ipAddress || "-"}</td>
                    <td className="px-2 py-1 border max-w-xs truncate" title={log.userAgent || undefined}>{log.userAgent || "-"}</td>
                    <td className="px-2 py-1 border">{log.deviceType || "-"}</td>
                    <td className="px-2 py-1 border">{log.browser || "-"}</td>
                    <td className="px-2 py-1 border">{log.operatingSystem || "-"}</td>
                    <td className="px-2 py-1 border">{log.country || "-"}</td>
                    <td className="px-2 py-1 border">{log.city || "-"}</td>
                    <td className="px-2 py-1 border">{log.latitude ?? "-"}</td>
                    <td className="px-2 py-1 border">{log.longitude ?? "-"}</td>
                    <td className="px-2 py-1 border">{log.timezone || "-"}</td>
                    <td className="px-2 py-1 border">{log.language || "-"}</td>
                    <td className="px-2 py-1 border max-w-xs truncate" title={log.referrer || undefined}>{log.referrer || "-"}</td>
                    <td className="px-2 py-1 border max-w-xs truncate" title={log.pageVisited || undefined}>{log.pageVisited || "-"}</td>
                    <td className="px-2 py-1 border text-center">{log.isMobile ? "✔" : ""}</td>
                    <td className="px-2 py-1 border">{new Date(log.firstVisitAt).toLocaleString()}</td>
                    <td className="px-2 py-1 border">{new Date(log.lastVisitAt).toLocaleString()}</td>
                    <td className="px-2 py-1 border text-center">{log.totalVisits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
} 