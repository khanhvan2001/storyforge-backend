export interface User {
  id: number;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface GeneratedUserStory {
  userStory: string;
  acceptanceCriteria: string[];
  notes?: string;
}

export interface AttachedFile {
  name: string;
  size: number;
  snippet?: string;
  url?: string;
}

export interface Story {
  id: number;
  title: string;
  status: string;
  userId: number;
  idea?: string;
  userRequirements?: string;
  attachedFiles?: AttachedFile[];
  referenceLinks?: string[];
  generatedUserStory?: GeneratedUserStory;
  finalUserStory?: GeneratedUserStory;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: number;
  title: string;
  contentText?: string;
  storyId: number;
  attachedFiles?: Array<{
    originalName: string;
    key: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

