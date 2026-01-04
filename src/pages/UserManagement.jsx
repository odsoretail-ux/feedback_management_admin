import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
    Tooltip, Tabs, Tab, Autocomplete
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LockReset as LockResetIcon,
    Refresh as RefreshIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    AccountTree as AccountTreeIcon
} from '@mui/icons-material';
import { userApi } from '../api/userApi';
import { branchApi } from '../api/branchApi';
import { useAuth } from '../hooks/useAuth';

// Internal Component for Hierarchy Tree
const HierarchyView = () => {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHierarchy = async () => {
            try {
                const res = await userApi.getHierarchy();
                if (res.data.success) {
                    setTree(res.data.data);
                }
            } catch (err) {
                console.error("Failed to load hierarchy", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHierarchy();
    }, []);

    if (loading) return <Typography>Loading hierarchy...</Typography>;

    // Simple recursive render or nested list
    return (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Hierarchy (DO {"->"} FO {"->"} RO)</Typography>
            {tree.length === 0 && <Typography>No hierarchy data found.</Typography>}
            {tree.map(cityNode => (
                <Box key={cityNode.name} sx={{ mb: 2, border: '1px solid #eee', borderRadius: 2, p: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <BusinessIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight="bold">{cityNode.name} (DO)</Typography>
                    </Box>

                    <Box sx={{ pl: 4 }}>
                        {cityNode.children.map(foNode => (
                            <Box key={foNode.name} sx={{ mb: 1 }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <PersonIcon color="action" fontSize="small" />
                                    <Typography variant="body1" fontWeight="medium">{foNode.name} ({foNode.type})</Typography>
                                </Box>

                                <Box sx={{ pl: 4, mt: 0.5 }}>
                                    {foNode.children.length === 0 ? <Typography variant="caption" color="text.secondary">No Branches</Typography> : (
                                        <Box display="flex" gap={1} flexWrap="wrap">
                                            {foNode.children.map(ro => (
                                                <Chip
                                                    key={ro.ro_code}
                                                    label={`${ro.ro_code} - ${ro.name}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                        {cityNode.children.length === 0 && <Typography variant="caption">No FOs assigned</Typography>}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export const UserManagement = () => {
    const { user: currentUser } = useAuth();

    // Tabs state
    const [tabValue, setTabValue] = useState(0);

    // Data States
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- User Dialog States ---
    const [openDialog, setOpenDialog] = useState(false);
    const [openResetDialog, setOpenResetDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // --- Branch Dialog States ---
    const [openBranchDialog, setOpenBranchDialog] = useState(false);
    const [branchFormData, setBranchFormData] = useState({
        ro_code: '',
        name: '',
        city: '',
        region: ''
    });

    // User Form Data
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
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchUsers(), fetchBranches()]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await userApi.getAllUsers();
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (err) {
            setError("Failed to load users");
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await branchApi.getAllBranches();
            if (response.success) {
                setBranches(response.data);
            }
        } catch (err) {
            console.error("Failed to load branches");
        }
    };

    // --- Handlers for Users ---

    const handleOpenDialog = (user = null) => {
        if (user) {
            setSelectedUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: '',
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

    const handleSaveUser = async () => {
        try {
            if (isEditMode) {
                await userApi.updateUser(selectedUser.id, formData);
            } else {
                await userApi.createUser(formData);
            }
            fetchUsers();
            setOpenDialog(false);
            setSelectedUser(null);
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

    const handleResetPassword = async () => {
        try {
            await userApi.resetPassword(selectedUser.id, resetPassword);
            setOpenResetDialog(false);
            alert("Password updated successfully");
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to reset password");
        }
    };

    // --- Handlers for Branches ---

    const handleOpenBranchDialog = () => {
        setBranchFormData({ ro_code: '', name: '', city: '', region: '' });
        setOpenBranchDialog(true);
    };

    const handleSaveBranch = async () => {
        try {
            await branchApi.createBranch(branchFormData);
            fetchBranches();
            setOpenBranchDialog(false);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to save branch");
        }
    };

    const handleDeleteBranch = async (code) => {
        if (window.confirm(`Delete branch ${code}? This might affect existing users or feedback.`)) {
            try {
                await branchApi.deleteBranch(code);
                fetchBranches();
            } catch (err) {
                setError(err.response?.data?.detail || "Failed to delete branch");
            }
        }
    };

    // --- Render ---

    if (currentUser?.role !== 'superuser') {
        return <Alert severity="error">Access Denied: Superuser only.</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">System Management</Typography>
                <IconButton onClick={fetchData} title="Refresh Data">
                    <RefreshIcon />
                </IconButton>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} centered variant="fullWidth">
                    <Tab icon={<PersonIcon />} label="User Management" />
                    <Tab icon={<BusinessIcon />} label="Branch Management" />
                    <Tab icon={<AccountTreeIcon />} label="Hierarchy View" />
                </Tabs>
            </Paper>

            {loading ? <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} /> : (
                <>
                    {/* --- Users Tab --- */}
                    {tabValue === 0 && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                                    Add User
                                </Button>
                            </Box>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Username</TableCell>
                                            <TableCell>Role</TableCell>
                                            <TableCell>Branch</TableCell>
                                            <TableCell>City</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell>
                                                    <Typography variant="subtitle2">{u.username}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{u.fullName}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={u.role} color={u.role === 'superuser' ? 'primary' : 'default'} size="small" />
                                                </TableCell>
                                                <TableCell>{u.branchName} ({u.branchCode})</TableCell>
                                                <TableCell>{u.city || '-'}</TableCell>
                                                <TableCell>
                                                    <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenDialog(u)}><EditIcon /></IconButton></Tooltip>
                                                    <Tooltip title="Reset Password"><IconButton size="small" onClick={() => { setSelectedUser(u); setResetPassword(''); setOpenResetDialog(true); }}><LockResetIcon /></IconButton></Tooltip>
                                                    <Tooltip title="Delete"><IconButton size="small" color="error" disabled={u.id === currentUser.id} onClick={() => handleDeleteUser(u)}><DeleteIcon /></IconButton></Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {/* --- Branches Tab --- */}
                    {tabValue === 1 && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenBranchDialog}>
                                    Add Branch
                                </Button>
                            </Box>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>RO Code</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>City</TableCell>
                                            <TableCell>Region</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {branches.map((b) => (
                                            <TableRow key={b.ro_code}>
                                                <TableCell>{b.ro_code}</TableCell>
                                                <TableCell>{b.name}</TableCell>
                                                <TableCell>{b.city}</TableCell>
                                                <TableCell>{b.region || '-'}</TableCell>
                                                <TableCell>
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteBranch(b.ro_code)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {/* --- Hierarchy Tab --- */}
                    {tabValue === 2 && (
                        <HierarchyView />
                    )}
                </>
            )}

            {/* --- User Dialog --- */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} disabled={isEditMode} fullWidth />
                        <TextField label="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} fullWidth />
                        <TextField label="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} fullWidth />
                        {!isEditMode && <TextField label="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} fullWidth />}

                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select value={formData.role} label="Role" onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                <MenuItem value="RO">RO</MenuItem>
                                <MenuItem value="DO">DO</MenuItem>
                                <MenuItem value="FO">FO</MenuItem>
                                <MenuItem value="superuser">Super User</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Branch Selection with Autocomplete */}
                        <Autocomplete
                            options={branches}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    const b = branches.find(b => b.ro_code === option);
                                    return b ? `${b.ro_code} - ${b.name}` : option;
                                }
                                return `${option.ro_code} - ${option.name}`;
                            }}
                            value={branches.find(b => b.ro_code === formData.branchCode) || null}
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    setFormData({
                                        ...formData,
                                        branchCode: newValue.ro_code,
                                        branchName: newValue.name,
                                        city: newValue.city
                                    });
                                } else {
                                    setFormData({ ...formData, branchCode: '', branchName: '', city: '' });
                                }
                            }}
                            renderInput={(params) => <TextField {...params} label="Assign Branch" helperText="Select from existing branches" />}
                            disabled={formData.role === 'superuser'}
                        />

                        <TextField label="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} fullWidth helperText="Auto-filled from Branch for RO/FO" />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveUser} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* --- Branch Dialog --- */}
            <Dialog open={openBranchDialog} onClose={() => setOpenBranchDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Add New Branch</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="RO Code" value={branchFormData.ro_code} onChange={e => setBranchFormData({ ...branchFormData, ro_code: e.target.value })} fullWidth placeholder="e.g. BR099" />
                        <TextField label="Branch Name" value={branchFormData.name} onChange={e => setBranchFormData({ ...branchFormData, name: e.target.value })} fullWidth />
                        <TextField label="City" value={branchFormData.city} onChange={e => setBranchFormData({ ...branchFormData, city: e.target.value })} fullWidth />
                        <TextField label="Region" value={branchFormData.region} onChange={e => setBranchFormData({ ...branchFormData, region: e.target.value })} fullWidth />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBranchDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveBranch} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* --- Reset Password Dialog --- */}
            <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)}>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <TextField label="New Password" type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} fullWidth autoFocus />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenResetDialog(false)}>Cancel</Button>
                    <Button onClick={handleResetPassword} variant="contained" color="warning">Reset</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}


