(function () {
  const root = document.documentElement;
  const storedTheme = localStorage.getItem("portfolio-theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initialTheme = storedTheme || (prefersLight ? "light" : "dark");
  root.dataset.theme = initialTheme;

  const themeToggle = document.querySelector("[data-theme-toggle]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const counters = document.querySelectorAll("[data-counter]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const refreshIcons = () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  const updateThemeIcon = () => {
    const iconName = root.dataset.theme === "light" ? "moon" : "sun";
    if (!themeToggle) return;
    themeToggle.innerHTML = `<i data-lucide="${iconName}"></i>`;
    refreshIcons();
  };

  themeToggle?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("portfolio-theme", root.dataset.theme);
    updateThemeIcon();
  });

  menuToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", Boolean(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    menuToggle.innerHTML = `<i data-lucide="${isOpen ? "x" : "menu"}"></i>`;
    refreshIcons();
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuToggle?.setAttribute("aria-label", "Open menu");
      if (menuToggle) {
        menuToggle.innerHTML = '<i data-lucide="menu"></i>';
      }
      refreshIcons();
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const counter = entry.target;
        const goal = Number(counter.dataset.counter);
        const suffix = counter.parentElement?.querySelector("span")?.textContent || "";
        const duration = reduceMotion ? 0 : 1200;
        const start = performance.now();

        const tick = (now) => {
          const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.round(goal * eased).toString();
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else if (suffix.includes("uptime")) {
            counter.textContent = "95";
          }
        };

        requestAnimationFrame(tick);
        counterObserver.unobserve(counter);
      });
    },
    { threshold: 0.8 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  function initThreeHero() {
    const canvas = document.querySelector("#hero-canvas");
    if (!canvas || !window.THREE) return;

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x000000, 0);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
    camera.position.set(0, 0.2, 12);

    const group = new THREE.Group();
    group.position.set(2.4, -0.15, 0);
    scene.add(group);

    const ambient = new THREE.AmbientLight(0xffffff, 0.58);
    scene.add(ambient);

    const mintLight = new THREE.PointLight(0x55d68c, 2.2, 34);
    mintLight.position.set(5, 3, 7);
    scene.add(mintLight);

    const coralLight = new THREE.PointLight(0xff725e, 2.1, 30);
    coralLight.position.set(-4, -3, 6);
    scene.add(coralLight);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.72, 2),
      new THREE.MeshStandardMaterial({
        color: 0x55d68c,
        roughness: 0.34,
        metalness: 0.28,
        emissive: 0x102b18,
        transparent: true,
        opacity: 0.86
      })
    );
    group.add(core);

    const coreWire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.84, 2),
      new THREE.MeshBasicMaterial({
        color: 0xf5bf43,
        wireframe: true,
        transparent: true,
        opacity: 0.34
      })
    );
    group.add(coreWire);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x42d7d2,
      transparent: true,
      opacity: 0.54,
      side: THREE.DoubleSide
    });

    const ringA = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.015, 16, 180), ringMaterial);
    ringA.rotation.set(Math.PI / 2.2, 0.15, 0.35);
    group.add(ringA);

    const ringB = new THREE.Mesh(
      new THREE.TorusGeometry(4.2, 0.012, 16, 220),
      new THREE.MeshBasicMaterial({
        color: 0xff725e,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide
      })
    );
    ringB.rotation.set(Math.PI / 2.7, Math.PI / 4, -0.2);
    group.add(ringB);

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(2.55, 0.026, 220, 12, 2, 5),
      new THREE.MeshBasicMaterial({
        color: 0xf5bf43,
        transparent: true,
        opacity: 0.42
      })
    );
    knot.rotation.set(0.7, 0.2, 0.1);
    group.add(knot);

    const nodeGeometry = new THREE.SphereGeometry(0.075, 16, 16);
    const nodeMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x55d68c, emissive: 0x102b18, roughness: 0.25 }),
      new THREE.MeshStandardMaterial({ color: 0xff725e, emissive: 0x35120f, roughness: 0.25 }),
      new THREE.MeshStandardMaterial({ color: 0xf5bf43, emissive: 0x2d220b, roughness: 0.25 }),
      new THREE.MeshStandardMaterial({ color: 0x42d7d2, emissive: 0x092b2a, roughness: 0.25 })
    ];
    const nodes = [];

    for (let i = 0; i < 28; i += 1) {
      const angle = (i / 28) * Math.PI * 2;
      const radius = 2.45 + (i % 4) * 0.48;
      const node = new THREE.Mesh(nodeGeometry, nodeMaterials[i % nodeMaterials.length]);
      node.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.8) * 0.72, Math.sin(angle) * radius);
      node.userData = { angle, radius, speed: 0.14 + (i % 5) * 0.025, phase: i * 0.37 };
      group.add(node);
      nodes.push(node);
    }

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.13
    });
    const linePositions = [];
    nodes.forEach((node, index) => {
      const next = nodes[(index + 7) % nodes.length];
      linePositions.push(node.position.x, node.position.y, node.position.z);
      linePositions.push(next.position.x, next.position.y, next.position.z);
    });
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const constellation = new THREE.LineSegments(lineGeometry, lineMaterial);
    group.add(constellation);

    const particleCount = window.innerWidth < 720 ? 420 : 820;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const palette = [
      new THREE.Color(0x55d68c),
      new THREE.Color(0xff725e),
      new THREE.Color(0xf5bf43),
      new THREE.Color(0x42d7d2),
      new THREE.Color(0xf7f1e8)
    ];

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      const radius = 7 + Math.random() * 13;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.58;
      particlePositions[i3 + 2] = radius * Math.cos(phi);

      const color = palette[i % palette.length];
      particleColors[i3] = color.r;
      particleColors[i3 + 1] = color.g;
      particleColors[i3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: 0.034,
        transparent: true,
        opacity: 0.7,
        vertexColors: true,
        depthWrite: false
      })
    );
    scene.add(particles);

    const mouse = new THREE.Vector2(0, 0);
    window.addEventListener("pointermove", (event) => {
      mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (event.clientY / window.innerHeight - 0.5) * -2;
    });

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();

      if (clientWidth < 720) {
        group.position.set(0.7, -0.4, 0);
        group.scale.setScalar(0.78);
      } else if (clientWidth < 980) {
        group.position.set(1.7, -0.2, 0);
        group.scale.setScalar(0.88);
      } else {
        group.position.set(2.8, -0.15, 0);
        group.scale.setScalar(1);
      }
    };

    const updateLines = () => {
      const positions = constellation.geometry.attributes.position.array;
      let pointer = 0;
      nodes.forEach((node, index) => {
        const next = nodes[(index + 7) % nodes.length];
        positions[pointer] = node.position.x;
        positions[pointer + 1] = node.position.y;
        positions[pointer + 2] = node.position.z;
        positions[pointer + 3] = next.position.x;
        positions[pointer + 4] = next.position.y;
        positions[pointer + 5] = next.position.z;
        pointer += 6;
      });
      constellation.geometry.attributes.position.needsUpdate = true;
    };

    const clock = new THREE.Clock();
    let rafId;

    const render = () => {
      const elapsed = clock.getElapsedTime();

      if (!reduceMotion) {
        core.rotation.x = elapsed * 0.19;
        core.rotation.y = elapsed * 0.32;
        coreWire.rotation.x = -elapsed * 0.16;
        coreWire.rotation.y = elapsed * 0.28;
        ringA.rotation.z = elapsed * 0.22;
        ringB.rotation.z = -elapsed * 0.18;
        knot.rotation.x = elapsed * 0.08;
        knot.rotation.y = elapsed * 0.2;
        particles.rotation.y = elapsed * 0.018;
        particles.rotation.x = Math.sin(elapsed * 0.15) * 0.04;

        nodes.forEach((node) => {
          const nextAngle = node.userData.angle + elapsed * node.userData.speed;
          const radius = node.userData.radius + Math.sin(elapsed + node.userData.phase) * 0.08;
          node.position.x = Math.cos(nextAngle) * radius;
          node.position.z = Math.sin(nextAngle) * radius;
          node.position.y = Math.sin(nextAngle * 1.8 + node.userData.phase) * 0.72;
        });
        updateLines();
      }

      group.rotation.y += (mouse.x * 0.16 - group.rotation.y) * 0.025;
      group.rotation.x += (mouse.y * 0.1 - group.rotation.x) * 0.025;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    render();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        clock.getDelta();
        render();
      }
    });
  }

  refreshIcons();
  updateThemeIcon();

  if (document.readyState === "complete") {
    initThreeHero();
  } else {
    window.addEventListener("load", initThreeHero, { once: true });
  }
})();
