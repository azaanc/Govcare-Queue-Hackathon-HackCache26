import { places, paths, placeById, helpDeskIds, floorLabel } from "../data/hospital.js";

function adjacency(avoidStairs) {
  const map = new Map();
  const add = (from, edge) => {
    if (!map.has(from)) map.set(from, []);
    map.get(from).push(edge);
  };
  paths.forEach((edge, index) => {
    if (avoidStairs && edge.stairs) return;
    add(edge.from, { ...edge, id: index, to: edge.to, next: edge.from });
    add(edge.to, { ...edge, id: index, to: edge.from, next: edge.to });
  });
  return map;
}

/** Dijkstra shortest path. Returns { nodes, edges, distance, usesStairs } or null. */
export function shortestPath(fromId, toId, avoidStairs = false) {
  if (!fromId || !toId) return null;
  if (fromId === toId) {
    return { nodes: [fromId], edges: [], distance: 0, usesStairs: false };
  }
  const graph = adjacency(avoidStairs);
  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set(places.map((place) => place.id));
  places.forEach((place) => distances.set(place.id, Infinity));
  distances.set(fromId, 0);

  while (unvisited.size) {
    let current = null;
    let best = Infinity;
    unvisited.forEach((id) => {
      const value = distances.get(id) ?? Infinity;
      if (value < best) {
        best = value;
        current = id;
      }
    });
    if (current === null || current === toId) break;
    unvisited.delete(current);
    (graph.get(current) ?? []).forEach((edge) => {
      if (!unvisited.has(edge.to)) return;
      const candidate = (distances.get(current) ?? Infinity) + Math.max(edge.metres, 0);
      if (candidate < (distances.get(edge.to) ?? Infinity)) {
        distances.set(edge.to, candidate);
        previous.set(edge.to, { node: current, edge });
      }
    });
  }

  if (!Number.isFinite(distances.get(toId))) return null;
  const nodes = [toId];
  const edges = [];
  let cursor = toId;
  while (cursor !== fromId) {
    const step = previous.get(cursor);
    if (!step) return null;
    edges.unshift(step.edge);
    cursor = step.node;
    nodes.unshift(cursor);
  }
  return {
    nodes,
    edges,
    distance: Math.round(distances.get(toId)),
    usesStairs: edges.some((edge) => edge.stairs),
  };
}

export function nearestHelpDesk(fromId, avoidStairs = false) {
  const options = helpDeskIds
    .map((id) => ({ id, path: shortestPath(fromId, id, avoidStairs) }))
    .filter((option) => option.path)
    .sort((a, b) => a.path.distance - b.path.distance);
  return options[0] ?? { id: "help-desk", path: shortestPath(fromId, "help-desk", false) };
}

function directionBetween(a, b, c) {
  if (!a || !b || !c) return "straight";
  const first = { x: b.x - a.x, y: b.y - a.y };
  const second = { x: c.x - b.x, y: c.y - b.y };
  const cross = first.x * second.y - first.y * second.x;
  const dot = first.x * second.x + first.y * second.y;
  if (Math.abs(cross) < 0.12 * Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y)) {
    return dot >= 0 ? "straight" : "back";
  }
  return cross > 0 ? "right" : "left";
}

function floorText(floor, language) {
  return floorLabel(floor, language);
}

export function routeInstructions(path, language = "en", t) {
  if (!path || !path.edges.length) return [];
  const start = placeById(path.nodes[0]);
  const destination = placeById(path.nodes[/** last */ path.nodes.length - 1]);
  const instructions = [
    {
      floor: start.floor,
      text: t("routeStart", { place: start.name[language] ?? start.name.en }),
      kind: "start",
    },
  ];

  path.edges.forEach((edge, index) => {
    const from = placeById(edge.next);
    const to = placeById(edge.to);
    const nextPlace = placeById(path.nodes[index + 1] ?? from.id);
    if (edge.vertical) {
      const after = path.edges[index + 1];
      const afterPlace = after ? placeById(after.to) : null;
      // A patient stays in the same lift while it passes intermediate floors.
      if (after?.vertical && afterPlace && afterPlace.type === to.type) return;
      const targetFloor = to.floor;
      if (to.type === "lift") {
        instructions.push({
          floor: targetFloor,
          text: t("useLift", { floor: floorText(targetFloor, language) }),
          kind: "lift",
        });
      } else if (to.type === "stairs") {
        instructions.push({
          floor: targetFloor,
          text: t("useStairs", { floor: floorText(targetFloor, language) }),
          kind: "stairs",
        });
      }
      return;
    }
    if (edge.stairs && nextPlace.type === "stairs" && nextPlace.floor !== from.floor) {
      instructions.push({
        floor: nextPlace.floor,
        text: t("useStairs", { floor: floorText(nextPlace.floor, language) }),
        kind: "stairs",
      });
      return;
    }
    if (edge.stairs) {
      instructions.push({
        floor: nextPlace.floor,
        text: t("useStairs", { floor: floorText(nextPlace.floor, language) }),
        kind: "stairs",
      });
      return;
    }

    const targetIsDestination = nextPlace.id === path.nodes[path.nodes.length - 1];
    const movement =
      index === 0 ? "straight" : directionBetween(previousPlanar(path.nodes, index), from, nextPlace);
    let movementText = "";
    if (index > 0 && movement === "left") movementText = `${t("turnLeft")} `;
    if (index > 0 && movement === "right") movementText = `${t("turnRight")} `;
    if (index > 0 && movement === "straight") movementText = `${t("continueStraight")} `;

    if (targetIsDestination) {
      instructions.push({
        floor: nextPlace.floor,
        text: `${movementText}${t("arriveLandmark", {
          place: nextPlace.name[language] ?? nextPlace.name.en,
          landmark: nextPlace.landmark[language] ?? nextPlace.landmark.en,
        })}`,
        kind: "arrive",
      });
    } else if (["lift", "stairs"].includes(nextPlace.type) && path.edges[index + 1]?.vertical) {
      instructions.push({
        floor: nextPlace.floor,
        text: `${movementText}${t(nextPlace.type === "lift" ? "goToLift" : "goToStairs", {
          landmark: nextPlace.landmark[language] ?? nextPlace.landmark.en,
        })}`,
        kind: "walk",
      });
    } else {
      instructions.push({
        floor: nextPlace.floor,
        text: `${movementText}${t("passLandmark", {
          place: nextPlace.name[language] ?? nextPlace.name.en,
          landmark: nextPlace.landmark[language] ?? nextPlace.landmark.en,
        })}`,
        kind: "walk",
      });
    }
  });

  if (path.usesStairs) {
    instructions.push({ floor: destination.floor, text: t("stairsWarning"), kind: "warning" });
  }
  return instructions;
}

function previousPlanar(nodes, index) {
  // For turn direction, use the node before the current edge within the same floor.
  for (let i = index - 1; i >= 0; i -= 1) {
    const candidate = placeById(nodes[i]);
    const current = placeById(nodes[index]);
    if (candidate.floor === current.floor) return candidate;
  }
  return null;
}

export function routeDistanceTime(distance) {
  return Math.max(1, Math.ceil(distance / 45));
}

export function floorRoute(nodes) {
  const segments = new Map();
  nodes.forEach((id) => {
    const place = placeById(id);
    if (!segments.has(place.floor)) segments.set(place.floor, []);
    segments.get(place.floor).push(id);
  });
  return segments;
}

export function stepFreeHelpPath(fromId, avoidStairs = true) {
  const option = nearestHelpDesk(fromId, avoidStairs);
  return option?.path ?? null;
}
