import { AppstoreAddOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Flex, Image, List, notification, Row, Tooltip, Typography } from "antd";
import React, { useEffect } from "react";
import { RecipeInList, RecipeService } from "../client/generated";
import { configInstance } from "../config";
import { CurrentPageContext, NavBarKeys } from "../context/current-page.context";
import { getPathSm } from "../helpers/get-path-sm";

export const Recipes: React.FC<React.PropsWithChildren> = _props => {
    const { setTitle, setNavBarKey } = React.useContext(CurrentPageContext);

    const [isFetched, setIsFetched] = React.useState<boolean>(true);
    const [recipes, setRecipes] = React.useState<RecipeInList[]>([]);

    useEffect(() => {
        setTitle("recipes");
        setNavBarKey(NavBarKeys.RECIPES);

        if (isFetched) {
            RecipeService.recipeControllerRecipeList(0, 100)
                .then(res => {
                    setRecipes(
                        res.result.map(r => ({
                            id: r.id,
                            title: r.title,
                            description: r.description,
                            photo: r.photo,
                            ingredients: r.ingredients,
                        })),
                    );
                })
                .catch(err => {
                    notification.error({
                        message: "Failed to fetch ingredients",
                        description: err.message,
                    });
                    throw err;
                })
                .finally(() => {
                    setIsFetched(false);
                });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFetched]);

    return (
        <React.Fragment>
            <Row>
                <Col span={24}>
                    <Typography.Title level={2} style={{ marginTop: 0 }}>
                        Recipes
                    </Typography.Title>
                </Col>
                <Col span={24}>
                    <Typography.Text>Here you can find a list of recipes that you can use to cook your favorite meals.</Typography.Text>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Divider style={{ marginBottom: 0 }} />
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <List
                        className="recipes-list"
                        itemLayout="vertical"
                        size="large"
                        pagination={{
                            pageSize: 4,
                            showSizeChanger: false,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                        }}
                        dataSource={recipes}
                        loading={isFetched}
                        renderItem={item => (
                            <List.Item
                                style={{
                                    display: "flex",
                                }}
                                key={item.id}
                                extra={
                                    <Image
                                        style={{
                                            width: 200,
                                            height: 200,
                                            objectFit: "cover",
                                            objectPosition: "center",
                                        }}
                                        placeholder={
                                            <div
                                                style={{
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <Image
                                                    preview={false}
                                                    style={{
                                                        width: 200,
                                                        height: 200,
                                                        objectFit: "cover",
                                                        objectPosition: "center",
                                                        filter: "blur(5px)",
                                                    }}
                                                    src={
                                                        item?.photo
                                                            ? configInstance.urls.storage + getPathSm(item.photo.path)
                                                            : configInstance.urls.frontend + "/images/noPhoto.jpg"
                                                    }
                                                />
                                            </div>
                                        }
                                        src={
                                            item?.photo
                                                ? configInstance.urls.storage + item.photo.path
                                                : configInstance.urls.frontend + "/images/noPhoto.jpg"
                                        }
                                    />
                                }
                            >
                                <Flex vertical style={{ height: 200 }}>
                                    <Typography.Title
                                        level={4}
                                        style={{
                                            margin: 0,
                                        }}
                                    >
                                        {item.title}
                                    </Typography.Title>
                                    <Typography.Text
                                        style={{
                                            color: "rgba(0, 0, 0, 0.45)",
                                            marginTop: 4,
                                            marginBottom: 4,
                                        }}
                                    >
                                        <Tooltip title="Percentage of ingredients that are in storage. Helps you to understand if you can cook this recipe right now.">
                                            {Math.round(
                                                (item.ingredients.filter(i => i.isInStorage).length / item.ingredients.length) * 100,
                                            )}
                                            {"% | "}
                                        </Tooltip>
                                        {item.ingredients.map(i => (
                                            <>
                                                <span className={i.isInStorage ? "ingredient-in-storage" : "ingredient-not-in-storage"}>
                                                    {i.amount} {i.unit.toLowerCase()}
                                                    {i.amount > 1 ? "s" : ""} of {i.name}
                                                </span>
                                                <span>{item.ingredients.indexOf(i) === item.ingredients.length - 1 ? "" : ", "}</span>
                                            </>
                                        ))}
                                    </Typography.Text>
                                    <Typography.Text>{item.description ?? ""}</Typography.Text>
                                    <Flex gap={5} className="item-actions" style={{ marginTop: "auto" }}>
                                        <Button type="default" icon={<ShoppingCartOutlined />}>
                                            Add ingredients to shopping list
                                        </Button>
                                        <Button type="default" icon={<AppstoreAddOutlined />}>
                                            Add ingredients to storage
                                        </Button>
                                    </Flex>
                                </Flex>
                            </List.Item>
                        )}
                    />
                </Col>
            </Row>
        </React.Fragment>
    );
};
