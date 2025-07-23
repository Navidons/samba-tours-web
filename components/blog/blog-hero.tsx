import { Feather } from "lucide-react"

export default function BlogHero() {
  return (
    <header className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden" style={{
      backgroundImage: 'linear-gradient(rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.8), rgba(0, 0, 0, 0.9)), url("/photos/rwenzori-mountain-hero.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="container-max px-4 pt-40 pb-24 text-center relative">
        <div className="absolute -top-1/4 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl opacity-50" />
        <div className="absolute -bottom-1/4 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl opacity-50" />

        <div className="relative">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-500/20 rounded-full border border-emerald-500/30">
              <Feather className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-playfair mb-4">
            Safari Stories & Travel Tips
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-gray-300">
            Your expert source for Ugandan travel guides, wildlife insights, and tales from the trail.
          </p>
        </div>
      </div>
    </header>
  )
}
