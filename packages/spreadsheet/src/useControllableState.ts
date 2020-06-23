import React from "react";

export function useControllableProp<T>(prop: T | undefined, state: T) {
  const { current: isControlled } = React.useRef(prop !== undefined);
  const value = isControlled && typeof prop !== "undefined" ? prop : state;
  return [isControlled, value] as const;
}

export function isFunction(value: any): value is Function {
  return typeof value === "function";
}

export function runIfFn<T, U>(
  valueOrFn: T | ((...args: U[]) => T),
  ...args: U[]
): T {
  return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn;
}

export interface UseControllableStateProps<T> {
  /**
   * The value to used in controlled mode
   */
  value?: T;
  /**
   * The initial value to be used, in uncontrolled mode
   */
  defaultValue?: T | (() => T);
  /**
   * The callback fired when the value changes
   */
  onChange?: (nextValue: T) => void;
  /**
   * The condition to update the state
   */
  shouldUpdate?: (prevState: T, state: T) => boolean;
  /**
   * The component name (for warnings)
   */
  name?: string;
}

/**
 * React hook for using controlling component state.
 * @param props
 */
export function useControllableState<T>(props: UseControllableStateProps<T>) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    shouldUpdate = () => true,
    name = "Component"
  } = props;

  const [valueState, setValue] = React.useState(defaultValue as T);
  const { current: isControlled } = React.useRef(valueProp !== undefined);

  // don't switch from controlled to uncontrolled
  React.useEffect(() => {
    const nextIsControlled = valueProp !== undefined;

    const nextMode = nextIsControlled ? "a controlled" : "an uncontrolled";
    const mode = isControlled ? "a controlled" : "an uncontrolled";

    if (isControlled !== nextIsControlled) {
      console.warn(
        `Warning: ${name} is changing from ${mode} to ${nextMode} component. More info: https://fb.me/react-controlled-components`
      );
    }
  }, [valueProp, isControlled, name]);

  const { current: _defaultValue } = React.useRef(defaultValue);

  React.useEffect(() => {
    if (_defaultValue !== defaultValue) {
      console.warn(
        `Warning: A component is changing the default value of an uncontrolled ${name} after being initialized. ` +
          `To suppress this warning opt to use a controlled ${name}.`
      );
    }
  }, [JSON.stringify(defaultValue)]);

  const value = isControlled ? (valueProp as T) : valueState;

  const updateValue = React.useCallback(
    (next: React.SetStateAction<T>) => {
      // const nextValue = runIfFn(next, value);
      // const shouldUpdateState = shouldUpdate(value, nextValue);

      // if (!shouldUpdateState) return;

      if (!isControlled) {
        setValue(next);
      }

      onChange?.(runIfFn(next, value));
    },
    [onChange, shouldUpdate, isControlled, value]
  );

  return [value, updateValue] as [T, React.Dispatch<React.SetStateAction<T>>];
}

export default useControllableState;
