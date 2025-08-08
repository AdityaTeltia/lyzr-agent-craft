import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Bot, FileText, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Agent {
  _id: string
  name: string
  systemPrompt: string
  userId: string
  createdAt: string
  ticketCount?: number
}

interface Ticket {
  _id: string
  agent: string
  userId: string
  createdAt: string
  updatedAt: string
  status: string
  chatHistory: any[]
  title: string
  description: string
  priority: string
}

interface SentimentData {
  turn_number: number
  speaker: string
  text: string
  sentiment: string
  sentiment_score: number
  emotion: string
}

export default function Dashboard() {
  const { user } = useUser()
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [showAllTickets, setShowAllTickets] = useState(false)
  const [sentimentData, setSentimentData] = useState<any>(null)
  const [sentimentLoading, setSentimentLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAgents()
      fetchTickets()
    }
  }, [user])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agents/user/${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        // Fetch ticket count for each agent
        const agentsWithTicketCount = await Promise.all(
          data.map(async (agent: Agent) => {
            try {
              const ticketResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tickets/get-ticket-by-agent/${agent._id}`)
              if (ticketResponse.ok) {
                const ticketData = await ticketResponse.json()
                return { ...agent, ticketCount: ticketData.length || 0 }
              }
              return { ...agent, ticketCount: 0 }
            } catch (error) {
              console.error('Error fetching ticket count for agent:', agent._id, error)
              return { ...agent, ticketCount: 0 }
            }
          })
        )
        setAgents(agentsWithTicketCount)
      } else {
        console.error('Failed to fetch agents')
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast({
        title: "Error",
        description: "Failed to fetch agents. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTickets = async () => {
    try {
      setTicketsLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tickets/get-all-tickets`)
      if (response.ok) {
        const data = await response.json()
        setTickets(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch tickets')
        setTickets([])
        toast({
          title: "Warning",
          description: "Could not load tickets. The tickets service may be unavailable.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      setTickets([])
      toast({
        title: "Error",
        description: "Failed to fetch tickets. Please check your connection.",
        variant: "destructive"
      })
    } finally {
      setTicketsLoading(false)
    }
  }

  const fetchSentimentData = async (agentId: string) => {
    try {
      setSentimentLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/improve/sentiment-graph`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId }),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.response) {
          const parsedResponse = JSON.parse(data.response)
          setSentimentData(parsedResponse.sentiment_analysis)
        } else {
          setSentimentData(null)
          toast({
            title: "Info",
            description: "No sentiment data available for this agent.",
            variant: "default"
          })
        }
      } else {
        console.error('Failed to fetch sentiment data')
        setSentimentData(null)
        toast({
          title: "Warning",
          description: "Could not load sentiment data. The service may be unavailable.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching sentiment data:', error)
      setSentimentData(null)
      toast({
        title: "Error",
        description: "Failed to fetch sentiment data. Please check your connection.",
        variant: "destructive"
      })
    } finally {
      setSentimentLoading(false)
    }
  }

  const displayedTickets = showAllTickets ? tickets : tickets.slice(0, 5)

  const getChartData = () => {
    if (!sentimentData || !sentimentData.sentiment_trend) return null

    const labels = sentimentData.sentiment_trend.map((item: SentimentData) => `Turn ${item.turn_number}`)
    const data = sentimentData.sentiment_trend.map((item: SentimentData) => item.sentiment_score)

    return {
      labels,
      datasets: [
        {
          label: 'Sentiment Score',
          data,
          borderColor: 'white',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          tension: 0.1,
          pointBackgroundColor: 'white',
          pointBorderColor: 'white',
        },
      ],
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white'
        }
      },
      title: {
        display: true,
        text: 'Conversation Sentiment Trend',
        color: 'white'
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        beginAtZero: true,
        max: 1,
        min: -1,
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
    },
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Agents</h1>
            <p className="text-muted-foreground mt-2">Manage your AI agents and their conversations</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border-border animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Agents</h1>
          <p className="text-muted-foreground mt-2">Manage your AI agents and their conversations</p>
        </div>
        <Link to="/create-agent">
          <Button className="bg-gradient-brand text-white hover:opacity-90 transition-smooth">
            <Plus className="w-4 h-4 mr-2" />
            Add Agent
          </Button>
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-chatbase-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Agents Created</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get started by creating your first AI agent. Upload documents and customize the behavior to match your needs.
          </p>
          <Link to="/create-agent">
            <Button className="bg-gradient-brand text-white hover:opacity-90 transition-smooth">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Agent
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {agents.map((agent) => (
              <Link key={agent._id} to={`/agent/${agent._id}`}>
                <Card className="bg-card border-border hover:bg-chatbase-surface-hover transition-smooth cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-brand rounded-lg flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-foreground">{agent.name}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            AI Agent
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {agent.systemPrompt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>Documents</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{agent.ticketCount || 0} chats</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-chatbase-surface text-foreground">
                        Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Your Tickets Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Your Tickets</h2>
            {ticketsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-card border-border animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Tickets Found</h3>
                  <p className="text-muted-foreground">No conversation tickets have been created yet.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {displayedTickets.map((ticket) => {
                    const agent = agents.find(a => a._id === ticket.agent)
                    return (
                      <Card key={ticket._id} className="bg-card border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">
                                  {agent?.name || 'Unknown Agent'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {ticket.chatHistory?.length || 0} messages
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                                {ticket.status}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(ticket.chatHistory?.[0]?.timestamp || ticket.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
                
                {tickets.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllTickets(!showAllTickets)}
                      className="flex items-center space-x-2"
                    >
                      {showAllTickets ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span>Show Less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>Show More</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sentiment Graph Section */}
          {agents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Sentiment Graph</h2>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Agent for Sentiment Analysis
                    </label>
                    <select
                      className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                      onChange={(e) => e.target.value && fetchSentimentData(e.target.value)}
                      defaultValue=""
                    >
                      <option value="">Select an agent...</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {sentimentLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : sentimentData ? (
                    <div>
                      <div className="mb-4">
                        <h4 className="font-medium text-foreground mb-2">Conversation Summary</h4>
                        <p className="text-sm text-muted-foreground">{sentimentData.summary}</p>
                      </div>
                      <div className="h-64">
                        <Line data={getChartData()!} options={chartOptions} />
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium text-foreground mb-2">Sentiment Details</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {sentimentData.sentiment_trend?.map((item: SentimentData, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div>
                                <span className="font-medium text-sm">Turn {item.turn_number} - {item.speaker}</span>
                                <p className="text-xs text-muted-foreground truncate max-w-md">{item.text}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant={item.sentiment === 'Positive' ? 'default' : item.sentiment === 'Negative' ? 'destructive' : 'secondary'}>
                                  {item.sentiment}
                                </Badge>
                                <p className="text-xs text-muted-foreground">{item.emotion}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select an agent to view sentiment analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}