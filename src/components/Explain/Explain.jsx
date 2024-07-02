import React from 'react';
import './Explain.css'; // Import the CSS file for styling

const AirQualityTable = () => {
  const data = [
    { range: '0 - 12.0', aqi: '0 - 50', safety: 'Tốt', healthEffects: 'Hầu như không có.', prevention: 'Không.' },
    { range: '12.1 - 35.4', aqi: '51 - 100', safety: 'Trung bình', healthEffects: 'Những người nhạy cảm có thể gặp các chứng bệnh đường hô hấp.', prevention: 'Những người nhạy cảm nên giảm các hoạt động phải gắng sức nặng hoặc kéo dài.' },
    { range: '35.5 - 55.4', aqi: '101 - 150', safety: 'Không tốt cho các nhóm người nhạy cảm', healthEffects: 'Tăng khả năng mắc các chứng bệnh hô hấp ở những người nhạy cảm; làm nặng thêm bệnh tim và bệnh phổi, tăng nguy cơ tử vong sớm ở người mắc bệnh tim phổi và người già.', prevention: 'Những người mắc bệnh đường hô hấp, bệnh tim, người già và trẻ em nên hạn chế các hoạt động phải gắng sức nặng hoặc kéo dài.' },
    { range: '55.5 - 150.4', aqi: '151 - 200', safety: 'Không tốt cho sức khỏe', healthEffects: 'Làm nặng thêm bệnh tim và bệnh phổi, tăng nguy cơ tử vong sớm ở người mắc bệnh tim phổi và người già; tăng ảnh hưởng xấu tới hô hấp của mọi người nói chung.', prevention: 'Những người mắc bệnh đường hô hấp, bệnh tim, người già và trẻ em nên tránh các hoạt động phải gắng sức nặng hoặc kéo dài; người bình thường nên hạn chế các hoạt động phải gắng sức kéo dài.' },
    { range: '150.5 - 250.4', aqi: '201 - 300', safety: 'Rất không tốt cho sức khỏe', healthEffects: 'Làm nặng thêm đáng kể bệnh tim và bệnh phổi, tăng đáng kể nguy cơ tử vong sớm ở người mắc bệnh tim phổi và người già; tăng đáng kể ảnh hưởng xấu tới hô hấp của mọi người nói chung.', prevention: 'Những người mắc bệnh đường hô hấp, bệnh tim, người già và trẻ em nên tránh mọi hoạt động ngoài trời; người bình thường nên tránh các hoạt động phải gắng sức kéo dài.' },
    { range: '250.5 - 500.4', aqi: '301 - 500', safety: 'Nguy hiểm', healthEffects: 'Làm nặng thêm bệnh tim và bệnh phổi, tăng nghiêm trọng nguy cơ tử vong sớm ở người mắc bệnh tim phổi và người già; gây ảnh hưởng xấu nghiêm trọng tới hô hấp của mọi người.', prevention: 'Mọi người nên tránh các hoạt động phải gắng sức ngoài trời; người mắc bệnh hô hấp, bệnh tim, người già và trẻ em nên ở trong nhà.' }
  ];

  return (
    <div>
    <h1 className= "white">Bụi mịn PM2.5</h1>
    <p className= "white">
      Hạt bụi mịn PM2.5 là một chất gây ô nhiễm không khí là mối quan tâm đối với sức khỏe của mọi người khi mức độ trong không khí cao. PM2.5 là những hạt nhỏ trong không khí làm giảm tầm nhìn và khiến không khí xuất hiện mờ khi mức độ tăng cao.
    </p>
    <p className= "white">
      Các mức ô nhiễm PM2.5:
    </p>
    <table className="air-quality-table">
      <thead>
        <tr>
          <th>Chỉ số PM2.5 (µg/m³)</th>
          <th>Chỉ số chất lượng không khí (AQI)</th>
          <th>Mức độ an toàn</th>
          <th>Tác động tới sức khỏe</th>
          <th>Biện pháp phòng ngừa</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.range}</td>
            <td>{row.aqi}</td>
            <td>{row.safety}</td>
            <td>{row.healthEffects}</td>
            <td>{row.prevention}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}

export default AirQualityTable;
