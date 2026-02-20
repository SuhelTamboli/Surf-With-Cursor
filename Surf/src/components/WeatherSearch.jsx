import { useState } from 'react'

function WeatherSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a location')
      return
    }

    setLoading(true)
    setError(null)
    setWeatherData(null)

    try {
      // Step 1: Geocode the location to get coordinates
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`
      
      const geocodeResponse = await fetch(geocodeUrl)
      const geocodeData = await geocodeResponse.json()

      if (!geocodeData.results || geocodeData.results.length === 0) {
        setError('Location not found. Please try a different search term.')
        setLoading(false)
        return
      }

      const location = geocodeData.results[0]
      const { latitude, longitude, name, country, admin1 } = location

      // Step 2: Get weather data using coordinates
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`
      
      const weatherResponse = await fetch(weatherUrl)
      const weatherResult = await weatherResponse.json()

      if (weatherResult.error) {
        setError('Failed to fetch weather data. Please try again.')
        setLoading(false)
        return
      }

      // Combine location and weather data
      setWeatherData({
        location: {
          name,
          country,
          admin1: admin1 || '',
          latitude,
          longitude
        },
        current: weatherResult.current,
        current_units: weatherResult.current_units || {}
      })

      setLoading(false)
    } catch (err) {
      setError('An error occurred while fetching data. Please try again.')
      setLoading(false)
      console.error('Error:', err)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    }
    return weatherCodes[code] || 'Unknown'
  }

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return directions[Math.round(degrees / 22.5) % 16]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">
            Weather Search
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Search for any location to get current weather information
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter location (e.g., London, New York, Tokyo)"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-800"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Fetching weather data...</p>
            </div>
          )}

          {/* Weather Card */}
          {weatherData && !loading && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {weatherData.location.name}
                </h2>
                <p className="text-gray-600">
                  {weatherData.location.admin1 && `${weatherData.location.admin1}, `}
                  {weatherData.location.country}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {weatherData.location.latitude.toFixed(4)}°N, {weatherData.location.longitude.toFixed(4)}°E
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Temperature */}
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Temperature</p>
                      <p className="text-4xl font-bold text-gray-800">
                        {weatherData.current.temperature_2m}{weatherData.current_units?.temperature_2m || '°C'}
                      </p>
                    </div>
                    <div className="text-5xl">🌡️</div>
                  </div>
                </div>

                {/* Weather Condition */}
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Condition</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {getWeatherDescription(weatherData.current.weather_code)}
                      </p>
                    </div>
                    <div className="text-5xl">
                      {weatherData.current.weather_code === 0 ? '☀️' :
                       weatherData.current.weather_code <= 3 ? '⛅' :
                       weatherData.current.weather_code <= 48 ? '🌫️' :
                       weatherData.current.weather_code <= 67 ? '🌧️' :
                       weatherData.current.weather_code <= 86 ? '❄️' : '⛈️'}
                    </div>
                  </div>
                </div>

                {/* Humidity */}
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Humidity</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {weatherData.current.relative_humidity_2m}%
                  </p>
                </div>

                {/* Wind */}
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Wind</p>
                  <p className="text-xl font-bold text-gray-800">
                    {weatherData.current.wind_speed_10m} {weatherData.current_units?.wind_speed_10m || 'km/h'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {getWindDirection(weatherData.current.wind_direction_10m)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Data provided by{' '}
                  <a 
                    href="https://open-meteo.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open-Meteo
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WeatherSearch
