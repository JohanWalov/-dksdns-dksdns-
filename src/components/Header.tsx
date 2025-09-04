export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex justify-between items-center h-16 px-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">Magic Numbers</h1>
        <p className="text-sm text-gray-500">
          Created by{' '}
          <a 
            href="https://www.linkedin.com/in/sviatoslav-nytka/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-black underline hover:text-gray-600"
          >
            Sviatoslav Nytka
          </a>{' '}
          from{' '}
          <a 
            href="https://magicflux.co" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-black underline hover:text-gray-600"
          >
            MagicFlux
          </a>
        </p>
      </div>
    </header>
  );
}