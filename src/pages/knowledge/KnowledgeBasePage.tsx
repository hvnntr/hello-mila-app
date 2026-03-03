import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  MoreVertical,
  Edit2,
  Trash2,
  Tag,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FAQ } from '@/types';

export function KnowledgeBasePage() {
  const { user } = useAppStore();
  
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  
  // Form state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadFAQs = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      const { data } = await getFAQs(user.id);
      if (data) {
        setFaqs(data as unknown as FAQ[]);
        setFilteredFaqs(data as unknown as FAQ[]);
      }
      setIsLoading(false);
    };

    loadFAQs();
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredFaqs(faqs.filter(f =>
        f.question.toLowerCase().includes(query) ||
        f.answer.toLowerCase().includes(query) ||
        f.category?.toLowerCase().includes(query) ||
        f.tags.some(t => t.toLowerCase().includes(query))
      ));
    } else {
      setFilteredFaqs(faqs);
    }
  }, [faqs, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsSubmitting(true);
    
    if (editingFaq) {
      const { data, error } = await updateFAQ(editingFaq.id, {
        question,
        answer,
        category: category || null,
      });
      
      if (!error && data) {
        setFaqs(faqs.map(f => f.id === editingFaq.id ? data as unknown as FAQ : f));
        resetForm();
        setIsDialogOpen(false);
      }
    } else {
      const { data, error } = await createFAQ({
        user_id: user.id,
        question,
        answer,
        category: category || null,
        tags: [],
        active: true,
      });
      
      if (!error && data) {
        setFaqs([data as unknown as FAQ, ...faqs]);
        resetForm();
        setIsDialogOpen(false);
      }
    }
    
    setIsSubmitting(false);
  };

  const handleDelete = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    const { error } = await deleteFAQ(faqId);
    if (!error) {
      setFaqs(faqs.filter(f => f.id !== faqId));
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || '');
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setQuestion('');
    setAnswer('');
    setCategory('');
    setEditingFaq(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsDialogOpen(open);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading knowledge base...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            FAQs and information Mila uses to answer questions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Question</label>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What question should Mila answer?"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Answer</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="How should Mila respond?"
                  className="w-full min-h-[120px] p-3 rounded-lg border border-input bg-background resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category (optional)</label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Pricing, Services, Hours"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingFaq ? 'Save changes' : 'Add FAQ')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total FAQs</p>
            <p className="text-2xl font-semibold mt-1">{faqs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-semibold mt-1">
              {faqs.filter(f => f.active).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Times Used</p>
            <p className="text-2xl font-semibold mt-1">
              {faqs.reduce((sum, f) => sum + f.usage_count, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FAQs List */}
      {filteredFaqs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">
              {searchQuery ? 'No FAQs found' : 'No FAQs yet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchQuery 
                ? 'Try adjusting your search terms.'
                : 'Add FAQs to help Mila answer common questions accurately.'}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your first FAQ
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFaqs.map((faq) => (
            <Card key={faq.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base font-medium">
                        {faq.question}
                      </CardTitle>
                      {faq.category && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {faq.category}
                        </span>
                      )}
                      {!faq.active && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(faq)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(faq.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {faq.answer}
                </p>
                {faq.usage_count > 0 && (
                  <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                    <MessageSquare className="w-3 h-3" />
                    Used {faq.usage_count} times
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
