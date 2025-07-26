import type React from "react"
import { useEffect, useRef, useMemo, useState } from "react"
import { Card, Button, Dropdown, Form, Col } from "react-bootstrap"
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js"

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface InventoryChartProps {
  inventory?: { id: number; product: { id: number; product: string; salePrice: number }; quantity: number }[]
  onRefresh?: () => void
  activeProductTypesCount: number
  inactiveProductTypesCount: number
}

const InventoryChart: React.FC<InventoryChartProps> = ({
  inventory,
  onRefresh,
  activeProductTypesCount,
  inactiveProductTypesCount,
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)

  const [metricVisibility, setMetricVisibility] = useState({
    totalStock: true,
    averagePerCategory: true,
    topCategory: true,
    registeredCategories: true,
    unregisteredCategories: true,
  })

  const chartData =
    inventory?.map((item) => ({
      label: item.product.product,
      value: item.quantity,
    })) || []

  const calculations = useMemo(() => {
    const values = chartData.map((item) => item.value)
    const totalStock = values.reduce((sum, value) => sum + value, 0)
    const totalCategories = chartData.length
    const averagePerCategory = totalCategories > 0 ? Math.round(totalStock / totalCategories) : 0

    const maxStock = values.length > 0 ? Math.max(...values) : 0
    const topCategory = chartData.find((item) => item.value === maxStock)

    const lowStockThreshold = averagePerCategory * 0.2
    const lowStockCategories = chartData.filter((item) => item.value > 0 && item.value <= lowStockThreshold).length

    return {
      totalStock,
      totalCategories,
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

    const modernColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"]

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
              text: "Cantidad (m³)",
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setMetricVisibility((prev) => ({ ...prev, [name]: checked }))
  }

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
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" size="sm" id="dropdown-basic">
                <i className="bi bi-gear me-1"></i>
                Configurar
              </Dropdown.Toggle>

              <Dropdown.Menu align="end" className="p-3">
                <Dropdown.Header>Mostrar/Ocultar Métricas</Dropdown.Header>
                <Dropdown.Divider />
                <Form.Check
                  type="checkbox"
                  id="check-totalStock"
                  label="Total Stock"
                  name="totalStock"
                  checked={metricVisibility.totalStock}
                  onChange={handleCheckboxChange}
                  className="mb-2"
                />
                <Form.Check
                  type="checkbox"
                  id="check-registeredCategories"
                  label="Categorías Activas"
                  name="registeredCategories"
                  checked={metricVisibility.registeredCategories}
                  onChange={handleCheckboxChange}
                  className="mb-2"
                />
                <Form.Check
                  type="checkbox"
                  id="check-unregisteredCategories"
                  label="Categorías Inactivas"
                  name="unregisteredCategories"
                  checked={metricVisibility.unregisteredCategories}
                  onChange={handleCheckboxChange}
                  className="mb-2"
                />
                <Form.Check
                  type="checkbox"
                  id="check-averagePerCategory"
                  label="Promedio por Categoría"
                  name="averagePerCategory"
                  checked={metricVisibility.averagePerCategory}
                  onChange={handleCheckboxChange}
                  className="mb-2"
                />
                <Form.Check
                  type="checkbox"
                  id="check-topCategory"
                  label="Categoría con Mayor Stock"
                  name="topCategory"
                  checked={metricVisibility.topCategory}
                  onChange={handleCheckboxChange}
                  className="mb-2"
                />
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <div style={{ height: "300px", position: "relative" }}>
          <canvas ref={chartRef} />
        </div>

        {/* 🧮 Información calculada automáticamente (basada en stock simulado) */}
        <div className="row mt-3 justify-content-around">
          {metricVisibility.totalStock && (
            <Col className="text-center">
              <small className="text-muted">Total Stock</small>
              <div className="fw-bold text-primary">{calculations.totalStock.toLocaleString()} m³ de materiales</div>
            </Col>
          )}
          {metricVisibility.registeredCategories && (
            <Col className="text-center">
              <small className="text-muted">Categorías activas</small>
              <div className="fw-bold text-success">{activeProductTypesCount} activas</div>
            </Col>
          )}
          {metricVisibility.unregisteredCategories && (
            <Col className="text-center">
              <small className="text-muted ">Categorías inactivas</small>
              <div className="fw-bold text-danger">{inactiveProductTypesCount} inactivas</div>
            </Col>
          )}
          {metricVisibility.averagePerCategory && (
            <Col className="text-center">
              <small className="text-muted">Promedio</small>
              <div className="fw-bold text-info">{calculations.averagePerCategory} m³/categoría</div>
            </Col>
          )}
          {metricVisibility.topCategory && (
            <Col className="text-center">
              <small className="text-muted">Mayor Stock</small>
              <div className="fw-bold text-warning">
                {calculations.topCategory?.label} ({calculations.maxStock}u)
              </div>
            </Col>
          )}
        </div>

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