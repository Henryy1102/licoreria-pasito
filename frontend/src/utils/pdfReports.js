import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Genera PDF del resumen de ventas
 */
export const generarPdfResumen = async (reportes) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Encabezado
  doc.setFont('Playfair Display', 'bold');
  doc.setFontSize(24);
  doc.text('Resumen de Ventas', pageWidth / 2, yPosition, { align: 'center' });
  
  doc.setFont('Montserrat', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(150);
  yPosition += 10;
  doc.text(`Período: ${reportes.periodo.desde} a ${reportes.periodo.hasta}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont('Montserrat', 'bold');

  // KPIs
  const kpis = [
    { label: 'Total Órdenes', value: reportes.resumen.totalOrdenes },
    { label: 'Total Vendido', value: `$${reportes.resumen.totalVentas.toFixed(2)}` },
    { label: 'Promedio por Orden', value: `$${reportes.resumen.promedioPorOrden.toFixed(2)}` },
    { label: 'Órdenes Completadas', value: reportes.resumen.ordenesCompletadas },
    { label: 'Pagos Confirmados', value: reportes.resumen.pagosConfirmados },
  ];

  kpis.forEach((kpi) => {
    doc.setFont('Montserrat', 'bold');
    doc.text(kpi.label, 20, yPosition);
    doc.setFont('Montserrat', 'normal');
    doc.text(String(kpi.value), pageWidth - 40, yPosition, { align: 'right' });
    yPosition += 8;
  });

  // Estados de Órdenes
  yPosition += 10;
  doc.setFont('Montserrat', 'bold');
  doc.setFontSize(12);
  doc.text('Estados de Órdenes', 20, yPosition);
  yPosition += 8;

  doc.setFont('Montserrat', 'normal');
  doc.setFontSize(10);
  Object.entries(reportes.estadoOrdenes).forEach(([estado, cantidad]) => {
    doc.text(`${estado}: ${cantidad}`, 20, yPosition);
    yPosition += 7;
  });

  // Métodos de Pago
  yPosition += 5;
  doc.setFont('Montserrat', 'bold');
  doc.setFontSize(12);
  doc.text('Métodos de Pago', 20, yPosition);
  yPosition += 8;

  doc.setFont('Montserrat', 'normal');
  doc.setFontSize(10);
  reportes.metodosPago.forEach((metodo) => {
    doc.text(`${metodo.metodo}: ${metodo.cantidad} órdenes - $${metodo.total.toFixed(2)}`, 20, yPosition);
    yPosition += 7;

    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
  });

  doc.save('resumen-ventas.pdf');
};

/**
 * Genera PDF de top clientes
 */
export const generarPdfClientes = async (reportes) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Encabezado
  doc.setFont('Playfair Display', 'bold');
  doc.setFontSize(24);
  doc.text('Top Clientes', pageWidth / 2, yPosition, { align: 'center' });

  doc.setFont('Montserrat', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(150);
  yPosition += 10;
  doc.text(`Período: ${reportes.periodo.desde} a ${reportes.periodo.hasta}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setTextColor(0);

  // Tabla
  const columns = ['#', 'Nombre', 'Email', 'Órdenes', 'Total Gastado', 'Promedio'];
  const rows = reportes.topClientes.map((cliente, index) => [
    String(index + 1),
    cliente.nombre,
    cliente.email,
    String(cliente.cantidad),
    `$${cliente.total.toFixed(2)}`,
    `$${(cliente.total / cliente.cantidad).toFixed(2)}`,
  ]);

  const cellPadding = 4;
  const columnWidths = [8, 35, 45, 18, 30, 25];
  const rowHeight = 8;

  // Headers
  doc.setFont('Montserrat', 'bold');
  doc.setFillColor(212, 175, 55); // primary color
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);

  let xPosition = 10;
  columns.forEach((col, idx) => {
    doc.rect(xPosition, yPosition, columnWidths[idx], rowHeight, 'F');
    doc.text(col, xPosition + cellPadding, yPosition + rowHeight - 2);
    xPosition += columnWidths[idx];
  });

  yPosition += rowHeight;

  // Datos
  doc.setFont('Montserrat', 'normal');
  doc.setTextColor(0);
  doc.setFontSize(8);

  rows.forEach((row) => {
    xPosition = 10;
    row.forEach((cell, idx) => {
      doc.rect(xPosition, yPosition, columnWidths[idx], rowHeight);
      doc.text(cell, xPosition + cellPadding, yPosition + rowHeight - 2);
      xPosition += columnWidths[idx];
    });
    yPosition += rowHeight;

    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
  });

  doc.save('top-clientes.pdf');
};

/**
 * Genera PDF de top productos
 */
export const generarPdfProductos = async (reportes) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Encabezado
  doc.setFont('Playfair Display', 'bold');
  doc.setFontSize(24);
  doc.text('Top Productos', pageWidth / 2, yPosition, { align: 'center' });

  doc.setFont('Montserrat', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(150);
  yPosition += 10;
  doc.text(`Período: ${reportes.periodo.desde} a ${reportes.periodo.hasta}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setTextColor(0);

  // Tabla
  const columns = ['#', 'Nombre del Producto', 'Cantidad Vendida', 'Ingresos'];
  const rows = reportes.topProductos.map((producto, index) => [
    String(index + 1),
    producto.nombre,
    String(producto.cantidad),
    `$${producto.ingresos.toFixed(2)}`,
  ]);

  const cellPadding = 4;
  const columnWidths = [8, 80, 35, 40];
  const rowHeight = 8;

  // Headers
  doc.setFont('Montserrat', 'bold');
  doc.setFillColor(212, 175, 55); // primary color
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);

  let xPosition = 10;
  columns.forEach((col, idx) => {
    doc.rect(xPosition, yPosition, columnWidths[idx], rowHeight, 'F');
    doc.text(col, xPosition + cellPadding, yPosition + rowHeight - 2);
    xPosition += columnWidths[idx];
  });

  yPosition += rowHeight;

  // Datos
  doc.setFont('Montserrat', 'normal');
  doc.setTextColor(0);
  doc.setFontSize(8);

  rows.forEach((row) => {
    xPosition = 10;
    row.forEach((cell, idx) => {
      doc.rect(xPosition, yPosition, columnWidths[idx], rowHeight);
      doc.text(cell, xPosition + cellPadding, yPosition + rowHeight - 2);
      xPosition += columnWidths[idx];
    });
    yPosition += rowHeight;

    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
  });

  doc.save('top-productos.pdf');
};

/**
 * Genera PDF de tendencias
 */
export const generarPdfTendencias = async (reportes) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Encabezado
  doc.setFont('Playfair Display', 'bold');
  doc.setFontSize(24);
  doc.text('Tendencias de Ventas', pageWidth / 2, yPosition, { align: 'center' });

  doc.setFont('Montserrat', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(150);
  yPosition += 10;
  doc.text(`Período: ${reportes.periodo.desde} a ${reportes.periodo.hasta}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setTextColor(0);

  // Ganancias por Mes
  doc.setFont('Montserrat', 'bold');
  doc.setFontSize(12);
  doc.text('Ganancias por Mes', 20, yPosition);
  yPosition += 8;

  doc.setFont('Montserrat', 'normal');
  doc.setFontSize(10);
  reportes.gananciasPorMes.forEach((mes) => {
    const ganancia = `$${mes.total.toFixed(2)}`;
    doc.text(`${mes.mes}:`, 20, yPosition);
    doc.text(ganancia, pageWidth - 40, yPosition, { align: 'right' });
    doc.text(`(${mes.ordenes} órdenes)`, pageWidth - 85, yPosition, { align: 'right' });
    yPosition += 7;
  });

  // Últimos 30 días
  yPosition += 10;
  doc.setFont('Montserrat', 'bold');
  doc.setFontSize(12);
  doc.text('Últimos 30 Días', 20, yPosition);
  yPosition += 8;

  doc.setFont('Montserrat', 'normal');
  doc.setFontSize(9);
  let diasPorFila = 0;

  reportes.gananciasPorDia.slice(0, 30).forEach((dia, index) => {
    if (diasPorFila === 0) {
      doc.text(`${dia.fecha}: $${dia.total.toFixed(2)}`, 20, yPosition);
    } else {
      doc.text(`${dia.fecha}: $${dia.total.toFixed(2)}`, 110, yPosition);
    }

    diasPorFila++;
    if (diasPorFila === 2) {
      yPosition += 6;
      diasPorFila = 0;
    }

    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
  });

  doc.save('tendencias-ventas.pdf');
};

/**
 * Genera un PDF con todos los reportes combinados
 */
export const generarPdfCompleto = async (reportes) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Portada
  doc.setFont('Playfair Display', 'bold');
  doc.setFontSize(32);
  doc.text('Reporte de Ventas Completo', pageWidth / 2, yPosition + 30, { align: 'center' });

  doc.setFont('Montserrat', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(150);
  doc.text('Licorería Al Pasito', pageWidth / 2, yPosition + 50, { align: 'center' });

  doc.setFontSize(10);
  const fecha = new Date().toLocaleDateString('es-ES');
  doc.text(`Generado: ${fecha}`, pageWidth / 2, yPosition + 60, { align: 'center' });
  doc.text(`Período: ${reportes.periodo.desde} a ${reportes.periodo.hasta}`, pageWidth / 2, yPosition + 70, { align: 'center' });

  // Nueva página para contenido
  doc.addPage();
  yPosition = 20;

  // Resumen
  doc.setTextColor(0);
  doc.setFont('Playfair Display', 'bold');
  doc.setFontSize(16);
  doc.text('Resumen Ejecutivo', 20, yPosition);
  yPosition += 12;

  doc.setFont('Montserrat', 'normal');
  doc.setFontSize(10);

  const kpis = [
    { label: 'Total Órdenes', value: reportes.resumen.totalOrdenes },
    { label: 'Total Vendido', value: `$${reportes.resumen.totalVentas.toFixed(2)}` },
    { label: 'Promedio por Orden', value: `$${reportes.resumen.promedioPorOrden.toFixed(2)}` },
    { label: 'Órdenes Completadas', value: reportes.resumen.ordenesCompletadas },
  ];

  kpis.forEach((kpi) => {
    doc.setFont('Montserrat', 'bold');
    doc.text(kpi.label, 20, yPosition);
    doc.setFont('Montserrat', 'normal');
    doc.text(String(kpi.value), pageWidth - 40, yPosition, { align: 'right' });
    yPosition += 8;
  });

  yPosition += 5;
  doc.setFont('Playfair Display', 'bold');
  doc.setFontSize(14);
  doc.text('Top 5 Clientes', 20, yPosition);
  yPosition += 8;

  doc.setFont('Montserrat', 'normal');
  doc.setFontSize(9);
  reportes.topClientes.forEach((cliente, index) => {
    doc.text(
      `${index + 1}. ${cliente.nombre} - ${cliente.cantidad} órdenes - $${cliente.total.toFixed(2)}`,
      20,
      yPosition
    );
    yPosition += 6;
  });

  yPosition += 5;
  doc.setFont('Playfair Display', 'bold');
  doc.setFontSize(14);
  doc.text('Top 5 Productos', 20, yPosition);
  yPosition += 8;

  doc.setFont('Montserrat', 'normal');
  doc.setFontSize(9);
  reportes.topProductos.forEach((producto, index) => {
    doc.text(
      `${index + 1}. ${producto.nombre} - ${producto.cantidad} unidades - $${producto.ingresos.toFixed(2)}`,
      20,
      yPosition
    );
    yPosition += 6;
  });

  doc.save('reporte-completo.pdf');
};
