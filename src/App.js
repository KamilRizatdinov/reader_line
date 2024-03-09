import React, {useCallback, useEffect, useState} from 'react';
import {InputNumber, ColorPicker, Flex, Switch, Select} from 'antd';

import "./App.css";

function App() {
  const [color, setColor] = useState("rgba(0, 0, 0, 0.15)");
  const [height, setHeight] = useState(20);
  const [enabled, setEnabled] = useState(true);
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

        <Select value={mode}  onChange={onModeChange} options={[{
          value: 'line',
          label: 'Line',
        },
        {
          value: 'focus',
          label: 'Focus',
        },]} />
      </Flex>
    </div>
  );
}

export default App;