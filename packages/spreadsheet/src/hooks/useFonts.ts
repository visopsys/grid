import React, { useEffect, useState } from "react";
import WebFont from "webfontloader";

export interface UseFontResults {
  isFontActive: boolean;
}

export interface UseFontProps {
  google?: string[];
}

const useFonts = (config?: WebFont.Config) => {
  // const { google } = props
  const [isFontActive, setIsFontActive] = useState(false);
  useEffect(() => {
    if (config) {
      WebFont.load({
        ...config,
        loading: () => setIsFontActive(false),
        active: () => setIsFontActive(true),
      });
    }
  }, [config]);

  return {
    isFontActive,
  };
};

export default useFonts;
