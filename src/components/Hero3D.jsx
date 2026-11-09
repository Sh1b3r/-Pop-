import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { createFunkoBox, createFunkoFigure, createPodium } from '../three/funko3DModel';
import { RotateCcw, Box, Sparkles, ShoppingBag, Eye, Zap } from 'lucide-react';

export const Hero3D = ({ products, onSelectProductForModal }) => {
  const containerRef = useRef(null);
  const { isDark } = useTheme();
  const { addToCart } = useCart();

  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [isUnboxed, setIsUnboxed] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [lightingMode, setLightingMode] = useState('studio'); // 'studio' | 'neon' | 'cyber'

  const currentProduct = products[selectedProductIndex] || products[0];

  const stateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    modelRoot: null,
    figureMesh: null,
    lidMesh: null,
    lights: {},
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    rotY: 0.25,
    rotX: 0.1,
    targetRotY: 0.25,
    targetRotX: 0.1,
    autoRotateSpeed: 0.006,
    unboxProgress: 0,
    targetUnboxProgress: 0
  });

  // Инициализация Three.js сцены один раз
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x0b0f19 : 0xf8fafc, 0.035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 6.2);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(isDark ? 0xff4757 : 0x38bdf8, 2.0);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffffff, 1.0, 10);
    fillLight.position.set(0, -1, 3);
    scene.add(fillLight);

    // 5. Root Object
    const modelRoot = new THREE.Group();
    modelRoot.position.y = -0.6;
    scene.add(modelRoot);

    stateRef.current.scene = scene;
    stateRef.current.camera = camera;
    stateRef.current.renderer = renderer;
    stateRef.current.modelRoot = modelRoot;
    stateRef.current.lights = { ambientLight, mainLight, rimLight, fillLight };

    // Events: Mouse / Touch rotate
    const onMouseDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevMouseX = e.clientX || (e.touches && e.touches[0].clientX);
      stateRef.current.prevMouseY = e.clientY || (e.touches && e.touches[0].clientY);
    };

    const onMouseMove = (e) => {
      if (!stateRef.current.isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      const deltaX = clientX - stateRef.current.prevMouseX;
      const deltaY = clientY - stateRef.current.prevMouseY;

      stateRef.current.targetRotY += deltaX * 0.008;
      stateRef.current.targetRotX = Math.max(-0.4, Math.min(0.6, stateRef.current.targetRotX + deltaY * 0.008));

      stateRef.current.prevMouseX = clientX;
      stateRef.current.prevMouseY = clientY;
    };

    const onMouseUp = () => {
      stateRef.current.isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    dom.addEventListener('touchstart', onMouseDown, { passive: true });
    window.addEventListener('touchmove', onMouseMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 520;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const st = stateRef.current;

      // Auto rotation
      if (isAutoRotate && !st.isDragging) {
        st.targetRotY += st.autoRotateSpeed;
      }

      // Smooth damping
      st.rotY += (st.targetRotY - st.rotY) * 0.1;
      st.rotX += (st.targetRotX - st.rotX) * 0.1;

      if (st.modelRoot) {
        st.modelRoot.rotation.y = st.rotY;
        st.modelRoot.rotation.x = st.rotX;
      }

      // Unbox animation
      st.unboxProgress += (st.targetUnboxProgress - st.unboxProgress) * 0.08;
      const up = st.unboxProgress;

      if (st.lidMesh) {
        // Крышка коробки откидывается назад
        st.lidMesh.rotation.x = -Math.PI * 0.7 * up;
      }

      if (st.figureMesh) {
        // Фигурка поднимается и выплывает вперед
        st.figureMesh.position.y = 0.45 + up * 1.6;
        st.figureMesh.position.z = up * 1.5;
        // Легкое покачивание парящей фигурки
        if (up > 0.5) {
          const t = clock.getElapsedTime();
          st.figureMesh.position.y += Math.sin(t * 3) * 0.05;
          st.figureMesh.rotation.y = Math.sin(t * 2) * 0.2;
        } else {
          st.figureMesh.rotation.y = 0;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onMouseDown);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Обновление темы (освещение, фон)
  useEffect(() => {
    const st = stateRef.current;
    if (!st.scene || !st.lights.ambientLight) return;

    if (lightingMode === 'neon') {
      st.lights.ambientLight.color.setHex(0x38bdf8);
      st.lights.ambientLight.intensity = 1.0;
      st.lights.mainLight.color.setHex(0xff007f);
      st.lights.rimLight.color.setHex(0x00f0ff);
      st.lights.fillLight.color.setHex(0xa855f7);
    } else if (lightingMode === 'cyber') {
      st.lights.ambientLight.color.setHex(0x10b981);
      st.lights.ambientLight.intensity = 1.2;
      st.lights.mainLight.color.setHex(0xfacc15);
      st.lights.rimLight.color.setHex(0x06b6d4);
      st.lights.fillLight.color.setHex(0x3b82f6);
    } else {
      // Studio
      st.lights.ambientLight.color.setHex(0xffffff);
      st.lights.ambientLight.intensity = isDark ? 1.0 : 1.4;
      st.lights.mainLight.color.setHex(0xffffff);
      st.lights.rimLight.color.setHex(isDark ? 0xff4757 : 0x3b82f6);
      st.lights.fillLight.color.setHex(0xffffff);
    }

    if (st.scene.fog) {
      st.scene.fog.color.setHex(isDark ? 0x0b0f19 : 0xf8fafc);
    }
  }, [isDark, lightingMode]);

  // Обновление 3D модели при смене выбранного товара
  useEffect(() => {
    const st = stateRef.current;
    if (!st.modelRoot) return;

    // Очистить старую модель
    while (st.modelRoot.children.length > 0) {
      const obj = st.modelRoot.children[0];
      st.modelRoot.remove(obj);
    }

    // Подиум
    const podium = createPodium(isDark);
    st.modelRoot.add(podium);

    // Коробка
    const { boxGroup, lidGroup } = createFunkoBox(currentProduct);
    st.modelRoot.add(boxGroup);
    st.lidMesh = lidGroup;

    // Фигурка
    const figure = createFunkoFigure(currentProduct);
    figure.position.set(0, 0.45, 0);
    st.modelRoot.add(figure);
    st.figureMesh = figure;

    // Сброс анимации распаковки
    setIsUnboxed(false);
    st.targetUnboxProgress = 0;
    st.unboxProgress = 0;
  }, [currentProduct, isDark]);

  // Триггер анимации распаковки
  const toggleUnbox = () => {
    const nextState = !isUnboxed;
    setIsUnboxed(nextState);
    stateRef.current.targetUnboxProgress = nextState ? 1 : 0;
  };

  const resetView = () => {
    stateRef.current.targetRotY = 0.25;
    stateRef.current.targetRotX = 0.1;
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-700/30 bg-gradient-to-b from-slate-900/60 to-slate-950/80 backdrop-blur-xl shadow-2xl p-4 md:p-8 my-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Левая колонка: Описание и управление */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-5 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Інтерактивний 3D Showroom
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              POP! #{currentProduct.popNumber}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              100% Оригінал
            </span>
          </div>

          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
              {currentProduct.title}
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-2 line-clamp-2">
              {currentProduct.description}
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl md:text-4xl font-extrabold text-white">
              ${currentProduct.price.toFixed(2)}
            </span>
            {currentProduct.oldPrice && (
              <span className="text-lg text-slate-500 line-through">
                ${currentProduct.oldPrice.toFixed(2)}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              В наявності
            </span>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => addToCart(currentProduct)}
              className="flex-1 min-w-[170px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 transition-all shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Купити | ${currentProduct.price}</span>
            </button>

            <button
              onClick={toggleUnbox}
              className={`flex items-center gap-2 py-3 px-5 rounded-xl font-bold border transition-all cursor-pointer ${
                isUnboxed
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800/80 text-white border-slate-700 hover:bg-slate-700/80'
              }`}
            >
              <Box className="w-5 h-5" />
              <span>{isUnboxed ? 'Закрити коробку' : 'Відкрити 3D'}</span>
            </button>

            <button
              onClick={() => onSelectProductForModal(currentProduct)}
              className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer"
              title="Детальний 3D огляд"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          {/* Переключатель фигурок в Hero */}
          <div className="pt-3 border-t border-slate-800/80">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Швидкий вибір моделі у 3D:
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {products.slice(0, 6).map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedProductIndex(idx)}
                  className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all p-1 bg-slate-800/50 cursor-pointer ${
                    selectedProductIndex === idx
                      ? 'border-red-500 scale-105 shadow-md shadow-red-500/30'
                      : 'border-slate-700/60 opacity-70 hover:opacity-100 hover:border-slate-500'
                  }`}
                  title={item.title}
                >
                  <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Правая колонка: 3D Canvas */}
        <div className="lg:col-span-7 relative flex items-center justify-center">
          {/* Интерактивный Canvas контейнер */}
          <div
            ref={containerRef}
            className="w-full h-[460px] md:h-[540px] cursor-grab active:cursor-grabbing three-canvas-container select-none"
          />

          {/* Верхняя плашка управления 3D */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-1.5 shadow-lg z-20">
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isAutoRotate ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-white'
              }`}
              title="Автообертання"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">360°</span>
            </button>

            <button
              onClick={resetView}
              className="p-2 rounded-lg text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Скинути ракурс"
            >
              Скинути
            </button>

            {/* Подсветка */}
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <button
              onClick={() => {
                const modes = ['studio', 'neon', 'cyber'];
                const next = modes[(modes.indexOf(lightingMode) + 1) % modes.length];
                setLightingMode(next);
              }}
              className="p-2 rounded-lg text-xs text-amber-400 hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="Змінити освітлення"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="capitalize text-[11px] hidden sm:inline">{lightingMode}</span>
            </button>
          </div>

          {/* Подсказка снизу */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400 pointer-events-none flex items-center gap-1.5 shadow-md">
            <span>👆 Крутіть мишкою або пальцем на 360°</span>
          </div>
        </div>
      </div>
    </div>
  );
};

