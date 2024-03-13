import React, {useState, useCallback} from 'react';
import {StarFilled, StarOutlined} from '@ant-design/icons';
import {Flex} from 'antd';

import './RateUs.css';

const RateUs = () => {
  const [rating, setRating] = useState(0);
  const onClick = useCallback((rating) => {
    if (rating >= 4) {
      window.open("https://google.com", '_blank').focus();
    } else {
      window.open("https://google.com", '_blank').focus();
    }
  }, []);

  return (
    <Flex gap="4px" className='rate-us' onMouseLeave={() => setRating(0)}>
      {[1,2,3,4,5].map(i => {
        if (i <= rating) {
          return (
            <StarFilled 
              key={i}
              onMouseEnter={() => setRating(i)} 
              onClickCapture={onClick}
              style={{
                fontSize: "30px", 
                color: "#1D8B70",
                cursor: "pointer",
              }} 
            />
          )
        }

        return (
          <StarOutlined 
            key={i}  
            onMouseEnter={() => setRating(i)} 
            style={{
              fontSize: "30px", 
              color: "#1D8B70",
              cursor: "pointer",
            }} 
          />
        )
      })}
    </Flex>
  );
};

export default RateUs;