import React from "react";

const LayoutContext = React.createContext({});

export const LayoutProvider = LayoutContext.Provider;
export const LayoutConsumer = LayoutContext.Consumer;