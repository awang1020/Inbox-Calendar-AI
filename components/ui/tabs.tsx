"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TabsOrientation = "horizontal" | "vertical";

type TabsContextValue = {
  value: string | null;
  setValue: (nextValue: string) => void;
  orientation: TabsOrientation;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be used within a <Tabs /> component.");
  }

  return context;
};

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value,
      defaultValue = null,
      onValueChange,
      className,
      children,
      orientation = "horizontal",
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string | null>(defaultValue);

    const currentValue = isControlled ? value ?? null : uncontrolledValue;

    const setValue = React.useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(nextValue);
        }
        onValueChange?.(nextValue);
      },
      [isControlled, onValueChange]
    );

    return (
      <TabsContext.Provider value={{ value: currentValue, setValue, orientation }}>
        <div
          ref={ref}
          className={cn(className)}
          data-orientation={orientation}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    const { orientation } = useTabsContext();

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-full bg-white/60 p-1 text-sm shadow-inner ring-1 ring-black/5 backdrop-blur-sm dark:bg-slate-900/50 dark:ring-white/5",
          orientation === "vertical" && "flex-col",
          className
        )}
        role="tablist"
        aria-orientation={orientation}
        data-orientation={orientation}
        {...props}
      />
    );
  }
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, onClick, ...props }, ref) => {
    const { value: activeValue, setValue, orientation } = useTabsContext();
    const isActive = activeValue === value;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex min-w-[120px] items-center justify-center whitespace-nowrap rounded-full px-4 py-2 font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-slate-100 data-[state=inactive]:hover:text-slate-900 dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 dark:data-[state=inactive]:text-slate-300 dark:data-[state=inactive]:hover:bg-slate-800 dark:data-[state=inactive]:hover:text-slate-100",
          className
        )}
        id={`${value}-trigger`}
        type="button"
        role="tab"
        data-state={isActive ? "active" : "inactive"}
        data-orientation={orientation}
        aria-selected={isActive}
        aria-controls={`${value}-content`}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            setValue(value);
          }
        }}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: activeValue, orientation } = useTabsContext();
    const isActive = activeValue === value;

    return (
      <div
        ref={ref}
        className={cn(
          "mt-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]",
          className
        )}
        role="tabpanel"
        data-state={isActive ? "active" : "inactive"}
        data-orientation={orientation}
        id={`${value}-content`}
        aria-labelledby={`${value}-trigger`}
        tabIndex={isActive ? 0 : -1}
        aria-hidden={!isActive}
        hidden={!isActive}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
