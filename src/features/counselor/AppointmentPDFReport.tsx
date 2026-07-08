// File: src/features/counselor/AppointmentPDFReport.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';

// ── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  // Header
  header: {
    marginBottom: 24,
    borderBottom: '2px solid #10b981',
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#064e3b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  badge: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    padding: '4 10',
    borderRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Summary row
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: '10 14',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#94a3b8',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  // Table
  table: {
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#064e3b',
    color: '#ffffff',
  },
  tableHeaderCell: {
    padding: '8 10',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #f1f5f9',
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    padding: '8 10',
    fontSize: 9,
    color: '#334155',
  },
  // Status badges
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    padding: '2 6',
    borderRadius: 3,
    textTransform: 'uppercase',
  },
  statusApproved: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    padding: '2 6',
    borderRadius: 3,
    textTransform: 'uppercase',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    padding: '2 6',
    borderRadius: 3,
    textTransform: 'uppercase',
  },
  statusInProgress: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    padding: '2 6',
    borderRadius: 3,
    textTransform: 'uppercase',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
  // Column widths
  colNo: { width: '6%' },
  colStudent: { width: '18%' },
  colType: { width: '12%' },
  colTopic: { width: '18%' },
  colDate: { width: '14%' },
  colScheduled: { width: '16%' },
  colStatus: { width: '16%' },
});

// ── Helper: Get status style ────────────────────────────────────
function getStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'confirmed':
    case 'completed':
      return styles.statusApproved;
    case 'rejected':
    case 'cancelled':
      return styles.statusRejected;
    case 'in-progress':
    case 'reviewing':
      return styles.statusInProgress;
    default:
      return styles.statusPending;
  }
}

// ── Helper: Format date ─────────────────────────────────────────
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

// ── Types ────────────────────────────────────────────────────────
interface ReportRequest {
  id: string;
  type: string;
  studentName?: string;
  status: string;
  topic_category?: string;
  target_school?: string;
  scheduled_date?: string;
  created_at: string;
}

interface AppointmentReportProps {
  requests: ReportRequest[];
  counselorName: string;
}

// ── PDF Document Component ───────────────────────────────────────
function AppointmentReportDocument({ requests, counselorName }: AppointmentReportProps) {
  const now = new Date();
  const generatedAt = now.toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalAppointments = requests.filter(r => r.type === 'Appointment').length;
  const totalTransfers = requests.filter(r => r.type === 'Transfer').length;
  const totalPending = requests.filter(r => r.status === 'pending').length;
  const totalResolved = requests.filter(r => ['approved', 'rejected', 'completed'].includes(r.status)).length;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>SAINA Care Portal</Text>
              <Text style={styles.subtitle}>Student Appointments & Requests Report</Text>
              <Text style={styles.subtitle}>Prepared by: {counselorName}</Text>
              <Text style={styles.subtitle}>Generated: {generatedAt}</Text>
            </View>
            <View>
              <Text style={styles.badge}>CONFIDENTIAL</Text>
            </View>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Records</Text>
            <Text style={styles.summaryValue}>{requests.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Appointments</Text>
            <Text style={styles.summaryValue}>{totalAppointments}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Transfers</Text>
            <Text style={styles.summaryValue}>{totalTransfers}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryValue}>{totalPending}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Resolved</Text>
            <Text style={styles.summaryValue}>{totalResolved}</Text>
          </View>
        </View>

        {/* Data Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNo]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colStudent]}>Student Name</Text>
            <Text style={[styles.tableHeaderCell, styles.colType]}>Type</Text>
            <Text style={[styles.tableHeaderCell, styles.colTopic]}>Topic / School</Text>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>Submitted</Text>
            <Text style={[styles.tableHeaderCell, styles.colScheduled]}>Scheduled</Text>
            <Text style={[styles.tableHeaderCell, styles.colStatus]}>Status</Text>
          </View>

          {/* Table Body */}
          {requests.map((req, index) => (
            <View key={req.id} style={index % 2 === 1 ? styles.tableRowAlt : styles.tableRow}>
              <Text style={[styles.tableCell, styles.colNo]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.colStudent]}>{req.studentName || 'Unknown'}</Text>
              <Text style={[styles.tableCell, styles.colType]}>{req.type}</Text>
              <Text style={[styles.tableCell, styles.colTopic]}>
                {req.type === 'Appointment' ? (req.topic_category || '—') : (req.target_school || '—')}
              </Text>
              <Text style={[styles.tableCell, styles.colDate]}>{formatDate(req.created_at)}</Text>
              <Text style={[styles.tableCell, styles.colScheduled]}>
                {req.type === 'Appointment' ? formatDateTime(req.scheduled_date) : '—'}
              </Text>
              <View style={[styles.tableCell, styles.colStatus]}>
                <Text style={getStatusStyle(req.status)}>{req.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>SAINA Care Portal — Confidential Report</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// ── Export function (called from a button click) ─────────────────
export async function generateAppointmentPDF(requests: ReportRequest[], counselorName: string) {
  const blob = await pdf(
    <AppointmentReportDocument requests={requests} counselorName={counselorName} />
  ).toBlob();

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const timestamp = new Date().toISOString().slice(0, 10);
  link.download = `SAINA_Appointments_Report_${timestamp}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default AppointmentReportDocument;
