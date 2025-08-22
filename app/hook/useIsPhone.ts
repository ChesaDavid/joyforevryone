import { useEffect, useState } from "react";

export function useIsPhone(breakpoint = 768) {
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsPhone(window.innerWidth < breakpoint);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, [breakpoint]);

  return isPhone;
}
