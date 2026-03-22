#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

const API_KEY = process.env.WEATHERAPI_KEY;
const BASE_URL = "https://api.weatherapi.com/v1";

if (!API_KEY) {
  console.error("Error: WEATHERAPI_KEY environment variable is required.");
  console.error("Get a free key at https://www.weatherapi.com/signup.aspx");
  process.exit(1);
}

// Helper: make a GET request to WeatherAPI
async function weatherRequest(
  endpoint: string,
  params: Record<string, string | number>
): Promise<unknown> {
  const searchParams = new URLSearchParams({ key: API_KEY! });
  for (const [k, v] of Object.entries(params)) {
    searchParams.set(k, String(v));
  }
  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    const err = data as { error?: { code: number; message: string } };
    throw new McpError(
      ErrorCode.InternalError,
      `WeatherAPI error ${err.error?.code}: ${err.error?.message ?? res.statusText}`
    );
  }
  return data;
}

const server = new Server(
  {
    name: "weatherapi-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// LIST TOOLS
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_current_weather",
      description:
        "Get real-time current weather for any location. Returns temperature, wind speed and direction, humidity, pressure, UV index, visibility, feels-like temperature, and weather condition. Optionally includes air quality (AQI) data.",
      inputSchema: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description:
              "Location query. Accepts: city name (London), lat/lon (51.5,-0.1), US zip (10001), UK postcode (SW1), IATA airport code (iata:LHR), IP address, or auto:ip for caller's location.",
          },
          aqi: {
            type: "string",
            enum: ["yes", "no"],
            description: "Include air quality data (CO, NO2, O3, SO2, PM2.5, PM10). Default: no.",
          },
        },
        required: ["q"],
      },
    },
    {
      name: "get_forecast",
      description:
        "Get weather forecast for 1 to 14 days. Returns daily summaries (max/min/avg temp, rain chance, UV, wind) and hourly breakdowns. Also returns current conditions, astronomy data (sunrise/sunset/moon phase), and optionally weather alerts and air quality.",
      inputSchema: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description: "Location query — city name, lat/lon, zip, postcode, IATA, or IP.",
          },
          days: {
            type: "number",
            description: "Number of forecast days (1–14). Default: 3.",
          },
          alerts: {
            type: "string",
            enum: ["yes", "no"],
            description: "Include government weather alerts. Default: no.",
          },
          aqi: {
            type: "string",
            enum: ["yes", "no"],
            description: "Include air quality data. Default: no.",
          },
        },
        required: ["q"],
      },
    },
    {
      name: "get_history",
      description:
        "Get historical weather data for a specific date from 1 January 2010 onwards. Returns daily summary and full hourly breakdown. Useful for past weather lookups, analytics, and backtesting.",
      inputSchema: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description: "Location query — city name, lat/lon, zip, postcode, IATA, or IP.",
          },
          dt: {
            type: "string",
            description: "Date in yyyy-MM-dd format. Must be on or after 2010-01-01.",
          },
          end_dt: {
            type: "string",
            description:
              "Optional end date for a date range (Pro+ plan only). Max 30 days range. yyyy-MM-dd.",
          },
        },
        required: ["q", "dt"],
      },
    },
    {
      name: "get_future_weather",
      description:
        "Get future weather forecast for a date between 14 and 300 days from today. Returns 3-hourly data. Available on Pro+ plan and above.",
      inputSchema: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description: "Location query — city name, lat/lon, zip, postcode, IATA, or IP.",
          },
          dt: {
            type: "string",
            description:
              "Future date in yyyy-MM-dd format. Must be between 14 and 300 days from today.",
          },
        },
        required: ["q", "dt"],
      },
    },
    {
      name: "get_marine_weather",
      description:
        "Get marine and sailing weather forecast including significant wave height, swell height, swell direction, swell period, and optionally tide data. Useful for nautical and coastal planning.",
      inputSchema: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description: "Coastal or ocean coordinates as lat,lon (e.g. 51.5,-1.8).",
          },
          days: {
            type: "number",
            description: "Forecast days (1–7 depending on plan). Default: 1.",
          },
          tides: {
            type: "string",
            enum: ["yes", "no"],
            description: "Include tide data (Pro+ plan and above). Default: no.",
          },
        },
        required: ["q"],
      },
    },
    {
      name: "get_astronomy",
      description:
        "Get astronomy data for a location and date: sunrise, sunset, moonrise, moonset, moon phase, and moon illumination percentage.",
      inputSchema: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description: "Location query — city name, lat/lon, zip, postcode, IATA, or IP.",
          },
          dt: {
            type: "string",
            description: "Date in yyyy-MM-dd format.",
          },
        },
        required: ["q", "dt"],
      },
    },
    {
      name: "get_timezone",
      description:
        "Get timezone and current local time for any location. Returns IANA timezone ID (e.g. Europe/London), local time string, and unix epoch.",
      inputSchema: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description: "Location query — city name, lat/lon, zip, postcode, IATA, or IP.",
          },
        },
        required: ["q"],
      },
    },
    {
      name: "search_locations",
      description:
        "Search for cities and towns by partial name or postcode. Returns an array of matching locations with their coordinates, region, country, and URL slug. Useful for building location pickers or resolving ambiguous place names.",
      inputSchema: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description: "Partial city name, postcode, or coordinates to search. E.g. 'lond', 'SW1', 'paris'.",
          },
        },
        required: ["q"],
      },
    },
    {
      name: "ip_lookup",
      description:
        "Look up geolocation data for an IP address: city, region, country, coordinates, timezone, and whether it's in the EU. Pass 'auto:ip' to geolocate the caller's own IP address.",
      inputSchema: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description: "IPv4 address, IPv6 address, or 'auto:ip' for caller's IP.",
          },
        },
        required: ["q"],
      },
    },
    {
      name: "get_alerts",
      description:
        "Get active government weather alerts and warnings for a location. Covers USA, UK, Europe, and rest of world. Returns headline, severity, urgency, affected areas, and full description.",
      inputSchema: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description: "Location query — city name, lat/lon, zip, postcode, IATA, or IP.",
          },
        },
        required: ["q"],
      },
    },
    {
      name: "get_sports",
      description:
        "Get upcoming sports events (football/soccer, cricket, golf) for a location, with stadium, country, tournament name, and start time.",
      inputSchema: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description: "Location query — city name, lat/lon, zip, postcode, or IATA.",
          },
        },
        required: ["q"],
      },
    },
  ],
}));

// CALL TOOL
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case "get_current_weather": {
        const { q, aqi = "no" } = args as { q: string; aqi?: string };
        result = await weatherRequest("/current.json", { q, aqi });
        break;
      }
      case "get_forecast": {
        const { q, days = 3, alerts = "no", aqi = "no" } = args as {
          q: string;
          days?: number;
          alerts?: string;
          aqi?: string;
        };
        result = await weatherRequest("/forecast.json", { q, days, alerts, aqi });
        break;
      }
      case "get_history": {
        const { q, dt, end_dt } = args as { q: string; dt: string; end_dt?: string };
        const params: Record<string, string | number> = { q, dt };
        if (end_dt) params.end_dt = end_dt;
        result = await weatherRequest("/history.json", params);
        break;
      }
      case "get_future_weather": {
        const { q, dt } = args as { q: string; dt: string };
        result = await weatherRequest("/future.json", { q, dt });
        break;
      }
      case "get_marine_weather": {
        const { q, days = 1, tides = "no" } = args as {
          q: string;
          days?: number;
          tides?: string;
        };
        result = await weatherRequest("/marine.json", { q, days, tides });
        break;
      }
      case "get_astronomy": {
        const { q, dt } = args as { q: string; dt: string };
        result = await weatherRequest("/astronomy.json", { q, dt });
        break;
      }
      case "get_timezone": {
        const { q } = args as { q: string };
        result = await weatherRequest("/timezone.json", { q });
        break;
      }
      case "search_locations": {
        const { q } = args as { q: string };
        result = await weatherRequest("/search.json", { q });
        break;
      }
      case "ip_lookup": {
        const { q } = args as { q: string };
        result = await weatherRequest("/ip.json", { q });
        break;
      }
      case "get_alerts": {
        const { q } = args as { q: string };
        result = await weatherRequest("/alerts.json", { q });
        break;
      }
      case "get_sports": {
        const { q } = args as { q: string };
        result = await weatherRequest("/sports.json", { q });
        break;
      }
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof McpError) throw error;
    throw new McpError(
      ErrorCode.InternalError,
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// START
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("WeatherAPI MCP server running. Set WEATHERAPI_KEY env var to authenticate.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
