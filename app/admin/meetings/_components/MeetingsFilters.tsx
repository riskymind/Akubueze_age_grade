"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function MeetingsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  )

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "ALL") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      startTransition(() => router.push(`?${params.toString()}`))
    },
    [router, searchParams]
  )

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    clearTimeout((window as unknown as { _mtDebounce?: ReturnType<typeof setTimeout> })._mtDebounce)
    ;(window as unknown as { _mtDebounce?: ReturnType<typeof setTimeout> })._mtDebounce = setTimeout(
      () => updateParam("search", value),
      300
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search meetings..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={searchParams.get("status") ?? "ALL"}
        onValueChange={(v) => updateParam("status", v ?? "ALL")}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="SCHEDULED">Scheduled</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("type") ?? "ALL"}
        onValueChange={(v) => updateParam("type", v ?? "ALL")}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Types</SelectItem>
          <SelectItem value="GENERAL">General</SelectItem>
          <SelectItem value="EXECUTIVE">Executive</SelectItem>
          <SelectItem value="EMERGENCY">Emergency</SelectItem>
          <SelectItem value="ANNUAL">Annual</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
