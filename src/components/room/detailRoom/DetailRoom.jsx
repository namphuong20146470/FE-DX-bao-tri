import { Card, Carousel, Col, notification, Row, Switch } from 'antd';
import Meta from 'antd/lib/card/Meta';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SiApacheairflow } from 'react-icons/si';
import { GiLightBulb } from 'react-icons/gi';
import { ImPower } from 'react-icons/im';
import { RiCharacterRecognitionFill } from 'react-icons/ri';
import { AiFillCodeSandboxSquare } from 'react-icons/ai';
import { TiDeviceDesktop } from 'react-icons/ti';
import { BsFillLockFill, BsFillUnlockFill } from 'react-icons/bs';
import { Pie } from 'ant-design-pro/lib/Charts';
import { Liquid } from '@ant-design/plots';
import { AiOutlineAudio } from 'react-icons/ai';
import { BsFillStopCircleFill } from 'react-icons/bs';
import Gauge from 'components/common/Gauge';
import WeatherBoard from  'components/common/WeatherBoard'
import axios from '../../../api/axios';
import './DetailRoom.css';

const contentStyle = {
  height: '400px',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  borderRadius: 15,
};

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
  // const token = localStorage.getItem('token');
  const [lights, setLights] = useState([]);
  const [airCondition, setAirCondition] = useState();
  const [humidity, setHumidity] = useState();
  const [temperature, setTemperature] = useState();
  const [door, setDoor] = useState();
  const [number_devices, setNumberDevices] = useState();
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    axios.get(`/api/v1/rooms/${roomId}`).then((res) => {
      let light = [];
      let listDevices = res.data.data;
      console.log('listDevices', listDevices);
      let count = listDevices === undefined ? 0 : listDevices.length;
      setNumberDevices(count);
      // eslint-disable-next-line array-callback-return
      listDevices.map((item, index) => {
        if (item.deviceName === 'fan') {
          setAirCondition(item);
        } else if (item.deviceName === 'door') {
          setDoor(item);
        } else {
          light.push(item);
        }
      });
      console.log('res ', listDevices);
      setLights(light);
    });
  }, []);

  // Update chart độ ẩm nhiệt độ từ sensor
  useEffect(() => {
    setInterval(() => {
      axios.get('/api/v1/sensors').then((res) => {
        console.log('data sensor : ', res.data.data.sensors);
        const dataSensor = res.data.data.sensors;
        setHumidity(dataSensor.humidityAir / 100);
        setTemperature(dataSensor.temperature);
      });
    }, 1000);
  }, []);


  // sự kiện click vào switch on/off mỗi phòng
  const onChange = (id, checked, event) => {
    console.log('checked ', id, checked, event);
    let status = 'off';
    if (checked === true) {
      status = 'on';
    } else {
      status = 'off';
    }
    axios
      .patch(`/api/v1/devices/${id}`, { status: status })
      .then((res) => {
        let device = res.data.data;
        console.log('device ', device);
        if (airCondition && id === airCondition._id) {
          setAirCondition(device);
        } else {
          let tmp = lights.map((item) => item);
          let index = findById(id, lights);
          tmp[index].status = status;
          console.log('tmp ', tmp);
          setLights(tmp);
        }
        console.log(device.status);
        if (device.status === 'on') {
          notification.success({
            message: 'Turn on device successfully!',
            style: {
              borderRadius: 15,
              backgroundColor: '#b7eb8f',
            },
            duration: 2,
          });
        } else {
          notification.success({
            message: 'Turn off device successfully!',
            style: {
              borderRadius: 15,
              backgroundColor: '#b7eb8f',
            },
            duration: 2,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        notification.error({
          message: 'server has an error!',
          style: {
            borderRadius: 15,
            backgroundColor: '#fff2f0',
          },
          duration: 2,
        });
      });
  };

  // Thực hiện khóa/mở cửa
  const handleLock = () => {
    console.log(door);
    let status = door.status;
    let tmp = 'off';
    if (status === 'on') {
      tmp = 'off';
    } else {
      tmp = 'on';
    }
    if (status === 'open') {
      tmp = 'off';
    }
    axios
      .patch(`/api/v1/devices/${door._id}`, { status: tmp })
      .then((res) => {
        console.log('te ', res.data.data);
        let door = res.data.data;
        setDoor(door);
        if (door.status === 'off') {
          notification.success({
            message: 'Lock door successfully!',
            style: {
              borderRadius: 15,
              backgroundColor: '#b7eb8f',
            },
            duration: 2,
          });
        } else {
          notification.success({
            message: 'Open door successfully!',
            style: {
              borderRadius: 15,
              backgroundColor: '#b7eb8f',
            },
            duration: 2,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        notification.error({
          message: 'server has an error!',
          style: {
            borderRadius: 15,
            backgroundColor: '#fff2f0',
          },
          duration: 2,
        });
      });
  };

  // tìm light trong array lights
  const findById = (id, arr) => {
    let index = -1;
    // eslint-disable-next-line array-callback-return
    arr.map((item, i) => {
      if (item._id === id) {
        index = i;
      }
    });
    return index;
  };

  // mặc định sẽ gồm 1 AirConditional, 1 door, và nhiều light
  return (
    <div className="detail-room">
  <Row style={{ lineHeight: 2.0 }}>
    {/* Phần 1: 4 gauge chia làm 2 hàng */}
    <Col span={12}>
      <Row gutter={[16, 16]} justify="center">
        <Col span={12} md={12}>
          <Gauge title="CO2" value={450} maxValue={1000} />
        </Col>
        <Col span={12} md={12}>
          <Gauge title="CO" value={30} maxValue={100} />
        </Col>
      </Row>
      <Row gutter={[16, 16]} justify="center">
        <Col span={12} md={12}>
          <Gauge title="UV" value={7} maxValue={10} />
        </Col>
        <Col span={12} md={12}>
          <Gauge title="PM2.5" value={120} maxValue={500} />
        </Col>
      </Row>
    </Col>

    {/* Phần 2: Hàng đầu là nhiệt độ và độ ẩm, hàng 2 là weatherboard thẳng hàng với 2 gauge */}
    <Col span={12}>
      <Row gutter={[16, 16]} justify="center" className="tempandhumd">
        <Col span={12} style={{ marginTop: 0, color: 'white' }}>
          <Liquid percent={humidity} {...configLiquid} />
        </Col>
        <Col span={12} style={{ backgroundColor: 'black' }}>
          {temperature === undefined ? (
            ''
          ) : (
            <Pie
              color="#0041ff"
              percent={temperature}
              subTitle="Nhiệt độ"
              total={temperature + '°C'}
              height={165}
            />
          )}
        </Col>
      </Row>
      <Row gutter={[16, 16]} justify="center" className="weatherboard">
        <Col span={24}>
          <WeatherBoard />
        </Col>
      </Row>
    </Col>
  </Row>
</div>


  
  );
}

export default DetailRoom;
