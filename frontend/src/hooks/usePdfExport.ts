import { useState, useCallback } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export const usePdfExport = () => {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPdf = useCallback(async (elementId: string, filename = "documento.pdf") => {
    setIsExporting(true)

    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error("Elemento no encontrado")
      }

      // Configuración optimizada para html2canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Mayor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      // Dimensiones de la página A4
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Calcular dimensiones manteniendo proporción
      const imgWidth = pdfWidth - 20 // Margen de 10mm a cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 10 // Margen superior

      // Agregar primera página
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight - 20 // Restar márgenes

      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight - 20
      }

      // Descargar el PDF
      pdf.save(filename)

      return true
    } catch (error) {
      console.error("Error al generar PDF:", error)
      alert("Error al generar el PDF. Por favor, inténtalo de nuevo.")
      return false
    } finally {
      setIsExporting(false)
    }
  }, [])

  return { exportToPdf, isExporting }
}
