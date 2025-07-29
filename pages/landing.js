import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import * as THREE from 'three';

// This is a stand-in for Next.js's Head component for this environment.
const Head = ({ children }) => {
  useEffect(() => {
    const title = children.find(c => c.type === 'title')?.props.children;
    if (title) document.title = title;
  }, [children]);
  return null;
};

// This is a stand-in for Next.js's Link component for this environment.
const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;


export default function App() {
  // Set the default theme to 'light' to match the profile page
  const [theme, setTheme] = useState('light');
  const backgroundRef = useRef(null);

  useEffect(() => {
    // Ensure we don't run this on the server
    if (typeof window === 'undefined' || !backgroundRef.current) return;

    // Three.js setup for 3D star particles
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Clear previous renderer and append new one
    while (backgroundRef.current.firstChild) {
        backgroundRef.current.removeChild(backgroundRef.current.firstChild);
    }
    backgroundRef.current.appendChild(renderer.domElement);


    const stars = new THREE.Group();
    const starGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    // Correct star color logic: white for dark, grey for light
    const starMaterial = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0xffffff : 0x666666
    });

    // Create 800 stars with random positions
    for (let i = 0; i < 800; i++) {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(
        (Math.random() - 0.5) * 200, // Reduced spread for better density
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );
      stars.add(star);
    }
    scene.add(stars);

    camera.position.z = 5;

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      stars.rotation.x += 0.0005;
      stars.rotation.y += 0.001;
      // Correct star color logic
      starMaterial.color.set(theme === 'dark' ? 0xffffff : 0x666666);
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
      cancelAnimationFrame(animationFrameId);
      // Clean up Three.js resources
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, [theme]); // Rerun effect when theme changes

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
    // Use a ternary operator to apply theme classes directly
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen select-none ${theme === 'dark' ? 'bg-black text-gray-100' : 'bg-white text-gray-900'} transition-all duration-500 flex flex-col items-center relative overflow-hidden`}>
      <Head>
        <title>Noteify - Your Smart Note-Taking App</title>
        <meta name="description" content="Noteify: Transform your note-taking with AI-driven features and seamless synchronization." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="background" ref={backgroundRef} className="absolute inset-0 z-0"></div>

      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none z-20"
        aria-label="Toggle theme"
      >
        <svg
          className="w-5 h-5 text-gray-900 dark:text-gray-100"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {/* Correct icon logic: show moon in light theme, sun in dark theme */}
          {theme === 'light' ? (
            // Moon icon to switch to dark theme
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.63-.14 2.39-.41-.56.24-1.15.41-1.77.41-3.31 0-6-2.69-6-6s2.69-6 6-6c.62 0 1.21.17 1.77.41-.76-.27-1.56-.41-2.39-.41zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" />
          ) : (
            // Sun icon to switch to light theme
            <path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-1 13h2v2h-2zm0-18h2v2h-2zm10 10h2v-2h-2zm-18 0h2v-2H3zm15.66 6.34l1.41 1.41 1.41-1.41-1.41-1.41-1.41 1.41zm-12.72 0l1.41-1.41-1.41-1.41-1.41 1.41 1.41 1.41zm12.72-12.72l1.41-1.41-1.41-1.41-1.41 1.41 1.41 1.41zm-12.72 0l-1.41-1.41-1.41 1.41 1.41 1.41 1.41-1.41z" />
          )}
        </svg>
      </button>

      <Link
        href="/profile"
        className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 transition-all duration-300 hover:scale-110 cursor-pointer z-20"
        title="Profile"
      >
        <svg
          className="w-5 h-5 text-gray-900 dark:text-gray-100"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </Link>

      <header className="fixed top-0 left-0 right-0 flex justify-center pt-4 z-10">
        <img
          src="/logo.png" // Replace with your actual logo URL
          alt="Noteify Logo"
          className={`w-48 h-48 cursor-pointer animate-bounce-slow hover:animate-spin-once ${theme === 'dark' ? 'invert' : ''}`}
          onClick={handleLogoClick}
          title="Click for a surprise!"
        />
      </header>

      <main className="text-center relative z-10 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-6xl font-bold animate-glow mb-4 transition-colors duration-500">Noteify</h1>
        <p className="text-2xl max-w-lg mx-auto animate-fade-in mb-8 transition-colors duration-500 text-gray-700 dark:text-gray-300">
          Transform your ideas into organized, AI-powered notes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          <div className="p-4 animate-fade-in hover:animate-card-hover" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-semibold animate-glow transition-colors duration-500">Intelligent Organization</h3>
            <p className="transition-colors duration-500 text-gray-600 dark:text-gray-400">Automatically sort and tag your notes with AI.</p>
          </div>
          <div className="p-4 animate-fade-in hover:animate-card-hover" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-xl font-semibold animate-glow transition-colors duration-500">AI Insights</h3>
            <p className="transition-colors duration-500 text-gray-600 dark:text-gray-400">Get smart summaries and suggestions instantly.</p>
          </div>
          <div className="p-4 animate-fade-in hover:animate-card-hover" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-xl font-semibold animate-glow transition-colors duration-500">Cross-Device Sync</h3>
            <p className="transition-colors duration-500 text-gray-600 dark:text-gray-400">Access your notes seamlessly on any device.</p>
          </div>
        </div>
        <a
          href="#get-started"
          className="inline-block px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full font-semibold transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 animate-pulse-subtle animate-fade-in"
          style={{ animationDelay: '0.8s' }}
        >
          Get Started
        </a>
      </main>
    </div>
  );
}
