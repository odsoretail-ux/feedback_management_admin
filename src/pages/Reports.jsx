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
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewStatus, setReviewStatus] = useState('');

    // Workflow State
    const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
    const [fos, setFos] = useState([]);
    const [targetFo, setTargetFo] = useState('');
    const [workflowAction, setWorkflowAction] = useState(''); // 'escalate', 'assign', 'resolve', 'close'

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

    const handleOpenReview = (feedback) => {
        setSelectedFeedback(feedback);
        setReviewStatus(feedback.status);
        setReviewDialogOpen(true);
    };

    const handleSubmitReview = async () => {
        if (selectedFeedback && reviewStatus) {
            await reviewFeedback(selectedFeedback.id, reviewStatus);
            setReviewDialogOpen(false);
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
        switch (status?.toLowerCase()) {
            case 'verified': return 'success';
            case 'rejected': return 'error';
            case 'reviewed': return 'info';
            default: return 'warning';
        }
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
            handleOpenReview(menuFeedback);
        }
        handleCloseMenu();
    };

    const handleWorkflowClick = async (newStatus) => {
        handleCloseMenu();
        if (newStatus === 'Assigned') {
            // Fetch FOs for the feedback's branch
            // Note: menuFeedback.roCode is the branch code? It should be in data.
            // Based on DTO: roCode is available.
            try {
                const res = await feedbackApi.getFieldOfficers(menuFeedback.roCode);
                if (res.success) {
                    setFos(res.data);
                    setTargetFo('');
                    setWorkflowAction(newStatus);
                    setWorkflowDialogOpen(true);
                }
            } catch (err) {
                console.error("Failed to fetch FOs", err);
                alert("Failed to fetch Field Officers");
            }
        } else {
            // Direct update for other statuses
            await submitWorkflowUpdate(menuFeedback.id, newStatus);
        }
    };

    const submitWorkflowChange = async () => {
        if (!targetFo) return;
        await submitWorkflowUpdate(menuFeedback.id, workflowAction, targetFo);
        setWorkflowDialogOpen(false);
    };

    const submitWorkflowUpdate = async (id, status, assignedTo = null) => {
        try {
            await feedbackApi.updateWorkflowStatus(id, status, assignedTo);
            // Refresh data
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                ...filters
            };
            fetchFeedbacks(params);
        } catch (err) {
            console.error("Workflow update failed", err);
            alert("Failed to update status");
        }
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
                                <TableCell>Workflow</TableCell>
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
                                        <TableCell>{dayjs(row.createdAt).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>{row.phoneNumber}</TableCell>
                                        <TableCell>{row.freeAirFacilityRating || '-'}</TableCell>
                                        <TableCell>{row.drinkingWaterRating || '-'}</TableCell>
                                        <TableCell>{row.washroomCleanlinessRating || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.workflowStatus || 'Pending'}
                                                size="small"
                                                color={row.workflowStatus === 'Closed' ? 'success' : row.workflowStatus === 'Resolved' ? 'info' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.status}
                                                color={getStatusColor(row.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" onClick={(e) => handleOpenMenu(e, row)}>
                                                <MoreVert />
                                            </IconButton>
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
                <MuiMenuItem onClick={() => handleMenuAction('view')}>View more</MuiMenuItem>

                {/* Workflow Actions */}
                {user?.role === 'RO' && (!menuFeedback?.workflowStatus || menuFeedback.workflowStatus === 'Pending') && (
                    <MuiMenuItem onClick={() => handleWorkflowClick('Escalated')}>Escalate to DO</MuiMenuItem>
                )}

                {user?.role === 'DO' && menuFeedback?.workflowStatus === 'Escalated' && (
                    <MuiMenuItem onClick={() => handleWorkflowClick('Assigned')}>Assign to FO</MuiMenuItem>
                )}

                {user?.role === 'FO' && menuFeedback?.workflowStatus === 'Assigned' && (
                    <MuiMenuItem onClick={() => handleWorkflowClick('Resolved')}>Mark Resolved</MuiMenuItem>
                )}

                {user?.role === 'DO' && menuFeedback?.workflowStatus === 'Resolved' && (
                    <MuiMenuItem onClick={() => handleWorkflowClick('Closed')}>Close Ticket</MuiMenuItem>
                )}

                {/* Review Action - For Superuser and DO */}
                {(user?.role === 'superuser' || user?.role === 'DO') && (
                    <MuiMenuItem onClick={() => handleMenuAction('action')}>Review Status</MuiMenuItem>
                )}
            </Menu>

            {/* Workflow Assignment Dialog */}
            <Dialog open={workflowDialogOpen} onClose={() => setWorkflowDialogOpen(false)}>
                <DialogTitle>Assign Field Officer</DialogTitle>
                <DialogContent sx={{ minWidth: 300, pt: 2 }}>
                    <Typography variant="body2" mb={2}>
                        Select a Field Officer to assign this ticket to.
                    </Typography>
                    <TextField
                        select
                        fullWidth
                        label="Select FO"
                        value={targetFo}
                        onChange={(e) => setTargetFo(e.target.value)}
                    >
                        {fos.map((fo) => (
                            <MenuItem key={fo.id} value={fo.id}>{fo.fullName || fo.username}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWorkflowDialogOpen(false)}>Cancel</Button>
                    <Button onClick={submitWorkflowChange} variant="contained" color="primary">Assign</Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Feedback Details</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {selectedFeedback && (
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box><Typography fontWeight="bold">ID:</Typography> {selectedFeedback.id}</Box>
                            <Box><Typography fontWeight="bold">Date:</Typography> {dayjs(selectedFeedback.createdAt).format('DD/MM/YYYY HH:mm')}</Box>
                            <Box><Typography fontWeight="bold">Phone:</Typography> {selectedFeedback.phoneNumber}</Box>
                            <Box><Typography fontWeight="bold">RO Code:</Typography> {selectedFeedback.roCode || '-'}</Box>
                            <Box><Typography fontWeight="bold">Air Rating:</Typography> {selectedFeedback.freeAirFacilityRating || '-'}</Box>
                            <Box><Typography fontWeight="bold">Water Rating:</Typography> {selectedFeedback.drinkingWaterRating || '-'}</Box>
                            <Box><Typography fontWeight="bold">Washroom Rating:</Typography> {selectedFeedback.washroomCleanlinessRating || '-'}</Box>
                            <Box><Typography fontWeight="bold">Comments:</Typography> {selectedFeedback.experienceComments || '-'}</Box>
                            <Box><Typography fontWeight="bold">Status:</Typography> {selectedFeedback.status}</Box>

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

            {/* Review Dialog (Take Action) */}
            <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)}>
                {/* ... existing review dialog content ... */}
                <DialogTitle>Take Action / Review</DialogTitle>
                <DialogContent sx={{ minWidth: 300, pt: 2 }}>
                    <Box mb={2}>
                        <Typography variant="subtitle2">Current Status: {selectedFeedback?.status}</Typography>
                    </Box>
                    <TextField
                        select
                        fullWidth
                        label="New Status"
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value)}
                    >
                        {filterOptions.statuses.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmitReview} variant="contained" color="primary">Update</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
