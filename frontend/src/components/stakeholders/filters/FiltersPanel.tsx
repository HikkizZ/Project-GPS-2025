import type React from "react"
import { ServerFilters } from "./ServerFilters"
import { LocalFilters } from "./LocalFilters"

interface FiltersPanelProps {
  showFilters: boolean
  // Props para filtros del servidor
  serverFilters: {
    rut: string
    email: string
  }
  onServerFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onServerFilterSubmit: (e: React.FormEvent) => void
  onServerFilterReset: () => void
  // Props para filtros locales
  localFilters: {
    name: string
    rut: string
    email: string
    address: string
    phone: string
  }
  onLocalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLocalFilterReset: () => void
  hasActiveLocalFilters: boolean
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  showFilters,
  serverFilters,
  onServerFilterChange,
  onServerFilterSubmit,
  onServerFilterReset,
  localFilters,
  onLocalFilterChange,
  onLocalFilterReset,
  hasActiveLocalFilters,
}) => {
  if (!showFilters) return null

  return (
    <>
      <ServerFilters
        filters={serverFilters}
        onFilterChange={onServerFilterChange}
        onSubmit={onServerFilterSubmit}
        onReset={onServerFilterReset}
      />

      <LocalFilters
        filters={localFilters}
        onFilterChange={onLocalFilterChange}
        onReset={onLocalFilterReset}
        hasActiveFilters={hasActiveLocalFilters}
      />
    </>
  )
}
