import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-2 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 text-gray-900">
            🎵 Concert Seating
          </h1>
          <p className="text-lg sm:text-xl text-gray-700">Sistem de vizualizare și gestionare locuri</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* Viewer Button */}
          <Link
            href="/viewer"
            className="block group"
          >
            <div className="h-full bg-gradient-to-br from-blue-400 to-cyan-500 p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 transition-transform">👁️</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Viewer Public</h2>
              <p className="text-blue-50 text-base sm:text-lg mb-4">
                Vizualizează în timp real disponibilitatea locurilor
              </p>
              <div className="text-white font-bold text-lg group-hover:translate-x-2 transition-transform">
                Vezi Locurile →
              </div>
            </div>
          </Link>

          {/* Admin Button */}
          <Link
            href="/admindash"
            className="block group"
          >
            <div className="h-full bg-gradient-to-br from-purple-500 to-indigo-600 p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 transition-transform">🔐</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Admin Dashboard</h2>
              <p className="text-purple-100 text-base sm:text-lg mb-4">
                Gestionează scaunele și alocare inteligentă
              </p>
              <div className="text-white font-bold text-lg group-hover:translate-x-2 transition-transform">
                Login Administrator →
              </div>
            </div>
          </Link>
        </div>
        
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">📊 Informații Sală</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl text-center border-2 border-blue-200">
              <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">204</div>
              <div className="text-base sm:text-lg font-semibold text-gray-700">Zona A</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">17 rânduri × 12 scaune</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl text-center border-2 border-blue-200">
              <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">204</div>
              <div className="text-base sm:text-lg font-semibold text-gray-700">Zona B</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">17 rânduri × 12 scaune</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-center border-2 border-indigo-600 shadow-lg">
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">408+</div>
              <div className="text-base sm:text-lg font-semibold text-white">Total Locuri</div>
              <div className="text-xs sm:text-sm text-indigo-100 mt-1">+ zone laterale</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
