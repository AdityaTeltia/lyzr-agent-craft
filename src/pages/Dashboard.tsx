import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Bot, FileText, MessageCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Agent {
  _id: string
  name: string
  systemPrompt: string
  userId: string
  createdAt: string
  ticketCount?: number
}

export default function Dashboard() {
  const { user } = useUser()
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAgents()
    }
  }, [user])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5001/api/agents/user/${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setAgents(data)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      )}
    </div>
  )
}