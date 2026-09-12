const INPUT_LABELS = [
  "Look Up for Wall", "Look Right for Wall", "Look Down for Wall", "Look Left for Wall",
  "Look Up for Squirrels", "Look Right for Squirrels", "Look Down for Squirrels", "Look Left for Squirrels",
  "Look Up for Treats", "Look Right for Treats", "Look Down for Treats", "Look Left for Treats",
  "Look Up for PB", "Look Right for PB", "Look Down for PB", "Look Left for PB",
  "Look Up for Powerup", "Look Right for Powerup", "Look Down for Powerup", "Look Left for Powerup",
  "Stamina Available", "Speed", "Whether Invincible",
];

const OUTPUT_LABELS = ["Move Up", "Move Right", "Move Down", "Move Left", "Sprint"];

function visualizeGenome(genome, canvas) {
  if (!canvas || !genome?.nodeGenes || !genome?.connectionGenes) return;

  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const nodeById = new Map(genome.nodeGenes.map((node) => [node.id, node]));
  const layers = assignLayers(genome);
  const maxLayer = Math.max(0, ...layers.values());
  const grouped = Array.from({ length: maxLayer + 1 }, () => []);

  for (const node of genome.nodeGenes) {
    grouped[layers.get(node.id) ?? 0].push(node);
  }

  const positions = new Map();
  const padX = 300;
  const padY = 100;
  const usableW = Math.max(1, width - padX * 2);
  const usableH = Math.max(1, height - padY * 2);
  const layerGap = maxLayer ? usableW / maxLayer : 0;

  for (let layer = 0; layer <= maxLayer; layer++) {
    const nodes = grouped[layer];
    const x = padX + layer * layerGap;
    const gapY = nodes.length > 1 ? usableH / (nodes.length - 1) : 0;

    for (let i = 0; i < nodes.length; i++) {
      positions.set(nodes[i].id, {
        x,
        y: nodes.length > 1 ? padY + i * gapY : height * 0.5,
      });
    }
  }

  const getNodeId = (node) => (typeof node === "object" && node ? node.id : node);
  ctx.lineCap = "round";

  for (const conn of genome.connectionGenes) {
    if (!conn.enabled) continue;
    const fromPos = positions.get(getNodeId(conn.outNode));
    const toPos = positions.get(getNodeId(conn.inNode));
    if (!fromPos || !toPos) continue;

    ctx.beginPath();
    ctx.moveTo(fromPos.x, fromPos.y);
    ctx.lineTo(toPos.x, toPos.y);
    ctx.strokeStyle = conn.weight >= 0 ? "#2CD5C4" : "#CE0058";
    ctx.lineWidth = Math.min(1 + Math.abs(conn.weight) * 1.25, 5);
    ctx.stroke();
  }

  const radius = 15;
  ctx.textBaseline = "middle";
  ctx.font = "24px sans-serif";

  for (const node of genome.nodeGenes) {
    const pos = positions.get(node.id);
    if (!pos) continue;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = node.nodeType === "INPUT" ? "#861F41" :
      node.nodeType === "OUTPUT" ? "#CA4F00" :
      node.nodeType === "HIDDEN" ? "#D7D2CB" :
      node.nodeType === "BIAS" ? "#508590" : "#999999";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();

    const label = getNodeLabel(node);
    if (!label) continue;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = node.nodeType === "INPUT" ? "right" : node.nodeType === "OUTPUT" ? "left" : "center";
    ctx.fillText(label, node.nodeType === "INPUT" ? pos.x - radius - 8 : node.nodeType === "OUTPUT" ? pos.x + radius + 8 : pos.x, node.nodeType === "HIDDEN" || node.nodeType === "BIAS" ? pos.y - radius - 10 : pos.y);
  }
}

function getNodeLabel(node) {
  if (node.nodeType === "INPUT") return INPUT_LABELS[node.id] ?? `Input ${node.id}`;
  if (node.nodeType === "OUTPUT") return OUTPUT_LABELS[node.id - INPUT_LABELS.length] ?? `Output ${node.id}`;
}

function assignLayers(genome) {
  const nodes = genome.nodeGenes;
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const idOf = (node) => (typeof node === "object" && node ? node.id : node);

  // Recurrent links are allowed by the NEAT configuration.  A longest-path
  // relaxation over a cycle never converges, so calculate a finite DFS layer
  // and ignore only the back-edge currently being traversed.
  const incoming = new Map(nodes.map((node) => [node.id, []]));
  for (const conn of genome.connectionGenes) {
    if (!conn.enabled) continue;
    const from = idOf(conn.outNode);
    const to = idOf(conn.inNode);
    const target = nodeById.get(to);
    if (!nodeById.has(from) || !target || target.nodeType === "INPUT" || target.nodeType === "BIAS") continue;
    incoming.get(to).push(from);
  }

  const layers = new Map();
  const visiting = new Set();
  const layerFor = (id) => {
    const node = nodeById.get(id);
    if (!node || node.nodeType === "INPUT" || node.nodeType === "BIAS") return 0;
    if (layers.has(id)) return layers.get(id);
    if (visiting.has(id)) return 0; // recurrent/back edge

    visiting.add(id);
    let layer = 1;
    for (const sourceId of incoming.get(id) ?? []) {
      const source = nodeById.get(sourceId);
      if (!source || source.nodeType === "OUTPUT") continue;
      layer = Math.max(layer, layerFor(sourceId) + 1);
    }
    visiting.delete(id);
    layers.set(id, layer);
    return layer;
  };

  let maxInternalLayer = 0;
  for (const node of nodes) {
    if (node.nodeType === "INPUT" || node.nodeType === "BIAS" || node.nodeType === "OUTPUT") {
      if (node.nodeType !== "OUTPUT") layers.set(node.id, 0);
      continue;
    }
    maxInternalLayer = Math.max(maxInternalLayer, layerFor(node.id));
  }

  for (const node of nodes) {
    if (node.nodeType === "OUTPUT") layers.set(node.id, maxInternalLayer + 1);
  }
  return layers;
}