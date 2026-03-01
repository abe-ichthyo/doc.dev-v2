// Neural network animation — floating nodes with synaptic connections
(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'neurons';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0.4;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let w, h, nodes = [], mouse = { x: -1000, y: -1000 };

  const CONFIG = {
    nodeCount: 80,
    maxDist: 150,
    mouseRadius: 200,
    speed: 0.3,
    nodeRadius: 1.5,
    pulseSpeed: 0.02,
    color: { r: 255, g: 107, b: 107 }, // matches --accent
  };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createNode() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * CONFIG.speed,
      vy: (Math.random() - 0.5) * CONFIG.speed,
      radius: CONFIG.nodeRadius + Math.random() * 1,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    nodes = [];
    for (let i = 0; i < CONFIG.nodeCount; i++) {
      nodes.push(createNode());
    }
  }

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function draw(time) {
    ctx.clearRect(0, 0, w, h);
    const { r, g, b } = CONFIG.color;

    // Update positions
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      n.phase += CONFIG.pulseSpeed;

      // Bounce off edges
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      // Subtle mouse repulsion
      const md = dist(n, mouse);
      if (md < CONFIG.mouseRadius) {
        const force = (1 - md / CONFIG.mouseRadius) * 0.02;
        n.vx += (n.x - mouse.x) * force;
        n.vy += (n.y - mouse.y) * force;
      }

      // Clamp velocity
      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (speed > CONFIG.speed * 2) {
        n.vx = (n.vx / speed) * CONFIG.speed * 2;
        n.vy = (n.vy / speed) * CONFIG.speed * 2;
      }
    }

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = dist(nodes[i], nodes[j]);
        if (d < CONFIG.maxDist) {
          const alpha = (1 - d / CONFIG.maxDist) * 0.6;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Occasional pulse along connection
          const pulse = (Math.sin(time * 0.001 + i + j) + 1) / 2;
          if (pulse > 0.92) {
            const t = (pulse - 0.92) / 0.08;
            const px = nodes[i].x + (nodes[j].x - nodes[i].x) * t;
            const py = nodes[i].y + (nodes[j].y - nodes[i].y) * t;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 1.5})`;
            ctx.fill();
          }
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      const pulse = 0.5 + Math.sin(n.phase) * 0.5;
      const nodeAlpha = 0.3 + pulse * 0.7;
      const nr = n.radius + pulse * 0.5;

      // Glow
      ctx.beginPath();
      ctx.arc(n.x, n.y, nr * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${nodeAlpha * 0.1})`;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(n.x, n.y, nr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${nodeAlpha})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('resize', () => {
    resize();
  });

  init();
  requestAnimationFrame(draw);
})();
