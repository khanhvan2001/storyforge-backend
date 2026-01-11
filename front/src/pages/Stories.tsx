import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'
import { Story } from '@/lib/types'
import { BookOpen, Plus, Calendar, FileText } from 'lucide-react'

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Stories
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all your user stories
          </p>
        </div>
        <Link to="/stories/generate">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Generate New Story
          </Button>
        </Link>
      </div>

      {stories.length === 0 ? (
        <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">No stories yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by generating your first user story
            </p>
            <Link to="/stories/generate">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Story
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => {
            // Map status to color - same status = same color
            const getStatusColor = (status: string) => {
              const statusLower = status.toLowerCase()
              if (statusLower.includes('generated') || statusLower.includes('draft')) {
                return 'from-blue-500 to-cyan-500'
              } else if (statusLower.includes('review') || statusLower.includes('pending')) {
                return 'from-yellow-500 to-orange-500'
              } else if (statusLower.includes('approved') || statusLower.includes('accepted')) {
                return 'from-green-500 to-emerald-500'
              } else if (statusLower.includes('rejected') || statusLower.includes('declined')) {
                return 'from-red-500 to-rose-500'
              } else if (statusLower.includes('in-progress') || statusLower.includes('progress')) {
                return 'from-purple-500 to-pink-500'
              } else if (statusLower.includes('completed') || statusLower.includes('done')) {
                return 'from-indigo-500 to-blue-500'
              }
              // Default color for unknown status
              return 'from-gray-500 to-slate-500'
            }
            const colorClass = getStatusColor(story.status)
            return (
              <Link key={story.id} to={`/stories/${story.id}`}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-2 hover:border-blue-300 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
                    <CardTitle className="line-clamp-2 text-gray-800">{story.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      {new Date(story.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Status:</span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full bg-gradient-to-r ${colorClass} text-white font-medium`}>
                          {story.status}
                        </span>
                      </div>
                      {story.idea && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {story.idea}
                        </p>
                      )}
                      {story.attachedFiles && story.attachedFiles.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                          <FileText className="h-3 w-3" />
                          {story.attachedFiles.length} file(s) attached
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

