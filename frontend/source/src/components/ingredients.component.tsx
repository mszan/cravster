import { DeleteFilled, DownOutlined, PlusOutlined, WarningTwoTone } from "@ant-design/icons";
import {
    Button,
    Col,
    Divider,
    Drawer,
    Dropdown,
    Form,
    GetRef,
    Input,
    InputNumber,
    InputRef,
    notification,
    Popconfirm,
    Row,
    Select,
    Space,
    Table,
    TableProps,
    Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { AddIngredientInput, EditIngredientInput, IngredientCategory, IngredientService, IngredientUnit } from "../client/generated";
import { CurrentPageContext, NavBarKeys } from "../context/current-page.context";

type FormInstance<T> = GetRef<typeof Form<T>>;

type ColumnTypes = Exclude<TableProps["columns"], undefined>;

interface EditableRowProps {
    index: number;
}

interface IngredientDataType {
    id: string;
    name: string;
    storageAmount: number;
    shoppingAmount: number;
    category: string;
    unit: string;
}

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: keyof IngredientDataType;
    record: IngredientDataType;
    handleSave: (record: IngredientDataType) => void;
}

interface AddIngredientDrawerProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    ingredients: IngredientDataType[];
    setIngredients: React.Dispatch<React.SetStateAction<IngredientDataType[]>>;
    isFetched: boolean;
    setIsFetched: React.Dispatch<React.SetStateAction<boolean>>;
}

const MIN_STORAGE_OR_SHOPPING_AMOUNT = 0;
const MAX_STORAGE_OR_SHOPPING_AMOUNT = 9999;

const ingredientCategoryItems: { key: IngredientCategory; label: string }[] = [
    {
        key: IngredientCategory.ALCOHOL,
        label: "Alcohol",
    },
    {
        key: IngredientCategory.BREAD,
        label: "Bread",
    },
    {
        key: IngredientCategory.CAKES_DESSERTS_ADDONS,
        label: "Cakes, desserts, addons",
    },
    {
        key: IngredientCategory.CHEMICALS,
        label: "Chemicals",
    },
    {
        key: IngredientCategory.COFFEE,
        label: "Coffee",
    },
    {
        key: IngredientCategory.DAIRY,
        label: "Dairy",
    },
    {
        key: IngredientCategory.DRY_GOODS,
        label: "Dry goods",
    },
    {
        key: IngredientCategory.FATS,
        label: "Fats",
    },
    {
        key: IngredientCategory.FISH,
        label: "Fish",
    },
    {
        key: IngredientCategory.FROZEN_FOODS_ICE_CREAM,
        label: "Frozen foods, ice cream",
    },
    {
        key: IngredientCategory.FRUITS_VEGETABLES,
        label: "Fruits, vegetables",
    },
    {
        key: IngredientCategory.MEAT_DELI,
        label: "Meat, deli",
    },
    {
        key: IngredientCategory.READY_MEALS,
        label: "Ready meals",
    },
    {
        key: IngredientCategory.SWEETS,
        label: "Sweets",
    },
    {
        key: IngredientCategory.OTHER,
        label: "Other",
    },
];

const ingredientUnitItems: { key: IngredientUnit; label: string }[] = [
    {
        key: IngredientUnit.GRAM,
        label: "Gram",
    },
    {
        key: IngredientUnit.KILOGRAM,
        label: "Kilogram",
    },
    {
        key: IngredientUnit.LITER,
        label: "Liter",
    },
    {
        key: IngredientUnit.MILLILITER,
        label: "Milliliter",
    },
    {
        key: IngredientUnit.PIECE,
        label: "Piece",
    },
];

const renderDropdown = (
    value: string,
    ingredientId: string,
    dropdownType: "category" | "unit",
    editIngredients: (input: EditIngredientInput) => void,
) => {
    let items: { key: IngredientCategory | IngredientUnit; label: string }[] | undefined;

    if (dropdownType === "category") {
        items = ingredientCategoryItems;
    }

    if (dropdownType === "unit") {
        items = ingredientUnitItems;
    }

    if (!items) {
        return;
    }

    return (
        <Dropdown
            menu={{
                items,
                selectable: true,
                selectedKeys: [value],
                onClick: info => {
                    editIngredients({
                        id: ingredientId,
                        [dropdownType]: info.key,
                    });
                },
            }}
            trigger={["click"]}
        >
            <Row
                style={{
                    cursor: "pointer",
                }}
            >
                <Col span={20}>
                    <Typography.Text>{items.find(item => item.key === value)?.label}</Typography.Text>
                </Col>
                <Col span={4} style={{ textAlign: "end" }}>
                    <DownOutlined />
                </Col>
            </Row>
        </Dropdown>
    );
};

const renderStorageAmount = (value: number) => {
    const isWarning = value < 2;

    if (isWarning) {
        return (
            <Row>
                <Col span={20}>
                    <Typography.Text>{value}</Typography.Text>
                </Col>
                <Col span={4} style={{ textAlign: "end" }}>
                    <WarningTwoTone twoToneColor="#faad14" />
                </Col>
            </Row>
        );
    }
    return <Typography.Text>{value}</Typography.Text>;
};

const EditableContext = React.createContext<FormInstance<any> | null>(null);

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = props => {
    const [editing, setEditing] = React.useState(false);
    const inputRef = React.useRef<InputRef>(null);
    const form = React.useContext(EditableContext)!;

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({ [props.dataIndex]: props.record[props.dataIndex] });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();
            props.handleSave({ ...props.record, ...values });
        } catch (errInfo) {
            notification.error({
                message: "Save failed",
                description: errInfo as string,
            });
        }
    };

    let childNode = props.children;

    let input = <Input ref={inputRef} onPressEnter={save} onBlur={save} />;
    if (props.dataIndex === "storageAmount" || props.dataIndex === "shoppingAmount") {
        input = (
            <InputNumber
                ref={inputRef as any}
                min={MIN_STORAGE_OR_SHOPPING_AMOUNT}
                max={MAX_STORAGE_OR_SHOPPING_AMOUNT}
                onPressEnter={save}
                onBlur={save}
                style={{ width: "100%" }}
            />
        );
    }

    if (props.editable) {
        childNode = editing ? (
            <Form.Item style={{ margin: 0 }} name={props.dataIndex} rules={[{ required: true, message: `${props.title} is required.` }]}>
                {input}
            </Form.Item>
        ) : (
            <div className="editable-cell-value-wrap" onClick={toggleEdit}>
                {props.children}
            </div>
        );
    }

    return <td>{childNode}</td>;
};

const AddIngredientDrawer: React.FC<React.PropsWithChildren<AddIngredientDrawerProps>> = props => {
    const [form] = Form.useForm();

    const addIngredient = (input: AddIngredientInput) => {
        IngredientService.ingredientControllerIngredientAdd(input)
            .then(res => {
                props.setIngredients([...props.ingredients, res]);
            })
            .catch(err => {
                notification.error({
                    message: "Failed to add ingredient",
                    description: err.message,
                });
                throw err;
            })
            .finally(() => {
                props.setIsOpen(false);
                props.setIsFetched(false);
            });
    };

    const handleSubmitClick = () => {
        form.submit();
    };

    return (
        <>
            <Drawer
                title="Add new ingredient"
                width={720}
                onClose={() => props.setIsOpen(false)}
                open={props.isOpen}
                styles={{
                    body: {
                        paddingBottom: 80,
                    },
                }}
                extra={
                    <Space>
                        <Button onClick={() => props.setIsOpen(false)}>Cancel</Button>
                        <Button block type="primary" onClick={handleSubmitClick}>
                            Submit
                        </Button>
                    </Space>
                }
            >
                <Form layout="vertical" form={form} onFinish={addIngredient}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter ingredient name" }]}>
                                <Input placeholder="strawberries" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="storageAmount"
                                label="Storage amount"
                                rules={[{ required: true, message: "Please select a storage amount" }]}
                            >
                                <InputNumber
                                    min={MIN_STORAGE_OR_SHOPPING_AMOUNT}
                                    max={MAX_STORAGE_OR_SHOPPING_AMOUNT}
                                    placeholder="5"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="shoppingAmount"
                                label="Shopping amount"
                                rules={[{ required: true, message: "Please select a shopping amount" }]}
                            >
                                <InputNumber
                                    min={MIN_STORAGE_OR_SHOPPING_AMOUNT}
                                    max={MAX_STORAGE_OR_SHOPPING_AMOUNT}
                                    placeholder="5"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="category" label="Category" rules={[{ required: true, message: "Please select a category" }]}>
                                <Select
                                    placeholder={ingredientCategoryItems.find(x => x.key === IngredientCategory.FRUITS_VEGETABLES)?.label}
                                >
                                    {ingredientCategoryItems.map(item => (
                                        <Select.Option key={item.key} value={item.key}>
                                            {item.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="unit" label="Unit" rules={[{ required: true, message: "Please select a unit" }]}>
                                <Select placeholder={ingredientUnitItems.find(x => x.key === IngredientUnit.PIECE)?.label}>
                                    {ingredientUnitItems.map(item => (
                                        <Select.Option key={item.key} value={item.key}>
                                            {item.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
        </>
    );
};

export const Ingredients: React.FC<React.PropsWithChildren> = _props => {
    const { setTitle, setNavBarKey } = React.useContext(CurrentPageContext);

    const [isFetched, setIsFetched] = React.useState<boolean>(true);
    const [ingredients, setIngredients] = React.useState<IngredientDataType[]>([]);

    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

    useEffect(() => {
        setTitle("ingredients");
        setNavBarKey(NavBarKeys.INGREDIENTS);

        if (isFetched) {
            IngredientService.ingredientControllerIngredientList(0, 100)
                .then(res => {
                    setIngredients(
                        res.result.map(r => ({
                            id: r.id,
                            name: r.name,
                            storageAmount: r.storageAmount,
                            shoppingAmount: r.shoppingAmount,
                            unit: r.unit,
                            category: r.category,
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

    const deleteIngredient = (id: string) => {
        IngredientService.ingredientControllerIngredientRemove({ id })
            .then(() => {
                const newIngredients = [...ingredients];
                const oldItemIndex = ingredients.findIndex(item => item.id === id);
                newIngredients.splice(oldItemIndex, 1);
                setIngredients(newIngredients);
            })
            .catch(err => {
                notification.error({
                    message: "Delete failed",
                    description: err.message,
                });
                throw err;
            })
            .finally(() => setIsFetched(false));
    };

    const editIngredient = (input: EditIngredientInput) => {
        IngredientService.ingredientControllerIngredientEdit({
            id: input.id,
            name: input.name,
            storageAmount: input.storageAmount,
            shoppingAmount: input.shoppingAmount,
            unit: input.unit as IngredientUnit,
            category: input.category as IngredientCategory,
        })
            .then(() => {
                const newIngredients = [...ingredients];
                const oldItemIndex = ingredients.findIndex(item => item.id === input.id);
                const oldItem = ingredients[oldItemIndex];
                newIngredients.splice(oldItemIndex, 1, {
                    ...oldItem,
                    ...input,
                });
                setIngredients(newIngredients);
            })
            .catch(err => {
                notification.error({
                    message: "Edit failed",
                    description: err.message,
                });
                throw err;
            })
            .finally(() => setIsFetched(false));
    };

    const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
        {
            title: "Name",
            dataIndex: "name",
            width: "25%",
            editable: true,
        },
        {
            title: "Storage amount",
            dataIndex: "storageAmount",
            width: "15%",
            editable: true,
            render: value => renderStorageAmount(value),
        },
        {
            title: "Shopping amount",
            dataIndex: "shoppingAmount",
            width: "15%",
            editable: true,
        },
        {
            title: "Category",
            dataIndex: "category",
            width: "20%",
            render: (value, record) => renderDropdown(value, record.id, "category", editIngredient),
            // filters: [
            //     {
            //         text: "Joe",
            //         value: "Joe",
            //     },
            //     {
            //         text: "Category 1",
            //         value: "Category 1",
            //     },
            //     {
            //         text: "Category 2",
            //         value: "Category 2",
            //     },
            // ],
            // filterMode: "tree",
            // filterSearch: true,
            // onFilter: (value, record) => record.name.startsWith(value as string),
        },
        {
            title: "Unit",
            dataIndex: "unit",
            width: "20%",
            render: (value, record) => renderDropdown(value, record.id, "unit", editIngredient),
        },
        {
            title: "",
            dataIndex: "operation",
            width: "5%",
            render: (_, record) => {
                if (ingredients.length === 0) {
                    return null;
                }

                return (
                    <div style={{ textAlign: "center" }}>
                        <Popconfirm title="Sure to delete?" onConfirm={() => deleteIngredient(record.id)}>
                            <DeleteFilled style={{ fontSize: 20 }} />
                        </Popconfirm>
                    </div>
                );
            },
        },
    ];

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };

    const columns = defaultColumns.map(col => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: IngredientDataType) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave: editIngredient,
            }),
        };
    });

    return (
        <React.Fragment>
            <Row>
                <Col span={24}>
                    <Typography.Title level={2} style={{ marginTop: 0 }}>
                        Ingredients
                    </Typography.Title>
                </Col>
                <Col span={24}>
                    <Typography.Text>
                        This is a list of all ingredients that you can use in your recipes. You can edit the name, storage amount, shopping
                        amount, category and unit of each ingredient.
                    </Typography.Text>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Divider />
                </Col>
            </Row>
            <Row>
                <Col span={24} style={{ textAlign: "right" }}>
                    <Button
                        type="primary"
                        style={{ marginBottom: 18 }}
                        onClick={() => setIsAddDrawerOpen(true)}
                        icon={<PlusOutlined />}
                        iconPosition="end"
                    >
                        Add ingredient
                    </Button>
                </Col>
                <Col span={24}>
                    <Table
                        pagination={{
                            pageSize: 12,
                            showSizeChanger: false,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                        }}
                        components={components}
                        rowClassName={() => "editable-row"}
                        loading={isFetched}
                        bordered
                        size="large"
                        dataSource={ingredients}
                        columns={columns as ColumnTypes}
                    />
                </Col>
            </Row>
            <AddIngredientDrawer
                isOpen={isAddDrawerOpen}
                setIsOpen={setIsAddDrawerOpen}
                ingredients={ingredients}
                setIngredients={setIngredients}
                isFetched={isFetched}
                setIsFetched={setIsFetched}
            />
        </React.Fragment>
    );
};
