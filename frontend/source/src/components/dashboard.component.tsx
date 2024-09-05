import { Divider, Skeleton, StatisticProps, Typography } from "antd";
import React, { useEffect } from "react";
import { AuthContext } from "../context/auth.context";
import { CurrentPageContext, NavBarKeys } from "../context/current-page.context";
import { Col, Row, Statistic } from "antd";
import CountUp from "react-countup";

const formatter: StatisticProps["formatter"] = value => <CountUp end={value as number} separator="" />;

type Props = {};

export type SomeItem = {
    id: number;
    name: string;
};

export const Dashboard: React.FC<Props> = () => {
    const { setTitle, setNavBarKey } = React.useContext(CurrentPageContext);
    const { getDecodedAccessToken } = React.useContext(AuthContext);

    useEffect(() => {
        setTitle("dashboard");
        setNavBarKey(NavBarKeys.DASHBOARD);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <React.Fragment>
            <Row>
                <Col span={24}>
                    <Typography.Title level={2}>Welcome, {getDecodedAccessToken()?.user.username}</Typography.Title>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Divider />
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Statistic title="Recipes amount" value={12345} formatter={formatter} />
                </Col>
                <Col span={12}>
                    <Statistic title="Ingredients amount" value={12345} precision={2} formatter={formatter} />
                </Col>
                {Array.from({ length: 10 }, (v, i) => i).map(_i => (
                    <Col span={24}>
                        <Skeleton />
                    </Col>
                ))}
            </Row>
        </React.Fragment>
    );
};
