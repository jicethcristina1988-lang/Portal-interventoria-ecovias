/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DailyReport } from './types';
import { storageService } from './services/storage';
import { Header } from './components/Header';
import { RepositoryTimeline } from './components/RepositoryTimeline';
import { ReportEditor } from './components/ReportEditor';
import { ExcelPreviewModal } from './components/ExcelPreviewModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [currentView, setCurrentView] = useState<'timeline' | 'editor'>('timeline');
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [previewExcelReport, setPreviewExcelReport] = useState<DailyReport | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Load reports from storage on mount
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const data = storageService.getReports();
    setReports(data);
  };

  const handleNavigateTimeline = () => {
    setEditingReport(null);
    setCurrentView('timeline');
  };

  const handleNavigateNewReport = () => {
    // Generate next report number starting at 1 if repository is empty
    const maxNumber = reports.reduce((max, r) => Math.max(max, r.reportNumber), 0);
    const todayStr = new Date().toISOString().split('T')[0];

    const newReportTemplate: DailyReport = {
      id: `report-${Date.now()}`,
      reportNumber: reports.length > 0 ? maxNumber + 1 : 1,
      date: todayStr,
      projectContractName: '',
      elaboratedBy: '',
      projectName: '',
      contractNumber: '',
      supervisorEntity: '',
      contractorEntity: '',
      weather: 'Soleado',
      generalEquipmentAndTools: '',
      frentes: [],
      interventorSigner: {
        name: '',
        license: '',
        entity: '',
        role: 'Ingeniero Residente de Interventoría',
      },
      contractorSigner: {
        name: '',
        license: '',
        entity: '',
        role: 'Ingeniero Residente de Obra',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingReport(newReportTemplate);
    setCurrentView('editor');
  };

  const handleSelectReportToEdit = (report: DailyReport) => {
    setEditingReport(report);
    setCurrentView('editor');
  };

  const handleSaveReport = (report: DailyReport) => {
    storageService.saveReport(report);
    loadReports();
    setCurrentView('timeline');
    setEditingReport(null);
  };

  const handleDuplicateReport = (report: DailyReport) => {
    const maxNumber = reports.reduce((max, r) => Math.max(max, r.reportNumber), 0);
    const todayStr = new Date().toISOString().split('T')[0];

    const duplicated: DailyReport = {
      ...report,
      id: `report-${Date.now()}`,
      reportNumber: maxNumber + 1,
      date: todayStr,
      frentes: report.frentes.map((f, idx) => ({
        ...f,
        id: `frente-dup-${Date.now()}-${idx}`,
        novedades: '', // Novedades en blanco para la nueva jornada
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingReport(duplicated);
    setCurrentView('editor');
  };

  const handleDeleteReport = (id: string) => {
    storageService.deleteReport(id);
    loadReports();
  };

  const handleClearAllReports = () => {
    if (confirm('¿Estás seguro de que deseas vaciar y eliminar todos los informes del historial? Esta acción dejará el repositorio en blanco.')) {
      storageService.clearAllReports();
      loadReports();
    }
  };

  const handleExportBackup = () => {
    const jsonStr = storageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Copia_Seguridad_Informes_Interventoria_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (storageService.importBackupJson(content)) {
        loadReports();
        alert('Copia de seguridad restaurada con éxito.');
      } else {
        alert('El archivo no tiene el formato JSON de informes válido.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Institutional Header */}
      <Header
        currentView={currentView}
        onNavigateTimeline={handleNavigateTimeline}
        onNavigateNewReport={handleNavigateNewReport}
        onOpenHelp={() => setIsHelpOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        totalReports={reports.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'timeline' ? (
          <RepositoryTimeline
            reports={reports}
            onSelectReportToEdit={handleSelectReportToEdit}
            onPreviewExcel={(r) => setPreviewExcelReport(r)}
            onCreateNewReport={handleNavigateNewReport}
            onDuplicateReport={handleDuplicateReport}
            onDeleteReport={handleDeleteReport}
            onClearAllReports={handleClearAllReports}
          />
        ) : (
          <ReportEditor
            initialReport={editingReport}
            onSave={handleSaveReport}
            onCancel={handleNavigateTimeline}
            onPreviewExcel={(r) => setPreviewExcelReport(r)}
          />
        )}
      </main>

      {/* Excel 2-Tab Interactive Preview Modal */}
      <ExcelPreviewModal
        isOpen={!!previewExcelReport}
        report={previewExcelReport}
        onClose={() => setPreviewExcelReport(null)}
      />

      {/* Master Requirements Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-5 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-300">
              Repositorio e Historial de Informes Diarios de Interventoría de Obra Civil
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Generador Oficial de Libros de Obra en Microsoft Excel (.xlsx) con Inserción Nativa de Fotografías
            </p>
          </div>
          <div className="text-[11px] text-slate-400">
            Exportación de 2 Pestañas: <strong>"Actividades"</strong> y <strong>"Registro Fotográfico"</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
