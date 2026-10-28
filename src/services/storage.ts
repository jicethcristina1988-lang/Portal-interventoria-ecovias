import { DailyReport } from '../types';

const STORAGE_KEY = 'INFORMES';

export const storageService = {
  getReports(): DailyReport[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Starts completely empty with ZERO test or mock data
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return [];
      }
      const parsed: DailyReport[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      // Ensure projectContractName and elaboratedBy exist on all records
      const normalized = parsed.map((r) => ({
        ...r,
        projectContractName:
          r.projectContractName ||
          (r.contractNumber ? `${r.projectName} / ${r.contractNumber}` : r.projectName || ''),
        elaboratedBy: r.elaboratedBy || r.interventorSigner?.name || '',
      }));
      // Sort chronologically by date descending (most recent first)
      return normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error('Error loading reports from storage:', e);
      return [];
    }
  },

  getReportById(id: string): DailyReport | undefined {
    const reports = this.getReports();
    return reports.find((r) => r.id === id);
  },

  saveReport(report: DailyReport): DailyReport {
    const reports = this.getReports();
    const existingIndex = reports.findIndex((r) => r.id === report.id);

    const updatedReport = {
      ...report,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      reports[existingIndex] = updatedReport;
    } else {
      reports.unshift(updatedReport);
    }

    // Save and sort
    const sorted = reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    return updatedReport;
  },

  deleteReport(id: string): void {
    const reports = this.getReports().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  },

  clearAllReports(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  },

  exportBackupJson(): string {
    const reports = this.getReports();
    return JSON.stringify(reports, null, 2);
  },

  importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};
