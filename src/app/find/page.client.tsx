"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, MapPin, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { OnlineMassFallback, ParishCard } from "@/components/find/ParishCard";
import type { Church } from "@/lib/masstimes";
import {
  filterChurches,
  sortChurchesByDistance,
  sortChurchesByTime,
  type ServiceFilter,
} from "@/lib/worship-times";
import { speakFindResultsSummary, type AppLocale } from "@/lib/speech";

const MapView = dynamic(
  () => import("@/components/find/MapView").then((m) => m.MapView),
  { ssr: false, loading: () => <Skeleton className="h-full min-h-[320px] w-full" /> },
);

export default function FindMassPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string>();
  const [service, setService] = useState<ServiceFilter>(
    (searchParams.get("service") as ServiceFilter) ?? "mass",
  );
  const [sort, setSort] = useState<"time" | "distance">("distance");
  const [showAll, setShowAll] = useState(false);
  const spokenForKeyRef = useRef<string | null>(null);

  const loadChurches = useCallback(async (latitude: number, longitude: number, pg = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/churches?lat=${latitude}&lng=${longitude}&page=${pg}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load parishes");
      setChurches((prev) => (pg === 1 ? data.churches : [...prev, ...data.churches]));
      setPage(pg);
      return (pg === 1 ? data.churches : null) as Church[] | null;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load parishes");
      setChurches([]);
      return [] as Church[];
    } finally {
      setLoading(false);
    }
  }, []);

  const maybeSpeakResults = useCallback(
    (list: Church[], place: string, searchKey: string) => {
      if (searchParams.get("speak") !== "1") return;
      if (spokenForKeyRef.current === searchKey) return;
      spokenForKeyRef.current = searchKey;

      const locale: AppLocale = searchParams.get("lang") === "es" ? "es" : "en";
      const byDistance = sortChurchesByDistance(list);
      const closest = byDistance[0];
      const miles = closest?.distance != null ? parseFloat(closest.distance) : null;

      speakFindResultsSummary({
        locale,
        count: list.length,
        closestName: closest?.name,
        closestMiles: miles != null && !Number.isNaN(miles) ? miles : null,
        placeLabel: place,
      });

      if (closest?.id) setSelectedId(closest.id);
    },
    [searchParams],
  );

  const geocodeAndSearch = useCallback(
    async (q: string, searchKey: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Location not found");
        setLat(data.lat);
        setLng(data.lng);
        setLocationLabel(data.displayName);
        const list = await loadChurches(data.lat, data.lng, 1);
        if (list) maybeSpeakResults(list, data.displayName, searchKey);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Search failed");
      } finally {
        setLoading(false);
      }
    },
    [loadChurches, maybeSpeakResults],
  );

  const locateUser = useCallback(
    (searchKey: string) => {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not available in this browser.");
        return;
      }
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setLocationLabel("Your current location");
          const list = await loadChurches(
            pos.coords.latitude,
            pos.coords.longitude,
            1,
          );
          if (list) maybeSpeakResults(list, "Your current location", searchKey);
          setLoading(false);
        },
        (error) => {
          const message =
            error.code === error.PERMISSION_DENIED
              ? "Location permission denied. Search by city or address instead."
              : error.code === error.POSITION_UNAVAILABLE
                ? "Location unavailable. Try searching by city or address."
                : "Could not determine your location. Try searching by city or address.";
          toast.error(message);
          setLoading(false);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
      );
    },
    [loadChurches, maybeSpeakResults],
  );

  const lastQueryRef = useRef<string | null>(null);

  // Re-run when voice/search params change (not only on first mount)
  useEffect(() => {
    const q = searchParams.get("q");
    const locate = searchParams.get("locate");
    const key = locate === "1" ? "locate:1" : q ? `q:${q}` : null;
    if (!key || lastQueryRef.current === key) return;
    lastQueryRef.current = key;

    if (locate === "1") {
      queueMicrotask(() => locateUser(key));
      return;
    }
    if (q) {
      queueMicrotask(() => {
        setQuery(q);
        void geocodeAndSearch(q, key);
      });
    }
  }, [searchParams, geocodeAndSearch, locateUser]);

  const filtered = useMemo(() => {
    let list = showAll
      ? churches
      : filterChurches(churches, { service, day: "all" });
    list = sort === "time" ? sortChurchesByTime(list) : sortChurchesByDistance(list);
    return list;
  }, [churches, service, sort, showAll]);

  return (
    <div className="flex h-[calc(100svh-var(--header-height)-5rem)] flex-col gap-4 p-4 md:h-[calc(100svh-var(--header-height)-1rem)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) {
              void geocodeAndSearch(query.trim(), `q:${query.trim()}`);
            }
          }}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="City, address, or zip code"
            aria-label="Search location"
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Search</span>
          </Button>
        </form>
        <Button
          variant="outline"
          onClick={() => locateUser("locate:manual")}
          disabled={loading}
        >
          <MapPin className="mr-2 h-4 w-4" />
          Use my location
        </Button>
        <Select
          value={service}
          onValueChange={(v) => setService(v as ServiceFilter)}
        >
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mass">Mass</SelectItem>
            <SelectItem value="confession">Confession</SelectItem>
            <SelectItem value="adoration">Adoration</SelectItem>
            <SelectItem value="all">All services</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as "time" | "distance")}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="time">Sort by time</SelectItem>
            <SelectItem value="distance">Sort by distance</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Today only" : "Show all"}
        </Button>
      </div>

      {locationLabel && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing results near: {locationLabel}
        </p>
      )}

      {!lat || !lng ? (
        <Empty className="flex-1 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MapPin />
            </EmptyMedia>
            <EmptyTitle>Find a Mass near you</EmptyTitle>
            <EmptyDescription>
              Three easy ways to start — then filter for Mass, Confession, or Adoration.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="max-w-md gap-4">
            <ol className="w-full list-decimal space-y-2 pl-5 text-left text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Allow location</strong> for nearby parishes
              </li>
              <li>
                <strong className="text-foreground">Type a city or zip</strong> in the search box
                above
              </li>
              <li>
                <strong className="text-foreground">Or watch online</strong> if you cannot travel
              </li>
            </ol>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => locateUser("locate:manual")}>Use my location</Button>
              <Button variant="outline" render={<Link href="/watch" />}>
                Watch Mass online
              </Button>
              <Button variant="ghost" render={<Link href="/guides/new-to-mass" />}>
                New to Mass?
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      ) : (
        <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1 rounded-lg border">
          <ResizablePanel defaultSize={55} minSize={35}>
            <div className="h-full p-2">
              <MapView
                lat={lat}
                lng={lng}
                churches={filtered}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onRecenter={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                  loadChurches(newLat, newLng, 1);
                }}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={45} minSize={30}>
            <ScrollArea className="h-full">
              <div className="space-y-3 p-3">
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading parishes…
                  </div>
                )}
                {!loading && filtered.length === 0 && (
                  <>
                    <OnlineMassFallback />
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle>No parishes match your filters</EmptyTitle>
                        <EmptyDescription>
                          Try expanding your search or load more parishes.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </>
                )}
                {filtered.map((church, index) => (
                  <ParishCard
                    key={church.id}
                    church={church}
                    index={index}
                    selected={selectedId === church.id}
                    onSelect={() => setSelectedId(church.id)}
                  />
                ))}
                {churches.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                    onClick={() => lat && lng && loadChurches(lat, lng, page + 1)}
                  >
                    Load 30 more parishes
                  </Button>
                )}
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}
