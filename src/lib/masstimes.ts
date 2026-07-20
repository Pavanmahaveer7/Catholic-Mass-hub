export type WorshipTime = {
  id: string;
  day_of_week: string;
  service_typename: string | null;
  time_start: string | null;
  time_end: string | null;
  language: string | null;
  comment: string | null;
  is_perpetual: boolean;
};

export type Church = {
  id: string;
  name: string;
  church_address_street_address: string;
  church_address_city_name: string;
  church_address_providence_name: string;
  church_address_postal_code: string;
  church_address_country_territory_name: string;
  latitude: string;
  longitude: string;
  distance: string | null;
  phone_number: string;
  url: string;
  email: string;
  diocese_name: string;
  rite_type_name: string;
  language_name: string;
  church_worship_times: WorshipTime[];
  last_update: string;
  wheel_chair_access: boolean | null;
};

const MASS_TIMES_BASE = "https://apiv4.updateparishdata.org/Churchs";

export async function fetchChurches(
  lat: number,
  lng: number,
  page = 1,
): Promise<Church[]> {
  const url = `${MASS_TIMES_BASE}/?lat=${lat}&long=${lng}&pg=${page}`;
  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`MassTimes API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchChurch(id: string): Promise<Church> {
  const res = await fetch(`${MASS_TIMES_BASE}/${id}`, {
    next: { revalidate: 3600 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`MassTimes API error: ${res.status}`);
  }

  return res.json();
}
