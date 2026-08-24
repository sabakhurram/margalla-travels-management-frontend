import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";

import "./AuditLogs.css";
function AuditLogs({ searchQuery = "" }) {
  const { session } = useAuth();

  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.access_token) {
      fetchAuditLogs();
    }
  }, [session]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/audit-logs",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch audit logs"
        );
      }

      setAuditLogs(data.auditLogs || []);
    } catch (error) {
      console.error("Fetch audit logs error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    if (action === "CREATE") {
      return <Plus size={15} />;
    }

    if (action === "UPDATE") {
      return <Pencil size={15} />;
    }

    if (action === "DELETE") {
      return <Trash2 size={15} />;
    }

    return <ClipboardList size={15} />;
  };
const formatDate = (date) => {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatFieldName = (key) => {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
const formatTableName = (tableName) => {
  if (!tableName) return "Unknown";

  return tableName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getChangedFields = (oldValue, newValue) => {
  if (!oldValue || !newValue) return [];

  return Object.keys(newValue)
    .filter((key) => {
      // Don't show technical fields
      if (
        key === "id" ||
        key === "created_at" ||
        key === "updated_at"
      ) {
        return false;
      }

      return (
        oldValue[key] !== newValue[key]
      );
    })
    .map((key) => ({
      field: formatFieldName(key),
      oldValue: oldValue[key],
      newValue: newValue[key],
    }));
};

const formatAuditDetails = (log) => {
  if (
    log.action === "UPDATE" &&
    log.old_value &&
    log.new_value
  ) {
    const changes = getChangedFields(
      log.old_value,
      log.new_value
    );

    if (changes.length === 0) {
      return "Record updated";
    }

    return changes.map((change) => (
      <div
        className="audit-change-item"
        key={change.field}
      >
        <span className="audit-change-field">
          {change.field}:
        </span>

        <span className="audit-old-value">
          {String(change.oldValue)}
        </span>

        <span className="audit-arrow">
          →
        </span>

        <span className="audit-new-value">
          {String(change.newValue)}
        </span>
      </div>
    ));
  }

  if (log.action === "CREATE") {
    const value = log.new_value;

    if (value?.name) {
      return `Created: ${value.name}`;
    }

    return "New record created";
  }

  if (log.action === "DELETE") {
    const value = log.old_value;

    if (value?.name) {
      return `Deleted: ${value.name}`;
    }

    return "Record deleted";
  }

  return "No details available";
};
const displayedAuditLogs = searchQuery.trim()
  ? auditLogs.filter((log) => {
      const query = searchQuery.trim().toLowerCase();

      return (
        log.user?.name?.toLowerCase().includes(query) ||
        log.profiles?.name?.toLowerCase().includes(query) ||
        log.action?.toLowerCase().includes(query) ||
        log.table_name?.toLowerCase().includes(query) ||
        String(log.record_id || "").includes(query)
      );
    })
  : auditLogs;
  return (
    <div className="audit-logs-page">

      {/* ================= HEADER ================= */}

      <div className="audit-logs-header">

        <div className="audit-logs-heading">

          <div className="audit-logs-heading-icon">
            <ClipboardList size={24} />
          </div>

          <div>
            <h1>Audit Logs</h1>

            <p>
              Track important changes made in the system
            </p>
          </div>

        </div>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="audit-logs-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* ================= TABLE ================= */}

      <div className="audit-logs-table-card">

        {loading ? (
          <div className="audit-logs-loading">
            Loading audit logs...
          </div>
   ) : displayedAuditLogs.length === 0 ? (
       <div className="audit-logs-empty">

  <ClipboardList size={40} />

  <h3>
    {searchQuery.trim()
      ? "No matching audit logs"
      : "No audit logs found"}
  </h3>

  <p>
    {searchQuery.trim()
      ? `No audit logs match "${searchQuery.trim()}".`
      : "Important system changes will appear here."}
  </p>
          </div>
        ) : (
          <div className="audit-logs-table-wrapper">

            <table className="audit-logs-table">
<thead>
  <tr>
    <th>Date & Time</th>
    <th>Changed By</th>
      <th>Table</th>
    <th>Action</th>
    <th>Details</th>
  </tr>
</thead>

              <tbody>
 {displayedAuditLogs.map((log) => (
    <tr key={log.id}>

      {/* DATE */}

      <td className="audit-date">
        {formatDate(log.created_at)}
      </td>

      {/* CHANGED BY */}

      <td className="audit-user">
        {log.user?.name ||
          log.profiles?.name ||
          "Unknown User"}
      </td>

<td>
  <span className="audit-table-name">
    {formatTableName(log.table_name)}
  </span>
</td>
      {/* ACTION */}

      <td>
        <span
          className={`audit-action audit-action-${log.action.toLowerCase()}`}
        >
          {getActionIcon(log.action)}
          {log.action}
        </span>
      </td>

      {/* DETAILS */}

      <td>
        <div className="audit-details">
          {formatAuditDetails(log)}
        </div>
      </td>

    </tr>
  ))}
</tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default AuditLogs;