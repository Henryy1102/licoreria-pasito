import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Generar PDF de factura
 * @param {Object} factura - Objeto de factura con todos los datos
 * @param {String} outputPath - Ruta donde guardar el PDF (opcional)
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
async function generarPDFFactura(factura, outputPath = null) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "LETTER", margin: 50 });
      const buffers = [];

      // Si se proporciona ruta, guardar en archivo
      if (outputPath) {
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);
      }

      // Capturar el PDF en memoria
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // ENCABEZADO
      const logoUrl =
        process.env.PDF_LOGO_URL || "https://licoreria-pasito.vercel.app/logo.jpeg";

      try {
        const logoResponse = await fetch(logoUrl);
        if (logoResponse.ok) {
          const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
          doc.image(logoBuffer, 50, 45, { width: 35, height: 35 });
        }
      } catch (error) {
        // Si falla el logo, continuar sin imagen
      }

      doc
        .fontSize(24)
        .fillColor("#FF4D8D")
        .text("LICORERÍA AL PASITO", 95, 50);

      doc
        .fontSize(10)
        .fillColor("#666666")
        .text("NIT: 1234-567890-123-4", 50, 80)
        .text("Tel: +593 99 550 8392", 50, 93)
        .text("Email: janethchavez@gmail.com", 50, 106)
        .text("Barrio 11 de Noviembre - Fernando Rodríguez & Vicente Ramon Roca", 50, 119);

      // INFORMACIÓN DE FACTURA (derecha)
      doc
        .fontSize(16)
        .fillColor("#000000")
        .text("FACTURA", 400, 50, { align: "right" });

      doc
        .fontSize(10)
        .fillColor("#666666")
        .text(`No. ${factura.numeroFactura}`, 400, 75, { align: "right" })
        .text(
          `Fecha: ${new Date(factura.fechaEmision).toLocaleDateString("es-SV")}`,
          400,
          90,
          { align: "right" }
        )
        .text(`Estado: ${factura.estado.toUpperCase()}`, 400, 105, {
          align: "right",
        });

      // LÍNEA SEPARADORA
      doc
        .moveTo(50, 145)
        .lineTo(550, 145)
        .strokeColor("#FF4D8D")
        .lineWidth(2)
        .stroke();

      // DATOS DEL CLIENTE
      doc.fontSize(12).fillColor("#FF4D8D").text("DATOS DEL CLIENTE", 50, 160);

      const datos = factura.datosFiscales || {};
      const razonSocial = datos.razonSocial || datos.nombre || "";
      const correo = datos.correo || datos.email || "";
      const direccion = datos.direccion || datos.direccionFiscal || "";
      const tipoIdentificacion =
        datos.tipoIdentificacion || (datos.nit ? "NIT" : datos.dui ? "DUI" : "");
      const numeroIdentificacion =
        datos.numeroIdentificacion || datos.nit || datos.dui || "";

      doc
        .fontSize(10)
        .fillColor("#000000")
        .text(`Razón Social: ${razonSocial}`, 50, 180)
        .text(`Correo: ${correo}`, 50, 195);

      if (tipoIdentificacion || numeroIdentificacion) {
        doc.text(
          `Identificación (${tipoIdentificacion || "N/A"}): ${numeroIdentificacion || ""}`,
          50,
          210
        );
      }
      if (datos.telefono) {
        doc.text(`Teléfono: ${datos.telefono}`, 50, 225);
      }
      if (direccion) {
        doc.text(`Dirección: ${direccion}`, 50, 240);
      }

      // TABLA DE PRODUCTOS
      let tableTop = 290;
      doc
        .fontSize(12)
        .fillColor("#FF4D8D")
        .text("DETALLE DE PRODUCTOS", 50, tableTop);

      tableTop += 25;

      // Encabezados de tabla
      doc
        .fontSize(9)
        .fillColor("#FFFFFF")
        .rect(50, tableTop, 500, 20)
        .fill("#FF4D8D");

      doc
        .fillColor("#FFFFFF")
        .text("PRODUCTO", 60, tableTop + 5, { width: 200 })
        .text("CANTIDAD", 270, tableTop + 5, { width: 60, align: "center" })
        .text("PRECIO UNIT.", 340, tableTop + 5, { width: 80, align: "right" })
        .text("SUBTOTAL", 430, tableTop + 5, { width: 100, align: "right" });

      tableTop += 25;

      // Productos
      doc.fillColor("#000000");
      factura.productos.forEach((producto, index) => {
        const y = tableTop + index * 20;

        // Alternar color de fondo
        if (index % 2 === 0) {
          doc.rect(50, y, 500, 20).fill("#F5F5F5");
        }

        doc
          .fillColor("#000000")
          .fontSize(9)
          .text(producto.nombre, 60, y + 5, { width: 200 })
          .text(producto.cantidad.toString(), 270, y + 5, {
            width: 60,
            align: "center",
          })
          .text(`$${producto.precioUnitario.toFixed(2)}`, 340, y + 5, {
            width: 80,
            align: "right",
          })
          .text(`$${producto.subtotal.toFixed(2)}`, 430, y + 5, {
            width: 100,
            align: "right",
          });
      });

      // TOTALES
      const totalesTop = tableTop + factura.productos.length * 20 + 30;

      doc
        .fontSize(10)
        .fillColor("#000000")
        .text("Subtotal:", 380, totalesTop, { width: 100, align: "right" })
        .text(`$${factura.subtotal.toFixed(2)}`, 480, totalesTop, {
          width: 60,
          align: "right",
        });

      if (factura.descuento > 0) {
        doc
          .text("Descuento:", 380, totalesTop + 20, {
            width: 100,
            align: "right",
          })
          .text(`-$${factura.descuento.toFixed(2)}`, 480, totalesTop + 20, {
            width: 60,
            align: "right",
          });
      }

      doc
        .text("IVA (15%):", 380, totalesTop + (factura.descuento > 0 ? 40 : 20), {
          width: 100,
          align: "right",
        })
        .text(
          `$${factura.iva.toFixed(2)}`,
          480,
          totalesTop + (factura.descuento > 0 ? 40 : 20),
          { width: 60, align: "right" }
        );

      // TOTAL - destacado
      const totalTop = totalesTop + (factura.descuento > 0 ? 60 : 40);
      doc
        .fontSize(12)
        .fillColor("#FF4D8D")
        .text("TOTAL:", 380, totalTop, { width: 100, align: "right" })
        .text(`$${factura.total.toFixed(2)}`, 480, totalTop, {
          width: 60,
          align: "right",
        });

      // MÉTODO DE PAGO
      doc
        .fontSize(10)
        .fillColor("#000000")
        .text(
          `Método de Pago: ${factura.metodoPago.toUpperCase()}`,
          50,
          totalTop + 40
        );

      // NOTAS
      if (factura.notas) {
        doc
          .fontSize(10)
          .fillColor("#666666")
          .text("Notas:", 50, totalTop + 70)
          .fontSize(9)
          .text(factura.notas, 50, totalTop + 85, { width: 500 });
      }

      // PIE DE PÁGINA
      const footerTop = 700;
      doc
        .fontSize(8)
        .fillColor("#999999")
        .text(
          "Gracias por su compra. Para cualquier consulta, contacte a nuestro servicio al cliente.",
          50,
          footerTop,
          { align: "center", width: 500 }
        )
        .text(
          "Esta factura es un documento tributario válido en Ecuador.",
          50,
          footerTop + 15,
          { align: "center", width: 500 }
        );

      // Finalizar documento
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export { generarPDFFactura };
