import React, { useEffect, useState } from "react";
import "./App.css";
import { MapContainer, TileLayer, Polygon, useMapEvents } from "react-leaflet";
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
async function getTiles(inputTile) {
  try {
    console.log(inputTile);
    const response = await fetch(
      process.env.BACKEND_API || "http://localhost:8000/api/v1/tile",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "success",
          data: inputTile,
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
  const [userInputTile, setUserInputTile] = useState({
    type: "Feature",
    properties: {
      fill: "#00f",
    },
    geometry: {
      type: "Polygon",
      coordinates: [[]],
    },
  });
  const [tiles, setTiles] = useState([]);

  const handleLocationClicked = async (latlng) => {
    if (userInputTile.geometry.coordinates[0].length === 4) {
      try {
        console.info("Fetching tiles...");
        const response = await getTiles(userInputTile);
        setTiles(response.data);
      } catch (err) {
        console.log(err.message);
      }
    } else {
      setUserInputTile({
        ...userInputTile,
        geometry: {
          ...userInputTile.geometry,
          coordinates: [
            [
              ...userInputTile.geometry.coordinates[0],
              [latlng.lng, latlng.lat],
            ],
          ],
        },
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
        positions={userInputTile.geometry.coordinates[0].map((e) => ({
          lat: e[1],
          lng: e[0],
        }))}
      />
      {tiles.map((tile, i) => {
        return (
          <Polygon
            key={i}
            pathOptions={{ color: getRandomColor() }}
            positions={tile.geometry.coordinates[0].map((e) => ({
              lat: e[1],
              lng: e[0],
            }))}
          />
        );
      })}
    </MapContainer>
  );
}

export default App;
