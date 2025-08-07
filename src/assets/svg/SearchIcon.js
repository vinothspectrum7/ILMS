// src/assets/svg/SearchIcon.js
import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const SearchIcon = ({ size = 20, color = "#A0A0A0" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
    <Path d="M21 21L16.65 16.65" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default SearchIcon;