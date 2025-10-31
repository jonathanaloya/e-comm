import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { FaTicketAlt, FaClock, FaCheckCircle, FaExclamationTriangle, FaEye } from 'react-icons/fa'

const SupportTickets = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const user = useSelector(state => state.user)

  useEffect(() => {
    fetchSupportTickets()

    // Check for highlighted ticket from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const highlightTicketId = urlParams.get('ticket')
    if (highlightTicketId) {
      // Find and highlight the ticket after data loads
      setTimeout(() => {
        const ticketElement = document.querySelector(`[data-ticket-id="${highlightTicketId}"]`)
        if (ticketElement) {
          ticketElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          ticketElement.classList.add('bg-yellow-100', 'ring-2', 'ring-yellow-400')
          setTimeout(() => {
            ticketElement.classList.remove('bg-yellow-100', 'ring-2', 'ring-yellow-400')
          }, 3000)
        }
      }, 1000)
    }
  }, [])

  const fetchSupportTickets = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getUserSupportTickets
      })

      if (response.data.success) {
        setTickets(response.data.data.tickets)
      }
    } catch (error) {
      toast.error('Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await Axios({
        ...SummaryApi.getUserSupportTicketDetails,
        url: `${SummaryApi.getUserSupportTicketDetails.url}/${ticketId}`
      })

      if (response.data.success) {
        setSelectedTicket(response.data.data)
        setShowModal(true)
      }
    } catch (error) {
      toast.error('Failed to load ticket details')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <FaExclamationTriangle className="text-yellow-500" />
      case 'in-progress':
        return <FaClock className="text-blue-500" />
      case 'resolved':
        return <FaCheckCircle className="text-green-500" />
      case 'closed':
        return <FaCheckCircle className="text-gray-500" />
      default:
        return <FaTicketAlt className="text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <FaTicketAlt className="text-blue-600 text-2xl mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">My Support Tickets</h1>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <FaTicketAlt className="text-gray-400 text-6xl mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No support tickets yet</h3>
              <p className="text-gray-500 mb-6">When you need help, you can contact our support team.</p>
              <button
                onClick={() => window.location.href = '/contact'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.ticketId}
                  data-ticket-id={ticket.ticketId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => fetchTicketDetails(ticket.ticketId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="text-2xl mt-1">
                        {getStatusIcon(ticket.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {ticket.subject}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('-', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2 line-clamp-2">
                          {ticket.message}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Ticket #{ticket.ticketId}</span>
                          <span>{formatDate(ticket.createdAt)}</span>
                          {ticket.responses && ticket.responses.length > 0 && (
                            <span className="text-blue-600 font-medium">
                              {ticket.responses.length} response{ticket.responses.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaEye className="text-gray-400" />
                      <span className="text-gray-500 text-sm">View Details</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Support Ticket #{selectedTicket.ticketId}</h2>
                  <p className="text-blue-100 mt-1">{selectedTicket.subject}</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedTicket(null)
                  }}
                  className="text-white hover:text-blue-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Ticket Info */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Priority:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created:</span>
                    <p className="text-gray-900 text-sm">{formatDate(selectedTicket.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                    <p className="text-gray-900 text-sm">{formatDate(selectedTicket.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Original Message */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Message</h3>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="whitespace-pre-wrap text-gray-700">{selectedTicket.message}</div>
                </div>
              </div>

              {/* Responses */}
              {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Support Responses</h3>
                  <div className="space-y-4">
                    {selectedTicket.responses.map((response, index) => (
                      <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-green-800">{response.adminName} (Support Team)</span>
                          <span className="text-sm text-green-600">{formatDate(response.createdAt)}</span>
                        </div>
                        <div className="whitespace-pre-wrap text-green-700">{response.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Instructions */}
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <h4 className="font-medium text-yellow-800 mb-2">Need More Help?</h4>
                <p className="text-yellow-700 text-sm">
                  If you need to reply to this ticket or provide additional information,
                  please contact our support team directly through the contact form.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportTickets