import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Bot, FileText, MessageCircle, Clock, User, Lightbulb, X, Pencil, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'

interface Agent {
  _id: string
  name: string
  systemPrompt: string
  userId: string
  createdAt: string
  embeddingScript?: string
}

interface ChatMessage {
  sender: 'user' | 'agent' | 'System'
  message: string
  timestamp: string
  _id: string
}

interface Ticket {
  _id: string
  title: string
  description: string
  status: 'open' | 'closed'
  priority: 'low' | 'medium' | 'high'
  userId: string
  chatHistory: ChatMessage[]
  createdAt?: string
}

export default function AgentDetails() {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [agent, setAgent] = useState<Agent | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [suggestions, setSuggestions] = useState<string | null>(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState('')
  const [updatingPrompt, setUpdatingPrompt] = useState(false)

  useEffect(() => {
    if (agentId) {
      fetchAgentDetails()
      fetchTickets()
    }
  }, [agentId])

  useEffect(() => {
    if (agent) {
      setEditedPrompt(agent.systemPrompt)
    }
  }, [agent])

  const fetchAgentDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agents/${agentId}`)
      if (response.ok) {
        const data = await response.json()
        setAgent(data)
      }
    } catch (error) {
      console.error('Error fetching agent details:', error)
      toast({
        title: "Error",
        description: "Failed to fetch agent details.",
        variant: "destructive"
      })
    }
  }

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tickets/get-ticket-by-agent/${agentId}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      toast({
        title: "Error",
        description: "Failed to fetch tickets.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getSuggestions = async () => {
    if (!agentId) return
    
    try {
      setLoadingSuggestions(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/improve/improve-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.response)
      } else {
        toast({
          title: "Error",
          description: "Failed to get suggestions.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error getting suggestions:', error)
      toast({
        title: "Error",
        description: "Failed to get suggestions.",
        variant: "destructive"
      })
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const updateSystemPrompt = async () => {
    if (!agentId || !editedPrompt.trim()) return
    
    try {
      setUpdatingPrompt(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agents/update-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          systemPrompt: editedPrompt.trim(),
        }),
      })
      
      if (response.ok) {
        setAgent(prev => prev ? { ...prev, systemPrompt: editedPrompt.trim() } : null)
        setIsEditingPrompt(false)
        toast({
          title: "Success",
          description: "System prompt updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update system prompt.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating system prompt:', error)
      toast({
        title: "Error",
        description: "Failed to update system prompt.",
        variant: "destructive"
      })
    } finally {
      setUpdatingPrompt(false)
    }
  }

  const cancelEdit = () => {
    setEditedPrompt(agent?.systemPrompt || '')
    setIsEditingPrompt(false)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'closed': return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  if (loading && !agent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="animate-pulse">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {agent && (
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 bg-gradient-brand rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{agent.name}</h1>
              <p className="text-muted-foreground">AI Agent Details</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Info */}
        <div className="lg:col-span-1 space-y-6">
          {agent && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5" />
                    <span>Agent Information</span>
                  </div>
                  <Button
                    onClick={getSuggestions}
                    disabled={loadingSuggestions}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <Lightbulb className="w-4 h-4 mr-1" />
                    {loadingSuggestions ? 'Loading...' : 'Suggest Improvements'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="text-foreground">{agent.name}</p>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-muted-foreground">System Prompt</Label>
                    {!isEditingPrompt && (
                      <Button
                        onClick={() => setIsEditingPrompt(true)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  {isEditingPrompt ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editedPrompt}
                        onChange={(e) => setEditedPrompt(e.target.value)}
                        className="bg-chatbase-surface border-border text-foreground min-h-[120px] text-sm"
                        placeholder="Enter system prompt..."
                      />
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={updateSystemPrompt}
                          disabled={updatingPrompt || !editedPrompt.trim() || editedPrompt.trim() === agent.systemPrompt}
                          size="sm"
                          className="bg-gradient-brand text-white hover:opacity-90"
                        >
                          {updatingPrompt ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Update
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          disabled={updatingPrompt}
                          size="sm"
                          variant="outline"
                          className="border-border text-foreground hover:bg-chatbase-surface"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-foreground text-sm mt-1 leading-relaxed">{agent.systemPrompt}</p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Embedding Script</Label>
                  <div className="bg-chatbase-surface rounded-lg p-3 mt-1">
                    <code className="text-xs text-green-400 break-all">
                      {agent.embeddingScript || `<script src="https://chatbase.co/embed/${agent._id}"></script>`}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tickets List */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Conversations ({tickets.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-3 rounded-lg border cursor-pointer transition-smooth ${
                        selectedTicket?._id === ticket._id
                          ? 'bg-chatbase-surface border-primary'
                          : 'bg-chatbase-surface hover:bg-chatbase-surface-hover border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm truncate">
                          {ticket.title}
                        </h4>
                        <div className="flex space-x-1 ml-2">
                          <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{ticket.userId}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{ticket.chatHistory.length} messages</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-foreground">
                {selectedTicket ? `Chat: ${selectedTicket.title}` : 'Select a conversation'}
              </CardTitle>
              {selectedTicket && (
                <CardDescription>
                  {selectedTicket.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              {selectedTicket ? (
                <div className="flex-1 overflow-y-auto space-y-4 pr-4">
                  {selectedTicket.chatHistory.map((message, index) => (
                    <div
                      key={message._id || index}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-gradient-brand text-white'
                            : message.sender === 'System'
                            ? 'bg-muted text-muted-foreground text-center'
                            : 'bg-chatbase-surface text-foreground border border-border'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {message.sender === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : message.sender === 'agent' ? (
                            <Bot className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          <span className="text-xs font-medium capitalize">
                            {message.sender}
                          </span>
                          <span className="text-xs opacity-70">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a conversation to view the chat history
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Suggestions Modal */}
      {suggestions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <span>Agent Improvement Suggestions</span>
              </h3>
              <Button
                onClick={() => setSuggestions(null)}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="prose prose-sm max-w-none text-foreground">
                {suggestions.split('\n').map((line, index) => (
                  <p key={index} className="mb-2 text-sm leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}