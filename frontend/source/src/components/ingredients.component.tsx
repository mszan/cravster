import { DeleteFilled, DownOutlined, WarningTwoTone } from "@ant-design/icons";
import {
    Button,
    Col,
    Divider,
    Dropdown,
    Form,
    GetRef,
    Input,
    InputNumber,
    InputRef,
    Popconfirm,
    Row,
    Table,
    TableProps,
    Typography,
} from "antd";
import { enqueueSnackbar, useSnackbar } from "notistack";
import React, { useEffect } from "react";
import { EditIngredientInput, IngredientCategory, IngredientService, IngredientUnit } from "../client/generated";
import { AuthContext } from "../context/auth.context";
import { CurrentPageContext, NavBarKeys } from "../context/current-page.context";

type Props = {};

type FormInstance<T> = GetRef<typeof Form<T>>;

type ColumnTypes = Exclude<TableProps["columns"], undefined>;

interface Item {
    id: string;
    name: string;
    storageAmount: number;
    shoppingAmount: number;
    category: string;
    unit: string;
}

interface EditableRowProps {
    index: number;
}

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: keyof Item;
    record: Item;
    handleSave: (record: Item) => void;
}

interface IngredientDataType {
    id: string;
    name: string;
    storageAmount: number;
    shoppingAmount: number;
    category: string;
    unit: string;
}

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

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}) => {
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
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            enqueueSnackbar(<Typography.Text>Save failed</Typography.Text>, { variant: "error", autoHideDuration: 2000 });
            console.debug("Save failed:", errInfo);
        }
    };

    let childNode = children;

    let input = <Input ref={inputRef} onPressEnter={save} onBlur={save} />;
    if (dataIndex === "storageAmount" || dataIndex === "shoppingAmount") {
        input = <InputNumber ref={inputRef as any} min={0} max={9999} onPressEnter={save} onBlur={save} style={{ width: "100%" }} />;
    }

    if (editable) {
        childNode = editing ? (
            <Form.Item style={{ margin: 0 }} name={dataIndex} rules={[{ required: true, message: `${title} is required.` }]}>
                {input}
            </Form.Item>
        ) : (
            <div className="editable-cell-value-wrap" onClick={toggleEdit}>
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

export const Ingredients: React.FC<Props> = () => {
    const { setTitle, setNavBarKey } = React.useContext(CurrentPageContext);
    const { getDecodedAccessToken } = React.useContext(AuthContext);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [isFetched, setIsFetched] = React.useState<boolean>(true);
    const [ingredients, setIngredients] = React.useState<IngredientDataType[]>([]);

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
                    enqueueSnackbar(<Typography.Text>{err.message}</Typography.Text>, {
                        variant: "error",
                        autoHideDuration: 2000,
                    });
                    throw err;
                })
                .finally(() => setIsFetched(false));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFetched]);

    const handleDelete = (key: React.Key) => {
        // const newData = dataSource.filter(item => item.key !== key);
        // setDataSource(newData);
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
                if (ingredients.length == 0) {
                    return null;
                }

                return (
                    <div style={{ textAlign: "center" }}>
                        <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
                            <DeleteFilled style={{ fontSize: 20 }} />
                        </Popconfirm>
                    </div>
                );
            },
        },
    ];

    const handleAdd = () => {
        // const newData: IngredientDataType = {
        // key: count,
        // name: `Edward King ${count}`,
        // age: "32",
        // address: `London, Park Lane no. ${count}`,
        // };
        // setDataSource([...dataSource, newData]);
        // setCount(count + 1);
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
                enqueueSnackbar(<Typography.Text>{err.message}</Typography.Text>, {
                    variant: "error",
                    autoHideDuration: 2000,
                });
                throw err;
            })
            .finally(() => setIsFetched(false));
    };

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
                    <Button type="primary" style={{ marginBottom: 18 }}>
                        Add ingredient
                    </Button>
                </Col>
                <Col span={24}>
                    <Table
                        pagination={{ pageSize: 12 }}
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
        </React.Fragment>
    );
};
