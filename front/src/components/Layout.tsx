import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { BookOpen, LogOut, Plus } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  onLogout: () => void
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    onLogout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/stories" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-xl font-bold">StoryForge</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/stories/generate">
                <Button variant="default" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Story
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

