"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function MembersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateParam("search", searchValue)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchValue, updateParam])

  const clearFilters = () => {
    setSearchValue("")
    router.push("?")
  }

  const hasFilters =
    searchParams.get("search") ||
    searchParams.get("status") ||
    searchParams.get("role") ||
    searchParams.get("gender")

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search members..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        value={searchParams.get("status") ?? ""}
        onValueChange={(v) => updateParam("status", v ?? "")}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="SUSPENDED">Suspended</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("role") ?? ""}
        onValueChange={(v) => updateParam("role", v ?? "")}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="MEMBER">Member</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("gender") ?? ""}
        onValueChange={(v) => updateParam("gender", v ?? "")}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="MALE">Male</SelectItem>
          <SelectItem value="FEMALE">Female</SelectItem>
          <SelectItem value="OTHER">Other</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="size-3.5 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
