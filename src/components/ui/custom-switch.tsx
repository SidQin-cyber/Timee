import React from 'react';
import styled from 'styled-components';

interface CustomSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({ checked, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 防止事件冒泡
    e.stopPropagation();
    onChange(e.target.checked);
  };

  return (
    <StyledWrapper>
      <label className="label">
        <div className="toggle">
          <input 
            className="toggle-state" 
            type="checkbox" 
            name="check" 
            checked={checked}
            onChange={handleChange}
          />
          <div className="indicator" />
        </div>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .label {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    color: #394a56;
  }

  .label-text {
    margin-left: 16px;
  }

  .toggle {
    isolation: isolate;
    position: relative;
    height: 24px;
    width: 48px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: -4px -2px 4px 0px #ffffff,
      4px 2px 6px 0px #d1d9e6,
      2px 2px 2px 0px #d1d9e6 inset,
      -2px -2px 2px 0px #ffffff inset;
  }

  .toggle-state {
    display: none;
  }

  .indicator {
    height: 100%;
    width: 200%;
    background: #ecf0f3;
    border-radius: 12px;
    transform: translate3d(-75%, 0, 0);
    transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: -4px -2px 4px 0px #ffffff,
      4px 2px 6px 0px #d1d9e6;
    will-change: transform;
  }

  .toggle-state:checked ~ .indicator {
    transform: translate3d(25%, 0, 0);
  }
`;

export default CustomSwitch; 