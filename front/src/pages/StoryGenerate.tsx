import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react'

export default function StoryGenerate() {
  const navigate = useNavigate()
  const [idea, setIdea] = useState('')
  const [userRequirements, setUserRequirements] = useState('')
  const [referenceLinks, setReferenceLinks] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (files.length + newFiles.length > 10) {
        const errorMessage = 'Maximum 10 files allowed'
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
        return
      }
      setFiles([...files, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('idea', idea)
      formData.append('userRequirements', userRequirements)
      if (referenceLinks) {
        formData.append('referenceLinks', referenceLinks)
      }
      files.forEach((file) => {
        formData.append('files', file)
      })

      const response = await api.post('/stories/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast({
        title: 'Success',
        description: 'Story generated successfully!',
        variant: 'success',
      })
      navigate(`/stories/${response.data.id}`)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to generate story'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/stories')}
          className="mb-6 hover:bg-blue-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stories
        </Button>

        <Card className="shadow-2xl border-2 border-blue-100 bg-white/95 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-white">Generate New User Story</CardTitle>
            <CardDescription className="text-blue-100">
              Use AI to generate a user story from your idea and requirements
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="idea">Story Idea *</Label>
              <Input
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                required
                placeholder="e.g., User wants to implement a login feature"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userRequirements">User Requirements *</Label>
              <textarea
                id="userRequirements"
                value={userRequirements}
                onChange={(e) => setUserRequirements(e.target.value)}
                required
                rows={5}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe the requirements in detail..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceLinks">Reference Links (optional)</Label>
              <Input
                id="referenceLinks"
                value={referenceLinks}
                onChange={(e) => setReferenceLinks(e.target.value)}
                placeholder="Comma-separated URLs: https://example.com/docs, https://example.com/api"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple links with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Attach Files (optional, max 10)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".txt,.md,.pdf,.docx"
                  className="cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  Supported: .txt, .md, .pdf, .docx
                </span>
              </div>
              {files.length > 0 && (
                <div className="space-y-2 mt-4">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-secondary rounded-md"
                    >
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/stories')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Generate Story
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}

