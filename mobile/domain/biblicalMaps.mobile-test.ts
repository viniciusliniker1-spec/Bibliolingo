import { describe, expect, it } from "vitest";
import { bibleBookByOsis } from "../../src/content/bible/catalog";
import { biblicalTimeline } from "../content/biblicalContext";
import { BIBLICAL_MAPS, mapForPassage, TIMELINE_MAPS } from "../content/maps/biblicalMaps";
import { COASTLINES } from "../content/maps/coastlines";

describe("mapas bíblicos", () => {
  it("cada mapa tem litoral gerado e lugares dentro do enquadramento", () => {
    for (const map of BIBLICAL_MAPS) {
      const coast = COASTLINES[map.id];
      expect(coast, map.id).toBeDefined();
      const [west, south, east, north] = coast.bbox;
      for (const place of map.places) {
        expect(place, `${map.id}: lugar ausente`).toBeDefined();
        const [lon, lat] = place.at;
        expect(lon >= west && lon <= east && lat >= south && lat <= north, `${map.id}/${place.id}`).toBe(true);
      }
    }
  });
  it("rotas só passam por lugares do próprio mapa", () => {
    for (const map of BIBLICAL_MAPS) {
      const ids = new Set(map.places.map((place) => place.id));
      for (const route of map.routes) for (const stop of route.stops) expect(ids.has(stop), `${map.id}/${route.id}/${stop}`).toBe(true);
    }
  });
  it("liga livros e eventos da linha do tempo aos mapas", () => {
    expect(mapForPassage("Acts", 13)).toBe("paulo");
    expect(mapForPassage("Gen", 1)).toBeUndefined();
    expect(mapForPassage("2Kgs", 25)).toBe("exilio");
    const ids = new Set(BIBLICAL_MAPS.map((map) => map.id));
    for (const [event, map] of Object.entries(TIMELINE_MAPS)) {
      expect(ids.has(map)).toBe(true);
      expect(biblicalTimeline.some((item) => item.id === event), event).toBe(true);
    }
    for (const osis of ["Exod", "Matt", "Acts", "Dan", "1Kgs"]) expect(bibleBookByOsis.get(osis)).toBeDefined();
  });
});
