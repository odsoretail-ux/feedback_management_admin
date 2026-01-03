import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LockReset as LockResetIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { userApi } from '../api/userApi';
import { useAuth } from '../hooks/useAuth';

export const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dialog States
    const [openDialog, setOpenDialog] = useState(false);
    const [openResetDialog, setOpenResetDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        branchCode: '',
        branchName: '',
        city: '',
        role: 'RO'
    });
    const [resetPassword, setResetPassword] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getAllUsers();
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (err) {
            setError("Failed to load users");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setSelectedUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: '', // Can't edit password here directly usually
                fullName: user.fullName || '',
                branchCode: user.branchCode,
                branchName: user.branchName || '',
                city: user.city || '',
                role: user.role
            });
            setIsEditMode(true);
        } else {
            setFormData({
                username: '',
                email: '',
                password: '',
                fullName: '',
                branchCode: '',
                branchName: '',
                city: '',
                role: 'RO'
            });
            setIsEditMode(false);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
        setError(null);
    };

    const handleSaveUser = async () => {
        try {
            if (isEditMode) {
                await userApi.updateUser(selectedUser.id, formData);
            } else {
                await userApi.createUser(formData);
            }
            fetchUsers();
            handleCloseDialog();
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to save user");
        }
    };

    const handleDeleteUser = async (user) => {
        if (window.confirm(`Are you sure you want to delete user ${user.username}?`)) {
            try {
                await userApi.deleteUser(user.id);
                fetchUsers();
            } catch (err) {
                setError(err.response?.data?.detail || "Failed to delete user");
            }
        }
    };

    const handleOpenResetDialog = (user) => {
        setSelectedUser(user);
        setResetPassword('');
        setOpenResetDialog(true);
    };

    const handleResetPassword = async () => {
        try {
            await userApi.resetPassword(selectedUser.id, resetPassword);
            setOpenResetDialog(false);
            alert("Password updated successfully");
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to reset password");
        }
    };

    if (currentUser?.role !== 'superuser') {
        return <Alert severity="error">Access Denied: Superuser only.</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">User Management</Typography>
                <Box>
                    <IconButton onClick={fetchUsers} sx={{ mr: 1 }}>
                        <RefreshIcon />
                    </IconButton>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add User
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Username</TableCell>
                                <TableCell>Full Name</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Branch</TableCell>
                                <TableCell>City</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.username}</TableCell>
                                    <TableCell>{u.fullName}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={u.role}
                                            color={u.role === 'superuser' ? 'primary' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{u.branchName} ({u.branchCode})</TableCell>
                                    <TableCell>{u.city || '-'}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit">
                                            <IconButton onClick={() => handleOpenDialog(u)} size="small">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Reset Password">
                                            <IconButton onClick={() => handleOpenResetDialog(u)} size="small">
                                                <LockResetIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                onClick={() => handleDeleteUser(u)}
                                                size="small"
                                                color="error"
                                                disabled={currentUser.id === u.id}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create/Edit Modal */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            disabled={isEditMode} // Usually username is immutable or needs special handling
                            fullWidth
                        />
                        <TextField
                            label="Full Name"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            fullWidth
                        />
                        {!isEditMode && (
                            <TextField
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                fullWidth
                            />
                        )}
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={formData.role}
                                label="Role"
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <MenuItem value="RO">RO</MenuItem>
                                <MenuItem value="DO">DO</MenuItem>
                                <MenuItem value="FO">FO</MenuItem>
                                <MenuItem value="superuser">Super User</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="City"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            fullWidth
                            helperText="Required for DO hierarchy"
                        />
                        <TextField
                            label="Branch Code"
                            value={formData.branchCode}
                            onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                            fullWidth
                            helperText="e.g. BR001"
                        />
                        <TextField
                            label="Branch Name"
                            value={formData.branchName}
                            onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveUser} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Reset Password Modal */}
            <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)}>
                <DialogTitle>Reset Password for {selectedUser?.username}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            label="New Password"
                            type="password"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                            fullWidth
                            autoFocus
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenResetDialog(false)}>Cancel</Button>
                    <Button onClick={handleResetPassword} variant="contained" color="warning">Reset Password</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};
