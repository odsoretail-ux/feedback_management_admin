import { useState, useEffect } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination, TextField, MenuItem, Button, IconButton, Chip, Typography,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tooltip, Menu, MenuItem as MuiMenuItem
} from '@mui/material';
import {
    FilterList, Download, Visibility, CheckCircle, Cancel, MoreVert
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

import { useFeedbacks } from '../hooks/useFeedbacks';
import { useAuth } from '../hooks/useAuth';
import { feedbackApi } from '../api/feedbackApi';
import { config } from '../config';

export const Reports = () => {
    const { user } = useAuth();
    const {
        loading, data, pagination, filterOptions, error,
        fetchFeedbacks, reviewFeedback, exportData
    } = useFeedbacks();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        roCode: '',
        status: '',
        startDate: null,
        endDate: null,
        search: ''
    });

    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // 'verify', 'resolve', 'close'

    // Load data on change
    useEffect(() => {
        const params = {
            page: page + 1,
            limit: rowsPerPage,
            ...filters,
            startDate: filters.startDate ? filters.startDate.format('YYYY-MM-DD') : undefined,
            endDate: filters.endDate ? filters.endDate.format('YYYY-MM-DD') : undefined
        };
        fetchFeedbacks(params);
    }, [page, rowsPerPage, filters, fetchFeedbacks]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(0);
    };

    const handleOpenAction = (feedback, type) => {
        setSelectedFeedback(feedback);
        setActionType(type);
        setActionDialogOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedFeedback || !actionType) return;

        let newStatus = '';
        if (actionType === 'verify_ro') newStatus = 'RO Verified';
        else if (actionType === 'verify_do') newStatus = 'DO Verified';
        else if (actionType === 'resolve') newStatus = 'Resolved';
        else if (actionType === 'close') newStatus = 'Closed';

        try {
            await feedbackApi.updateWorkflowStatus(selectedFeedback.id, newStatus);
            // Refresh logic handled by fetchFeedbacks in useEffect or optimistic update if added
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                ...filters,
                startDate: filters.startDate ? filters.startDate.format('YYYY-MM-DD') : undefined,
                endDate: filters.endDate ? filters.endDate.format('YYYY-MM-DD') : undefined
            };
            fetchFeedbacks(params);
            setActionDialogOpen(false);
        } catch (err) {
            console.error("Action failed", err);
            // Optional: Set specific error state to show in dialog
        }
    };

    const handleExport = () => {
        const params = {
            ...filters,
            startDate: filters.startDate ? filters.startDate.format('YYYY-MM-DD') : undefined,
            endDate: filters.endDate ? filters.endDate.format('YYYY-MM-DD') : undefined
        };
        exportData(params);
    };

    const getStatusColor = (status) => {
        if (!status) return 'default';
        const s = status.toLowerCase();
        if (s.includes('verified') || s === 'resolved') return 'success';
        if (s === 'rejected' || s === 'closed') return 'error';
        if (s.includes('assigned') || s === 'reviewed') return 'info';
        if (s === 'pending') return 'warning';
        return 'default';
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const [menuFeedback, setMenuFeedback] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    const handleOpenMenu = (event, feedback) => {
        setAnchorEl(event.currentTarget);
        setMenuFeedback(feedback);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setMenuFeedback(null);
    };

    const handleMenuAction = (action) => {
        if (action === 'view') {
            setSelectedFeedback(menuFeedback);
            setViewDialogOpen(true);
        } else if (action === 'action') {
            const actionType = getActionForUser(menuFeedback);
            if (actionType) {
                handleOpenAction(menuFeedback, actionType);
            }
        }
        handleCloseMenu();
    };

    const getActionForUser = (feedback) => {
        if (!feedback) return null;
        const status = feedback.workflowStatus || feedback.status;
        const role = user?.role;

        if (role === 'RO' && status === 'Pending') return 'verify_ro';
        if (role === 'DO' && (status === 'RO Verified' || status === 'Pending')) return 'verify_do';
        if (role === 'FO' && status === 'Assigned') return 'resolve';
        if (role === 'DO' && status === 'Resolved') return 'close';
        return null;
    };




    // ... existing handlers ...

    return (
        <Box>
            {/* ... Header and Filters ... */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Reports</Typography>
                <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleExport}
                >
                    Export CSV
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                {/* ... existing filters grid ... */}
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Search"
                            size="small"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Phone or Comment"
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField
                            select
                            fullWidth
                            label="RO"
                            size="small"
                            value={filters.roCode}
                            onChange={(e) => handleFilterChange('roCode', e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            {filterOptions.roCodes.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            size="small"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            {filterOptions.statuses.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Box display="flex" gap={1}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="From"
                                    value={filters.startDate}
                                    onChange={(v) => handleFilterChange('startDate', v)}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                                <DatePicker
                                    label="To"
                                    value={filters.endDate}
                                    onChange={(v) => handleFilterChange('endDate', v)}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                            </LocalizationProvider>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Table */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>S.No</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Air Rating</TableCell>
                                <TableCell>Water Rating</TableCell>
                                <TableCell>Washroom Rating</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>More</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">Loading...</TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">No data found</TableCell>
                                </TableRow>
                            ) : (
                                data.map((row, index) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>{(page * rowsPerPage) + index + 1}</TableCell>
                                        <TableCell>{dayjs.utc(row.createdAt).tz(dayjs.tz.guess()).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>{row.phoneNumber}</TableCell>
                                        <TableCell>{row.freeAirFacilityRating || '-'}</TableCell>
                                        <TableCell>{row.drinkingWaterRating || '-'}</TableCell>
                                        <TableCell>{row.washroomCleanlinessRating || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.workflowStatus || row.status}
                                                color={getStatusColor(row.workflowStatus || row.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" justifyContent="center">
                                                <IconButton size="small" onClick={(e) => handleOpenMenu(e, row)}>
                                                    <MoreVert />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={pagination.total}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            </Paper>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
                <MuiMenuItem onClick={() => handleMenuAction('view')}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Visibility fontSize="small" />
                        <Typography>View Details</Typography>
                    </Box>
                </MuiMenuItem>

                {/* Conditional "Take Action" Item */}
                {getActionForUser(menuFeedback) && (
                    <MuiMenuItem onClick={() => handleMenuAction('action')}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <CheckCircle fontSize="small" color="primary" />
                            <Typography color="primary" fontWeight="medium">Take Action</Typography>
                        </Box>
                    </MuiMenuItem>
                )}
            </Menu>



            {/* View Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Feedback Details</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {selectedFeedback && (
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box><Typography fontWeight="bold">ID:</Typography> {selectedFeedback.id}</Box>
                            <Box><Typography fontWeight="bold">Date:</Typography> {dayjs.utc(selectedFeedback.createdAt).tz(dayjs.tz.guess()).format('DD/MM/YYYY HH:mm z')}</Box>
                            <Box><Typography fontWeight="bold">Phone:</Typography> {selectedFeedback.phoneNumber}</Box>
                            <Box><Typography fontWeight="bold">RO Code:</Typography> {selectedFeedback.roCode || '-'}</Box>
                            <Box><Typography fontWeight="bold">Air Rating:</Typography> {selectedFeedback.freeAirFacilityRating || '-'}</Box>
                            <Box><Typography fontWeight="bold">Water Rating:</Typography> {selectedFeedback.drinkingWaterRating || '-'}</Box>
                            <Box><Typography fontWeight="bold">Washroom Rating:</Typography> {selectedFeedback.washroomCleanlinessRating || '-'}</Box>
                            <Box><Typography fontWeight="bold">Comments:</Typography> {selectedFeedback.experienceComments || '-'}</Box>
                            <Box><Typography fontWeight="bold">Status:</Typography> {selectedFeedback.workflowStatus || selectedFeedback.status}</Box>

                            <Box>
                                <Typography fontWeight="bold" mb={1}>Attachments:</Typography>
                                <Box display="flex" gap={2} flexWrap="wrap">
                                    {selectedFeedback.freeAirFacilityImage && (
                                        <Box>
                                            <Typography variant="caption" display="block">Air Facility</Typography>
                                            <a href={`${config.apiBaseUrl.replace('/api', '')}/feedback/${selectedFeedback.id}/image/air`} target="_blank" rel="noreferrer">
                                                <img
                                                    src={`${config.apiBaseUrl.replace('/api', '')}/feedback/${selectedFeedback.id}/image/air`}
                                                    alt="Air Facility"
                                                    style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
                                                />
                                            </a>
                                        </Box>
                                    )}
                                    {selectedFeedback.drinkingWaterImage && (
                                        <Box>
                                            <Typography variant="caption" display="block">Drinking Water</Typography>
                                            <a href={`${config.apiBaseUrl.replace('/api', '')}/feedback/${selectedFeedback.id}/image/water`} target="_blank" rel="noreferrer">
                                                <img
                                                    src={`${config.apiBaseUrl.replace('/api', '')}/feedback/${selectedFeedback.id}/image/water`}
                                                    alt="Drinking Water"
                                                    style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
                                                />
                                            </a>
                                        </Box>
                                    )}
                                    {selectedFeedback.washroomCleanlinessImage && (
                                        <Box>
                                            <Typography variant="caption" display="block">Washroom</Typography>
                                            <a href={`${config.apiBaseUrl.replace('/api', '')}/feedback/${selectedFeedback.id}/image/washroom`} target="_blank" rel="noreferrer">
                                                <img
                                                    src={`${config.apiBaseUrl.replace('/api', '')}/feedback/${selectedFeedback.id}/image/washroom`}
                                                    alt="Washroom"
                                                    style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
                                                />
                                            </a>
                                        </Box>
                                    )}
                                    {selectedFeedback.fuelTransactionReceipt && (
                                        <Box>
                                            <Typography variant="caption" display="block">Receipt</Typography>
                                            <a href={`${config.apiBaseUrl.replace('/api', '')}/feedback/${selectedFeedback.id}/image/receipt`} target="_blank" rel="noreferrer">
                                                <img
                                                    src={`${config.apiBaseUrl.replace('/api', '')}/feedback/${selectedFeedback.id}/image/receipt`}
                                                    alt="Receipt"
                                                    style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
                                                />
                                            </a>
                                        </Box>
                                    )}
                                    {!selectedFeedback.freeAirFacilityImage && !selectedFeedback.drinkingWaterImage && !selectedFeedback.washroomCleanlinessImage && !selectedFeedback.fuelTransactionReceipt && (
                                        <Typography variant="body2" color="text.secondary">No attachments</Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Action Confirmation Dialog */}
            <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Please confirm the following action for Feedback #{selectedFeedback?.id}:
                    </Typography>

                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                            {actionType === 'verify_ro' ? 'Verify Feedback (RO)' :
                                actionType === 'verify_do' ? 'Verify & Auto-Assign (DO)' :
                                    actionType === 'resolve' ? 'Mark as Resolved' :
                                        actionType === 'close' ? 'Close Ticket' : ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {actionType === 'verify_ro' ? 'Confirm that this feedback is valid.' :
                                actionType === 'verify_do' ? 'Validate and assign to the mapped Field Officer.' :
                                    actionType === 'resolve' ? 'Indicate that the issue has been addressed.' :
                                        actionType === 'close' ? 'Finalize and close this feedback loop.' : ''}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmAction} variant="contained" color="primary">Confirm</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
