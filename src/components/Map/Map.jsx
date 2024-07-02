import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt } from 'react-icons/fa';
import ReactDOMServer from 'react-dom/server';
import axios from '../../api/axios';

const MapComponent = () => {
  const [sensorData, setSensorData] = useState({});
  const mapRef = useRef(null);
  let map = null;
  let markers = [];

  const data = [
    { roomId: "62616bb00aa850983c21b11b", latitude: 10.85224, longitude: 106.77161, name: 'Khu D' },
    { roomId: "62616bcfadb8c6e0f01e49dc", latitude: 10.85041, longitude: 106.77310, name: 'Sân vận động' },
    { roomId: "62618a2af73fe211513926c8", latitude: 10.85105, longitude: 106.77194, name: 'Tòa Trung Tâm' },
    { roomId: "62a9dc30092f09dc52362d94", latitude: 10.85135, longitude: 106.77051, name: 'Khu E' },
  ];

  useEffect(() => {
    data.forEach(location => {
      axios.get(`/api/v1/sensors/${location.roomId}`).then(res => {
        setSensorData(prevState => ({
          ...prevState,
          [location.roomId]: res.data.data.latestSensorData
        }));
      });
    });
  }, []);

  useEffect(() => {
    map = L.map(mapRef.current).setView([10.85240, 106.77162], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const customMarkerIcon = L.divIcon({
      html: ReactDOMServer.renderToString(<FaMapMarkerAlt style={{ color: 'red', fontSize: '24px' }} />),
      iconSize: [24, 24],
      className: ''
    });

    if (data && data.length > 0) {
      data.forEach(coord => {
        const { roomId, latitude, longitude, name } = coord;
        const marker = L.marker([latitude, longitude], { icon: customMarkerIcon }).addTo(map);

        const popupContent = sensorData[roomId]
          ? `
            <div>
              <h4><b>${name}</b></h4>
              <table>
                <tr><td>SO2:</td><td>${sensorData[roomId].so2} µg/m³</td></tr>
                <tr><td>CO:</td><td>${sensorData[roomId].CO} µg/m³</td></tr>
                <tr><td>NO2:</td><td>${sensorData[roomId].no2} µg/m³</td></tr>
                <tr><td>PM2.5:</td><td>${sensorData[roomId].pm25} µg/m³</td></tr>
                <tr><td>Humidity:</td><td>${sensorData[roomId].humidityAir}%</td></tr>
                <tr><td>Temperature:</td><td>${sensorData[roomId].temperature} °C</td></tr>
              </table>
            </div>
          `
          : 'Loading...';

        marker.bindPopup(popupContent);
        markers.push(marker);
      });

      const group = new L.featureGroup(data.map(coord => L.marker([coord.latitude, coord.longitude], { icon: customMarkerIcon })));
      map.fitBounds(group.getBounds());
    }

    return () => {
      map.remove();
    };
  }, [sensorData]);

  return <div style={{ height: '500px' }} ref={mapRef}></div>;
};

export default MapComponent;
