import * as THREE from 'three';

/**
 * Создает процедурную текстуру для коробки Funko POP с окном, номером, логотипом
 */
function createBoxCanvasTexture(character, face) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  const p = character.threeParams || {};
  const boxColor = p.boxColor || '#1e293b';
  const accentColor = p.accentColor || '#ef4444';

  ctx.fillStyle = boxColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Верхняя полоса
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 0, canvas.width, 140);

  // Текст POP!
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px Montserrat, Arial, sans-serif';
  ctx.fillText('POP!', 30, 95);

  // Кружок с номером
  ctx.beginPath();
  ctx.arc(canvas.width - 70, 70, 48, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 36px Montserrat, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(character.popNumber || '100', canvas.width - 70, 70);

  // Заголовок персонажа
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px Montserrat, Arial, sans-serif';
  ctx.fillText(character.title || 'Funko Figure', 30, 200);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '24px Montserrat, Arial, sans-serif';
  ctx.fillText(character.franchise || 'VINYL FIGURE', 30, 235);

  if (face === 'front') {
    // Рамка прозрачного окна
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 270, canvas.width - 60, 400);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(35, 275, canvas.width - 70, 390);

    // Надпись внизу
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Montserrat, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VINYL FIGURE / FIGURINE EN VINYLE', canvas.width / 2, canvas.height - 35);
  } else if (face === 'back') {
    // Задняя сторона коробки: коллекция
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Montserrat, Arial, sans-serif';
    ctx.fillText('COLLECT THEM ALL!', 30, 300);

    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(30 + (i % 2) * 230, 340 + Math.floor(i / 2) * 160, 200, 130);
      ctx.fillStyle = accentColor;
      ctx.fillRect(30 + (i % 2) * 230, 340 + Math.floor(i / 2) * 160, 200, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Montserrat, Arial, sans-serif';
      ctx.fillText(`Series #${i + 1}`, 40 + (i % 2) * 230, 360 + Math.floor(i / 2) * 160);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Создает 3D персонажа Funko POP в виниловом стиле с поддержкой финиша
 */
export function createFunkoFigure(character, finishType = 'classic') {
  const figureGroup = new THREE.Group();
  figureGroup.name = 'funko_figure';

  const p = character.threeParams || {};
  let figureColor = new THREE.Color(p.figureColor || '#0284c7');
  let accentColor = new THREE.Color(p.accentColor || '#ef4444');
  let eyesColor = new THREE.Color(p.eyesColor || '#09090b');
  let detailsColor = new THREE.Color(p.detailsColor || '#38bdf8');

  let roughness = 0.35;
  let metalness = 0.05;

  if (finishType === 'glossy') {
    roughness = 0.12;
    metalness = 0.25;
  } else if (finishType === 'metallic') {
    // Золотой Chase Edition!
    figureColor = new THREE.Color('#eab308');
    accentColor = new THREE.Color('#ca8a04');
    roughness = 0.2;
    metalness = 0.85;
  }

  // Материал винила
  const vinylMaterial = new THREE.MeshStandardMaterial({
    color: figureColor,
    roughness,
    metalness
  });

  const vinylAccentMaterial = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness,
    metalness
  });

  const eyesMaterial = new THREE.MeshStandardMaterial({
    color: eyesColor,
    roughness: 0.1,
    metalness: 0.2
  });

  // --- 1. ГОЛОВА FUNKO ---
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.35;

  const headGeo = new THREE.BoxGeometry(1.6, 1.35, 1.35, 8, 8, 8);
  const headPos = headGeo.attributes.position;
  for (let i = 0; i < headPos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(headPos, i);
    const len = v.length();
    v.normalize().multiplyScalar(Math.min(len, 1.05));
    headPos.setXYZ(i, v.x * 1.05, v.y * 0.95, v.z * 0.95);
  }
  headGeo.computeVertexNormals();

  const headMesh = new THREE.Mesh(headGeo, vinylMaterial);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  headGroup.add(headMesh);

  // Глаза Funko
  const eyeGeo = new THREE.SphereGeometry(0.22, 24, 24);
  eyeGeo.scale(1, 1, 0.45);

  const leftEye = new THREE.Mesh(eyeGeo, eyesMaterial);
  leftEye.position.set(-0.48, 0.02, 0.65);
  leftEye.rotation.y = -0.05;
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyesMaterial);
  rightEye.position.set(0.48, 0.02, 0.65);
  rightEye.rotation.y = 0.05;
  headGroup.add(rightEye);

  // Блики в глазах
  const shineGeo = new THREE.SphereGeometry(0.06, 12, 12);
  const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const leftShine = new THREE.Mesh(shineGeo, shineMat);
  leftShine.position.set(-0.42, 0.08, 0.72);
  headGroup.add(leftShine);

  const rightShine = new THREE.Mesh(shineGeo, shineMat);
  rightShine.position.set(0.54, 0.08, 0.72);
  headGroup.add(rightShine);

  // Кастомизация персонажей
  if (p.type === 'stitch') {
    const earGeo = new THREE.ConeGeometry(0.45, 1.2, 16);
    earGeo.scale(0.25, 1, 0.8);
    const innerEarMat = new THREE.MeshStandardMaterial({
      color: finishType === 'metallic' ? 0xb45309 : detailsColor,
      roughness: 0.5
    });

    const leftEar = new THREE.Mesh(earGeo, vinylMaterial);
    leftEar.position.set(-0.95, 0.6, 0);
    leftEar.rotation.z = 0.85;
    leftEar.rotation.x = -0.2;
    headGroup.add(leftEar);

    const leftInnerEar = new THREE.Mesh(earGeo, innerEarMat);
    leftInnerEar.scale.set(0.8, 0.8, 0.8);
    leftInnerEar.position.set(-0.92, 0.6, 0.03);
    leftInnerEar.rotation.z = 0.85;
    leftInnerEar.rotation.x = -0.2;
    headGroup.add(leftInnerEar);

    const rightEar = new THREE.Mesh(earGeo, vinylMaterial);
    rightEar.position.set(0.95, 0.6, 0);
    rightEar.rotation.z = -0.85;
    rightEar.rotation.x = -0.2;
    headGroup.add(rightEar);

    const rightInnerEar = new THREE.Mesh(earGeo, innerEarMat);
    rightInnerEar.scale.set(0.8, 0.8, 0.8);
    rightInnerEar.position.set(0.92, 0.6, 0.03);
    rightInnerEar.rotation.z = -0.85;
    rightInnerEar.rotation.x = -0.2;
    headGroup.add(rightInnerEar);

    const noseGeo = new THREE.SphereGeometry(0.12, 16, 16);
    noseGeo.scale(1.4, 0.9, 0.8);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.3 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, -0.1, 0.68);
    headGroup.add(nose);
  } else if (p.type === 'ironman') {
    const plateGeo = new THREE.BoxGeometry(1.2, 1.0, 0.15);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.6,
      roughness: 0.2
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, 0.05, 0.62);
    headGroup.add(plate);

    const glowMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    leftEye.material = glowMat;
    rightEye.material = glowMat;
  } else if (p.type === 'spiderman') {
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2 });
    const spideyFrameGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.05, 3);
    spideyFrameGeo.scale(1, 1, 1.4);
    spideyFrameGeo.rotateX(Math.PI / 2);
    spideyFrameGeo.rotateZ(0.2);

    const spideyLeft = new THREE.Mesh(spideyFrameGeo, borderMat);
    spideyLeft.position.set(-0.48, 0.02, 0.65);
    headGroup.add(spideyLeft);

    const spideyRight = new THREE.Mesh(spideyFrameGeo, borderMat);
    spideyRight.position.set(0.48, 0.02, 0.65);
    spideyRight.rotation.y = Math.PI;
    headGroup.add(spideyRight);
  }

  figureGroup.add(headGroup);

  // --- 2. ТУЛОВИЩЕ ---
  const bodyGeo = new THREE.CylinderGeometry(0.4, 0.48, 0.85, 16);
  const bodyMesh = new THREE.Mesh(bodyGeo, vinylMaterial);
  bodyMesh.position.y = 0.45;
  bodyMesh.castShadow = true;
  figureGroup.add(bodyMesh);

  const beltGeo = new THREE.CylinderGeometry(0.49, 0.5, 0.12, 16);
  const beltMesh = new THREE.Mesh(beltGeo, vinylAccentMaterial);
  beltMesh.position.y = 0.35;
  figureGroup.add(beltMesh);

  // --- 3. НОГИ ---
  const legGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.5, 16);
  const leftLeg = new THREE.Mesh(legGeo, vinylMaterial);
  leftLeg.position.set(-0.25, 0.0, 0);
  leftLeg.castShadow = true;
  figureGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, vinylMaterial);
  rightLeg.position.set(0.25, 0.0, 0);
  rightLeg.castShadow = true;
  figureGroup.add(rightLeg);

  const footGeo = new THREE.BoxGeometry(0.26, 0.16, 0.4);
  const leftFoot = new THREE.Mesh(footGeo, vinylAccentMaterial);
  leftFoot.position.set(-0.25, -0.22, 0.08);
  figureGroup.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeo, vinylAccentMaterial);
  rightFoot.position.set(0.25, -0.22, 0.08);
  figureGroup.add(rightFoot);

  // --- 4. РУКИ ---
  const armGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.65, 16);
  const leftArm = new THREE.Mesh(armGeo, vinylMaterial);
  leftArm.position.set(-0.55, 0.45, 0);
  leftArm.rotation.z = 0.35;
  figureGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, vinylMaterial);
  rightArm.position.set(0.55, 0.45, 0);
  rightArm.rotation.z = -0.35;
  figureGroup.add(rightArm);

  const handGeo = new THREE.SphereGeometry(0.15, 16, 16);
  const leftHand = new THREE.Mesh(handGeo, vinylMaterial);
  leftHand.position.set(-0.66, 0.18, 0);
  figureGroup.add(leftHand);

  const rightHand = new THREE.Mesh(handGeo, vinylMaterial);
  rightHand.position.set(0.66, 0.18, 0);
  figureGroup.add(rightHand);

  // Аксессуары
  if (p.type === 'hero' && character.id.includes('1419')) {
    const shieldGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.06, 32);
    shieldGeo.rotateX(Math.PI / 2);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: finishType === 'metallic' ? 0xeab308 : 0xef4444,
      metalness: 0.6,
      roughness: 0.2
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0.72, 0.4, 0.25);
    figureGroup.add(shield);
  }

  figureGroup.scale.set(0.9, 0.9, 0.9);
  return figureGroup;
}

/**
 * Создает 3D коробку Funko POP с открываемой крышкой и окном
 */
export function createFunkoBox(character) {
  const boxGroup = new THREE.Group();
  boxGroup.name = 'funko_box';

  const width = 2.4;
  const height = 3.4;
  const depth = 2.0;
  const thickness = 0.06;

  const p = character.threeParams || {};
  const boxColor = new THREE.Color(p.boxColor || '#1e293b');

  const cardboardMaterial = new THREE.MeshStandardMaterial({
    color: boxColor,
    roughness: 0.6,
    metalness: 0.05
  });

  const frontTexture = createBoxCanvasTexture(character, 'front');
  const backTexture = createBoxCanvasTexture(character, 'back');

  const frontMat = new THREE.MeshStandardMaterial({
    map: frontTexture,
    roughness: 0.5,
    metalness: 0.05
  });

  const backMat = new THREE.MeshStandardMaterial({
    map: backTexture,
    roughness: 0.5,
    metalness: 0.05
  });

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, thickness),
    backMat
  );
  backWall.position.set(0, height / 2, -depth / 2 + thickness / 2);
  boxGroup.add(backWall);

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(thickness, height, depth),
    cardboardMaterial
  );
  leftWall.position.set(-width / 2 + thickness / 2, height / 2, 0);
  boxGroup.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(thickness, height, depth),
    cardboardMaterial
  );
  rightWall.position.set(width / 2 - thickness / 2, height / 2, 0);
  boxGroup.add(rightWall);

  const bottomWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, thickness, depth),
    cardboardMaterial
  );
  bottomWall.position.set(0, thickness / 2, 0);
  boxGroup.add(bottomWall);

  const frontBottom = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.45, thickness),
    frontMat
  );
  frontBottom.position.set(0, 0.225, depth / 2 - thickness / 2);
  boxGroup.add(frontBottom);

  const frontTop = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.7, thickness),
    frontMat
  );
  frontTop.position.set(0, height - 0.35, depth / 2 - thickness / 2);
  boxGroup.add(frontTop);

  const windowMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.25,
    roughness: 0.1,
    transmission: 0.85,
    ior: 1.45,
    reflectivity: 0.8
  });

  const windowMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.3, height - 1.25),
    windowMaterial
  );
  windowMesh.position.set(0, height / 2 - 0.15, depth / 2 - 0.01);
  boxGroup.add(windowMesh);

  const lidGroup = new THREE.Group();
  lidGroup.name = 'box_lid';
  lidGroup.position.set(0, height, -depth / 2);

  const lidMesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, thickness, depth),
    cardboardMaterial
  );
  lidMesh.position.set(0, 0, depth / 2);
  lidGroup.add(lidMesh);
  boxGroup.add(lidGroup);

  const standGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.12, 24);
  const standMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.3,
    metalness: 0.2
  });
  const stand = new THREE.Mesh(standGeo, standMat);
  stand.position.set(0, 0.15, 0);
  boxGroup.add(stand);

  return { boxGroup, lidGroup };
}

/**
 * Создает круговой подиум со светом под коробкой
 */
export function createPodium(isDark = true) {
  const podiumGroup = new THREE.Group();

  const discGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.2, 32);
  const discMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x0f172a : 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.5
  });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.position.y = -0.1;
  disc.receiveShadow = true;
  podiumGroup.add(disc);

  const ringGeo = new THREE.TorusGeometry(2.2, 0.04, 16, 64);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: isDark ? 0xff4757 : 0x3b82f6
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.01;
  podiumGroup.add(ring);

  return podiumGroup;
}
