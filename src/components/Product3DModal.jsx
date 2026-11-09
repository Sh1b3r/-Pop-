import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useCart } from '../context/CartContext';
import { usePricing } from '../context/PricingContext';
import { useTheme } from '../context/ThemeContext';
import { createFunkoBox, createFunkoFigure, createPodium } from '../three/funko3DModel';
import { sounds } from '../three/audioEffects';
import { X, RotateCw, Package, Check, ShoppingBag } from 'lucide-react';

export const Product3DModal = ({ product, onClose }) => {
  const containerRef = useRef(null);
  const { isDark } = useTheme();
  const { addToCart } = useCart();
  const { getProductPrice, formatPrice, currency } = usePricing();

  const [isUnboxed, setIsUnboxed] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [finishType, setFinishType] = useState('classic'); // 'classic' | 'glossy' | 'metallic'
  const [isAdded, setIsAdded] = useState(false);

  const { price } = getProductPrice(product);

  const stateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    modelRoot: null,
    figureMesh: null,
    lidMesh: null,
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    rotY: 0.3,
    rotX: 0.1,
    targetRotY: 0.3,
    targetRotX: 0.1,
    zoom: 6.0,
    targetZoom: 6.0,
    unboxProgress: 0,
    targetUnboxProgress: 0
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    sounds.playModalOpen();

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0, stateRef.current.zoom);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(5, 10, 7);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xFF6B00, 0.8);
    dirLight2.position.set(-6, -4, -4);
    scene.add(dirLight2);

    // Podium
    const podium = createPodium(isDark);
    scene.add(podium);

    // Model root group
    const modelRoot = new THREE.Group();
    scene.add(modelRoot);

    // Box
    const { boxGroup, lidMesh } = createFunkoBox(product, isDark);
    modelRoot.add(boxGroup);

    // Figure
    const figureGroup = createFunkoFigure(product, finishType);
    modelRoot.add(figureGroup);

    stateRef.current.scene = scene;
    stateRef.current.camera = camera;
    stateRef.current.renderer = renderer;
    stateRef.current.modelRoot = modelRoot;
    stateRef.current.figureMesh = figureGroup;
    stateRef.current.lidMesh = lidMesh;

    // Interaction listeners
    const onMouseDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevMouseX = e.clientX;
      stateRef.current.prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!stateRef.current.isDragging) return;
      const dx = e.clientX - stateRef.current.prevMouseX;
      const dy = e.clientY - stateRef.current.prevMouseY;

      stateRef.current.targetRotY += dx * 0.01;
      stateRef.current.targetRotX += dy * 0.01;
      stateRef.current.targetRotX = Math.max(-0.5, Math.min(0.8, stateRef.current.targetRotX));

      stateRef.current.prevMouseX = e.clientX;
      stateRef.current.prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      stateRef.current.isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      stateRef.current.targetZoom += e.deltaY * 0.005;
      stateRef.current.targetZoom = Math.max(3.5, Math.min(9.0, stateRef.current.targetZoom));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isAutoRotate && !stateRef.current.isDragging) {
        stateRef.current.targetRotY += 0.005;
      }

      stateRef.current.rotY += (stateRef.current.targetRotY - stateRef.current.rotY) * 0.1;
      stateRef.current.rotX += (stateRef.current.targetRotX - stateRef.current.rotX) * 0.1;
      stateRef.current.zoom += (stateRef.current.targetZoom - stateRef.current.zoom) * 0.1;

      modelRoot.rotation.y = stateRef.current.rotY;
      modelRoot.rotation.x = stateRef.current.rotX;
      camera.position.z = stateRef.current.zoom;

      // Unbox animation
      stateRef.current.unboxProgress += (stateRef.current.targetUnboxProgress - stateRef.current.unboxProgress) * 0.08;
      const p = stateRef.current.unboxProgress;

      if (lidMesh) {
        lidMesh.rotation.x = -p * Math.PI * 0.65;
        lidMesh.position.y = 1.6 + p * 0.3;
      }

      if (figureGroup) {
        figureGroup.position.y = p * 1.4;
        figureGroup.rotation.y = p * Math.PI * 0.25;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [product, finishType, isDark, isAutoRotate]);

  const toggleUnbox = () => {
    const nextState = !isUnboxed;
    setIsUnboxed(nextState);
    stateRef.current.targetUnboxProgress = nextState ? 1.0 : 0.0;
    sounds.playUnbox();
  };

  const handleBuy = () => {
    addToCart(product);
    sounds.playAddToCart();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="modal-overlay">
      <div
        className="glass-card max-w-4xl w-full p-6 sm:p-8 rounded-3xl relative flex flex-col md:flex-row gap-6 animate-scaleUp max-h-[90vh] overflow-y-auto"
        style={{
          background: 'rgba(16, 22, 34, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 30px rgba(255, 107, 0, 0.2)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors z-20"
          aria-label="Закрити"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D Canvas Area */}
        <div className="flex-1 min-h-[350px] relative rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
          <div ref={containerRef} className="w-full h-full min-h-[350px]" />

          {/* Quick 3D Controls Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border transition-all ${
                isAutoRotate
                  ? 'bg-[#FF6B00] text-white border-[#FF7A00]'
                  : 'bg-black/60 text-white/70 border-white/20'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
              <span>Обертання</span>
            </button>

            <button
              onClick={toggleUnbox}
              className="p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-black/60 hover:bg-[#FF6B00] text-white border border-white/20 hover:border-[#FF7A00] transition-all backdrop-blur-md"
            >
              <Package className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>{isUnboxed ? 'В коробку' : 'Розпакувати'}</span>
            </button>
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="w-full md:w-80 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-[11px] font-mono uppercase font-bold text-[#FF6B00] tracking-wider block mb-1">
              {product.franchise} • Funko POP! #{product.popNumber}
            </span>
            <h2 className="text-2xl font-black text-white leading-tight">
              {product.title}
            </h2>
            <h4 className="text-xs text-white/60 font-mono mt-1 mb-3">
              {product.subtitle}
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              {product.description}
            </p>

            {/* Material / Finish selector */}
            <div className="mt-5">
              <span className="text-[11px] font-bold text-white/60 block uppercase mb-2">
                Покриття фігурки:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFinishType('classic');
                    sounds.playSwitch();
                  }}
                  className={`filter-btn text-xs py-1.5 px-3 ${finishType === 'classic' ? 'active' : ''}`}
                >
                  Класичне
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFinishType('glossy');
                    sounds.playSwitch();
                  }}
                  className={`filter-btn text-xs py-1.5 px-3 ${finishType === 'glossy' ? 'active' : ''}`}
                >
                  Глянцеве
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFinishType('metallic');
                    sounds.playSwitch();
                  }}
                  className={`filter-btn text-xs py-1.5 px-3 ${finishType === 'metallic' ? 'active' : ''}`}
                >
                  Gold Chase
                </button>
              </div>
            </div>
          </div>

          {/* Pricing & Buy CTA */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-white/60">Ціна:</span>
              <span className="text-2xl font-black text-[#FF6B00] tabular-numbers font-mono">
                {formatPrice(price, currency)}
              </span>
            </div>

            <button
              onClick={handleBuy}
              className="btn-accent w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Додано в кошик!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Купити / Додати в кошик</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
