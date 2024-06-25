import { Col,Row } from 'antd';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Pie } from 'ant-design-pro/lib/Charts';
import { Liquid } from '@ant-design/plots';
import Gauge from 'components/common/Gauge';
import WeatherBoard from  'components/Board/WeatherBoard'
import axios from '../../../api/axios';
import './DetailRoom.css';
import AqiBoard from 'components/Board/AqiDashboard'

const configLiquid = {
  autoFill: false,
  height: 150,
  width: 150,
  outline: {
    border: 8,
    distance: 8,
  },
  wave: {
    length: 128,
  },
};

// Với mỗi room sẽ gán các device cho nó
function DetailRoom(props) {
  const roomId = useParams().id;
  const [dataSenor, setDataSensor] = useState({});

  const fetchData = () => {
    axios.get(`/api/v1/sensors/${roomId}`).then((res) => {
      console.log('data sensor : ', res.data.data.latestSensorData);
      setDataSensor(res.data.data.latestSensorData);
    });
  };
  // Update chart độ ẩm nhiệt độ từ sensor
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    // Dọn dẹp interval khi component bị hủy
    return () => clearInterval(interval);
  }, [roomId]);

  return (
    <div className="detail-room">
  <Row style={{ lineHeight: 2.0 }}>
    {/* Phần 1: 4 gauge chia làm 2 hàng */}
    <Col span={12}>
      <Row gutter={[16, 16]} justify="center">
        <Col span={12} md={12}>
          <Gauge title="SO2" value={parseFloat(dataSenor?.so2)} aqi_value={dataSenor?.aqi_so2} maxValue={1004} />
        </Col>
        <Col span={12} md={12}>
          <Gauge title="CO" value={parseFloat(dataSenor?.CO)} aqi_value={dataSenor?.aqi_CO} maxValue={150000} />
        </Col>
      </Row>
      <Row gutter={[16, 16]} justify="center">
        <Col span={12} md={12}>
          <Gauge title="NO2" value={parseFloat(dataSenor?.no2)} aqi_value={dataSenor?.aqi_no2} maxValue={3850} />
        </Col>
        <Col span={12} md={12}>
          <Gauge title="PM2.5" value={parseFloat(dataSenor?.pm25)} aqi_value={dataSenor?.aqi_pm25} maxValue={500} />
        </Col>
      </Row>
    </Col>

    {/* Phần 2: Hàng đầu là nhiệt độ và độ ẩm, hàng 2 là weatherboard thẳng hàng với 2 gauge */}
    <Col span={12}>
      <Row gutter={[16, 16]} justify="center" className="tempandhumd">
        <Col span={12} style={{ marginBottom: '20px',marginTop: '15px', color: 'white' }}>
          <Liquid percent={dataSenor?.humidityAir / 100} {...configLiquid} />
        </Col>
        <Col span={12} style={{ marginBottom: '20px',marginTop: '15px',backgroundColor: 'black' }}>
          {dataSenor?.temperature === undefined ? (
            ''
          ) : (
            <Pie
              color="#0041ff"
              percent={dataSenor?.temperature}
              subTitle="Temperature"
              total={dataSenor?.temperature + '°C'}
              height={165}
            />
          )}
        </Col>
      </Row>
      <Row gutter={[16, 16]} justify="center" className="weatherboard">
                    <Col xs={24} md={10}>
                        <WeatherBoard />
                    </Col>
                    <Col xs={24} md={10}>
                        <AqiBoard city="Ho%20Chi%20Minh%20City" />
                    </Col>
      </Row>
    </Col>
  </Row>
</div>


  
  );
}

export default DetailRoom;
