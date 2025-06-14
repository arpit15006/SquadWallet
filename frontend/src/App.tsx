import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Providers } from './providers';
import '@coinbase/onchainkit/styles.css';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { WalletPage } from './pages/WalletPage';
import { GamePage } from './pages/GamePage';
import { ChatPage } from './pages/ChatPage';
import { TournamentPage } from './pages/TournamentPage';
import { XPBadgesPage } from './pages/XPBadgesPage';
import { SocialPage } from './pages/SocialPage';
import IntegrationsDemo from './pages/IntegrationsDemo';
import OnchainKitTest from './pages/OnchainKitTest';
import CoinbaseWalletTest from './pages/CoinbaseWalletTest';
import SimpleCoinbaseTest from './pages/SimpleCoinbaseTest';
import OnchainKitServiceTest from './pages/OnchainKitServiceTest';
import BasenamesDemo from './pages/BasenamesDemo';

// Floating particles background component
const FloatingParticles = () => {
  const colors = [
    'from-red-400 to-pink-400',
    'from-yellow-400 to-orange-400',
    'from-blue-400 to-cyan-400',
    'from-purple-400 to-pink-400',
    'from-green-400 to-emerald-400'
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-3 h-3 bg-gradient-to-r ${colors[i % colors.length]} rounded-full opacity-40`}
          animate={{
            x: [0, Math.random() * 200 - 100, 0],
            y: [0, Math.random() * 200 - 100, 0],
            scale: [1, Math.random() * 2 + 1, 1],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

function App() {
  return (
    <Providers>
      <Router>
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 25%, #2d1b69 50%, #1a1a1a 75%, #0c0c0c 100%)'
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,107,107,0.15),transparent_50%)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(254,202,87,0.15),transparent_50%)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(72,219,251,0.15),transparent_50%)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_60%,rgba(255,159,243,0.1),transparent_50%)] animate-pulse"></div>
        </div>

        {/* Floating Particles */}
        <FloatingParticles />

        {/* Main Content */}
        <div className="relative z-10">
          <Navbar />
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <HomePage />
                  </motion.div>
                } />
                <Route path="/wallet" element={
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <WalletPage />
                  </motion.div>
                } />
                <Route path="/wallet/:address" element={
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <WalletPage />
                  </motion.div>
                } />
                <Route path="/game" element={
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <GamePage />
                  </motion.div>
                } />
                <Route path="/chat" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ChatPage />
                  </motion.div>
                } />
                <Route path="/tournaments" element={
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <TournamentPage />
                  </motion.div>
                } />
                <Route path="/xp" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <XPBadgesPage />
                  </motion.div>
                } />
                <Route path="/social" element={
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <SocialPage />
                  </motion.div>
                } />
                <Route path="/integrations" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <IntegrationsDemo />
                  </motion.div>
                } />
                <Route path="/test" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <OnchainKitTest />
                  </motion.div>
                } />
                <Route path="/wallet-test" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CoinbaseWalletTest />
                  </motion.div>
                } />
                <Route path="/simple-test" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <SimpleCoinbaseTest />
                  </motion.div>
                } />
                <Route path="/frame-test" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <OnchainKitServiceTest />
                  </motion.div>
                } />
                <Route path="/basenames" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <BasenamesDemo />
                  </motion.div>
                } />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </Router>
    </Providers>
  );
}

export default App;
