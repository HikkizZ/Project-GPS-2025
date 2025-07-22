import { useState } from "react"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

export const useExcelExport = () => {
  const [isExporting, setIsExporting] = useState(false)

  const exportToExcel = async (data: any[], filename: string, sheetName = "Datos") => {
    try {
      setIsExporting(true)

      // Crear un nuevo workbook
      const workbook = XLSX.utils.book_new()

      // Convertir los datos a worksheet
      const worksheet = XLSX.utils.json_to_sheet(data)

      // Configurar el ancho de las columnas automáticamente
      const columnWidths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.max(key.length, ...data.map((row) => String(row[key] || "").length)),
      }))
      worksheet["!cols"] = columnWidths

      // Agregar la hoja al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

      // Generar el archivo Excel
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

      // Crear blob y descargar
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      // Generar nombre con fecha
      const timestamp = new Date().toISOString().split("T")[0]
      const finalFilename = `${filename}_${timestamp}.xlsx`

      saveAs(blob, finalFilename)
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }

  const exportMultipleSheets = async (sheets: { data: any[]; sheetName: string }[], filename: string) => {
    try {
      setIsExporting(true)

      // Crear un nuevo workbook
      const workbook = XLSX.utils.book_new()

      // Agregar cada hoja
      sheets.forEach(({ data, sheetName }) => {
        if (data.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(data)

          // Configurar ancho de columnas
          const columnWidths = Object.keys(data[0]).map((key) => ({
            wch: Math.max(key.length, ...data.map((row) => String(row[key] || "").length)),
          }))
          worksheet["!cols"] = columnWidths

          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
        }
      })

      // Generar y descargar
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const timestamp = new Date().toISOString().split("T")[0]
      const finalFilename = `${filename}_${timestamp}.xlsx`

      saveAs(blob, finalFilename)
    } catch (error) {
      console.error("Error al exportar múltiples hojas:", error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }

  return {
    exportToExcel,
    exportMultipleSheets,
    isExporting,
  }
}