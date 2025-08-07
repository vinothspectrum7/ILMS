// src/assets/svg/BackArrowIcon.js
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const BackArrowIcon = ({ size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default BackArrowIcon;