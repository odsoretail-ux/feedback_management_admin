import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

export const PieChart = ({ title, data, dataKey = "value", nameKey = "name", colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'], minHeight = 350, sx }) => {
    const theme = useTheme();

    // Define color mapping for rating labels
    const colorMap = {
        'Good': '#10b981',    // Green
        'Neutral': '#fbbf24', // Yellow
        'Poor': '#ef4444'     // Red
    };

    // Function to get color based on entry name
    const getColor = (entry, index) => {
        const name = entry[nameKey];
        return colorMap[name] || colors[index % colors.length];
    };

    // Hardcode levels as requested to ensure they appear in legend even if missing
    // We strictly enforce this order: Good, Neutral, Poor
    const ratingLabels = ['Good', 'Neutral', 'Poor'];

    // Check if this looks like a rating chart (or data is empty, assume yes)
    // If we have data that doesn't match these labels at all, we might want to skip modification
    // to keep this component reusable.
    const isRatingChart = data.length === 0 || data.some(d => ratingLabels.includes(d[nameKey]));

    const processedData = isRatingChart
        ? ratingLabels.map(label => {
            const existing = data.find(d => d[nameKey] === label);
            return existing || { [nameKey]: label, [dataKey]: 0 };
        })
        : data;

    return (
        <Card sx={{ height: '100%', minHeight: minHeight, ...sx }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom fontWeight="600" color="text.secondary">
                    {title}
                </Typography>
                <Box sx={{ flexGrow: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                            <Pie
                                data={processedData}
                                cx="50%"
                                cy="50%"

                                innerRadius="70%"
                                outerRadius="90%"
                                paddingAngle={5}
                                dataKey={dataKey}
                                nameKey={nameKey}
                                stroke="none"
                            >
                                {processedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry, index)} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    borderRadius: 8,
                                    border: 'none',
                                    boxShadow: theme.shadows[3]
                                }}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="left"
                                iconType="circle"
                                wrapperStyle={{ paddingLeft: '20px' }}
                            />
                        </RePieChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};
