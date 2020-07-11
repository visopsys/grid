import React, {
  EffectCallback,
  useRef,
  useEffect,
  DependencyList,
} from "react";

const useDidUpdate = (callback: EffectCallback, deps: DependencyList) => {
  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) {
      callback();
    } else {
      didMount.current = true;
    }
  }, [deps]);
};

export default useDidUpdate;
