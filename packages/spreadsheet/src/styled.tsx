import React from 'react'
import defaultStyled, { CreateStyled } from "@emotion/styled";
import { theme } from "@chakra-ui/core";
import { Box } from "@chakra-ui/core";

export type ThemeType = typeof theme
const styled = defaultStyled as CreateStyled<ThemeType>;
export default styled

type ToolbarProps = {
  borderColor: string
  className?: string
  backgroundColor: string
}
const Toolbar: React.FC<ToolbarProps> = (props) => <div className={props.className}>{props.children}</div>
export const StyledToolbar = styled(Toolbar)`
  min-height: 40px;
  padding-left: ${props => props.theme.space[2]};
  padding-right: ${props => props.theme.space[2]};
  border-color: ${props => props.borderColor};
  background: ${props => props.backgroundColor};
  border-width: 1px 0;
  display: flex;
  align-items: center;
  min-width: 0;
`;

type SeparatorProps = {
  className?: string
  borderColor: string
}
const SeparatorComponent: React.FC<SeparatorProps> = (props) => <div className={props.className}>{props.children}</div>
export const Separator = styled(SeparatorComponent)`
  border-color: ${props => props.borderColor};
  border-width: 0 1px 0 0;
  height: 24px;
  margin: 0 ${props => props.theme.space[1]};
`;

export const Rect = styled(Box)`
  height: 2px;
  background: ${props => props.color};
  width: 20px;
  margin-top: 3px;
`;

export const BottomPanel = styled(Box)`
  display: flex;
  flex: 1;
  height: 40px;
`


export const GridWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
`