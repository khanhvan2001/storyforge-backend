import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { ClarifyingQuestion } from '@/lib/types';
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function StoryGenerate() {
  const navigate = useNavigate();
  const [idea, setIdea] = useState('');
  const [userRequirements, setUserRequirements] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasRefined, setHasRefined] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 10) {
        const errorMessage = 'Maximum 10 files allowed';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleRefine = async () => {
    if (!idea || !userRequirements) {
      toast({
        title: 'Missing Information',
        description: 'Please enter an idea and user requirements first.',
        variant: 'destructive',
      });
      return;
    }

    setIsRefining(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('idea', idea);
      formData.append('userRequirements', userRequirements);
      if (referenceLinks) {
        formData.append('referenceLinks', referenceLinks);
      }
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await api.post('/stories/refine', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newQuestions: ClarifyingQuestion[] = response.data;
      if (newQuestions.length === 0) {
        toast({
          title: 'No Questions',
          description:
            'AI could not generate clarifying questions. Try adding more detail.',
          variant: 'default',
        });
        return;
      }

      setQuestions(newQuestions);
      setShowQuestions(true);

      // Initialize empty answers
      const initialAnswers: Record<string, string> = {};
      newQuestions.forEach((q) => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
      return true;
    } catch (err: any) {
      console.error(err);
      // Optional: don't show error to user if this was an auto-trigger, just return false
      return false;
    } finally {
      setIsRefining(false);
    }
  };

  const handleApplyRefinement = () => {
    let refinementText = '\n\n--- User Clarifications ---\n';
    let hasAnswers = false;

    questions.forEach((q, index) => {
      let answer = answers[q.id];
      if (answer) {
        // Format array selection for display (stored as ||| separated)
        if (answer.includes('|||')) {
          const parts = answer.split('|||');
          // Clean up "Other: " prefix if present in text
          const cleanParts = parts.map((p) => (p.startsWith('Other:') ? p : p));
          answer = cleanParts.join(', ');
        }
        refinementText += `\nQ${index + 1}: ${q.question_text}\nA: ${answer}\n`;
        hasAnswers = true;
      }
    });

    if (hasAnswers) {
      setUserRequirements((prev) => prev + refinementText);
      toast({
        title: 'Refinement Applied',
        description: 'Answers have been added to your requirements.',
        variant: 'success',
      });
      setShowQuestions(false);
      setQuestions([]);
    } else {
      setShowQuestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Auto-refinement check
    if (!hasRefined && !showQuestions) {
      const foundQuestions = await handleRefine();
      if (foundQuestions) {
        setHasRefined(true); // Mark as tried so we don't loop forever if they skip later (need separate logic for skip)
        // Actually, if we found questions, we stop here and let the user answer or skip.
        return;
      }
      // If no questions found or error, proceed to generate
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('idea', idea);
      formData.append('userRequirements', userRequirements);
      if (referenceLinks) {
        formData.append('referenceLinks', referenceLinks);
      }
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await api.post('/stories/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Success',
        description: 'Story generated successfully!',
        variant: 'success',
      });
      navigate(`/stories/${response.data.id}`);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to generate story';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle className="text-2xl text-white">
              Generate New User Story
            </CardTitle>
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
                <Label htmlFor="referenceLinks">
                  Reference Links (optional)
                </Label>
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

              {/* Refinement Section */}
              {!showQuestions && (
                <div className="flex justify-start pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRefine}
                    disabled={
                      isRefining || loading || !idea || !userRequirements
                    }
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 transition-all hover:scale-105"
                  >
                    {isRefining ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Refine with AI
                  </Button>
                </div>
              )}

              {showQuestions && questions.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-6 animate-in fade-in slide-in-from-top-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-purple-900 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                      Clarifying Questions
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowQuestions(false)}
                      className="h-8 w-8 p-0 hover:bg-purple-200"
                    >
                      <X className="h-4 w-4 text-purple-700" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {questions.map((q, index) => (
                      <div
                        key={q.id}
                        className="bg-white p-4 rounded-md shadow-sm border border-purple-100 transition-all hover:shadow-md"
                      >
                        <Label className="text-base font-medium mb-3 block text-purple-900 selection:bg-purple-100">
                          {index + 1}. {q.question_text}
                        </Label>

                        {q.type === 'single_choice' ? (
                          <div className="space-y-2">
                            {q.options.map((option, idx) => {
                              const isLastOption = idx === q.options.length - 1;
                              // Check selection. If last option, check if answer starts with 'Other:'
                              // For standard options, exact match.
                              const isSelected = isLastOption
                                ? answers[q.id]?.startsWith('Other:')
                                : answers[q.id] === option;

                              return (
                                <div key={option} className="space-y-2">
                                  <div
                                    className="flex items-center space-x-2 p-2 hover:bg-purple-50 rounded-md cursor-pointer"
                                    onClick={() => {
                                      if (isLastOption) {
                                        // Don't overwrite if already typing in Other
                                        if (
                                          !answers[q.id]?.startsWith('Other:')
                                        ) {
                                          setAnswers({
                                            ...answers,
                                            [q.id]: 'Other: ',
                                          });
                                        }
                                      } else {
                                        setAnswers({
                                          ...answers,
                                          [q.id]: option,
                                        });
                                      }
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      id={`${q.id}-${option}`}
                                      name={q.id}
                                      value={option}
                                      checked={!!isSelected}
                                      onChange={() => {}} // handled by div click
                                      className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer"
                                    />
                                    <Label
                                      htmlFor={`${q.id}-${option}`}
                                      className="font-normal cursor-pointer flex-1"
                                    >
                                      {option}
                                    </Label>
                                  </div>

                                  {/* Show input ONLY if it is the last option ("Other") and it is selected */}
                                  {isLastOption && isSelected && (
                                    <Input
                                      value={
                                        answers[q.id]?.replace('Other: ', '') ||
                                        ''
                                      }
                                      onChange={(e) =>
                                        setAnswers({
                                          ...answers,
                                          [q.id]: `Other: ${e.target.value}`,
                                        })
                                      }
                                      className="ml-6 w-[90%] mt-1"
                                      placeholder="Please specify..."
                                      autoFocus
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {q.options.map((option, idx) => {
                              const currentAnswers = answers[q.id]
                                ? answers[q.id].split('|||')
                                : [];
                              const isLastOption = idx === q.options.length - 1;

                              // For last option ("Other"), is selected if currentAnswers contains something starting with "Other:"
                              // For normal options, exact match in array
                              const isSelected = isLastOption
                                ? currentAnswers.some((a) =>
                                    a.startsWith('Other:'),
                                  )
                                : currentAnswers.includes(option);

                              return (
                                <div key={option} className="space-y-2">
                                  <div
                                    className="flex items-center space-x-2 p-2 hover:bg-purple-50 rounded-md cursor-pointer"
                                    onClick={() => {
                                      let newAnswers = [...currentAnswers];
                                      const isChecked = isSelected;
                                      // Toggle logic
                                      if (!isChecked) {
                                        if (isLastOption) {
                                          newAnswers.push('Other: ');
                                        } else {
                                          newAnswers.push(option);
                                        }
                                      } else {
                                        if (isLastOption) {
                                          newAnswers = newAnswers.filter(
                                            (a) => !a.startsWith('Other:'),
                                          );
                                        } else {
                                          newAnswers = newAnswers.filter(
                                            (a) => a !== option,
                                          );
                                        }
                                      }
                                      setAnswers({
                                        ...answers,
                                        [q.id]: newAnswers.join('|||'),
                                      });
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      id={`${q.id}-${option}`}
                                      checked={!!isSelected}
                                      onChange={() => {}} // handled by div click
                                      className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer rounded"
                                    />
                                    <Label
                                      htmlFor={`${q.id}-${option}`}
                                      className="font-normal cursor-pointer flex-1"
                                    >
                                      {option}
                                    </Label>
                                  </div>

                                  {/* Show input ONLY if it is the last option and selected */}
                                  {isLastOption && isSelected && (
                                    <Input
                                      value={
                                        currentAnswers
                                          .find((a) => a.startsWith('Other:'))
                                          ?.replace('Other: ', '') || ''
                                      }
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const newAnswers = currentAnswers.map(
                                          (a) =>
                                            a.startsWith('Other:')
                                              ? `Other: ${val}`
                                              : a,
                                        );
                                        setAnswers({
                                          ...answers,
                                          [q.id]: newAnswers.join('|||'),
                                        });
                                      }}
                                      className="ml-6 w-[90%] mt-1"
                                      placeholder="Please specify..."
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-purple-200 mt-4 gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowQuestions(false);
                        // Make sure we don't auto-trigger again immediately if they click Generate
                        setHasRefined(true);
                        // Automatically submit the form to generate story?
                        // No, let them click Generate again to be safe/explicit, or auto-submit.
                        // Let's auto-submit for better UX:
                        // We need to bypass the check in handleSubmit.
                        // Setting hasRefined=true does that.
                        // We can't easily call handleSubmit(e) here without the event.
                        // So just let them click Generate Story again.
                        toast({
                          description:
                            'Refinement skipped. Click Generate Story to proceed.',
                        });
                      }}
                      className="text-muted-foreground hover:text-purple-900"
                    >
                      Skip & Generate Original
                    </Button>
                    <Button
                      type="button"
                      onClick={handleApplyRefinement}
                      className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 hover:shadow-xl transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Apply & Continue
                    </Button>
                  </div>
                </div>
              )}

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
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
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
  );
}
