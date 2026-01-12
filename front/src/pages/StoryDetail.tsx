import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'
import { Story, GeneratedUserStory, Document } from '@/lib/types'
import { ArrowLeft, FileText, ExternalLink, Calendar, Edit, Save, X, Loader2, Download, Upload, Plus, Trash2, Eye } from 'lucide-react'

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedFinalStory, setEditedFinalStory] = useState<GeneratedUserStory | null>(null)
  const [showCreateDocument, setShowCreateDocument] = useState(false)
  const [documentTitle, setDocumentTitle] = useState('')
  const [documentContent, setDocumentContent] = useState('')
  const [documentFiles, setDocumentFiles] = useState<File[]>([])
  const [creatingDocument, setCreatingDocument] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      fetchStory()
      fetchDocuments()
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

  const fetchDocuments = async () => {
    if (!id) return
    setLoadingDocuments(true)
    try {
      const response = await api.get(`/stories/${id}/documents`)
      setDocuments(response.data)
    } catch (err: any) {
      // Silently fail - documents might not exist yet
      setDocuments([])
    } finally {
      setLoadingDocuments(false)
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

  const handleViewFile = async (fileUrl: string) => {
    try {
      const response = await api.get('/files/signed-url', {
        params: { url: fileUrl },
      })
      window.open(response.data.signedUrl, '_blank')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to open file'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (documentFiles.length + newFiles.length > 10) {
        toast({
          title: 'Error',
          description: 'Maximum 10 files allowed',
          variant: 'destructive',
        })
        return
      }
      setDocumentFiles([...documentFiles, ...newFiles])
    }
  }

  const removeDocumentFile = (index: number) => {
    setDocumentFiles(documentFiles.filter((_, i) => i !== index))
  }

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !documentTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Document title is required',
        variant: 'destructive',
      })
      return
    }

    setCreatingDocument(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('title', documentTitle)
      if (documentContent.trim()) {
        formData.append('contentText', documentContent)
      }
      formData.append('storyId', id)
      documentFiles.forEach((file) => {
        formData.append('files', file)
      })

      await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast({
        title: 'Success',
        description: 'Document created successfully!',
        variant: 'success',
      })

      // Reset form
      setDocumentTitle('')
      setDocumentContent('')
      setDocumentFiles([])
      setShowCreateDocument(false)
      // Refresh documents list
      fetchDocuments()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create document'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setCreatingDocument(false)
    }
  }

  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      await api.delete(`/documents/${documentId}`)
      toast({
        title: 'Success',
        description: 'Document deleted successfully!',
        variant: 'success',
      })
      // Refresh documents list
      fetchDocuments()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete document'
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
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/stories')}
          className="mb-6 hover:bg-blue-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stories
        </Button>

        <div className="space-y-6">
          <Card className="shadow-xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/50">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-3xl text-white">{story.title}</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2 text-blue-100">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(story.createdAt).toLocaleDateString()}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium">
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
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewFile(file.url!)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(file.url!, file.name)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
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
          <Card className="shadow-lg border-2 border-green-100 bg-gradient-to-br from-white to-green-50/50">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Final User Story</CardTitle>
                  <CardDescription className="text-green-100">Editable final version</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={handleEdit} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-white text-green-600 hover:bg-green-50">
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

        {/* Documents Section */}
        <Card className="shadow-lg border-2 border-orange-100 bg-gradient-to-br from-white to-orange-50/50">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Documentation</CardTitle>
                <CardDescription className="text-orange-100">Documents created for this story</CardDescription>
              </div>
              {!showCreateDocument && (
                <Button variant="outline" size="sm" onClick={() => setShowCreateDocument(true)} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Document
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingDocuments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents yet. Create your first document to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((document) => (
                  <Card key={document.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{document.title}</h3>
                        {document.contentText && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {document.contentText}
                          </p>
                        )}
                        {document.attachedFiles && document.attachedFiles.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Attached Files ({document.attachedFiles.length}):
                            </p>
                            <div className="space-y-2">
                              {document.attachedFiles.map((file, index) => (
                                <Card key={index} className="p-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        <p className="font-medium text-sm">{file.originalName}</p>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {(file.size / 1024).toFixed(2)} KB
                                      </p>
                                    </div>
                                    {file.url && (
                                      <div className="flex gap-2 ml-4">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleViewFile(file.url!)}
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          View
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDownload(file.url!, file.originalName)}
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          Download
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-3">
                          Created: {new Date(document.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            {showCreateDocument && (
              <div className="border-t pt-6 mt-6">
                <form onSubmit={handleCreateDocument} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentTitle">Document Title *</Label>
                  <Input
                    id="documentTitle"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    required
                    placeholder="e.g., Project Requirements Document"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentContent">Content (optional)</Label>
                  <Textarea
                    id="documentContent"
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    rows={5}
                    placeholder="Enter document content..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentFiles">Attach Files (optional, max 10)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="documentFiles"
                      type="file"
                      multiple
                      onChange={handleDocumentFileChange}
                      accept=".txt,.md,.pdf,.docx"
                      className="cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">
                      Supported: .txt, .md, .pdf, .docx
                    </span>
                  </div>
                  {documentFiles.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {documentFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-secondary rounded-md"
                        >
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocumentFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateDocument(false)
                      setDocumentTitle('')
                      setDocumentContent('')
                      setDocumentFiles([])
                    }}
                    disabled={creatingDocument}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatingDocument} className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white">
                    {creatingDocument ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Create Document
                      </>
                    )}
                  </Button>
                </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}

