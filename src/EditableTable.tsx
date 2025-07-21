import React, { JSX, useEffect, useRef, useState } from "react";
import { DatePicker, Flex, Radio, Select, Table, TableProps } from 'antd';
import { Button } from 'azure-devops-ui/Button';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import Column from 'antd/es/table/Column';
import { ButtonGroup } from "azure-devops-ui/ButtonGroup";
import { setFieldValue } from "./WorkItemForm";
import { IdentityPickerDropdownWrapper } from "./components/IdentityPickerDropdownWrapper";
import './styles.css';
import { DurationInput } from "./components/DurationPickerCompont";
import { useIdentityCache } from "./api/identityCache";

// define the title for the table
export interface IPOCTableItem {
    key: React.Key;
    learningContentTitle: string;
    Modality: string;
    LearningContentDescription: string;
    CourseLength: string;
    AssignedTo: string;
}

export const EditableTable = (): JSX.Element => {
    const [tableItems, setTableItems] = useState<IPOCTableItem[]>([]);
    const [dropdownList, setDropdownList] = useState<string[]>([]);
    const [filteredDropdownList, setFilteredDropdownList] = useState<string[]>([]);
    const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});
    const { loading: identityLoading, error: identityError } = useIdentityCache("WWLOpsTest");


    const tableList = [] as IPOCTableItem[];
    // 验证函数：检查单行是否完整
    const validateRow = (item: IPOCTableItem): string[] => {
        const errors: string[] = [];
        if (!item.learningContentTitle?.trim()) {
            errors.push('Learning content title is required');
        }
        return errors;
    };

    // 验证所有行数据
    const validateAllRows = (items: IPOCTableItem[]): boolean => {
        const newValidationErrors: { [key: string]: string[] } = {};
        let isValid = true;

        items.forEach((item, index) => {
            const rowErrors = validateRow(item);
            if (rowErrors.length > 0) {
                newValidationErrors[item.key.toString()] = rowErrors;
                isValid = false;
            }
        });

        setValidationErrors(newValidationErrors);
        return isValid;
    };

    // 保存数据到字段（只有验证通过才保存）
    const saveToField = (items: IPOCTableItem[]) => {
        if (items.length === 0 || validateAllRows(items)) {
            setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(items));
        }
    };
    useEffect(() => {
        const fetchData = async () => {
            //初始化table的数据并保存到对应的field
            setTableItems(tableList);
            setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(tableList));
            //加载下拉菜单项
            fetchDropdownList();
        };
        fetchData();
    }, []);

    //实时更新tableItems的引用
    const tableItemsRef = useRef(tableItems);
    useEffect(() => {
        tableItemsRef.current = tableItems;
    }, [tableItems]);


    // event handlers
    const LearningContentTitleChanged = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number): void => {
        const newTableItems = [...tableItems];
        newTableItems[index].learningContentTitle = event.target.value;
        setTableItems(newTableItems);
        saveToField(newTableItems);
    };
    const LearningContentDescription = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number): void => {
        const newTableItems = [...tableItems];
        newTableItems[index].LearningContentDescription = event.target.value;
        setTableItems(newTableItems);
        //setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(newTableItems));
        saveToField(newTableItems);
    };

    const modalityChanged = (value: string, index: number): void => {
        const newTableItems = [...tableItems];
        newTableItems[index].Modality = value;
        setTableItems(newTableItems);
        setFilteredDropdownList(dropdownList);
        //setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(newTableItems));
        saveToField(newTableItems);
    };

    const modalitySearched = (value: string): void => {
        if (!value) {
            setFilteredDropdownList(dropdownList);
        } else {
            const filtered = dropdownList.filter(item =>
                item.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredDropdownList(filtered);
        }
    };

    const CourseLengthChanged = (hours: number, minutes: number, index: number) => {
        const hour = hours + 'hour';
        const min = minutes + 'min';
        const courseLenght = hours > 0 ? (hour + min) : min;
        const newTableItems = [...tableItems];
        newTableItems[index].CourseLength = courseLenght;
        setTableItems(newTableItems);
        //setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(newTableItems));
        saveToField(newTableItems);
    };

    // 处理身份选择变更
    const handleAssignedToChange = (identity: any, index: number) => {
        const newTableItems = [...tableItems];
        newTableItems[index].AssignedTo = identity?.displayName || "";
        setTableItems(newTableItems);
        //setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(newTableItems));
        saveToField(newTableItems);
    };

    //button handlers
    const addRecord = () => {
        const newItem: IPOCTableItem = {
            key: Date.now().toString(),
            learningContentTitle: "",
            LearningContentDescription: "",
            Modality: "",
            CourseLength: "",
            AssignedTo: ""
        };
        const newItems = [...tableItems, newItem];
        setTableItems(newItems);
        validateAllRows(newItems);
        //setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(newItems));
        // setTableItems(prevItems => {
        //     const newItems = [...prevItems, newItem];
        //    setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(newItems));
        //     return newItems;
        // });
    };

    const deleteRecord = (index: number) => {
        const newItems = [...tableItems];
        newItems.splice(index, 1);
        setTableItems(newItems);
        saveToField(newItems);
        //setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(newItems));
        // setTableItems(prevItems => {
        //     const newItems = [...prevItems];
        //     newItems.splice(index, 1);
        //     return newItems;
        // });
    };

    const rowSelection: TableProps<IPOCTableItem>['rowSelection'] = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: IPOCTableItem[]) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: (record: IPOCTableItem) => ({
            disabled: record.learningContentTitle === 'Disabled Title',
            name: record.learningContentTitle,
        }),
    };

    // Dropdown list

    const fetchDropdownList = async () => {
        const fetchedList = [
            "Applied Skill",
            "Badge",
            "Blended Learning",
            "CANDI",
            "Certificates",
            "Certification Renewals",
            "Certifications",
            "Coaching or mentoring",
            "Collections/Plans",
            "Copilot End User Training",
            "Exam",
            "Exam Prep Video",
            "In-person event",
            "Instructor Led Training(ILT)",
            "Lab Exercise",
            "Learning Path(LL)",
            "Learning Path(SS)",
            "MicroLearning",
            "Module",
            "MOOC",
            "Online Training(OLT)",
            "Practice Assessment",
            "Second Nature",
            "Simulation",
            "Technical Workshop",
            "Video",
            "Virtual Instructor Led Training(VILT)",
            "Virtual Training Day"
        ];
        setDropdownList(fetchedList);
        setFilteredDropdownList(fetchedList);
    };

    return (
        <Flex className='container' justify='start' wrap align='start' >
            <Radio.Group onChange={(e) => setSelectionType(e.target.value)} value={selectionType}>
                {/* <Radio value="checkbox">Checkbox</Radio>
                <Radio value="radio">radio</Radio> */}
            </Radio.Group>
            {identityError && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                    Error loading identities: {identityError}
                </div>
            )}
            {/* {Object.keys(validationErrors).length > 0 && (
                <div style={{ color: 'orange', marginBottom: '10px', padding: '8px', backgroundColor: '#fff7e6', border: '1px solid #ffd666', borderRadius: '4px' }}>
                    <strong>Validation Warning:</strong> Please complete all required fields before saving. Some rows have missing information.
                </div>
            )} */}
            <Table<IPOCTableItem>
                rowSelection={{ type: selectionType, ...rowSelection }}
                dataSource={tableItems}
                className='table'
                pagination={{ pageSize: 5 }}
                summary={() => (
                    <Table.Summary>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={6}>
                                <div className="summary-button-wrapper">
                                    <Button
                                        className='add_record_button'
                                        iconProps={{ iconName: "Add" }}
                                        text="Add row"
                                        onClick={() => addRecord()}
                                    />
                                </div>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            >
                <Column
                    title="Learning content title"
                    dataIndex="learningContentTitle"
                    key="LearningContentTitle"
                    align="center"
                    render={(value: string, record: IPOCTableItem, index: number) => (
                        <TextField
                            ariaLabel="Learning content title"
                            value={value}
                            onChange={(e) => LearningContentTitleChanged(e, index)}
                            placeholder="Please input learning content title"
                            width={TextFieldWidth.auto}
                            className={!value? "custom-text-field error" : "custom-text-field"}
                        />
                    )}
                    sorter={(a, b) => a.learningContentTitle.localeCompare(b.learningContentTitle)}
                    sortDirections={['ascend', 'descend']}
                />

                <Column
                    title="Learning content description"
                    dataIndex="LearningContentDescription"
                    key="LearningContentDescription"
                    align="center"
                    render={(value: string, record: IPOCTableItem, index: number) => (
                        <TextField
                            ariaLabel="Learning content description"
                            value={value}
                            multiline
                            rows={2}
                            onChange={(e) => LearningContentDescription(e, index)}
                            placeholder="Please input learning content description"
                            width={TextFieldWidth.auto}
                            className="custom-text-field"
                        />
                    )}
                />

                <Column
                    title="Modality "
                    dataIndex="Modality"
                    key="Modality"
                    align="center"
                    render={(_, record: IPOCTableItem, index) => (
                        <Select
                            allowClear
                            showSearch
                            placeholder="Please select"
                            onChange={(value, option) => modalityChanged(value, index)}
                            onSearch={(value) => modalitySearched(value)}
                            value={record.Modality}
                            className="custom-text-field"
                            options={filteredDropdownList.map(item => ({ label: item, value: item }))}
                            filterOption={false}
                        />
                    )}

                />

                <Column
                    title="Course length"
                    dataIndex="CourseLength"
                    key="CourseLength"
                    align="center"
                    render={(value: string, record: IPOCTableItem, index: number) => (
                        <DurationInput
                            onChange={(hours, minutes) => {
                                CourseLengthChanged(hours, minutes, index);
                            }}
                        />
                    )}
                />

                <Column
                    title="Assigned to"
                    dataIndex="AssignedTo"
                    key="AssignedTo"
                    align="center"
                    // IdentityPicker
                    render={(value: string, record: IPOCTableItem, index: number) => (

                        <IdentityPickerDropdownWrapper
                            onChange={(identity) => handleAssignedToChange(identity, index)}
                        />

                    )}

                />
                <Column
                    title="Actions"
                    key="action"
                    align="center"
                    render={(value: any, row: IPOCTableItem, index: number) => (
                        <ButtonGroup className="flex">
                            <Button
                                text="Delete"
                                ariaLabel="Delete"
                                iconProps={{ iconName: "Delete" }}
                                onClick={() => deleteRecord(index)}
                                className="delete-button"
                            />
                        </ButtonGroup>
                    )}
                />
            </Table>
        </Flex>
    );
}

