import React, { useEffect } from "react";
import { CurrentPageContext } from "../context/current-page.context";
import { Button, Result } from "antd";

type Props = {};

export const NotFound: React.FC<Props> = () => {
    const { setTitle, setNavBarKey } = React.useContext(CurrentPageContext);

    useEffect(() => {
        setTitle("not found");
        setNavBarKey(undefined);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={
                <Button type="primary" href="/">
                    Back Home
                </Button>
            }
        />
    );
};
