import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10">
      <div className="text-center space-y-6 p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-2xl">V</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Veltrik</h1>
        </div>
        <p className="text-xl text-gray-500 max-w-md mx-auto">Your unified electric vehicle marketplace. Buy, sell, compare, and manage EVs all in one place.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/user" className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
