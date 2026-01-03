import { useState, useEffect } from 'react';
import {
    Grid, Box, Typography, Button, IconButton, TextField, MenuItem,
    CircularProgress, Alert
} from '@mui/material';
import {
    Refresh, Download, FilterList,
    ThumbUp, ThumbDown, Warning, Assignment
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { dashboardApi } from '../api/dashboardApi';
import { StatsCard } from '../components/dashboard/StatsCard';
import { LineChart } from '../components/dashboard/LineChart';
import { PieChart } from '../components/dashboard/PieChart';

export const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        startDate: dayjs().subtract(30, 'day'),
        endDate: dayjs(),
        roCode: ''
    });

    const [stats, setStats] = useState(null);
    const [dailyComplaints, setDailyComplaints] = useState([]);
    const [washroomData, setWashroomData] = useState([]);
    const [airData, setAirData] = useState([]);
    const [waterData, setWaterData] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiFilters = {
                ...filters,
                startDate: filters.startDate?.format('YYYY-MM-DD'),
                endDate: filters.endDate?.format('YYYY-MM-DD')
            };

            const [statsRes, dailyRes, washroomRes, airRes, waterRes] = await Promise.all([
                dashboardApi.getStats(apiFilters),
                dashboardApi.getDailyComplaints(apiFilters),
                dashboardApi.getWashroomFeedback(apiFilters),
                dashboardApi.getFreeAirFeedback(apiFilters),
                dashboardApi.getDrinkingWaterFeedback(apiFilters)
            ]);

            setStats(statsRes.data);
            setDailyComplaints(dailyRes.data);
            setWashroomData(washroomRes.data);
            setAirData(airRes.data);
            setWaterData(waterRes.data);

        } catch (err) {
            console.error(err);
            setError('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]); // Refetch when filters change

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    if (loading && !stats) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} mb={4} gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                        Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Welcome back! Here's what's happening today, {dayjs().format('MMMM D, YYYY')}.
                    </Typography>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" bgcolor="background.paper" p={1} borderRadius={2} boxShadow={1}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Start Date"
                            value={filters.startDate}
                            onChange={(v) => handleFilterChange('startDate', v)}
                            slotProps={{ textField: { size: 'small', variant: 'outlined', sx: { width: 140 } } }}
                        />
                        <Typography color="text.secondary">-</Typography>
                        <DatePicker
                            label="End Date"
                            value={filters.endDate}
                            onChange={(v) => handleFilterChange('endDate', v)}
                            slotProps={{ textField: { size: 'small', variant: 'outlined', sx: { width: 140 } } }}
                        />
                    </LocalizationProvider>
                    <TextField
                        label="RO Code"
                        size="small"
                        value={filters.roCode}
                        onChange={(e) => handleFilterChange('roCode', e.target.value)}
                        sx={{ width: 100 }}
                    />
                    <IconButton onClick={fetchData} color="primary" sx={{ bgcolor: 'primary.light', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}>
                        <Refresh />
                    </IconButton>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box display="flex" flexDirection="column" gap={3}>
                {/* Stats Cards Row */}
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                        <StatsCard
                            title="Total Feedbacks"
                            value={stats?.totalFeedbacks || 0}
                            icon={<Assignment />}
                            color="#2196F3"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                        <StatsCard
                            title="Verified"
                            value={stats?.verifiedFeedbacks || 0}
                            icon={<ThumbUp />}
                            color="#4CAF50"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                        <StatsCard
                            title="Pending"
                            value={stats?.pendingFeedbacks || 0}
                            icon={<Warning />}
                            color="#FF9800"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                        <StatsCard
                            title="Not Verified"
                            value={stats?.notVerifiedFeedbacks || 0}
                            icon={<ThumbDown />}
                            color="#F44336"
                        />
                    </Grid>
                </Grid>

                {/* Charts Layout */}
                <Grid container spacing={3} alignItems="stretch">
                    {/* Left Column (Line Chart) */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <LineChart
                            title="Daily Complaints Trend"
                            data={dailyComplaints}
                            color="#FF9800"
                            minHeight={450}
                            sx={{ height: '100%' }}
                        />
                    </Grid>

                    {/* Right Column (Stacked Pie Charts) */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Box display="flex" flexDirection="column" gap={3} height="100%">
                            <Box flex={1}>
                                <PieChart
                                    title="Washroom Ratings"
                                    data={washroomData}
                                    colors={['#ef4444', '#fbbf24', '#10b981']}
                                    minHeight={200}
                                    sx={{ height: '100%' }}
                                />
                            </Box>
                            <Box flex={1}>
                                <PieChart
                                    title="Free Air Facility Ratings"
                                    data={airData}
                                    colors={['#ef4444', '#fbbf24', '#10b981']}
                                    minHeight={200}
                                    sx={{ height: '100%' }}
                                />
                            </Box>
                            <Box flex={1}>
                                <PieChart
                                    title="Drinking Water Ratings"
                                    data={waterData}
                                    colors={['#ef4444', '#fbbf24', '#10b981']}
                                    minHeight={200}
                                    sx={{ height: '100%' }}
                                />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};
