import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';

export const BarChart = ({ title, data, dataKey = "count", xKey = "date", color = "#82ca9d" }) => {
    return (
        <Card sx={{ height: '100%', minHeight: 300 }}>
            <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <Box sx={{ height: 250, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xKey} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
                        </ReBarChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};
