/**
 * Generador de XML para facturas electrónicas
 */

function escapeXml(unsafe) {
  if (typeof unsafe !== "string") return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export async function generarXMLFactura(factura) {
  const datos = factura.datosFiscales || {};
  const razonSocial = datos.razonSocial || datos.nombre || "";
  const correo = datos.correo || datos.email || "";
  const direccion = datos.direccion || datos.direccionFiscal || "";
  const tipoIdentificacion = datos.tipoIdentificacion || (datos.nit ? "NIT" : datos.dui ? "DUI" : "");
  const numeroIdentificacion = datos.numeroIdentificacion || datos.nit || datos.dui || "";

  const productos = factura.items || factura.productos || [];
  const totalSinImpuestos = productos.reduce((sum, p) => sum + (p.subtotal || 0), 0);
  const totalDescuento = 0;
  const totalIVA = totalSinImpuestos * 0.13;
  const total = totalSinImpuestos + totalIVA;

  const detallesXml = productos
    .map((p, index) => {
      return `    <detalle>
      <codigoPrincipal>${escapeXml(p.codigoProducto || p.codigo || String(index + 1))}</codigoPrincipal>
      <descripcion>${escapeXml(p.nombre || p.descripcion)}</descripcion>
      <cantidad>${escapeXml(p.cantidad?.toString?.() ?? p.cantidad)}</cantidad>
      <precioUnitario>${escapeXml(p.precioUnitario?.toFixed?.(2) ?? p.precio?.toFixed?.(2) ?? p.precio)}</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>${escapeXml(p.subtotal?.toFixed?.(2) ?? p.subtotal)}</precioTotalSinImpuesto>
    </detalle>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<factura version="1.0.0" id="comprobante">
  <infoTributaria>
    <ambiente>PRUEBAS</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>LICORERÍA AL PASITO</razonSocial>
    <nombreComercial>Licorería Al Pasito</nombreComercial>
    <ruc>1234567890123</ruc>
    <claveAcceso>${escapeXml(factura.numeroFactura)}</claveAcceso>
    <codDoc>01</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>${escapeXml(factura.numeroFactura)}</secuencial>
    <dirMatriz>Barrio 11 de Noviembre - Fernando Rodríguez &amp; Vicente Ramon Roca</dirMatriz>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>${escapeXml(formatDate(factura.fechaEmision || new Date()))}</fechaEmision>
    <razonSocialComprador>${escapeXml(razonSocial)}</razonSocialComprador>
    <tipoIdentificacionComprador>${escapeXml(tipoIdentificacion)}</tipoIdentificacionComprador>
    <identificacionComprador>${escapeXml(numeroIdentificacion)}</identificacionComprador>
    <direccionComprador>${escapeXml(direccion)}</direccionComprador>
    <correoComprador>${escapeXml(correo)}</correoComprador>
    <totalSinImpuestos>${escapeXml(totalSinImpuestos.toFixed(2))}</totalSinImpuestos>
    <totalDescuento>${escapeXml(totalDescuento.toFixed(2))}</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>2</codigoPorcentaje>
        <baseImponible>${escapeXml((totalSinImpuestos - totalDescuento).toFixed(2))}</baseImponible>
        <valor>${escapeXml(totalIVA.toFixed(2))}</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <importeTotal>${escapeXml(total.toFixed(2))}</importeTotal>
    <moneda>USD</moneda>
  </infoFactura>
  <detalles>
${detallesXml}
  </detalles>
</factura>`;

  return xml;
}

export default { generarXMLFactura };
