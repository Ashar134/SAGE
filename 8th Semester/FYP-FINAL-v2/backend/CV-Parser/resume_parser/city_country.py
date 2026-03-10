from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Optional

import pycountry

# A compact city -> country mapping for common global cities.
# Users can extend this by editing `extra_cities.json` in the same folder.
CITY_TO_COUNTRY: Dict[str, str] = {
    # North America
    "new york": "United States",
    "san francisco": "United States",
    "seattle": "United States",
    "austin": "United States",
    "chicago": "United States",
    "boston": "United States",
    "los angeles": "United States",
    "washington": "United States",
    "toronto": "Canada",
    "vancouver": "Canada",
    "montreal": "Canada",
    "ottawa": "Canada",
    "mexico city": "Mexico",
    "guadalajara": "Mexico",
    # Europe
    "london": "United Kingdom",
    "manchester": "United Kingdom",
    "edinburgh": "United Kingdom",
    "dublin": "Ireland",
    "paris": "France",
    "berlin": "Germany",
    "munich": "Germany",
    "frankfurt": "Germany",
    "rome": "Italy",
    "milan": "Italy",
    "madrid": "Spain",
    "barcelona": "Spain",
    "lisbon": "Portugal",
    "amsterdam": "Netherlands",
    "rotterdam": "Netherlands",
    "brussels": "Belgium",
    "zurich": "Switzerland",
    "geneva": "Switzerland",
    "stockholm": "Sweden",
    "oslo": "Norway",
    "copenhagen": "Denmark",
    "helsinki": "Finland",
    "prague": "Czech Republic",
    "vienna": "Austria",
    "warsaw": "Poland",
    "budapest": "Hungary",
    "bucharest": "Romania",
    "sofia": "Bulgaria",
    "athens": "Greece",
    "kyiv": "Ukraine",
    # Asia
    "dubai": "United Arab Emirates",
    "abu dhabi": "United Arab Emirates",
    "doha": "Qatar",
    "riyadh": "Saudi Arabia",
    "jeddah": "Saudi Arabia",
    "amman": "Jordan",
    "istanbul": "Turkey",
    "ankara": "Turkey",
    "mumbai": "India",
    "pune": "India",
    "bangalore": "India",
    "bengaluru": "India",
    "hyderabad": "India",
    "chennai": "India",
    "kolkata": "India",
    "delhi": "India",
    "new delhi": "India",
    "noida": "India",
    "gurgaon": "India",
    "mysore": "India",
    "ahmedabad": "India",
    "jaipur": "India",
    "lucknow": "India",
    "kochi": "India",
    "trivandrum": "India",
    "ahmedabad": "India",
    "islamabad": "Pakistan",
    "lahore": "Pakistan",
    "karachi": "Pakistan",
    "beijing": "China",
    "shanghai": "China",
    "hong kong": "China",
    "singapore": "Singapore",
    "kuala lumpur": "Malaysia",
    "jakarta": "Indonesia",
    "manila": "Philippines",
    "bangkok": "Thailand",
    "hanoi": "Vietnam",
    "ho chi minh city": "Vietnam",
    "tokyo": "Japan",
    "osaka": "Japan",
    "seoul": "South Korea",
    "taipei": "Taiwan",
    # Oceania
    "sydney": "Australia",
    "melbourne": "Australia",
    "brisbane": "Australia",
    "perth": "Australia",
    "auckland": "New Zealand",
    "wellington": "New Zealand",
    # Africa
    "cairo": "Egypt",
    "alexandria": "Egypt",
    "lagos": "Nigeria",
    "abuja": "Nigeria",
    "johannesburg": "South Africa",
    "cape town": "South Africa",
    "nairobi": "Kenya",
    "casablanca": "Morocco",
    "tunis": "Tunisia",
    "accra": "Ghana",
    # South America
    "sao paulo": "Brazil",
    "rio de janeiro": "Brazil",
    "brasilia": "Brazil",
    "buenos aires": "Argentina",
    "santiago": "Chile",
    "lima": "Peru",
    "bogota": "Colombia",
    "medellin": "Colombia",
    "montevideo": "Uruguay",
}


def _load_extra_cities() -> Dict[str, str]:
    extra_path = Path(__file__).with_name("extra_cities.json")
    if not extra_path.exists():
        return {}
    try:
        with extra_path.open("r", encoding="utf-8") as fh:
            data = json.load(fh)
        return {k.lower(): v for k, v in data.items()}
    except Exception:
        return {}


EXTRA_CITY_TO_COUNTRY = _load_extra_cities()


def infer_country(city: Optional[str], text_blob: str | None = None) -> Optional[str]:
    """
    Attempt to infer country from a city name or any explicit country mention.
    """
    if not city and not text_blob:
        return None

    if text_blob:
        # If the country is directly mentioned, return it.
        text_lower = text_blob.lower()
        for c in pycountry.countries:
            if c.name and c.name.lower() in text_lower:
                return c.name

    if not city:
        return None

    city_key = city.lower().strip()
    if city_key in EXTRA_CITY_TO_COUNTRY:
        return EXTRA_CITY_TO_COUNTRY[city_key]
    if city_key in CITY_TO_COUNTRY:
        return CITY_TO_COUNTRY[city_key]

    # Try matching country names that are part of the city string (e.g., "Paris, France")
    for c in pycountry.countries:
        if c.name and c.name.lower() in city_key:
            return c.name

    return None


def is_country(name: str) -> bool:
    name_lower = name.strip().lower()
    for c in pycountry.countries:
        if c.name and c.name.lower() == name_lower:
            return True
    return False
