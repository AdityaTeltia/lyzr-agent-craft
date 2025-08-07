import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Upload, FileText, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function CreateAgent() {
  const { user } = useUser()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    systemPrompt: ''
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file.",
          variant: "destructive"
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.systemPrompt || !file) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and upload a PDF.",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('systemPrompt', formData.systemPrompt)
      formDataToSend.append('userId', user?.id || '')
      formDataToSend.append('file', file)

      const response = await fetch('http://localhost:5001/api/agents/create-agent', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your agent has been created successfully."
        })
        navigate('/dashboard')
      } else {
        throw new Error('Failed to create agent')
      }
    } catch (error) {
      console.error('Error creating agent:', error)
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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

      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Agent</h1>
        <p className="text-muted-foreground mt-2">
          Upload documents and configure your AI agent's behavior
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Agent Configuration</CardTitle>
          <CardDescription>
            Set up your agent's name, behavior, and knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Agent Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter agent name"
                className="bg-chatbase-surface border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt" className="text-foreground">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="You are a friendly and helpful support agent..."
                className="bg-chatbase-surface border-border text-foreground min-h-[120px]"
                required
              />
              <p className="text-sm text-muted-foreground">
                Define how your agent should behave and respond to users
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Upload Documents</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-chatbase-surface hover:bg-chatbase-surface-hover transition-smooth">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gradient-brand rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">
                        {file ? file.name : 'Drag & drop files here, or click to select files'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supported file types: pdf, doc, docx, txt
                      </p>
                    </div>
                  </div>
                </label>
              </div>
              {file && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Upload documents to train your AI agent. Extract text from PDFs, DOCX, and TXT files.
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="border-border text-foreground hover:bg-chatbase-surface"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-brand text-white hover:opacity-90 transition-smooth"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Agent...
                  </>
                ) : (
                  'Create Agent'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}