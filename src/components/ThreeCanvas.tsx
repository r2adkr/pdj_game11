import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundFx } from '../utils/soundEffects';

interface ThreeCanvasProps {
  onTriggerCard: () => void;
  playerPosRef: React.MutableRefObject<{ x: number; z: number }>;
  joystickVector: { x: number; y: number };
  currentLevel: number;
  stats: { power: number; shield: number; sanity: number; hack: number };
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  onTriggerCard,
  playerPosRef,
  joystickVector,
  currentLevel,
  stats,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [nearTerminal, setNearTerminal] = useState<string | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a12);
    scene.fog = new THREE.FogExp2(0x070a12, 0.04);

    // 2. Camera Setup (Isometric 2.5D style)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 18, 14);
    camera.lookAt(0, 0, 0);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2638, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Red warning point light at center core
    const coreLight = new THREE.PointLight(0xff2a6d, 2, 12);
    coreLight.position.set(0, 2, 0);
    scene.add(coreLight);

    // 5. Floor & Grid Map Construction
    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c1220,
      roughness: 0.4,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid helper lines
    const gridHelper = new THREE.GridHelper(36, 36, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Facility Wall Barriers
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x131c2e,
      metalness: 0.9,
      roughness: 0.3,
    });

    const createWall = (w: number, h: number, d: number, x: number, z: number) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const wall = new THREE.Mesh(geo, wallMat);
      wall.position.set(x, h / 2, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      scene.add(wall);
    };

    // Outer Perimeter Walls
    createWall(38, 3, 1, 0, -18);
    createWall(38, 3, 1, 0, 18);
    createWall(1, 3, 38, -18, 0);
    createWall(1, 3, 38, 18, 0);

    // Inner Rooms / Corridors
    createWall(12, 2.5, 0.8, -8, -6);
    createWall(12, 2.5, 0.8, 8, 6);
    createWall(0.8, 2.5, 12, 6, -8);
    createWall(0.8, 2.5, 12, -6, 8);

    // 6. Player Character Mesh Setup
    const playerGroup = new THREE.Group();

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.2,
      metalness: 0.9,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    playerGroup.add(body);

    // Visor / Helmet Glow
    const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.8,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.5, 0);
    playerGroup.add(head);

    // Player Flashlight
    const flashlight = new THREE.SpotLight(0x00f0ff, 3, 10, Math.PI / 6, 0.5);
    flashlight.position.set(0, 1.2, 0.2);
    flashlight.target.position.set(0, 0, 3);
    playerGroup.add(flashlight);
    playerGroup.add(flashlight.target);

    scene.add(playerGroup);

    // Initial Player Position
    playerGroup.position.set(playerPosRef.current.x, 0, playerPosRef.current.z);

    // 7. Interactive Terminal Consoles
    const terminals: { id: string; mesh: THREE.Group; x: number; z: number }[] = [];

    const createTerminalNode = (id: string, x: number, z: number, colorHex: number) => {
      const group = new THREE.Group();

      // Console Stand
      const standGeo = new THREE.BoxGeometry(1, 1.6, 0.8);
      const standMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.y = 0.8;
      group.add(stand);

      // Holographic Monitor
      const screenGeo = new THREE.BoxGeometry(0.8, 0.6, 0.1);
      const screenMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(0, 1.8, 0);
      screen.rotation.x = -0.3;
      group.add(screen);

      // Terminal Glow Light
      const pointL = new THREE.PointLight(colorHex, 1.5, 4);
      pointL.position.set(0, 1.8, 0.4);
      group.add(pointL);

      group.position.set(x, 0, z);
      scene.add(group);

      terminals.push({ id, mesh: group, x, z });
    };

    createTerminalNode('터미널 Alpha (알파)', -12, -12, 0x00f0ff);
    createTerminalNode('APEX-9 코어 연결점', 0, -2, 0xff2a6d);
    createTerminalNode('터미널 Beta (베타)', 12, 12, 0x3b82f6);
    createTerminalNode('보안 환기망 발제실', -12, 12, 0xf59e0b);
    createTerminalNode('원자로 동력 제어소', 12, -12, 0x10b981);

    // 8. Patrol AI Drones
    const drones: { mesh: THREE.Group; startX: number; startZ: number; speed: number; dir: number }[] = [
      { mesh: new THREE.Group(), startX: -8, startZ: 0, speed: 0.05, dir: 1 },
      { mesh: new THREE.Group(), startX: 8, startZ: -4, speed: 0.04, dir: -1 },
    ];

    drones.forEach((d) => {
      const droneMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xff2a6d, emissive: 0xff0044, emissiveIntensity: 0.6 })
      );
      d.mesh.add(droneMesh);

      const spot = new THREE.SpotLight(0xff0044, 2, 8, Math.PI / 5);
      spot.position.set(0, 0, 0);
      spot.target.position.set(0, -3, 0);
      d.mesh.add(spot);
      d.mesh.add(spot.target);

      d.mesh.position.set(d.startX, 2, d.startZ);
      scene.add(d.mesh);
    });

    // 9. Floating Ambient Cyber Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 36;
      particlePos[i + 1] = Math.random() * 6 + 0.5;
      particlePos[i + 2] = (Math.random() - 0.5) * 36;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Pulse Core Light
      coreLight.intensity = 1.5 + Math.sin(time * 3) * 0.8;

      // Animate Drones
      drones.forEach((d) => {
        d.mesh.position.x += d.speed * d.dir;
        if (d.mesh.position.x > 14 || d.mesh.position.x < -14) {
          d.dir *= -1;
        }
        d.mesh.position.y = 2 + Math.sin(time * 2) * 0.2;
      });

      // Animate Particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += Math.sin(time + i) * 0.003;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Movement Vector Calculation
      let dx = 0;
      let dz = 0;
      const speed = 7 * delta;

      if (keysPressed.current['w'] || keysPressed.current['arrowup']) dz -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dz += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += 1;

      // Combine Keyboard with Virtual Joystick
      if (joystickVector.x !== 0 || joystickVector.y !== 0) {
        dx = joystickVector.x;
        dz = -joystickVector.y;
      }

      if (dx !== 0 || dz !== 0) {
        const len = Math.sqrt(dx * dx + dz * dz);
        const normX = (dx / len) * speed;
        const normZ = (dz / len) * speed;

        const newX = THREE.MathUtils.clamp(playerGroup.position.x + normX, -16.5, 16.5);
        const newZ = THREE.MathUtils.clamp(playerGroup.position.z + normZ, -16.5, 16.5);

        playerGroup.position.x = newX;
        playerGroup.position.z = newZ;

        // Face Movement Direction
        const angle = Math.atan2(dx, dz);
        playerGroup.rotation.y = angle;

        // Update Position Ref
        playerPosRef.current = { x: newX, z: newZ };

        if (Math.random() < 0.1) {
          soundFx.playFootstep();
        }
      }

      // Smooth Camera Follow
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerGroup.position.x, 0.08);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, playerGroup.position.z + 14, 0.08);
      camera.lookAt(playerGroup.position.x, 0, playerGroup.position.z);

      // Check Proximity to Terminals
      let foundTerminal: string | null = null;
      terminals.forEach((term) => {
        const dist = Math.hypot(playerGroup.position.x - term.x, playerGroup.position.z - term.z);
        if (dist < 2.5) {
          foundTerminal = term.id;
        }
      });

      setNearTerminal(foundTerminal);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentLevel]);

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-950 shadow-2xl">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Terminal Proximity Prompt overlay */}
      {nearTerminal && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
          <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-400 px-5 py-2.5 rounded-lg shadow-lg shadow-cyan-500/20 text-center">
            <p className="text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1">
              [ 감지됨: {nearTerminal} ]
            </p>
            <button
              onClick={() => {
                soundFx.playTerminalClick();
                onTriggerCard();
              }}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded transition-all shadow-md active:scale-95 cursor-pointer"
            >
              [E] 터미널 접속 & 보안 해킹 시작
            </button>
          </div>
        </div>
      )}

      {/* Controls Guidance Overlay */}
      <div className="absolute top-3 left-3 z-10 hidden md:flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 px-3 py-1.5 rounded-md text-[11px] font-mono text-slate-300">
        <span className="bg-slate-800 border border-slate-600 px-1.5 py-0.5 rounded text-cyan-400">WASD / 방향키</span>
        <span>이동</span>
        <span className="text-slate-500">•</span>
        <span className="bg-slate-800 border border-slate-600 px-1.5 py-0.5 rounded text-cyan-400">터미널 접근</span>
        <span>카드 결정</span>
      </div>
    </div>
  );
};
