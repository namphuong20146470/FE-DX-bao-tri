import React, { useState,useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt } from 'react-icons/fa';
import ReactDOMServer from 'react-dom/server';
import axios from '../../api/axios';

const MapComponent = () => {
  const [dataSenor, setDataSensor] = useState({});
  useEffect(() => {
      axios.get('/api/v1/sensors').then((res) => {
        console.log('data sensor : ', res.data.data.sensors);
        setDataSensor(res.data.data.sensors)
      });
  }, []);
  const data = [
    { latitude: 10.85224, longitude: 106.77161, name: 'Khu D', },
    { latitude: 10.85041, longitude: 106.77310, name: 'Sân vận động', },
    { latitude: 10.85105, longitude: 106.77194, name: 'Tòa Trung Tâm',  },
    { latitude: 10.85135, longitude: 106.77051, name: 'Khu E',  },
  ];
  const mapRef = useRef(null);
  let map = null;
  let markers = [];

  useEffect(() => {
    map = L.map(mapRef.current).setView([10.85240, 106.77162], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create custom icon using React component
    const customMarkerIcon = L.divIcon({
      html: ReactDOMServer.renderToString(<FaMapMarkerAlt style={{ color: 'red', fontSize: '24px' }} />),
      iconSize: [24, 24], // adjust this size according to your needs
      className: '' // remove the default class
    });

    if (data && data.length > 0) {
      data.forEach(coord => {
        const { latitude, longitude, name, value } = coord;
        const marker = L.marker([latitude, longitude], { icon: customMarkerIcon }).addTo(map);
        
        const { so2, CO, no2, pm25, humidityAir, temperature } = dataSenor;
      const popupContent = `
        <div>
          <h4><b>${name}</b></h4>
          <table>
            <tr><td>SO2:</td><td>${so2} µg/m³</td></tr>
            <tr><td>CO:</td><td>${CO} µg/m³</td></tr>
            <tr><td>NO2:</td><td>${no2} µg/m³</td></tr>
            <tr><td>PM2.5:</td><td>${pm25} µg/m³</td></tr>
            <tr><td>Humidity:</td><td>${humidityAir}%</td></tr>
            <tr><td>Temperature:</td><td>${temperature} °C</td></tr>
          </table>
        </div>
      `;
      marker.bindPopup(popupContent);
      });

      const group = new L.featureGroup(data.map(coord => L.marker([coord.latitude, coord.longitude], { icon: customMarkerIcon })));
      map.fitBounds(group.getBounds());
    }

    return () => {
      map.remove();
    };
  }, [dataSenor]);

  return <div style={{ height: '500px' }} ref={mapRef}></div>;
};

export default MapComponent;
