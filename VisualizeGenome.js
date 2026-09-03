const nodeMap = {
    0: "Look Up for Wall",
    1: "Look Right for Wall",
    2: "Look Down for Wall",
    3: "Look Left for Wall",
    4: "Look Up for Squirrels",
    5: "Look Right for Squirrels",
    6: "Look Down for Squirrels",
    7: "Look Left for Squirrels",
    8: "Look Up for Treats",
    9: "Look Right for Treats",
    10: "Look Down for Treats",
    11: "Look Left for Treats",
    12: "Look Up for PB",
    13: "Look Right for PB",
    14: "Look Down for PB",
    15: "Look Left for PB",
    16: "Look Up for Powerup",
    17: "Look Right for Powerup",
    18: "Look Down for Powerup",
    19: "Look Left for Powerup",
    20: "Stamina Available",
    21: "Speed",
    22: "Whether Invincible",
    23: "Move Up",
    24: "Move Right",
    25: "Move Down",
    26: "Move Left",
    27: "Sprint"
};

function visualizeGenome(genome, canvas) {
    const ctx = canvas.getContext('2d');
    
    // 1. Clear previous visualization
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!genome || !genome.nodeGenes || !genome.connectionGenes) return;

    // 2. Assign layers to nodes for layout structure
    const nodeLayers = assignLayers(genome);
    const maxLayer = Math.max(...Object.values(nodeLayers), 1);
    
    // Group nodes by their layer index
    const layers = {};
    genome.nodeGenes.forEach(node => {
        const l = nodeLayers[node.id] || 0;
        if (!layers[l]) layers[l] = [];
        layers[l].push(node);
    });

    // 3. Calculate spatial positions (X, Y) for every node
    const positions = {};
    const paddingWidth = 300;
    const paddingHeight = 100;
    const usableWidth = canvas.width - paddingWidth * 2;
    const usableHeight = canvas.height - paddingHeight * 2;

    Object.keys(layers).forEach(layerStr => {
        const layerIdx = parseInt(layerStr);
        const layerNodes = layers[layerIdx];
        
        // X coordinate based on layer depth
        const x = paddingWidth + (layerIdx / maxLayer) * usableWidth;
        
        layerNodes.forEach((node, index) => {
            // Y coordinate spaced evenly within the layer
            const y = paddingHeight + (layerNodes.length > 1 
                ? (index / (layerNodes.length - 1)) * usableHeight 
                : usableHeight / 2);
            
            positions[node.id] = { x, y };
        });
    });

    // 4. Draw Connections (Genes)
    genome.connectionGenes.forEach(conn => {
        // Skip disabled connections
        if (conn.enabled === false) return; 
        // console.log("conn.outNode: ", conn.outNode)
        const fromPos = positions[conn.outNode.id];
        const toPos = positions[conn.inNode.id];
        // console.log("fromPos: ", fromPos);
        // console.log("toPos: ", toPos);
        if (!fromPos || !toPos) return;

        // console.log("fromPos: ", fromPos);
        ctx.beginPath();
        ctx.moveTo(fromPos.x, fromPos.y);
        ctx.lineTo(toPos.x, toPos.y);

        // Color: Green for positive weights, Red for negative weights
        ctx.strokeStyle = conn.weight >= 0 ? '#2CD5C4' : '#CE0058';

        // console.log("conn.weight: ", conn.weight)
        // Thickness scales with weight magnitude
        ctx.lineWidth = Math.min(Math.abs(conn.weight) * 1.5, 5); 
        ctx.stroke();
    });

    // 5. Draw Nodes
    const nodeRadius = 15;
    genome.nodeGenes.forEach(node => {
        const pos = positions[node.id];
        if (!pos) return;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
        
        // Color based on node type
        if (node.nodeType === 'INPUT') ctx.fillStyle = '#861F41';
        else if (node.nodeType === 'OUTPUT') ctx.fillStyle = '#CA4F00';
        else if (node.nodeType === 'HIDDEN') ctx.fillStyle = '#D7D2CB';
        else if (node.nodeType === 'BIAS') ctx.fillStyle = '#508590';                             
        
        ctx.fill();
        
        // Draw border (darker if node has a high bias)
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Label node ID inside or near the node
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px sans-serif';
        ctx.textBaseline = 'middle';
        
        if (node.nodeType === 'INPUT') {
            ctx.textAlign = 'right';
            ctx.fillText(nodeMap[node.id], pos.x - 30, pos.y)
        } else if(node.nodeType === 'OUTPUT') {
            ctx.textAlign = 'left';
            ctx.fillText(nodeMap[node.id], pos.x + 30, pos.y)
        }
    });
}

/**
 * Helper: Sorts nodes into topology layers to prevent backward visual overlapping.
 */
function assignLayers(genome) {
    const layers = {};
    
    // Initialize inputs to layer 0, outputs to a placeholder large layer
    genome.nodeGenes.forEach(node => {
        if (node.nodeType === 'INPUT') layers[node.id] = 0;
    });

    // Push hidden/output layers forward based on graph depth
    let changed = true;
    let iterations = 0;
    const maxIterations = genome.nodeGenes.length * 2; // Prevent infinite loops in cyclic recurrent nets

    while (changed && iterations < maxIterations) {
        changed = false;
        iterations++;

        genome.connectionGenes.forEach(conn => {
            if (conn.enabled === false) return;
            
            const fromLayer = layers[conn.outNode];
            const toLayer = layers[conn.inNode];

            if (fromLayer !== undefined) {
                // The target node must be at least one layer further right than the source node
                if (toLayer === undefined || toLayer <= fromLayer) {
                    layers[conn.inNode] = fromLayer + 1;
                    changed = true;
                }
            }
        });
    }

    // Force outputs to the final layer edge for clean visual structure
    let maxHiddenLayer = 0;
    genome.nodeGenes.forEach(node => {
        if (node.nodeType !== 'OUTPUT' && layers[node.id] > maxHiddenLayer) {
            maxHiddenLayer = layers[node.id];
        }
    });
    
    genome.nodeGenes.forEach(node => {
        if (node.nodeType === 'OUTPUT') {
            layers[node.id] = maxHiddenLayer + 1;
        }
    });

    return layers;
}
