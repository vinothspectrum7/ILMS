// src/assets/svg/WaveHeader.js
import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Dimensions } from 'react-native'; // <--- Make sure Dimensions is imported

const { width } = Dimensions.get('window'); // Get width outside the component for default prop

const WaveHeader = ({
  width: svgWidth = width, // Use a different prop name to avoid conflict with local width
  height = 150,
  primaryColor = "#0466FB",
  secondaryColor = "#0052CC"
}) => (
  <Svg width={svgWidth} height={height} viewBox={'0 0 ${svgWidth} ${height}'} fill="none">
    <Defs>
      <LinearGradient id="paint0_linear_wave" x1="0" y1="0" x2={svgWidth} y2={height} gradientUnits="userSpaceOnUse">
        <Stop stopColor={primaryColor} />
        <Stop offset="1" stopColor={secondaryColor} />
      </LinearGradient>
    </Defs>
    <Path
      d={'M0 ${height * 0.7} C${svgWidth * 0.25} ${height * 0.5}, ${svgWidth * 0.75} ${height * 0.9}, ${svgWidth} ${height * 0.7} V0 H0 V${height * 0.7} Z'}
      fill="url(#paint0_linear_wave)"
    />
  </Svg>
);

export default WaveHeader;