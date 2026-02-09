"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const speciesFilters = [
  { label: "All", value: "ALL" },
  { label: "Dogs", value: "DOG" },
  { label: "Cats", value: "CAT" },
];

export function PatientSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") ?? "";
  const currentSpecies = searchParams.get("species") ?? "ALL";

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value && value !== "ALL" && value !== "") {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      }
      return newParams.toString();
    },
    [searchParams]
  );

  function handleSearchChange(value: string) {
    startTransition(() => {
      const qs = createQueryString({ search: value });
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  }

  function handleSpeciesChange(species: string) {
    startTransition(() => {
      const qs = createQueryString({ species });
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, owner, or HN..."
          defaultValue={currentSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
        {speciesFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={currentSpecies === filter.value ? "default" : "ghost"}
            size="sm"
            onClick={() => handleSpeciesChange(filter.value)}
            disabled={isPending}
          >
            {filter.value === "DOG" && "🐕 "}
            {filter.value === "CAT" && "🐈 "}
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
