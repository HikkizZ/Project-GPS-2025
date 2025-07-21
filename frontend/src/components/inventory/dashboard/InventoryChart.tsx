"use client"

import type React from "react"
import { useEffect, useRef, useMemo } from "react"
import { Card, Button } from "react-bootstrap"
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js"

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface InventoryChartProps {
  data?: { label: string; value: number }[]
  onRefresh?: () => void // Nueva prop para refrescar datos
}

const InventoryChart: React.FC<InventoryChartProps> = ({ data: propData, onRefresh }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)

  // 📊 Datos del gráfico, ahora siempre vienen de propData
  const chartData = propData || [] // Si no hay propData, usar un array vacío

  // 🧮 Cálculos automáticos
  const calculations = useMemo(() => {
    const values = chartData.map((item) => item.value)
    const totalStock = values.reduce((sum, value) => sum + value, 0)
    const totalCategories = chartData.length
    const averagePerCategory = totalCategories > 0 ? Math.round(totalStock / totalCategories) : 0

    // Categorías activas (con stock > 0)
    const activeCategories = chartData.filter((item) => item.value > 0).length

    // Categoría con mayor stock
    const maxStock = values.length > 0 ? Math.max(...values) : 0
    const topCategory = chartData.find((item) => item.value === maxStock)

    // Categorías con stock bajo (menos del 20% del promedio)
    const lowStockThreshold = averagePerCategory * 0.2
    const lowStockCategories = chartData.filter((item) => item.value > 0 && item.value <= lowStockThreshold).length

    return {
      totalStock,
      totalCategories,
      activeCategories,
      averagePerCategory,
      topCategory,
      lowStockCategories,
      maxStock,
    }
  }, [chartData])

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d")
    if (!ctx) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const labels = chartData.map((item) => item.label)
    const data = chartData.map((item) => item.value)

    // 🎨 Paleta de colores moderna y profesional
    const modernColors = [
      "#3B82F6", // Azul moderno
      "#10B981", // Verde esmeralda
      "#F59E0B", // Amarillo ámbar
      "#EF4444", // Rojo coral
      "#8B5CF6", // Púrpura
      "#06B6D4", // Cian (para más categorías)
      "#84CC16", // Lima
      "#F97316", // Naranja
    ]

    // Asegurar que tenemos suficientes colores
    const colors = labels.map((_, index) => modernColors[index % modernColors.length])

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Stock actual",
            data,
            backgroundColor: colors,
            borderWidth: 0,
            borderRadius: 8,
            borderSkipped: false,
            hoverBackgroundColor: colors.map((color) => color + "CC"),
            barPercentage: 0.4,
            categoryPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 20,
            bottom: 10,
            left: 10,
            right: 10,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 14,
                weight: 500,
              },
              color: "#6B7280",
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "#F3F4F6",
              lineWidth: 1,
            },
            ticks: {
              font: {
                size: 14,
              },
              color: "#6B7280",
              callback: (value) => {
                return value + " u"
              },
            },
            title: {
              display: true,
              text: "Cantidad (unidades)",
              font: {
                size: 15,
                weight: 600,
              },
              color: "#374151",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#FFFFFF",
            bodyColor: "#FFFFFF",
            borderColor: "#E5E7EB",
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y} unidades`,
            },
          },
        },
        animation: {
          duration: 1000,
          easing: "easeOutQuart",
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    })

    return () => {
      chartInstance.current?.destroy()
    }
  }, [chartData])

  return (
    <Card className="inventory-chart-card shadow-sm">
      <Card.Header className="bg-light border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <i className="bi bi-bar-chart-fill me-2 text-primary"></i>
            <div>
              <h5 className="mb-1">Stock Actual por Producto</h5>
              <small className="text-muted">Inventario actual por categoría</small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm" onClick={onRefresh}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Actualizar
            </Button>
            <Button variant="outline-secondary" size="sm">
              <i className="bi bi-gear me-1"></i>
              Configurar
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <div style={{ height: "350px", position: "relative" }}>
          <canvas ref={chartRef} />
        </div>

        {/* 🧮 Información calculada automáticamente */}
        <div className="row mt-3">
          <div className="col-md-3 text-center">
            <small className="text-muted">Total Stock</small>
            <div className="fw-bold text-primary">{calculations.totalStock.toLocaleString()} unidades</div>
          </div>
          <div className="col-md-3 text-center">
            <small className="text-muted">Categorías</small>
            <div className="fw-bold text-success">{calculations.activeCategories} activas</div>
          </div>
          <div className="col-md-3 text-center">
            <small className="text-muted">Promedio</small>
            <div className="fw-bold text-info">{calculations.averagePerCategory} u/categoría</div>
          </div>
          <div className="col-md-3 text-center">
            <small className="text-muted">Mayor Stock</small>
            <div className="fw-bold text-warning">
              {calculations.topCategory?.label} ({calculations.maxStock}u)
            </div>
          </div>
        </div>

        {/* 📊 Información adicional */}
        {calculations.lowStockCategories > 0 && (
          <div className="row mt-2">
            <div className="col-12 text-center">
              <small className="badge bg-warning text-dark">
                <i className="bi bi-exclamation-triangle me-1"></i>
                {calculations.lowStockCategories} categoría{calculations.lowStockCategories > 1 ? "s" : ""} con stock
                bajo
              </small>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default InventoryChart
