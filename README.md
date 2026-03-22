# weatherapi-mcp

Official MCP (Model Context Protocol) server for [WeatherAPI.com](https://www.weatherapi.com). Gives AI agents like Claude direct access to real-time weather, forecasts, historical data, astronomy, marine weather, air quality, and more.

## Quick Start

```bash
# Run directly with npx (no install needed)
WEATHERAPI_KEY=your_api_key npx weatherapi-mcp
```

Get a free API key at [weatherapi.com/signup.aspx](https://www.weatherapi.com/signup.aspx)

## Setup in Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "weatherapi": {
      "command": "npx",
      "args": ["-y", "weatherapi-mcp"],
      "env": {
        "WEATHERAPI_KEY": "your_api_key_here"
      }
    }
  }
}
```

Config file locations:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Restart Claude Desktop after editing.

## Setup in Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "weatherapi": {
      "command": "npx",
      "args": ["-y", "weatherapi-mcp"],
      "env": {
        "WEATHERAPI_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get_current_weather` | Real-time conditions — temp, wind, humidity, UV, pressure, AQI |
| `get_forecast` | Up to 14-day forecast with hourly breakdown and alerts |
| `get_history` | Historical weather from 1 Jan 2010 onwards |
| `get_future_weather` | Long-range forecast 14–300 days ahead (Pro+ plan) |
| `get_marine_weather` | Wave height, swell, tide data for coastal/ocean points |
| `get_astronomy` | Sunrise, sunset, moonrise, moon phase, illumination |
| `get_timezone` | IANA timezone and local time for any location |
| `search_locations` | Autocomplete city/town search with coordinates |
| `ip_lookup` | Geolocate an IP address or auto-detect caller's location |
| `get_alerts` | Government weather warnings (USA, UK, Europe, worldwide) |
| `get_sports` | Upcoming football, cricket, and golf events |

## Location Formats

The `q` parameter accepts:
- City name: `London`, `New York`, `Tokyo`
- Coordinates: `51.5,-0.1`
- US zip: `10001`
- UK postcode: `SW1A 1AA`
- IATA airport: `iata:LHR`
- IP address: `100.0.0.1`
- Auto-detect: `auto:ip`

## Example Prompts

Once connected, ask Claude:
- *"What's the weather like in Glasgow right now?"*
- *"Will it rain in London this weekend? Show me hourly."*
- *"What was the weather in Paris on 15 June 2024?"*
- *"What time does the sun rise in Tokyo tomorrow?"*
- *"Are there any weather warnings active for New York?"*
- *"What's the wave height off the coast of Cornwall today?"*
- *"What timezone is Sydney in and what time is it there now?"*

## Plans

| Plan | Price | Calls/month |
|------|-------|-------------|
| Free | $0 | 100,000 |
| Starter | $7/mo | 3,000,000 |
| Pro+ | $25/mo | 5,000,000 |
| Business | $65/mo | 10,000,000 |
| Enterprise | Custom | Custom |

## Links

- [Documentation](https://www.weatherapi.com/docs/)
- [API Explorer](https://www.weatherapi.com/api-explorer.aspx)
- [Sign Up Free](https://www.weatherapi.com/signup.aspx)
- [OpenAPI Spec](https://www.weatherapi.com/openapi.json)
- [Pricing](https://www.weatherapi.com/pricing.aspx)

## License

MIT
