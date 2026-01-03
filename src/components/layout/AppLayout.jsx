import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItem,
    ListItemIcon, ListItemText, Toolbar, Typography, Menu, MenuItem,
    Avatar, Divider, Container, useMediaQuery, useTheme
} from '@mui/material';
import {
    Menu as MenuIcon, Dashboard, Assessment, ExitToApp,
    Person, ChevronLeft, People, LockReset
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from '@mui/material';
import { authApi } from '../../api/authApi';

const drawerWidth = 240;

export const AppLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [open, setOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Ensure drawer state updates when screen size changes
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setOpen(!open);
        }
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    // Change Password Logic
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);

    const handleOpenChangePassword = () => {
        setAnchorEl(null); // Close menu
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordError(null);
        setPasswordSuccess(null);
        setOpenChangePassword(true);
    };

    const handleChangePasswordSubmit = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        try {
            await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
            setPasswordSuccess("Password changed successfully");
            setPasswordError(null);
            setTimeout(() => setOpenChangePassword(false), 1500);
        } catch (err) {
            setPasswordError(err.response?.data?.detail || "Failed to change password");
            setPasswordSuccess(null);
        }
    };

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Reports', icon: <Assessment />, path: '/reports' }
    ];

    if (user?.role === 'superuser') {
        menuItems.push({ text: 'User Management', icon: <People />, path: '/users' });
    }

    const drawerContent = (
        <>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: [1],
                }}
            >
                <IconButton onClick={handleDrawerToggle}>
                    <ChevronLeft />
                </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => {
                            navigate(item.path);
                            if (isMobile) setMobileOpen(false);
                        }}
                        selected={location.pathname === item.path}
                        sx={{
                            bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent',
                            '&:hover': { bgcolor: 'action.hover' }
                        }}
                    >
                        <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="absolute" open={open && !isMobile} sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                width: open && !isMobile ? `calc(100% - ${drawerWidth}px)` : '100%',
                ml: open && !isMobile ? `${drawerWidth}px` : 0,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
            }}>
                <Toolbar sx={{ pr: '24px' }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerToggle}
                        sx={{
                            marginRight: '36px',
                            ...((open && !isMobile) && { display: 'none' })
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
                        Feedback Admin Portal - {user?.branchName || user?.branch || 'Admin'}
                    </Typography>
                    <IconButton color="inherit" onClick={handleMenu}>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            {user?.username?.charAt(0).toUpperCase() || 'A'}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem disabled>{user?.username}</MenuItem>
                        <MenuItem onClick={handleOpenChangePassword}>
                            <ListItemIcon><LockReset fontSize="small" /></ListItemIcon>
                            Change Password
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon><ExitToApp fontSize="small" /></ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        position: 'relative',
                        whiteSpace: 'nowrap',
                        width: drawerWidth,
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        boxSizing: 'border-box',
                        ...(!open && {
                            overflowX: 'hidden',
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.leavingScreen,
                            }),
                            width: theme.spacing(7),
                            [theme.breakpoints.up('sm')]: {
                                width: theme.spacing(9),
                            },
                        }),
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            <Box
                component="main"
                sx={{
                    backgroundColor: (theme) => theme.palette.background.default,
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <Toolbar />
                <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
                    <Outlet />
                </Container>
            </Box>

            {/* Change Password Dialog */}
            <Dialog open={openChangePassword} onClose={() => setOpenChangePassword(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {passwordError && <Alert severity="error">{passwordError}</Alert>}
                        {passwordSuccess && <Alert severity="success">{passwordSuccess}</Alert>}
                        <TextField
                            label="Current Password"
                            type="password"
                            fullWidth
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />
                        <TextField
                            label="New Password"
                            type="password"
                            fullWidth
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            fullWidth
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenChangePassword(false)}>Cancel</Button>
                    <Button onClick={handleChangePasswordSubmit} variant="contained" disabled={!!passwordSuccess}>Change Password</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
