"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AboutModal } from "@/features/home/about-modal";

type AboutModalContextValue = {
  openAbout: () => void;
  closeAbout: () => void;
};

const AboutModalContext = createContext<AboutModalContextValue | null>(null);

export function useAboutModal() {
  const ctx = useContext(AboutModalContext);
  if (!ctx) {
    throw new Error("useAboutModal must be used within AboutModalProvider");
  }
  return ctx;
}

type AboutModalProviderProps = {
  children: React.ReactNode;
  email: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

export function AboutModalProvider({
  children,
  email,
  image,
}: AboutModalProviderProps) {
  const [open, setOpen] = useState(false);
  const openAbout = useCallback(() => setOpen(true), []);
  const closeAbout = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ openAbout, closeAbout }),
    [openAbout, closeAbout],
  );

  return (
    <AboutModalContext.Provider value={value}>
      {children}
      <AboutModal
        open={open}
        onClose={closeAbout}
        email={email}
        image={image}
      />
    </AboutModalContext.Provider>
  );
}
