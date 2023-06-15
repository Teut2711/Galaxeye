import React, { useState } from "react";
import "./App.css";
import { MapContainer, TileLayer, Polygon, useMapEvents } from "react-leaflet";

async function getTiles(inputTile) {
  try {
    const response = await fetch(
      process.env.BACKEND_API || "http://localhost:8000/api/v1/tile",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "success",
          data: {
            type: "Feature",
            properties: {
              fill: "#00f",
            },
            geometry: {
              type: "Polygon",
              coordinates: [Object.values(inputTile)],
            },
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      // Handle the response data
      return data;
    } else {
      throw new Error("Request failed with status: " + response.status);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

function MapEventsHandler({ onLocationClicked }) {
  useMapEvents({
    click(e) {
      onLocationClicked(e.latlng);
    },
  });

  return null;
}

function App() {
  const [placesInKarnataka, setPlacesInKarnataka] = useState([]);
  const [tiles, setTiles] = useState([]);

  const handleLocationClicked = async (latlng) => {
    if (placesInKarnataka.length === 4) {
      try {
        console.info("Fetching tiles...");
        const response = await getTiles(placesInKarnataka);
        setTiles(response.data);
      } catch (err) {
        console.log(err.message);
      }
    } else {
      setPlacesInKarnataka((state) => {
        const newState = [...state, latlng];
        return newState;
      });
    }
  };

  return (
    <MapContainer
      center={[15.3173, 75.7139]}
      zoom={10}
      scrollWheelZoom={true}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEventsHandler onLocationClicked={handleLocationClicked} />
      <Polygon
        pathOptions={{ color: "purple" }}
        positions={placesInKarnataka}
      />
      {tiles.map((tile, i) => {
        return (
          <Polygon
            key={i}
            pathOptions={{ color: "red" }}
            positions={tile.geometry.coordinates[0].map(([a, b]) => ({
              lat: b,
              lng: a,
            }))}
          />
        );
      })}
    </MapContainer>
  );
}

export default App;
