import {useState, useEffect} from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

const GaugeChart = () => {
  const [value, setValue] = useState(0); 

  useEffect(() => {
  
    const interval = setInterval(() => {
      setValue((prevValue) => {
        if (prevValue < 95) {
          return prevValue + 1; 
        } else {
          clearInterval(interval); 
          return prevValue;
        }
      });
    }, 30); 
    return () => clearInterval(interval); 
  }, []); 
  return (
    <div style={{ height: '300px' }}> 
      <Gauge
        value={value}
        startAngle={-110}
        endAngle={110}
        sx={{
          [`& .${gaugeClasses.valueText}`]: {
            fontSize: 40,
            transform: 'translate(0px, 0px)',
          },
        }}
        text={({ value, valueMax }) => `${value} / ${valueMax}`}
      />
    </div>
  );
};

export default GaugeChart;
