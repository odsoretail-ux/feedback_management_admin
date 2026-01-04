import { Card, CardContent, Typography, Box } from '@mui/material';
import React from 'react';

export const StatsCard = ({ title, value, icon, color }) => (
    <Card sx={{
        height: '100%',
        borderRadius: 4,
        minHeight: 120,
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            backgroundColor: color || 'primary.main',
            opacity: 0.8
        }
    }}>
        <CardContent sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2.5, sm: 3 },
            '&:last-child': { pb: { xs: 2.5, sm: 3 } }
        }}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={1.5}
                width="100%"
            >
                <Box
                    sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: '20px',
                        background: color
                            ? `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`
                            : 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)',
                        color: color || 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: { xs: 48, sm: 56, md: 64 },
                        minHeight: { xs: 48, sm: 56, md: 64 },
                        mb: 0.5,
                        transition: 'transform 0.3s ease',
                        '.MuiCard-root:hover &': {
                            transform: 'scale(1.1) rotate(5deg)',
                        },
                        '& svg': {
                            fontSize: { xs: '1.5rem', sm: '1.75rem' },
                            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
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
                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                            lineHeight: 1,
                            mb: 0.5,
                            letterSpacing: '-0.03em',
                            background: color ? `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` : 'inherit',
                            WebkitBackgroundClip: color ? 'text' : 'none',
                            WebkitTextFillColor: color ? 'transparent' : 'inherit',
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
                            letterSpacing: '0.1em',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            opacity: 0.8
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
);
