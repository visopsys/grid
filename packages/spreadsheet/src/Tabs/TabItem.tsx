import React, { useState } from "react";
import {
  useTheme,
  Button,
  Box,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  IconButton,
} from "@chakra-ui/core";
import { MdArrowDropDown } from "react-icons/md";
import { KeyCodes } from "@rowsncolumns/grid/dist/types";

interface TabItemProps {
  name: string;
  isLight: boolean;
  isActive: boolean;
  id: string;
  onSelect?: (id: string) => void;
  onChangeSheetName?: (id: string, value: string) => void;
  onDeleteSheet?: (id: string) => void;
  onDuplicateSheet?: (id: string) => void;
}

const TabItem: React.FC<TabItemProps> = ({
  name,
  isLight,
  isActive,
  id,
  onSelect,
  onChangeSheetName,
  onDeleteSheet,
  onDuplicateSheet,
}) => {
  const theme = useTheme();
  const [isEditmode, setIsEditmode] = useState(false);
  const [value, setValue] = useState(name);
  const bg = isActive ? "white" : undefined;
  const color =
    isActive || isLight ? theme.colors.gray[900] : theme.colors.gray[300];
  const shadow = isActive ? "0 1px 3px 1px rgba(60,64,67,.15)" : undefined;
  const enableEditmode = () => setIsEditmode(true);
  const disableEditmode = () => setIsEditmode(false);
  const height = "39px";
  return (
    <Box
      position="relative"
      display="flex"
      alignItems="center"
      height={height}
      background={bg}
      boxShadow={shadow}
    >
      {isEditmode ? (
        <Input
          defaultValue={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setValue(e.target.value)
          }
          width="auto"
          onBlur={() => {
            onChangeSheetName?.(id, value);
            disableEditmode();
          }}
          height="26px"
          background="white"
          pl={1}
          pr={1}
          ml={2}
          mr={2}
          size="sm"
          autoFocus
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.which === KeyCodes.Enter) {
              onChangeSheetName?.(id, value);
              disableEditmode();
            }
            if (e.which === KeyCodes.Escape) {
              disableEditmode();
            }
          }}
        />
      ) : (
        <>
          <Button
            as="div"
            size="sm"
            fontWeight="normal"
            borderRadius={0}
            color={color}
            height={height}
            onDoubleClick={enableEditmode}
            onClick={() => onSelect?.(id)}
            background={bg}
            cursor="pointer"
            _hover={{
              background: isActive
                ? bg
                : isLight
                ? theme.colors.gray[200]
                : theme.colors.gray[800],
            }}
          >
            {name}

            <Popover placement="top" usePortal>
              {({ isOpen, onClose }) => {
                return (
                  <>
                    <PopoverTrigger>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        pl={0}
                        pr={0}
                        minWidth={4}
                        height={4}
                        ml={1}
                        mr={-1}
                        aria-label="More"
                        icon={MdArrowDropDown}
                        fontSize={20}
                        color="gray.400"
                      />
                    </PopoverTrigger>
                    <PopoverContent width={200}>
                      <PopoverArrow />
                      <PopoverBody>
                        <Button
                          fontWeight="normal"
                          size="sm"
                          variant="ghost"
                          isFullWidth
                          textAlign="left"
                          justifyContent="left"
                          borderRadius={0}
                          onClick={(e) => {
                            onDeleteSheet?.(id);
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          fontWeight="normal"
                          size="sm"
                          variant="ghost"
                          isFullWidth
                          textAlign="left"
                          justifyContent="left"
                          borderRadius={0}
                          onClick={(e) => {
                            onDuplicateSheet?.(id);                            
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          Duplicate
                        </Button>
                        <Button
                          fontWeight="normal"
                          size="sm"
                          variant="ghost"
                          isFullWidth
                          textAlign="left"
                          justifyContent="left"
                          borderRadius={0}
                          onClick={(e) => {
                            enableEditmode()
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          Rename
                        </Button>
                      </PopoverBody>
                    </PopoverContent>
                  </>
                );
              }}
            </Popover>
          </Button>
        </>
      )}
    </Box>
  );
};

export default TabItem;
