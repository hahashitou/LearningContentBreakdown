import React, { JSX, useEffect, useRef, useState } from "react";
import { DatePicker, Flex, Select, Table } from 'antd';
import { Button } from 'azure-devops-ui/Button';
import { TextField, TextFieldWidth } from 'azure-devops-ui/TextField';
import Column from 'antd/es/table/Column';
import { Toggle } from 'azure-devops-ui/Toggle';
import { Link } from 'azure-devops-ui/Link';
import { ButtonGroup } from "azure-devops-ui/ButtonGroup";
import { Spinner, SpinnerSize } from 'azure-devops-ui/Spinner';
import { ObservableValue } from 'azure-devops-ui/Core/Observable';
import dayjs from 'dayjs';
import { setFieldValue } from "./WorkItemForm";
import {
    IdentityPickerDropdown,
    IIdentity,
    IPeoplePickerProvider,
    IPersonaConnections,
} from "azure-devops-ui/IdentityPicker";
import { IdentityPickerComponent } from "./components/IdentityPickerComponent";
import { IdentityPickerDropdownWrapper } from "./components/peoplePickerComponent";
// import {IdentityPickerDropdownWrapper } from "./components/IdentityPickerDropdownWrapper";
import './styles.css';
import { DurationInput } from "./components/DurationPickerCompont";

// define the title for the table
export interface IPOCTableItem {
    id?: string;
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

    const tableList = [{
        id: '1',
        learningContentTitle: "Learning Content1",
        Modality: "Second Nature",
        LearningContentDescription: "This is a sample description for the learning content.",
        CourseLength: "2 hours",
        AssignedTo: "User2"
    },
    {
        id: '2',
        learningContentTitle: "Learning Content2",
        Modality: "Learning Path",
        LearningContentDescription: "This is another sample description for the learning content.",
        CourseLength: "1 hour",
        AssignedTo: "User3"
    },
    {
        id: '3',
        learningContentTitle: "Learning Content3",
        Modality: "Virtual Instructor-Led Training",
        LearningContentDescription: "This is yet another sample description for the learning content.",
        CourseLength: "3 hours",
        AssignedTo: "User4"
    }]

    useEffect(() => {
        // Fetch initial data or set default values
        const fetchData = async () => {
            // Simulate fetching data from an API or service
            // In a real application, you would replace this with an actual API call
            setTableItems(tableList);
            setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(tableList));
            fetchDropdownList();
        };
        fetchData();
    }, []);

    const tableItemsRef = useRef(tableItems);
    useEffect(() => {
        tableItemsRef.current = tableItems;
    }, [tableItems]);


    // event handlers
    const LearningContentTitleChanged = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, value: string, index: number): void => {
        const newTableItems = [...tableItems];
        newTableItems[index].learningContentTitle = event.target.value;
        setTableItems(newTableItems);
        setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(newTableItems));
    };
    const LearningContentDescription = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, value: string, index: number): void => {
        const newTableItems = [...tableItems];
        newTableItems[index].LearningContentDescription = event.target.value;
        setTableItems(newTableItems);
        setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(newTableItems));
    };

    const modalityChanged = (value: string, option: any, index: number): void => {
        const newTableItems = [...tableItems];
        newTableItems[index].Modality = value;
        setTableItems(newTableItems);
        setFilteredDropdownList(dropdownList);
        setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(newTableItems));
    };

    const modalitySearched = (value: string, option: any, index: number): void => {
        if (!value) {
            setFilteredDropdownList(dropdownList);
        } else {
            const filtered = dropdownList.filter(item =>
                item.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredDropdownList(filtered);
        }
    };

    // const CourseLengthChanged = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, value: string, index: number): void => {
    //     const newTableItems = [...tableItems];
    //     newTableItems[index].CourseLength = event.target.value;
    //     setTableItems(newTableItems);
    //     setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(newTableItems));
    // }


    const CourseLengthChanged = (hours: number, minutes: number, index: number) => {
        console.log('Duration selected:', hours, 'hours', minutes, 'minutes');

        const hour = hours + 'hour';
        const min = minutes + 'min';
        const courseLenght = hours > 0 ? (hour + min) : min;
        const newTableItems = [...tableItems];
        newTableItems[index].CourseLength = courseLenght;
        setTableItems(newTableItems);
        setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(newTableItems));
    };


    //button handlers
    const addRecord = () => {
        const newItem: IPOCTableItem = {
            id: Date.now().toString(),
            learningContentTitle: "",
            LearningContentDescription: "",
            Modality: "",
            CourseLength: "",
            AssignedTo: ""
        };

        setTableItems(prevItems => {
            const newItems = [...prevItems, newItem];
            setFieldValue("Custom.IntakeRequestCourseDetails", JSON.stringify(newItems));
            return newItems;
        });
    };
    const deleteRecord = (index: number) => {
        setTableItems(prevItems => {
            const newItems = [...prevItems];
            newItems.splice(index, 1);
            return newItems;
        });
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
            <Table<IPOCTableItem>
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
                            value={record.learningContentTitle}
                            onChange={(e) => LearningContentTitleChanged(e, value, index)}
                            placeholder="Please input learning content title"
                            width={TextFieldWidth.auto}
                            className="single-text-field"
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
                            value={record.LearningContentDescription}
                            multiline
                            rows={2}
                            onChange={(e) => LearningContentDescription(e, value, index)}
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
                            style={{ width: '100%', minWidth: '120px' }}
                            placeholder="Please select"
                            onChange={(value, option) => modalityChanged(value, option, index)}
                            onSearch={(value) => modalitySearched(value, null, index)}
                            value={record.Modality}
                            className="custom-text-field"
                            options={filteredDropdownList.map(item => ({ label: item, value: item }))}
                            filterOption={false}
                        />
                    )}

                />

                {/* <Column
                    title="Course length"
                    dataIndex="CourseLength"
                    key="CourseLength"
                    render={(value: string, record: IPOCTableItem, index: number) => (
                        <TextField
                            ariaLabel="Course length"
                            value={record.CourseLength}
                            onChange={(e) => CourseLengthChanged(e, value, index)}
                            placeholder="Please input course length"
                            width={TextFieldWidth.auto}
                            className="single-text-field"
                        />
                    )}
                /> */}

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
                        <IdentityPickerDropdownWrapper />
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

