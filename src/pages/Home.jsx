import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">
        Waldaa Gaaddisa Maatii (WGM)
      </h1>
      <p className="text-gray-600 mb-8">
        Welcome to the community platform.
      </p>
      <Link
        to="/auth"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Login / Register
      </Link>
    </div>
  )
}
