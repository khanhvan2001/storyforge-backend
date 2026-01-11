import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'
import { Story } from '@/lib/types'
import { BookOpen, Plus, Calendar } from 'lucide-react'

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const response = await api.get('/stories')
      setStories(response.data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load stories'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading stories...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Stories</h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all your user stories
          </p>
        </div>
        <Link to="/stories/generate">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generate New Story
          </Button>
        </Link>
      </div>

      {stories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by generating your first user story
            </p>
            <Link to="/stories/generate">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Story
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <Link key={story.id} to={`/stories/${story.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{story.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(story.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Status:</span>
                      <span className="ml-2 text-xs px-2 py-1 bg-secondary rounded">
                        {story.status}
                      </span>
                    </div>
                    {story.idea && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {story.idea}
                      </p>
                    )}
                    {story.attachedFiles && story.attachedFiles.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {story.attachedFiles.length} file(s) attached
                      </div>
                    )}
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

