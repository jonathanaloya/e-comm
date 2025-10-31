import { useState } from 'react'
import toast from 'react-hot-toast'

const SupportTicketModal = ({ ticket, onClose, onReply, onUpdateStatus }) => {
  const [replyMessage, setReplyMessage] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(ticket.status)

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message')
      return
    }

    setIsReplying(true)
    try {
      await onReply(ticket.ticketId, replyMessage.trim())
      setReplyMessage('')
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsReplying(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (newStatus === ticket.status) return

    try {
      await onUpdateStatus(ticket.ticketId, newStatus)
      setSelectedStatus(newStatus)
    } catch (error) {
      // Error handled in parent
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Support Ticket #{ticket.ticketId}</h2>
              <p className="text-blue-100 mt-1">{ticket.subject}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Ticket Details */}
          <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
            {/* Ticket Info */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Customer:</span>
                  <p className="text-gray-900">{ticket.name}</p>
                  <p className="text-gray-600 text-sm">{ticket.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Priority:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`ml-2 px-2 py-1 rounded text-xs font-medium border-0 ${getStatusColor(selectedStatus)}`}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Created:</span>
                  <p className="text-gray-900 text-sm">{formatDate(ticket.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Original Message */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Original Message</h3>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="whitespace-pre-wrap text-gray-700">{ticket.message}</div>
              </div>
            </div>

            {/* Conversation History */}
            {ticket.responses && ticket.responses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Conversation History</h3>
                <div className="space-y-4">
                  {ticket.responses.map((response, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-green-800">{response.adminName} (Admin)</span>
                        <span className="text-sm text-green-600">{formatDate(response.createdAt)}</span>
                      </div>
                      <div className="whitespace-pre-wrap text-green-700">{response.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reply Section */}
          <div className="lg:w-96 p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Send Reply</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reply Message
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response to the customer..."
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isReplying}
                />
              </div>

              <button
                onClick={handleReply}
                disabled={!replyMessage.trim() || isReplying}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isReplying ? 'Sending...' : 'Send Reply'}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setReplyMessage("Thank you for contacting us. We're reviewing your request and will get back to you shortly.")}
                  className="w-full text-left p-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Standard Acknowledgment
                </button>
                <button
                  onClick={() => setReplyMessage("We've resolved your issue. Please let us know if you need any further assistance.")}
                  className="w-full text-left p-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Resolution Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupportTicketModal