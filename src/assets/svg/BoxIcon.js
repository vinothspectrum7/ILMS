// src/assets/svg/BoxIcon.js
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const BoxIcon = ({ size = 20, color = "#0466FB" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12.89 1.95L21.6 6.84C21.84 6.98 22 7.26 22 7.56V16.44C22 16.74 21.84 17.02 21.6 17.16L12.89 22.05C12.44 22.3 11.56 22.3 11.11 22.05L2.4 17.16C2.16 17.02 2 16.74 2 16.44V7.56C2 7.26 2.16 6.98 2.4 6.84L11.11 1.95C11.56 1.7 12.44 1.7 12.89 1.95Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M2 7.5L12 12.5L22 7.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 22V12.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default BoxIcon;