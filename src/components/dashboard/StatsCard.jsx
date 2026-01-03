import { Card, CardContent, Typography, Box } from '@mui/material';
import React from 'react';

export const StatsCard = ({ title, value, icon, color }) => (
    <Card sx={{
        height: '100%',
        borderRadius: 4,
        minHeight: 120,
        overflow: 'hidden' // Prevent overflow
    }}>
        <CardContent sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 1, sm: 1.5 }, // Responsive padding
            '&:last-child': { pb: { xs: 1, sm: 1.5 } } // Fix MUI padding issue
        }}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={0.5}
                width="100%" // Ensure it respects container width
            >
                <Box
                    sx={{
                        p: { xs: 1, sm: 1.5 },
                        borderRadius: '50%',
                        bgcolor: color ? `${color}15` : 'primary.light',
                        color: color || 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: { xs: 40, sm: 48, md: 56 }, // Responsive icon size
                        minHeight: { xs: 40, sm: 48, md: 56 },
                        mb: 0.5,
                        '& svg': {
                            fontSize: { xs: '1.25rem', sm: '1.5rem' } // Responsive icon
                        }
                    }}
                >
                    {icon}
                </Box>
                <Box textAlign="center" width="100%" px={0.5}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }, // Responsive font
                            lineHeight: 1.2,
                            wordBreak: 'break-word', // Break long numbers
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {value}
                    </Typography>
                    <Typography
                        color="text.secondary"
                        variant="subtitle2"
                        sx={{
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }, // Responsive font
                            lineHeight: 1.4,
                            mt: 0.25,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap' // Prevent title wrapping
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
);
