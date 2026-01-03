import { useState, useEffect, useCallback } from 'react';
import { feedbackApi } from '../api/feedbackApi';

export const useFeedbacks = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [filterOptions, setFilterOptions] = useState({ roCodes: [], statuses: [] });
    const [error, setError] = useState(null);

    // Fetch filter options once
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await feedbackApi.getFilterOptions();
                if (res.success) setFilterOptions(res.data);
            } catch (err) {
                console.error("Error fetching filter options", err);
            }
        };
        fetchOptions();
    }, []);

    const fetchFeedbacks = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        try {
            const res = await feedbackApi.getFeedbacks(params);
            if (res.success) {
                setData(res.data);
                setPagination(res.pagination);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch feedbacks');
        } finally {
            setLoading(false);
        }
    }, []);

    const reviewFeedback = async (id, status) => {
        try {
            const res = await feedbackApi.reviewFeedback(id, status);
            if (res.success) {
                // Optimistic update
                setData(prev => prev.map(item =>
                    item.id === id ? { ...item, status: res.data.status, reviewed: true, reviewedBy: res.data.reviewedBy } : item
                ));
                return { success: true };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const exportData = async (params) => {
        try {
            const response = await feedbackApi.exportCSV(params);
            // Trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'feedbacks.csv';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
            }
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false, error: "Download failed" };
        }
    };

    return {
        loading,
        data,
        pagination,
        filterOptions,
        error,
        fetchFeedbacks,
        reviewFeedback,
        exportData
    };
};
