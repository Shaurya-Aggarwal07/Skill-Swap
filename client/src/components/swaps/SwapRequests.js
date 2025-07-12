import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import axios from 'axios';

const PAGE_SIZE = 5;

const SwapRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/swaps/my-requests?page=${pageNum}&limit=${PAGE_SIZE}`);
      setRequests(res.data.requests);
      setTotalPages(res.data.pagination?.pages || 1);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load swap requests');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests(1);
    // eslint-disable-next-line
  }, []);

  const handleAction = async (swapId, action) => {
    setActionLoading(swapId + action);
    try {
      if (action === 'accept') {
        await axios.put(`/api/swaps/${swapId}/accept`);
      } else if (action === 'reject') {
        await axios.put(`/api/swaps/${swapId}/reject`);
      } else if (action === 'cancel') {
        await axios.delete(`/api/swaps/${swapId}`);
      }
      fetchRequests(page);
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.error || 'Unknown error'));
    }
    setActionLoading(null);
  };

  if (loading) return <LoadingSpinner className="py-12" />;
  if (error) return <div className="text-center text-red-600 py-12">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Swap Requests</h1>
        <p className="mt-2 text-gray-600">Manage your skill swap requests</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {requests.length === 0 ? (
          <div className="text-center text-gray-600 py-8">No swap requests found.</div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {req.requester_id === user.id
                        ? `You → ${req.recipient_name}`
                        : `${req.requester_name} → You`}
                    </span>
                    <span className={`badge ${
                      req.status === 'accepted'
                        ? 'badge-success'
                        : req.status === 'pending'
                        ? 'badge-warning'
                        : 'badge-danger'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {req.offered_skill_name} ↔ {req.requested_skill_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(req.created_at).toLocaleDateString()}
                  </div>
                  {req.message && (
                    <div className="text-xs text-gray-700 mt-1">Message: {req.message}</div>
                  )}
                </div>
                <div className="flex gap-2 mt-2 md:mt-0 md:ml-4">
                  {req.status === 'pending' && req.recipient_id === user.id && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={actionLoading === req.id + 'accept'}
                        onClick={() => handleAction(req.id, 'accept')}
                      >Accept</Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={actionLoading === req.id + 'reject'}
                        onClick={() => handleAction(req.id, 'reject')}
                      >Reject</Button>
                    </>
                  )}
                  {req.status === 'pending' && req.requester_id === user.id && (
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={actionLoading === req.id + 'cancel'}
                      onClick={() => handleAction(req.id, 'cancel')}
                    >Cancel</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => fetchRequests(page - 1)}
            >Previous</Button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <Button
              variant="secondary"
              disabled={page === totalPages}
              onClick={() => fetchRequests(page + 1)}
            >Next</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapRequests; 