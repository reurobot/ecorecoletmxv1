"use client";

import * as React from "react";
import type { PropsWithChildren } from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";
import { reducer } from "@/hooks/use-toast"; // Assuming reducer is exported

const TOAST_LIMIT = 1;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

interface State {
  toasts: ToasterToast[];
}

type Action =
  | {
      type: "ADD_TOAST";
      toast: ToasterToast;
    }
  | {
      type: "UPDATE_TOAST";
      toast: Partial<ToasterToast>;
    }
  | {
      type: "DISMISS_TOAST";
      toastId?: ToasterToast["id"];
    }
  | {
      type: "REMOVE_TOAST";
      toastId?: ToasterToast["id"];
    };

interface ToastContextProps {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const ToastContext = React.createContext<ToastContextProps | undefined>(
  undefined
);

const initialState: State = {
  toasts: [],
};

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <ToastContext.Provider value={{ state, dispatch }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};

export { ToastContext };
