import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02030A); // deep navy black

const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.set(0, 0, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Jewel Colors
const emerald = new THREE.Color("#00A884");
const sapphire = new THREE.Color("#0047AB");

function getInstanced(geometry, index) {
  const numObjs = 8 + index * 4;
  const step = (Math.PI * 2) / numObjs;

  // Alternate between emerald & sapphire
  const isEmerald = index % 2 === 0;
  const color = isEmerald ? emerald : sapphire;

  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.3,
    metalness: 1.0,
    roughness: 0.2
  });

  const mesh = new THREE.InstancedMesh(geometry, material, numObjs);
  const matrix = new THREE.Matrix4();
  const radius = 1 + index * 0.6;
  const z = -0.5 + index * -0.25;
  const size = 0.5;
  const axis = new THREE.Vector3(0, 0, 1);

  for (let i = 0; i < numObjs; i++) {
    const x = Math.cos(step * i) * radius;
    const y = Math.sin(step * i) * radius;
    const pos = new THREE.Vector3(x, y, z);
    const quat = new THREE.Quaternion();
    const scale = new THREE.Vector3().setScalar(size);
    quat.setFromAxisAngle(axis, step * i);
    matrix.compose(pos, quat, scale);
    mesh.setMatrixAt(i, matrix);
  }

  return mesh;
}

// Geometries
const geoms = [
  new THREE.BoxGeometry(),
  new THREE.SphereGeometry(0.66, 16, 16),
  new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16),
  new THREE.ConeGeometry(0.5, 1, 4)
];

// Rings
for (let i = 0; i < 10; i++) {
  scene.add(getInstanced(geoms[i % geoms.length], i));
}

// Centerpiece = Emerald
const middle = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16),
  new THREE.MeshStandardMaterial({
    color: emerald,
    emissive: emerald,
    emissiveIntensity: 0.5,
    metalness: 1.0,
    roughness: 0.2
  })
);
scene.add(middle);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.1));
const pointLight = new THREE.PointLight(0xffffff, 2, 50);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Subtle Bloom
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(undefined, 0.6, 0.4, 0.2)); // elegant softness

function animate() {
  requestAnimationFrame(animate);
  scene.rotation.z += 0.002; // gentle spin
  controls.update();
  composer.render();
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
