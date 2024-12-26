import React, {useCallback, useEffect, useState} from 'react';
import {InputNumber, ColorPicker, Flex, Switch, Radio, Typography} from 'antd';
import Link from 'antd/es/typography/Link';
import RateUs from './components/RateUs';

import "./App.css";

function App() {
  const [color, setColor] = useState("rgba(0, 0, 0, 0.15)");
  const [height, setHeight] = useState(20);
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState("line");

  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (!chrome?.storage) {
      return;
    }

    // eslint-disable-next-line no-undef
    chrome.storage.local.get(["color", "height", "mode", "enabled"]).then(({color, height, mode, enabled}) => {
      if (!!color) {
        setColor(color);
      }

      if (typeof height === "number") {
        setHeight(height);
      }

      if (!!mode) {
        setMode(mode);
      }

      if (typeof enabled === "boolean") {
        setEnabled(enabled);
      }
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
    chrome.storage.local.set({enabled: value});
  }, []);

  const onModeChange = useCallback(value => {
    setMode(value);

    // eslint-disable-next-line no-undef
    if (!chrome?.storage) {
      return;
    }

    // eslint-disable-next-line no-undef
    chrome.storage.local.set({mode: value});
  }, []);

  return (
    <div className="app">
      <div className='app__header'>
        <h1>Reader Line</h1>
        <Switch checkedChildren="ON" unCheckedChildren="OFF" onChange={onEnabledChange} value={enabled} />
      </div>

      <Flex vertical gap={"small"}>
        <ColorPicker onChange={onColorChange} value={color} />

        <InputNumber addonBefore="height" onChange={onHeightChange} value={height} controls={true} addonAfter="px" />

        <Radio.Group
          options={[
            {
              value: 'line',
              label: 'Line',
            },
            {
              value: 'focus',
              label: 'Focus',
            }
          ]}
          onChange={(e) => onModeChange(e.target.value)}
          value={mode}
          optionType="button"
          buttonStyle="solid"
          size='middle'
        />
        <Typography>Check our partner's <Link target='_blank' href='https://chromewebstore.google.com/detail/chrome-reader-mode%E2%80%8B/opfflfgjinednmneaiplkponjphblmmc?hl=en&utm_source=reader_line&utm_medium=app'>Chrome Reader Mode</Link></Typography>

        

        <RateUs />
      </Flex>
    </div>
  );
}

export default App;