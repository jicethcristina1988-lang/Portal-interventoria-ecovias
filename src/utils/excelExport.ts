import ExcelJS from 'exceljs';
import { DailyReport } from '../types';

/**
 * Generates and downloads the official 2-sheet Excel (.xlsx) file
 * Sheet 1: "Actividades"
 * Sheet 2: "Registro Fotográfico" (with clean embedded images)
 */
export async function exportDailyReportToExcel(report: DailyReport): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Interventoría de Obra Civil';
  workbook.lastModifiedBy = 'Interventoría Técnica';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Colors based on Institutional Civil Engineering Standards
  const navyHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F2942' }, // Dark Navy Blue
  };

  const steelHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' }, // Slate Blue
  };

  const subHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' }, // Light Gray/Slate
  };

  const zebraFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' }, // Lightest Slate
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  const regularFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 10,
    color: { argb: 'FF1E293B' },
  };

  const titleFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 14,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  // ==========================================
  // PESTAÑA 1: "Actividades"
  // ==========================================
  const wsAct = workbook.addWorksheet('Actividades', {
    views: [{ showGridLines: true }],
  });

  // Define Column Widths
  wsAct.columns = [
    { width: 14 }, // A: Frente
    { width: 34 }, // B: Actividad Realizada Concreta
    { width: 44 }, // C: Descripción Breve de la Labor
    { width: 12 }, // D: Ing. Interv.
    { width: 12 }, // E: Ing. Contrat.
    { width: 10 }, // F: SISO
    { width: 12 }, // G: Obreros
    { width: 12 }, // H: Topógrafo
    { width: 12 }, // I: Total Personal
    { width: 36 }, // J: Columna de Novedades (Manual)
  ];

  // Title Banner
  wsAct.mergeCells('A1:J1');
  const titleCell = wsAct.getCell('A1');
  titleCell.value = 'INFORME DIARIO DE INTERVENTORÍA Y CONTROL DE OBRA';
  titleCell.font = titleFont;
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = navyHeaderFill;
  wsAct.getRow(1).height = 32;

  // General Information Header
  const setMetaRow = (rowNum: number, label1: string, val1: string, label2: string, val2: string) => {
    wsAct.mergeCells(`A${rowNum}:B${rowNum}`);
    const l1 = wsAct.getCell(`A${rowNum}`);
    l1.value = label1;
    l1.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };
    l1.fill = subHeaderFill;
    l1.alignment = { vertical: 'middle' };

    wsAct.mergeCells(`C${rowNum}:E${rowNum}`);
    const v1 = wsAct.getCell(`C${rowNum}`);
    v1.value = val1;
    v1.font = regularFont;
    v1.alignment = { vertical: 'middle' };

    wsAct.mergeCells(`F${rowNum}:G${rowNum}`);
    const l2 = wsAct.getCell(`F${rowNum}`);
    l2.value = label2;
    l2.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };
    l2.fill = subHeaderFill;
    l2.alignment = { vertical: 'middle' };

    wsAct.mergeCells(`H${rowNum}:J${rowNum}`);
    const v2 = wsAct.getCell(`H${rowNum}`);
    v2.value = val2;
    v2.font = regularFont;
    v2.alignment = { vertical: 'middle' };

    wsAct.getRow(rowNum).height = 22;
  };

  const fullProjectContract =
    report.projectContractName ||
    (report.contractNumber ? `${report.projectName} / ${report.contractNumber}` : report.projectName);
  const fullElaboratedBy = report.elaboratedBy || report.interventorSigner?.name || 'Ing. Carlos Fernando Restrepo';

  setMetaRow(2, 'PROYECTO / CONTRATO:', fullProjectContract, 'FECHA DEL INFORME:', report.date);
  setMetaRow(3, 'ELABORADO POR / INTERVENTOR:', fullElaboratedBy, 'INFORME DIARIO No.:', `ID-${report.reportNumber.toString().padStart(3, '0')}`);
  setMetaRow(4, 'EMPRESA INTERVENTORÍA:', report.supervisorEntity, 'ESTADO DEL CLIMA:', report.weather.toUpperCase());
  setMetaRow(5, 'CONTRATISTA DE OBRA:', report.contractorEntity, 'REGISTRO GENERADO:', new Date().toLocaleDateString('es-ES'));

  // General Machinery & Tools Consolidated Box
  wsAct.mergeCells('A6:J6');
  const eqHeader = wsAct.getCell('A6');
  eqHeader.value = 'RESUMEN GENERAL CONSOLIDADO DE MAQUINARIA, EQUIPOS Y HERRAMIENTAS MENORES:';
  eqHeader.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  eqHeader.fill = steelHeaderFill;
  eqHeader.alignment = { vertical: 'middle', indent: 1 };
  wsAct.getRow(6).height = 24;

  wsAct.mergeCells('A7:J7');
  const eqContent = wsAct.getCell('A7');
  eqContent.value = report.generalEquipmentAndTools || 'No se reporta maquinaria o equipos especiales en la jornada.';
  eqContent.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF1E293B' } };
  eqContent.alignment = { vertical: 'middle', wrapText: true };
  eqContent.fill = zebraFill;
  wsAct.getRow(7).height = 36;

  // Space row
  wsAct.getRow(8).height = 12;

  // Table Headers
  const tableHeaderRowIndex = 9;
  const tableHeaderRow = wsAct.getRow(tableHeaderRowIndex);
  tableHeaderRow.values = [
    'Frente de Obra',
    'Actividad Realizada (Concreta)',
    'Descripción Breve de la Labor',
    'Ing. Interv.',
    'Ing. Contr.',
    'SISO',
    'Obreros',
    'Topógrafo',
    'Total Pers.',
    'Columna de Novedades (Manual)',
  ];
  tableHeaderRow.height = 28;

  for (let c = 1; c <= 10; c++) {
    const cell = tableHeaderRow.getCell(c);
    cell.fill = navyHeaderFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
  }

  // Populate Table Data Rows
  let currentRow = 10;
  let totalInterv = 0;
  let totalContr = 0;
  let totalSiso = 0;
  let totalObreros = 0;
  let totalTopografo = 0;

  report.frentes.forEach((frente, idx) => {
    const r = wsAct.getRow(currentRow);
    const p = frente.personnel;
    const fTotal = (p.residenteInterventoria || 0) + (p.residenteContratista || 0) + (p.siso || 0) + (p.obreros || 0) + (p.topografo || 0);

    totalInterv += p.residenteInterventoria || 0;
    totalContr += p.residenteContratista || 0;
    totalSiso += p.siso || 0;
    totalObreros += p.obreros || 0;
    totalTopografo += p.topografo || 0;

    r.values = [
      `Frente ${frente.frenteNumber}`,
      frente.activity,
      frente.description,
      p.residenteInterventoria,
      p.residenteContratista,
      p.siso,
      p.obreros,
      p.topografo,
      fTotal,
      frente.novedades || '', // Columna de novedades en blanco por defecto
    ];

    r.height = 42;

    const rowFill = idx % 2 === 1 ? zebraFill : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } } as ExcelJS.Fill;

    for (let c = 1; c <= 10; c++) {
      const cell = r.getCell(c);
      cell.border = thinBorder;
      cell.font = regularFont;
      cell.fill = rowFill;

      if (c === 1) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F2942' } };
      } else if (c >= 4 && c <= 9) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (c === 9) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E3A8A' } };
        }
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      }
    }

    currentRow++;
  });

  // Totals Row
  const totalRow = wsAct.getRow(currentRow);
  const grandTotal = totalInterv + totalContr + totalSiso + totalObreros + totalTopografo;
  totalRow.values = [
    'TOTALES:',
    `${report.frentes.length} Frentes de obra ejecutados`,
    'Consolidado de personal en obra',
    totalInterv,
    totalContr,
    totalSiso,
    totalObreros,
    totalTopografo,
    grandTotal,
    '',
  ];
  totalRow.height = 24;

  for (let c = 1; c <= 10; c++) {
    const cell = totalRow.getCell(c);
    cell.fill = subHeaderFill;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F2942' } };
    cell.border = thinBorder;
    if (c >= 4 && c <= 9) {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    } else {
      cell.alignment = { horizontal: c === 1 ? 'center' : 'left', vertical: 'middle' };
    }
  }

  currentRow += 3;

  // Signature Block
  const sigRow = currentRow;
  wsAct.mergeCells(`B${sigRow}:D${sigRow}`);
  const sigIntervLine = wsAct.getCell(`B${sigRow}`);
  sigIntervLine.value = '_____________________________________________';
  sigIntervLine.alignment = { horizontal: 'center' };

  wsAct.mergeCells(`G${sigRow}:I${sigRow}`);
  const sigContrLine = wsAct.getCell(`G${sigRow}`);
  sigContrLine.value = '_____________________________________________';
  sigContrLine.alignment = { horizontal: 'center' };

  wsAct.mergeCells(`B${sigRow + 1}:D${sigRow + 1}`);
  const sigIntervName = wsAct.getCell(`B${sigRow + 1}`);
  sigIntervName.value = report.interventorSigner.name.toUpperCase();
  sigIntervName.font = { name: 'Calibri', size: 10, bold: true };
  sigIntervName.alignment = { horizontal: 'center' };

  wsAct.mergeCells(`G${sigRow + 1}:I${sigRow + 1}`);
  const sigContrName = wsAct.getCell(`G${sigRow + 1}`);
  sigContrName.value = report.contractorSigner.name.toUpperCase();
  sigContrName.font = { name: 'Calibri', size: 10, bold: true };
  sigContrName.alignment = { horizontal: 'center' };

  wsAct.mergeCells(`B${sigRow + 2}:D${sigRow + 2}`);
  const sigIntervLic = wsAct.getCell(`B${sigRow + 2}`);
  sigIntervLic.value = `Mat. Prof.: ${report.interventorSigner.license} - ${report.interventorSigner.role}`;
  sigIntervLic.font = { name: 'Calibri', size: 9, italic: true };
  sigIntervLic.alignment = { horizontal: 'center' };

  wsAct.mergeCells(`G${sigRow + 2}:I${sigRow + 2}`);
  const sigContrLic = wsAct.getCell(`G${sigRow + 2}`);
  sigContrLic.value = `Mat. Prof.: ${report.contractorSigner.license} - ${report.contractorSigner.role}`;
  sigContrLic.font = { name: 'Calibri', size: 9, italic: true };
  sigContrLic.alignment = { horizontal: 'center' };

  wsAct.mergeCells(`B${sigRow + 3}:D${sigRow + 3}`);
  const sigIntervEnt = wsAct.getCell(`B${sigRow + 3}`);
  sigIntervEnt.value = report.interventorSigner.entity;
  sigIntervEnt.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF334155' } };
  sigIntervEnt.alignment = { horizontal: 'center' };

  wsAct.mergeCells(`G${sigRow + 3}:I${sigRow + 3}`);
  const sigContrEnt = wsAct.getCell(`G${sigRow + 3}`);
  sigContrEnt.value = report.contractorSigner.entity;
  sigContrEnt.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF334155' } };
  sigContrEnt.alignment = { horizontal: 'center' };


  // ==========================================
  // PESTAÑA 2: "Registro Fotográfico"
  // ==========================================
  const wsPhotos = workbook.addWorksheet('Registro Fotográfico', {
    views: [{ showGridLines: true }],
  });

  // Strict 3 Columns
  // Columna 1: Frente de obra (Frente 1, Frente 2...)
  // Columna 2: Actividad realizada de manera concreta
  // Columna 3: Evidencia (foto insertada limpia en la celda al frente de la actividad, sin textos o resúmenes debajo de la imagen)
  wsPhotos.columns = [
    { width: 18 }, // Columna 1: Frente de obra
    { width: 44 }, // Columna 2: Actividad realizada de manera concreta
    { width: 38 }, // Columna 3: Evidencia (foto insertada limpia)
  ];

  // Header Title
  wsPhotos.mergeCells('A1:C1');
  const photoTitleCell = wsPhotos.getCell('A1');
  photoTitleCell.value = `REGISTRO FOTOGRÁFICO DE OBRA - INFORME No. ID-${report.reportNumber.toString().padStart(3, '0')} (${report.date})`;
  photoTitleCell.font = titleFont;
  photoTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  photoTitleCell.fill = navyHeaderFill;
  wsPhotos.getRow(1).height = 32;

  // Table Column Headers
  const photoHeaderRow = wsPhotos.getRow(3);
  photoHeaderRow.values = [
    'Frente de obra',
    'Actividad realizada de manera concreta',
    'Evidencia (Fotografía)',
  ];
  photoHeaderRow.height = 28;

  for (let c = 1; c <= 3; c++) {
    const cell = photoHeaderRow.getCell(c);
    cell.fill = steelHeaderFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  }

  // Iterate over each frente to insert rows and embedded photos
  let photoRowIndex = 4;

  for (let i = 0; i < report.frentes.length; i++) {
    const frente = report.frentes[i];
    const row = wsPhotos.getRow(photoRowIndex);

    // Row Height set to 140 points (~186px) to comfortably hold a clean photo
    row.height = 140;

    // Col 1: Frente de obra
    const c1 = row.getCell(1);
    c1.value = `Frente ${frente.frenteNumber}`;
    c1.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF0F2942' } };
    c1.alignment = { horizontal: 'center', vertical: 'middle' };
    c1.border = thinBorder;

    // Col 2: Actividad realizada de manera concreta
    const c2 = row.getCell(2);
    c2.value = frente.activity;
    c2.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E293B' } };
    c2.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true, indent: 1 };
    c2.border = thinBorder;

    // Col 3: Evidencia (celda vacía donde se posiciona la imagen limpia)
    const c3 = row.getCell(3);
    c3.value = '';
    c3.border = thinBorder;
    c3.alignment = { horizontal: 'center', vertical: 'middle' };

    // Embed photo into workbook and place in cell C
    if (frente.photoUrl && frente.photoUrl.startsWith('data:image/')) {
      try {
        const matches = frente.photoUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
        if (matches && matches[2]) {
          let extension: 'png' | 'jpeg' = 'jpeg';
          if (matches[1].includes('png')) extension = 'png';

          const imageId = workbook.addImage({
            base64: matches[2],
            extension: extension,
          });

          // Place the image cleanly inside Column C of this row
          // tl: col 2 (0-indexed = C), row (photoRowIndex - 1)
          wsPhotos.addImage(imageId, {
            tl: { col: 2.15, row: photoRowIndex - 0.92 },
            ext: { width: 220, height: 165 },
            editAs: 'oneCell',
          });
        }
      } catch (err) {
        console.warn('Could not embed image in Excel cell:', err);
      }
    } else {
      // Placeholder note if image is not base64
      c3.value = '[Registro fotográfico adjunto en archivo digital]';
      c3.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF64748B' } };
    }

    photoRowIndex++;
  }

  // Generate binary buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const fileName = `Informe_Interventoria_${report.reportNumber.toString().padStart(3, '0')}_${report.date}.xlsx`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
