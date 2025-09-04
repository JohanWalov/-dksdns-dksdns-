import React, { useState } from 'react';
import { Header } from './components/Header';
import { ColorPaletteGenerator } from './components/ColorPaletteGenerator';
import { ContrastChecker } from './components/ContrastChecker';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState<'palette' | 'contrast'>('palette');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-50/50">
      <Header />
      
      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Main tabs */}
          <div className="flex gap-8 border-b border-gray-200 mb-8">
            <button
              className={`py-4 px-1 border-b-2 text-sm font-medium transition-all ${
                activeMainTab === 'palette'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveMainTab('palette')}
            >
              Palette Generator
            </button>
            <button
              className={`py-4 px-1 border-b-2 text-sm font-medium transition-all ${
                activeMainTab === 'contrast'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveMainTab('contrast')}
            >
              Contrast Checker
            </button>
          </div>

          {/* Tab Content */}
          {activeMainTab === 'palette' && <ColorPaletteGenerator />}
          {activeMainTab === 'contrast' && <ContrastChecker />}
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}