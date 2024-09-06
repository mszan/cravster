import { LogoutOutlined, OrderedListOutlined, PieChartOutlined, SettingOutlined, SnippetsOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, Typography, notification, theme } from "antd";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWindowSize } from "usehooks-ts";
import { AuthContext } from "../context/auth.context";
import { CurrentPageContext, NavBarKeys } from "../context/current-page.context";
import { UserRole } from "../types";

type MenuItem = Required<MenuProps>["items"][number];

type Props = {
    component: React.ReactNode;
    requiredRoles?: UserRole[];
};

export function RequireAuth({ component, requiredRoles }: Props) {
    const { width: windowWidth } = useWindowSize();

    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isSiderCollapsed, setSiderCollapsed] = React.useState(false);

    const { user, getUserRoles, getDecodedAccessToken, logout } = React.useContext(AuthContext);
    const { navBarKey } = React.useContext(CurrentPageContext);

    const location = useLocation();
    const navigate = useNavigate();

    const {
        token: { colorBgContainer, borderRadiusLG, screenSM },
    } = theme.useToken();

    React.useEffect(() => {
        canUserAccess();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const items: MenuItem[] = [
        {
            label: "CRAVSTER",
            key: "cravster",
            icon: null,
            className: "sider-item-logo",
        },
        {
            label: "Dashboard",
            key: NavBarKeys.DASHBOARD,
            icon: <PieChartOutlined />,
            onClick: () => navigate("/"),
        },
        {
            label: "Ingredients",
            key: NavBarKeys.INGREDIENTS,
            icon: <OrderedListOutlined />,
            onClick: () => navigate("/ingredients"),
        },
        {
            label: "Recipes",
            key: NavBarKeys.RECIPES,
            icon: <SnippetsOutlined />,
            onClick: () => navigate("/recipes"),
        },
        {
            label: getDecodedAccessToken()?.user.username,
            key: "user",
            icon: <UserOutlined />,
            style: {
                position: "fixed",
                bottom: 0,
                width: 200,
            },
            children: [
                {
                    label: "Logout",
                    key: "logout",
                    icon: <LogoutOutlined />,
                    onClick: logout,
                },
                {
                    label: "Settings",
                    key: "settings",
                    icon: <SettingOutlined />,
                    // onClick: () => enqueueSnackbar(...getSnackbarContent("Settings page is not available yet", "info")),
                    onClick: () => notification.error({ message: "test", description: "test" }),
                },
            ],
        },
    ];

    const canUserAccess = () => {
        // if there's no required roles for the page, simply let user access the page
        if (!requiredRoles) {
            setIsLoading(false);
            return true;
        }

        // check whether user is logged in and navigate to login page if not
        if (!user) {
            console.log("This page is available for logged in users only. Log in please");
            setIsLoading(false);
            return navigate("/login");
        }

        // check whether user has required roles to access auth protected page
        const userHasRequiredRoles = requiredRoles.every(requiredRole => getUserRoles().includes(requiredRole));
        if (!userHasRequiredRoles) {
            console.log("You don't have permissions to view this page");
            setIsLoading(false);
            return navigate("/login");
        }

        setIsLoading(false);
        return true;
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Layout.Sider
                breakpoint="lg"
                collapsedWidth="0"
                onCollapse={value => setSiderCollapsed(value)}
                style={{
                    position: "fixed",
                    minHeight: "100vh",
                }}
            >
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={navBarKey ? [navBarKey] : undefined}
                    items={items}
                    style={{ minHeight: "100vh" }}
                />
            </Layout.Sider>
            <Layout>
                <Layout.Content style={{ margin: "24px 16px 0" }}>
                    <div
                        style={{
                            marginLeft: isSiderCollapsed ? 0 : 200,
                            width: windowWidth < screenSM ? "100%" : "unset",
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {isLoading ? <Typography>Loading...</Typography> : component}
                    </div>
                </Layout.Content>
                <Layout.Footer style={{ textAlign: "end", paddingRight: 20 }}>Dawid Mszanowski ©{new Date().getFullYear()}</Layout.Footer>
            </Layout>
        </Layout>
    );
}
