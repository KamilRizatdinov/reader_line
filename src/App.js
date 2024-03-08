import React, {useCallback, useEffect, useState} from 'react';
import {InputNumber, ColorPicker, Flex, Switch} from 'antd';

import "./App.css";

function App() {
  const [color, setColor] = useState("rgba(0, 0, 0, 0.15)");
  const [height, setHeight] = useState(20);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (!chrome?.storage) {
      return;
    }

    // eslint-disable-next-line no-undef
    chrome.storage.local.get(["color", "height", "enabled"]).then(({color, height, enabled}) => {
      if (!!color) {
        setColor(color);
      }

      if (!!height) {
        setHeight(height);
      }

      setEnabled(!!enabled);
    });
  }, []);

  const onColorChange = useCallback((value, _) => {
    setColor(value.toRgbString());

    // eslint-disable-next-line no-undef
    if (!chrome?.storage) {
      return;
    }

    // eslint-disable-next-line no-undef
    chrome.storage.local.set({color: value.toRgbString()});
  }, []);

  const onHeightChange = useCallback(value => {
    setHeight(value);

    // eslint-disable-next-line no-undef
    if (!chrome?.storage) {
      return;
    }

    // eslint-disable-next-line no-undef
    chrome.storage.local.set({height: value});
  }, []);

  const onEnabledChange = useCallback(value => {
    setEnabled(value);

    // eslint-disable-next-line no-undef
    if (!chrome?.storage) {
      return;
    }

    // eslint-disable-next-line no-undef
    chrome.storage.local.set({enabled: value}).then(() => {
      console.log("Value is set");
    });
  }, []);

  return (
    <div className="app">
      <div className='app__header'>
        <h1>Reader Line</h1>
        <Switch onChange={onEnabledChange} value={enabled} />
      </div>

      <Flex vertical gap={"small"}>
        <ColorPicker onChange={onColorChange} value={color} />

        <InputNumber addonBefore="height" onChange={onHeightChange} value={height} controls={true} addonAfter="px" />
      </Flex>
    </div>
  );
}

export default App;