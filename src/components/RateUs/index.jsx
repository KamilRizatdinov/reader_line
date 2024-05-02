/* eslint-disable no-undef */
import React, {useState, useCallback, useEffect} from 'react';
import {StarFilled, StarOutlined} from '@ant-design/icons';
import {Flex, Divider} from 'antd';

import './RateUs.css';

const RateUs = () => {
  const [rating, setRating] = useState(0);
  const [locale, setLocale] = useState('');

  useEffect(() => {
    if (!chrome || !chrome.i18n) return;

    setLocale(chrome.i18n.getUILanguage());
  }, []);

  const onClick = useCallback((rating) => {
    if (rating >= 4) {
      window.open("https://chromewebstore.google.com/detail/reader-line/fikijclmnnepcpijbljojpdaepikaicm/reviews", '_blank').focus();
    } else {
      window.open("https://kamilrizatdinov.github.io/reader_line/rate-us", '_blank').focus();
    }
  }, []);

  const ratings = ["ar", "ara"].includes(locale) ? [5,4,3,2,1] : [1,2,3,4,5];

  return (
    <div className='rate-us'>
      <Divider>Rate us:</Divider>
      <Flex gap="4px" className='rate-us__stars' onMouseLeave={() => setRating(0)}>
        {ratings.map(i => {
          if (i <= rating) {
            return (
              <StarFilled 
                key={i}
                onMouseEnter={() => setRating(i)} 
                onClickCapture={() => onClick(rating)}
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
    </div>
  );
};

export default RateUs;