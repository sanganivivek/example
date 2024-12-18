import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Grid, useTheme, Chip, Avatar, Stack } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteIcon from '@mui/icons-material/Delete';
import useSnackBar from '@/hooks/useSnackBar';
import TextFieldComponent from '@/components/common/TextFieldComponent';
import IconBackground from '@/components/common/IconBackground';
import ButtonContained from '@/components/common/ButtonContained';
import ButtonOutlined from '@/components/common/ButtonOutlined';

const DialogTableCompletion = ({ setQuestionWithAnswers, questionWithAnswers, tableData, setTableData, setColumns, columns, setRows, rows, errors }: any) => {
    // --------------- Hooks ---------------
    const theme = useTheme();
    const { setSnackBar } = useSnackBar();

    // --------------- States ---------------
    const [lastModified, setLastModified] = useState({ row: -1, col: -1 });
    const [questionData, setQuestionData] = useState({ questionNumber: '', questionAnswer: '' });

    const MAX_ROWS = 5;
    const MAX_COLUMNS = 5;

    // --------------- Handler ---------------
    const addRow = () => {
        if (rows.length >= MAX_ROWS) {
            setSnackBar("error", `You can't add more than ${MAX_ROWS} rows.`);
            return;
        }
        setRows([...rows, Array(columns.length).fill('')]);
    };

    const addColumn = () => {
        if (columns.length >= MAX_COLUMNS) {
            setSnackBar("error", `You can't add more than ${MAX_COLUMNS} columns.`);
            return;
        }
        setColumns([...columns, `Column ${columns.length + 1}`]);
        setRows(rows.map((row: any) => [...row, '']));
    };

    const removeColumn = (colIndex: any) => {
        if (columns.length === 1) return;
        const updatedRows = rows.map((row: any) => row.filter((_: any, cIdx: any) => cIdx !== colIndex));
        const updatedColumns = columns.filter((_: any, idx: any) => idx !== colIndex);
        const newColumnNames = updatedColumns.map((_: any, index: any) => `Column ${index + 1}`);
        setRows(updatedRows);
        setColumns(newColumnNames);
    };

    const removeRow = (index: any) => {
        if (rows.length === 1) return;
        setRows(rows.filter((_: any, idx: any) => idx !== index));
    };

    const createQuestion = () => {
        const { row, col } = lastModified;
        const { questionNumber, questionAnswer } = questionData;

        const isDuplicate = questionWithAnswers?.some((item: any) => item.questionNumber === questionNumber);
        if (isDuplicate) {
            setSnackBar("error", `Question number ${questionNumber} already exists.`);
            return;
        }

        if (row >= 0 && col >= 0) {
            const currentValue = rows[row][col];
            handleInputChange(row, col, `${currentValue} ##${questionNumber}##`);
            setQuestionWithAnswers((prev: any) => [
                ...prev,
                { questionNumber, questionAnswer }
            ]);

            setQuestionData({ questionNumber: '', questionAnswer: '' });
        } else {
            setSnackBar("error", "Please modify a column before adding a question answer.");
        }
    };

    const handleInputChange = (rowIndex: any, colIndex: any, value: any) => {
        const updatedRows = rows.map((row: any, rIdx: any) =>
            row.map((cell: any, cIdx: any) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
        );
        setRows(updatedRows);
        setLastModified({ row: rowIndex, col: colIndex });
    };

    const handleDeleteQuestionAnswer = (questionNumber: string) => {
        setQuestionWithAnswers((prev: any) => prev.filter((q: any) => q.questionNumber !== questionNumber));
        setRows((prevRows: any) => prevRows.map((row: any) => row.map((cell: any) => cell.replace(`##${questionNumber}##`, ''))));
    };

    const updateColumnValue = (questionNumber: string) => {
        const updatedRows = rows.map((row: any) =>
            row.map((cell: any) => cell.replace(`##${questionNumber}##`, ''))
        );
        setRows(updatedRows);
    };

    const handleFocus = (rowIndex: number, colIndex: number) => {
        setLastModified({ row: rowIndex, col: colIndex });
    };

    const handleTextFieldChange = (e: any, rowIndex: number, colIndex: number) => {
        const value = e.target.value;
        const previousValue = rows[rowIndex][colIndex];
        handleInputChange(rowIndex, colIndex, value);
        const questionNumbers = previousValue.match(/##(\d+)##/g) || [];
        questionNumbers.forEach((question: any) => {
            const questionNumber = question.replace(/##/g, '');
            if (!value.includes(`##${questionNumber}##`)) {
                handleDeleteQuestionAnswer(questionNumber);
                updateColumnValue(questionNumber);
            }
        });
    };

    return (
        <Grid container spacing={2}>
            <Grid item
                xs={3}
                container
                direction="column"
                justifyContent="flex-end"
                style={{ display: 'flex' }}>

            </Grid>
            <Grid item xs={12} display={'flex'} gap={2}>
                <ButtonOutlined text="Add Row" onClick={addRow} disabled={rows?.length >= MAX_ROWS} />
                <ButtonOutlined text="Add Column" onClick={addColumn} disabled={columns?.length >= MAX_COLUMNS} />
            </Grid>
            <Grid item xs={12} display={'flex'} gap={2}>
                <TableContainer sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "4px" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns?.map((col: any, colIndex: any) => (
                                    <TableCell
                                        key={colIndex}
                                        sx={{
                                            borderRight: colIndex !== columns.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                                        }}
                                        align="center">
                                        <Box display={"flex"} justifyContent={"center"}>
                                            <IconBackground icon={<DeleteForeverIcon />} onClick={() => removeColumn(colIndex)} />
                                        </Box>
                                    </TableCell>
                                ))}
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows?.map((row: any, rowIndex: any) => (
                                <TableRow key={rowIndex}>
                                    {row.map((cell: any, colIndex: any) => (
                                        <TableCell
                                            sx={{
                                                borderRight: colIndex !== row.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                                            }}
                                            key={colIndex}>
                                            <TextFieldComponent
                                                value={cell}
                                                sx={{ textOverflow: 'ellipsis', }}
                                                onChange={(e: any) => handleTextFieldChange(e, rowIndex, colIndex)}
                                                onFocus={() => handleFocus(rowIndex, colIndex)}
                                                width="100%"
                                                multiline
                                            />
                                        </TableCell>
                                    ))}
                                    <TableCell>
                                        <IconBackground icon={<DeleteForeverIcon />} onClick={() => removeRow(rowIndex)} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <Grid item xs={12} sm={3} >
                <TextFieldComponent
                    text="Enter Question Number"
                    name="Question Number"
                    type="number"
                    width="100%"
                    value={questionData.questionNumber}
                    // placeholder="Enter Question Number"
                    onChange={(e: any) => { if (e.target.value >= 0) { setQuestionData({ ...questionData, questionNumber: e.target.value }) } }}
                    valid
                />
            </Grid>
            <Grid item xs={12} sm={6} >
                <TextFieldComponent
                    text="Enter Question Text"
                    type="text"
                    name="Question Answer"
                    width="100%"
                    value={questionData.questionAnswer}
                    // placeholder="Enter your Answer"
                    onChange={(e: any) => setQuestionData({ ...questionData, questionAnswer: e.target.value })}
                    valid
                />
            </Grid>
            <Grid display={'flex'} alignItems={'end'} item xs={12} sm={3} >
                <ButtonOutlined text={`Create Question`}
                    disabled={!questionData?.questionNumber || !questionData?.questionAnswer}
                    onClick={createQuestion} />
            </Grid>
            <Grid item xs={12} >
                <Typography mb={1}>  List of answer </Typography>
                <Stack direction="row" spacing={1} gap={1} sx={{ flexWrap: "wrap", }}>
                    {questionWithAnswers?.map((ele: any) => {
                        return (
                            <Chip key={ele.questionNumber} label={`${ele.questionNumber} - ${ele.questionAnswer}`} onDelete={() => handleDeleteQuestionAnswer(ele.questionNumber)} color='primary' />
                        );
                    })}
                </Stack>
                <Typography fontSize={"14px"} color={"error"}>
                    {questionWithAnswers?.length !== 0 ? "" : errors?.['question']}
                </Typography>
            </Grid>
        </Grid >
    );
};

export default DialogTableCompletion;
