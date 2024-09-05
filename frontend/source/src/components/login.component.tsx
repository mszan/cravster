import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Form, Input, Row, Typography } from "antd";
import { useSnackbar } from "notistack";
import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

type Props = {};
type LoginFormFieldType = {
    username: string;
    password: string;
};

export const Login: React.FC<Props> = () => {
    let navigate = useNavigate();
    const { login, user } = React.useContext(AuthContext);
    const { enqueueSnackbar } = useSnackbar();

    const [isLoading, setIsLoading] = React.useState(false);

    const onFinish = async (values: LoginFormFieldType) => {
        setIsLoading(true);
        try {
            await login(values.username, values.password);
            navigate("/");
            window.location.reload();
        } catch (e) {
            console.error(e);
        } finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 2000);
        }
    };

    if (user) {
        return <Navigate to="/" />;
    }

    return (
        <Row align="middle" justify="center" style={{ minHeight: "100vh", alignItems: "center" }}>
            <Col xs={20} xl={6}>
                <div style={{ textAlign: "center" }}>
                    <Typography.Title
                        style={{
                            fontWeight: 800,
                            fontStretch: "expanded",
                        }}
                    >
                        CRAVSTER
                    </Typography.Title>
                    <Typography.Paragraph>
                        <Typography.Text>Your personal cooking assistant</Typography.Text>
                    </Typography.Paragraph>
                </div>
                <Divider />
                <Form name="login" onFinish={onFinish} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                    <Form.Item
                        name="username"
                        style={{ width: "100%" }}
                        rules={[{ required: true, message: "Please input your Username!" }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        style={{ width: "100%" }}
                        rules={[{ required: true, message: "Please input your Password!" }]}
                    >
                        <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
                    </Form.Item>

                    <Form.Item style={{ maxWidth: 200 }}>
                        <Button block type="primary" htmlType="submit" disabled={isLoading}>
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </Col>
        </Row>
    );
};
