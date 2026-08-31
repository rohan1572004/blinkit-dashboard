// =========================================================
//  BLINKIT ANALYTICS — THREE.JS 3D BACKGROUND ENGINE
// =========================================================

let scene, camera, renderer, floatingGroup, particles;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

document.addEventListener('DOMContentLoaded', () => {
  initThreeBackground();
  init3DCardParallax();
});

function initThreeBackground() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  // 1. Scene setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  // 2. Renderer setup
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 3. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffc400, 1.2);
  dirLight.position.set(20, 20, 20);
  scene.add(dirLight);

  const pointLight = new THREE.PointLight(0x10b981, 0.8, 50);
  pointLight.position.set(-15, -15, 10);
  scene.add(pointLight);

  // 4. Floating 3D Packages / Cubes Group
  floatingGroup = new THREE.Group();

  const cubeGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffc400, roughness: 0.3, metalness: 0.1 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.2 });

  for (let i = 0; i < 24; i++) {
    const mat = i % 2 === 0 ? yellowMat : blackMat;
    const mesh = new THREE.Mesh(cubeGeo, mat);

    mesh.position.x = (Math.random() - 0.5) * 50;
    mesh.position.y = (Math.random() - 0.5) * 35;
    mesh.position.z = (Math.random() - 0.5) * 20 - 5;

    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;

    const scale = 0.6 + Math.random() * 0.8;
    mesh.scale.set(scale, scale, scale);

    mesh.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.015,
      rotSpeedY: (Math.random() - 0.5) * 0.015,
      floatSpeed: 0.005 + Math.random() * 0.01,
      initialY: mesh.position.y
    };

    floatingGroup.add(mesh);
  }
  scene.add(floatingGroup);

  // 5. Ambient Background Particle Cloud
  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 120;
  const posArray = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 80;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.25,
    color: 0xffc400,
    transparent: true,
    opacity: 0.4
  });

  particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Mouse Listener for 3D Camera Parallax
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onWindowResize);

  animateThree();
}

function onMouseMove(event) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animateThree() {
  requestAnimationFrame(animateThree);

  // Smooth lerp mouse parallax
  targetX += (mouseX * 4 - targetX) * 0.05;
  targetY += (mouseY * 4 - targetY) * 0.05;

  camera.position.x = targetX;
  camera.position.y = targetY;
  camera.lookAt(scene.position);

  // Rotate floating cubes
  floatingGroup.children.forEach(mesh => {
    mesh.rotation.x += mesh.userData.rotSpeedX;
    mesh.rotation.y += mesh.userData.rotSpeedY;
    mesh.position.y += Math.sin(Date.now() * 0.001 + mesh.position.x) * 0.005;
  });

  if (particles) {
    particles.rotation.y += 0.0005;
  }

  renderer.render(scene, camera);
}

// ── 3D CARD PARALLAX TILT EFFECT ──────────────────────────
function init3DCardParallax() {
  document.addEventListener('mousemove', e => {
    const cards = document.querySelectorAll('.card, .kpi-b-card, .hero-card');
    const x = (window.innerWidth / 2 - e.pageX) / 45;
    const y = (window.innerHeight / 2 - e.pageY) / 45;

    cards.forEach(card => {
      card.style.transform = `perspective(1000px) rotateY(${-x * 0.2}deg) rotateX(${y * 0.2}deg)`;
    });
  });
}
