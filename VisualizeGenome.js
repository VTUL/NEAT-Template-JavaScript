const INPUT_LABELS = [
  "Look Up for Wall",
  "Look Right for Wall",
  "Look Down for Wall",
  "Look Left for Wall",
  "Look Up for Squirrels",
  "Look Right for Squirrels",
  "Look Down for Squirrels",
  "Look Left for Squirrels",
  "Look Up for Treats",
  "Look Right for Treats",
  "Look Down for Treats",
  "Look Left for Treats",
  "Look Up for PB",
  "Look Right for PB",
  "Look Down for PB",
  "Look Left for PB",
  "Look Up for Powerup",
  "Look Right for Powerup",
  "Look Down for Powerup",
  "Look Left for Powerup",
  "Stamina Available",
  "Speed",
  "Whether Invincible",
];

const OUTPUT_LABELS = [
  "Move Up",
  "Move Right",
  "Move Down",
  "Move Left",
  "Sprint",
];

function visualizeGenome(genome, canvas) {
  if (!canvas || !genome?.nodeGenes || !genome?.connectionGenes) return;

  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const nodeById = new Map();
  for (let i = 0; i < genome.nodeGenes.length; i++) {
    const node = genome.nodeGenes[i];
    nodeById.set(node.id, node);
  }

  const layers = assignLayers(genome);
  let maxLayer = 0;
  for (const layer of layers.values()) if (layer > maxLayer) maxLayer = layer;

  const grouped = Array.from({ length: maxLayer + 1 }, () => []);
  for (let i = 0; i < genome.nodeGenes.length; i++) {
    const node = genome.nodeGenes[i];
    const layer = Math.max(0, Math.min(maxLayer, layers.get(node.id) ?? 0));
    grouped[layer].push(node);
  }

  const positions = new Map();
  const padX = 300;
  const padY = 100;
  const usableW = Math.max(1, width - padX * 2);
  const usableH = Math.max(1, height - padY * 2);
  const layerGap = maxLayer > 0 ? usableW / maxLayer : 0;

  for (let layer = 0; layer <= maxLayer; layer++) {
    const nodes = grouped[layer];
    if (!nodes.length) continue;
    const x = padX + layer * layerGap;
    const gapY = nodes.length > 1 ? usableH / (nodes.length - 1) : 0;
    for (let i = 0; i < nodes.length; i++) {
      positions.set(nodes[i].id, {
        x,
        y: nodes.length > 1 ? padY + i * gapY : height * 0.5,
      });
    }
  }

  const getNodeId = (n) => (typeof n === "object" && n !== null ? n.id : n);
  const getNodeType = (n) =>
    typeof n === "object" && n !== null
      ? n.nodeType
      : nodeById.get(n)?.nodeType;

  ctx.lineCap = "round";
  for (let i = 0; i < genome.connectionGenes.length; i++) {
    const conn = genome.connectionGenes[i];
    if (!conn.enabled) continue;

    const fromId = getNodeId(conn.outNode);
    const toId = getNodeId(conn.inNode);
    const fromPos = positions.get(fromId);
    const toPos = positions.get(toId);
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

  for (let i = 0; i < genome.nodeGenes.length; i++) {
    const node = genome.nodeGenes[i];
    const pos = positions.get(node.id);
    if (!pos) continue;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);

    switch (node.nodeType) {
      case "INPUT":
        ctx.fillStyle = "#861F41";
        break;
      case "OUTPUT":
        ctx.fillStyle = "#CA4F00";
        break;
      case "HIDDEN":
        ctx.fillStyle = "#D7D2CB";
        break;
      case "BIAS":
        ctx.fillStyle = "#508590";
        break;
      default:
        ctx.fillStyle = "#999999";
    }

    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();

    const label = getNodeLabel(node);
    if (!label) continue;

    ctx.fillStyle = "#FFFFFF";
    if (node.nodeType === "INPUT") {
      ctx.textAlign = "right";
      ctx.fillText(label, pos.x - radius - 8, pos.y);
    } else if (node.nodeType === "OUTPUT") {
      ctx.textAlign = "left";
      ctx.fillText(label, pos.x + radius + 8, pos.y);
    } else {
      ctx.textAlign = "center";
      ctx.fillText(label, pos.x, pos.y - radius - 10);
    }
  }
}

function getNodeLabel(node) {
  if (node.nodeType === "INPUT")
    return INPUT_LABELS[node.id] ?? `Input ${node.id}`;
  if (node.nodeType === "OUTPUT")
    return OUTPUT_LABELS[node.id - INPUT_LABELS.length] ?? `Output ${node.id}`;
}

function assignLayers(genome) {
  const layers = new Map();
  const nodes = genome.nodeGenes;
  const connections = genome.connectionGenes;
  const nodeById = new Map();

  for (let i = 0; i < nodes.length; i++) nodeById.set(nodes[i].id, nodes[i]);

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.nodeType === "INPUT" || node.nodeType === "BIAS")
      layers.set(node.id, 0);
  }

  let changed = true;
  let iterations = 0;
  const maxIterations = nodes.length * 4;

  while (changed && iterations++ < maxIterations) {
    changed = false;
    for (let i = 0; i < connections.length; i++) {
      const conn = connections[i];
      if (!conn.enabled) continue;

      const fromId =
        typeof conn.outNode === "object" ? conn.outNode.id : conn.outNode;
      const toId =
        typeof conn.inNode === "object" ? conn.inNode.id : conn.inNode;
      if (!nodeById.has(fromId) || !nodeById.has(toId)) continue;

      const fromLayer = layers.get(fromId);
      if (fromLayer === undefined) continue;

      const nextLayer = fromLayer + 1;
      const currentLayer = layers.get(toId);
      const targetNode = nodeById.get(toId);

      if (currentLayer === undefined || nextLayer > currentLayer) {
        if (targetNode.nodeType !== "INPUT" && targetNode.nodeType !== "BIAS") {
          layers.set(toId, nextLayer);
          changed = true;
        }
      }
    }
  }

  let maxLayer = 0;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const layer = layers.get(node.id) ?? 0;
    if (node.nodeType !== "OUTPUT" && layer > maxLayer) maxLayer = layer;
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.nodeType === "OUTPUT") layers.set(node.id, maxLayer + 1);
  }

  return layers;
}
