import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

export const LineChart = ({ title, data, dataKey = "count", xKey = "date", color = "#8884d8", minHeight = 350, sx }) => {
    const theme = useTheme();

    return (
        <Card sx={{ height: '100%', minHeight: minHeight, ...sx }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom fontWeight="600" color="text.secondary">
                    {title}
                </Typography>
                <Box sx={{ flexGrow: 1, width: '100%', mt: 2, minHeight: 0, height: '100%' }}>
                    <div style={{ width: '100%', height: '100%', minHeight: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 50, left: 0, bottom: 25 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                <XAxis
                                    dataKey={xKey}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: theme.palette.background.paper,
                                        borderRadius: 8,
                                        border: 'none',
                                        boxShadow: theme.shadows[3]
                                    }}
                                />
                                <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Box>
            </CardContent>
        </Card>
    );
};
