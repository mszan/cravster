import React, { useMemo, useState } from "react";
import isbot from "isbot";

export enum NavBarKeys {
    DASHBOARD = "DASHBOARD",
    INGREDIENTS = "INGREDIENTS",
    RECIPES = "RECIPES",
}

export interface CurrentPageContextInterface {
    title: string;
    setTitle: (text: string) => void;
    navBarKey: NavBarKeys | undefined;
    setNavBarKey: React.Dispatch<React.SetStateAction<NavBarKeys | undefined>>;
}

export const CurrentPageContextDefaults: CurrentPageContextInterface = {
    title: "",
    setTitle: () => {
        return;
    },
    navBarKey: undefined,
    setNavBarKey: () => null,
};

export const CurrentPageContext = React.createContext<CurrentPageContextInterface>(CurrentPageContextDefaults);

export const CurrentPageContextProvider = ({ children }: any) => {
    const [topBarTitle, setTopBarTitle] = useState<string>("");
    const [navBarKey, setNavBarKey] = useState<NavBarKeys>();

    const setTitle = (text: string) => {
        const isBot = isbot(navigator.userAgent);
        if (isBot) {
            document.title = `CRAVSTER`;
        } else {
            document.title = `cravster | ${text}`;
            setTopBarTitle(text);
        }
    };

    const value = useMemo(
        () => ({
            title: topBarTitle,
            setTitle,
            navBarKey,
            setNavBarKey,
        }),

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [topBarTitle],
    );
    return <CurrentPageContext.Provider value={value}>{children}</CurrentPageContext.Provider>;
};
