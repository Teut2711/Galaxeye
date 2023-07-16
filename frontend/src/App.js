import React, { useState, useRef } from "react";
import "./App.css";
import { MapContainer, TileLayer, Polygon, useMapEvents } from "react-leaflet";

import { Bars } from "react-loader-spinner";

async function getTiles(inputTile) {
  try {
    console.log("API :", process.env.REACT_APP_BACKEND_API);
    const response = await fetch(
      process.env.REACT_APP_BACKEND_API || "http://localhost:8000/api/v1/tile",
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
      console.info("Data is: ", data);
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
function getInitialState() {
  return {
    type: "Feature",
    properties: {
      fill: "#00f",
    },
    geometry: {
      type: "Polygon",
      coordinates: [[]],
    },
  };
}

function Wrapper({ isLoading, children }) {
  return isLoading ? (
    <Bars
      height="80"
      width="80"
      color="#4fa94d"
      ariaLabel="bars-loading"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
    />
  ) : (
    children
  );
}
function App() {
  const [userInputTile, setUserInputTile] = useState(() => getInitialState());
  const [isLoading, setLoading] = useState(false);
  const [tiles, setTiles] = useState([]);
  const mapRef = useRef(null);
  const map = mapRef.current;

  const handleReset = () => {
    setUserInputTile(() => getInitialState());
    setTiles([]);
  };
  const handleLocationClicked = async (latlng) => {
    setUserInputTile({
      ...userInputTile,
      geometry: {
        ...userInputTile.geometry,
        coordinates: [
          [...userInputTile.geometry.coordinates[0], [latlng.lng, latlng.lat]],
        ],
      },
    });
  };
  const handleAPICall = async () => {
    try {
      console.info("Fetching tiles...");
      setLoading(true);
      const response = await getTiles(userInputTile);
      setLoading(false);
      setTiles(response.data);
    } catch (err) {
      console.log(err.message);
      setLoading(false);
      map.flyTo(
        userInputTile.geometry.coordinates[0].map((e) => ({
          lat: e[1],
          lng: e[0],
        }))
      );
    }
  };
  const styles = {
    backgroundColor: "purple",
    margin: "10px",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "5px",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
    cursor: "pointer",
    width: "200px",
  };
  return (
    <div
      style={{
        paddingTop: "20px",

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Wrapper isLoading={isLoading}>
        <MapContainer
          center={[15.3173, 75.7139]}
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: "90vh", width: "90%" }}
          ref={mapRef}
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
                pathOptions={{ color: "rgb(255, 0, 0)" }}
                positions={tile.geometry.coordinates[0].map((e) => ({
                  lat: e[1],
                  lng: e[0],
                }))}
              />
            );
          })}
        </MapContainer>
        <div
          style={{
            width: "80%",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <button onClick={handleAPICall} style={styles}>
            Get matching tiles!
          </button>{" "}
          <button onClick={handleReset} style={styles}>
            Reset!
          </button>{" "}
        </div>
      </Wrapper>
    </div>
  );
}

export default App;
