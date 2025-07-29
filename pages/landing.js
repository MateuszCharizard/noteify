import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import confetti from 'canvas-confetti';
import * as THREE from 'three';

export default function Home() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Three.js setup for 3D star particles
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const backgroundDiv = document.getElementById('background');
    if (backgroundDiv) {
      backgroundDiv.appendChild(renderer.domElement);
    }

    const stars = new THREE.Group();
    const starGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({ 
      color: theme === 'dark' ? 0xffffff : 0x000000 
    });

    // Create 800 stars with random positions
    for (let i = 0; i < 800; i++) {
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
      starMaterial.color.set(theme === 'dark' ? 0xffffff : 0x000000);
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
      if (backgroundDiv && renderer.domElement) {
        backgroundDiv.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  const handleLogoClick = () => {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.1 },
      colors: ['#ffffff', '#cccccc', '#999999'],
    });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`min-h-screen select-none ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} transition-all duration-500 flex flex-col items-center relative overflow-hidden`}>
      <Head>
        <title>Noteify - Your Smart Note-Taking App</title>
        <meta name="description" content="Noteify: Transform your note-taking with AI-driven features and seamless synchronization." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="background" className="absolute inset-0 z-0"></div>

      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none z-20"
        aria-label="Toggle theme"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {theme === 'dark' ? (
            // Sun icon for dark mode (switch to light)
            <path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-1 13h2v2h-2zm0-18h2v2h-2zm10 10h2v-2h-2zm-18 0h2v-2H3zm15.66 6.34l1.41 1.41 1.41-1.41-1.41-1.41-1.41 1.41zm-12.72 0l1.41-1.41-1.41-1.41-1.41 1.41 1.41 1.41zm12.72-12.72l1.41-1.41-1.41-1.41-1.41 1.41 1.41 1.41zm-12.72 0l-1.41-1.41-1.41 1.41 1.41 1.41 1.41-1.41z" />
          ) : (
            // Moon icon for light mode (switch to dark)
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.63-.14 2.39-.41-.56.24-1.15.41-1.77.41-3.31 0-6-2.69-6-6s2.69-6 6-6c.62 0 1.21.17 1.77.41-.76-.27-1.56-.41-2.39-.41zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" />
          )}
        </svg>
      </button>

      <div
        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 transition-all duration-300 hover:scale-110 cursor-pointer z-20"
        title="Profile"
      >
        <svg
          className="w-5 h-5 text-white m-2.5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>

      <header className="fixed top-0 left-0 right-0 flex justify-center pt-4 z-10">
        <img
          src="/logo.png"
          alt="Noteify Logo"
          className={`w-48 h-48 cursor-pointer animate-bounce-slow hover:animate-spin-once ${theme === 'dark' ? 'invert' : ''}`}
          onClick={handleLogoClick}
          title="Click for a surprise!"
        />
      </header>

      <main className="text-center relative z-10 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-6xl font-bold animate-glow mb-4 transition-colors duration-500">Noteify</h1>
        <p className="text-2xl max-w-lg mx-auto animate-fade-in mb-8 transition-colors duration-500">
          Transform your ideas into organized, AI-powered notes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          <div className="p-4 animate-fade-in hover:animate-card-hover" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-semibold animate-glow transition-colors duration-500">Intelligent Organization</h3>
            <p className="transition-colors duration-500">Automatically sort and tag your notes with AI.</p>
          </div>
          <div className="p-4 animate-fade-in hover:animate-card-hover" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-xl font-semibold animate-glow transition-colors duration-500">AI Insights</h3>
            <p className="transition-colors duration-500">Get smart summaries and suggestions instantly.</p>
          </div>
          <div className="p-4 animate-fade-in hover:animate-card-hover" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-xl font-semibold animate-glow transition-colors duration-500">Cross-Device Sync</h3>
            <p className="transition-colors duration-500">Access your notes seamlessly on any device.</p>
          </div>
        </div>
        <a
          href="#get-started"
          className="inline-block px-6 py-3 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-full font-semibold transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 animate-pulse-subtle animate-fade-in"
          style={{ animationDelay: '0.8s' }}
        >
          Get Started
        </a>
      </main>
    </div>
  );
}