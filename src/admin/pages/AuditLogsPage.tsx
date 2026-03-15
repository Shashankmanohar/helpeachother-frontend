import { useState } from "react";
import { mockAuditLogs, type AuditLog } from "@admin/lib/mock-data";
import { formatDateTime } from "@admin/lib/formatters";
import { ScrollText, User, Globe } from "lucide-react";
import { useIsMobile } from "@admin/hooks/use-mobile";

const AuditLogsPage = () => {
  const isMobile = useIsMobile();
  const [logs] = useState<AuditLog[]>(mockAuditLogs);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Audit Logs</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">Immutable record of all admin actions</p>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16">
          <ScrollText className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No audit logs yet</p>
          <p className="text-xs text-muted-foreground/60">Admin actions will be recorded here</p>
        </div>
      ) : isMobile ? (
        <div className="space-y-2.5">
          {logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-info/10">
                    <ScrollText className="h-4 w-4 text-info" />
                  </div>
                  <div>
                    <span className="status-badge-info text-[10px]">{log.action}</span>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{formatDateTime(log.timestamp)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {log.adminName}</span>
                <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {log.ipAddress}</span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Target: {log.targetUser}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="data-table-header px-4 py-3 text-left">Log ID</th>
                <th className="data-table-header px-4 py-3 text-left">Admin</th>
                <th className="data-table-header px-4 py-3 text-left">Action</th>
                <th className="data-table-header px-4 py-3 text-left">Target</th>
                <th className="data-table-header px-4 py-3 text-left">Timestamp</th>
                <th className="data-table-header px-4 py-3 text-left">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{log.adminName}</td>
                  <td className="px-4 py-3"><span className="status-badge-info">{log.action}</span></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.targetUser}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(log.timestamp)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
