import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, CircularProgress, Grid } from '@mui/material';
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiFog, WiDaySunnyOvercast} from 'react-icons/wi';

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get('http://api.weatherapi.com/v1/current.json', {
          params: {
            key: '8c60834758724c91bf424354241606', // Thay YOUR_API_KEY bằng API key của bạn
            q: 'Ho Chi Minh City', // Thay đổi thành thành phố bạn muốn
            aqi: 'no' // AQI (Air Quality Index) không cần thiết cho ví dụ này
          }
        });
        setWeatherData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{`Error: ${error.message}`}</Typography>;

  const renderWeatherIcon = (condition) => {
    switch (condition) {
      case 'Sunny':
        return <WiDaySunny size={50} />;
      case 'Partly cloudy':
      case 'Cloudy':
        return <WiCloud size={50} color='silver'/>;
      case 'Rain':
      case 'Light rain':
      case 'Moderate rain':
      case 'Light rain shower':
        return <WiRain size={50} color='blue'/>;
      case 'Snow':
      case 'Light snow':
        return <WiSnow size={50} />;
      case 'Fog':
      case 'Overcast':
        return <WiDaySunnyOvercast size={50} color='yellow' />
      case 'Mist':
        return <WiFog size={50} />;
      default:
        return null;
    }
  };

  return (
    <Grid container justifyContent="center" style={{ marginTop: '20px', marginBottom: '20px' }}>
      <Card style={{ minWidth: 275 }}>
        <CardContent style={{borderRadius: '20px'}}>
          <Typography variant="h5" component="div">
            Weather Dashboard
          </Typography>
          {weatherData && (
            <div>
              <Typography variant="h6">{weatherData.location.name}</Typography>
              {renderWeatherIcon(weatherData.current.condition.text)}
              <Typography variant="body2">
                Temperature: {weatherData.current.temp_c}°C
              </Typography>
              <Typography variant="body2">
                Humidity: {weatherData.current.humidity}%
              </Typography>
              <Typography variant="body2">
                Condition: {weatherData.current.condition.text}
              </Typography>
            </div>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default WeatherDashboard;
