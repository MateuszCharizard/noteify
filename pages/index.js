import React, { useEffect } from 'react';
import Head from 'next/head';
import confetti from 'canvas-confetti';
import * as THREE from 'three';

export default function Home() {
  useEffect(() => {
    // Three.js setup for 3D star particles
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('background').appendChild(renderer.domElement);

    const stars = new THREE.Group();
    const starGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Create 1000 stars with random positions
    for (let i = 0; i < 1000; i++) {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
      );
      stars.add(star);
    }
    scene.add(stars);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.getElementById('background').removeChild(renderer.domElement);
    };
  }, []);

  const handleLogoClick = () => {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.45 },
      colors: ['#ffffff', '#cccccc', '#999999'], // Black-and-white confetti
    });
  };

  return (
    <div className="min-h-screen select-none bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Head>
        <title>Noteify - Coming Soon</title>
        <meta name="description" content="Noteify is coming in Summer 2025! Stay tuned for a revolutionary note-taking experience." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="background" className="absolute inset-0 z-0"></div>

      <main className="text-center relative z-10 flex flex-col items-center justify-center min-h-screen -mt-50">
        <div className="relative mb-[-8rem]">
          <img
            src="/logo.png"
            alt="Noteify Logo"
            className="w-96 h-96 mx-auto cursor-pointer animate-bounce-slow invert"
            onClick={handleLogoClick}
            title="Click for a surprise!"
          />
          <h1 className="text-7xl font-bold text-white animate-glow absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/4">
            Noteify
          </h1>
        </div>
        <h2 className="text-4xl mt-6 font-bold text-white animate-glow">
          Comin' Summer 2025
        </h2>
      </main>
    </div>
  );
}