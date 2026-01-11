import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'
import { Story, GeneratedUserStory } from '@/lib/types'
import { ArrowLeft, FileText, ExternalLink, Calendar, Edit, Save, X, Loader2, Download } from 'lucide-react'

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedFinalStory, setEditedFinalStory] = useState<GeneratedUserStory | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      fetchStory()
    }
  }, [id])

  const fetchStory = async () => {
    try {
      const response = await api.get(`/stories/${id}`)
      setStory(response.data)
      // Initialize editedFinalStory from finalUserStory or generatedUserStory
      if (response.data.finalUserStory) {
        setEditedFinalStory({ ...response.data.finalUserStory })
      } else if (response.data.generatedUserStory) {
        setEditedFinalStory({ ...response.data.generatedUserStory })
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load story'
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

  const handleEdit = () => {
    if (story) {
      // Use finalUserStory if exists, otherwise use generatedUserStory as base
      const baseStory = story.finalUserStory || story.generatedUserStory
      if (baseStory) {
        setEditedFinalStory({ ...baseStory })
        setIsEditing(true)
      }
    }
  }

  const handleCancel = () => {
    if (story) {
      const baseStory = story.finalUserStory || story.generatedUserStory
      if (baseStory) {
        setEditedFinalStory({ ...baseStory })
      }
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!id || !editedFinalStory) return

    setSaving(true)
    setError('')

    try {
      const response = await api.put(`/stories/${id}`, {
        finalUserStory: editedFinalStory,
      })
      setStory(response.data)
      setIsEditing(false)
      toast({
        title: 'Success',
        description: 'Story updated successfully!',
        variant: 'success',
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save story'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof GeneratedUserStory, value: any) => {
    if (editedFinalStory) {
      setEditedFinalStory({
        ...editedFinalStory,
        [field]: value,
      })
    }
  }

  const updateAcceptanceCriteria = (index: number, value: string) => {
    if (editedFinalStory && editedFinalStory.acceptanceCriteria) {
      const updated = [...editedFinalStory.acceptanceCriteria]
      updated[index] = value
      setEditedFinalStory({
        ...editedFinalStory,
        acceptanceCriteria: updated,
      })
    }
  }

  const addAcceptanceCriteria = () => {
    if (editedFinalStory) {
      setEditedFinalStory({
        ...editedFinalStory,
        acceptanceCriteria: [
          ...(editedFinalStory.acceptanceCriteria || []),
          '',
        ],
      })
    }
  }

  // Initialize editedFinalStory if not exists
  useEffect(() => {
    if (story && !editedFinalStory) {
      const baseStory = story.finalUserStory || story.generatedUserStory
      if (baseStory) {
        setEditedFinalStory({
          userStory: baseStory.userStory || '',
          acceptanceCriteria: baseStory.acceptanceCriteria || [],
          notes: baseStory.notes || '',
        })
      }
    }
  }, [story])

  const removeAcceptanceCriteria = (index: number) => {
    if (editedFinalStory && editedFinalStory.acceptanceCriteria) {
      const updated = editedFinalStory.acceptanceCriteria.filter((_, i) => i !== index)
      setEditedFinalStory({
        ...editedFinalStory,
        acceptanceCriteria: updated,
      })
    }
  }

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await api.get('/files/download', {
        params: { url: fileUrl },
        responseType: 'blob',
      })
      
      // Create blob and download
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Success',
        description: `File "${fileName}" downloaded successfully`,
        variant: 'success',
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to download file'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading story...</div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">{error || 'Story not found'}</div>
      </div>
    )
  }

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => navigate('/stories')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Stories
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{story.title}</CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(story.createdAt).toLocaleDateString()}
              </span>
              <span className="px-2 py-1 bg-secondary rounded text-xs">
                {story.status}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {story.idea && (
              <div>
                <h3 className="font-semibold mb-2">Idea</h3>
                <p className="text-muted-foreground">{story.idea}</p>
              </div>
            )}
            {story.userRequirements && (
              <div>
                <h3 className="font-semibold mb-2">User Requirements</h3>
                <p className="text-muted-foreground">{story.userRequirements}</p>
              </div>
            )}
            {story.referenceLinks && story.referenceLinks.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Reference Links</h3>
                <ul className="space-y-1">
                  {story.referenceLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {link}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {story.attachedFiles && story.attachedFiles.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Attached Files
                </h3>
                <div className="space-y-2">
                  {story.attachedFiles.map((file, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        {file.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(file.url!, file.name)}
                            className="ml-4"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {story.generatedUserStory && (
          <Card>
            <CardHeader>
              <CardTitle>AI Generated User Story</CardTitle>
              <CardDescription>Read-only AI-generated content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">User Story</h3>
                <p className="text-muted-foreground">
                  {story.generatedUserStory.userStory}
                </p>
              </div>
              {story.generatedUserStory.acceptanceCriteria && (
                <div>
                  <h3 className="font-semibold mb-2">Acceptance Criteria</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {story.generatedUserStory.acceptanceCriteria.map(
                      (criteria, index) => (
                        <li key={index}>{criteria}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
              {story.generatedUserStory.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-muted-foreground">
                    {story.generatedUserStory.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(story.finalUserStory || story.generatedUserStory) && editedFinalStory && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Final User Story</CardTitle>
                  <CardDescription>Editable final version</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-semibold mb-2 block">User Story</Label>
                {isEditing ? (
                  <Textarea
                    value={editedFinalStory.userStory || ''}
                    onChange={(e) => updateField('userStory', e.target.value)}
                    rows={4}
                    className="w-full"
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {(story.finalUserStory || story.generatedUserStory)?.userStory}
                  </p>
                )}
              </div>
              <div>
                <Label className="font-semibold mb-2 block">Acceptance Criteria</Label>
                {isEditing ? (
                  <div className="space-y-2">
                    {editedFinalStory.acceptanceCriteria?.map((criteria, index) => (
                      <div key={index} className="flex gap-2">
                        <Textarea
                          value={criteria}
                          onChange={(e) => updateAcceptanceCriteria(index, e.target.value)}
                          rows={2}
                          className="flex-1"
                          placeholder="Enter acceptance criteria..."
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAcceptanceCriteria(index)}
                          className="text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addAcceptanceCriteria}
                      className="w-full"
                    >
                      + Add Criteria
                    </Button>
                  </div>
                ) : (
                  (story.finalUserStory || story.generatedUserStory)?.acceptanceCriteria && (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {(story.finalUserStory || story.generatedUserStory)?.acceptanceCriteria?.map(
                        (criteria, index) => (
                          <li key={index}>{criteria}</li>
                        )
                      )}
                    </ul>
                  )
                )}
              </div>
              <div>
                <Label className="font-semibold mb-2 block">Notes</Label>
                {isEditing ? (
                  <Textarea
                    value={editedFinalStory.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    className="w-full"
                    placeholder="Add notes (optional)..."
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {(story.finalUserStory || story.generatedUserStory)?.notes || 'No notes'}
                  </p>
                )}
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

