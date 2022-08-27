/* eslint-disable import/no-extraneous-dependencies */
import { useSwitch, UseSwitchProps } from '@mui/base/SwitchUnstyled';
import { useTheme } from '@mui/material';
import { styled } from '@mui/system';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

const grey = {
  400: '#BFC7CF',
  500: '#AAB4BE',
};

interface CustomSwitchProps {
  color: string;
}

const CustomSwitchRoot = styled('span')<CustomSwitchProps>`
  font-size: 0;
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  margin: 10px;
  background: ${props => props.color};
  border-radius: 10px;
  cursor: pointer;

  &.Switch-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.Switch-checked {
    background: ${props => props.color};
  }
`;

const CustomSwitchInput = styled('input')`
  cursor: inherit;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  z-index: 1;
  margin: 0;
`;

const CustomSwitchThumb = styled('span')`
  display: block;
  width: 14px;
  height: 14px;
  top: 3px;
  left: 3px;
  border-radius: 16px;
  background-color: #fff;
  position: relative;
  transition: all 200ms ease;

  &.Switch-focusVisible {
    background-color: ${grey[500]};
    box-shadow: 0 0 1px 8px rgba(0, 0, 0, 0.25);
  }

  &.Switch-checked {
    left: 22px;
    top: 3px;
    background-color: #fff;
  }
`;

export default function CustomSwitch(props: UseSwitchProps) {
  const { getInputProps, checked: c, disabled, focusVisible } = useSwitch(props);
  const [checked, setChecked] = useState(c);

  const theme = useTheme();

  useEffect(() => {
    setChecked(c);
  }, [c]);

  const stateClasses = {
    'Switch-checked': checked,
    'Switch-disabled': disabled,
    'Switch-focusVisible': focusVisible,
  };

  return (
    <CustomSwitchRoot
      className={clsx(stateClasses)}
      onClick={() => {
        setChecked(state => !state);
      }}
      color={theme.palette.primary.main}
    >
      <CustomSwitchThumb className={clsx(stateClasses)} />
      <CustomSwitchInput {...getInputProps()} aria-label="Demo switch" />
    </CustomSwitchRoot>
  );
}
