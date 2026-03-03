import { useState } from 'react';
import { FileText, Edit2, Eye, MessageSquare, Calendar, Bell, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Template {
  id: string;
  name: string;
  type: 'initial_response' | 'booking_confirmation' | 'reminder' | 'follow_up' | 'escalation_notice';
  subject: string;
  content: string;
  description: string;
}

const defaultTemplates: Template[] = [
  {
    id: '1',
    name: 'Initial Response',
    type: 'initial_response',
    subject: 'Re: {{subject}}',
    content: `Hi {{name}},

Thank you for reaching out to {{business_name}}. 

I've received your enquiry and I'm here to help. Let me gather a few details to assist you better.

{{qualification_questions}}

Best regards,
Mila
{{business_name}}`,
    description: 'First response to new enquiries',
  },
  {
    id: '2',
    name: 'Booking Confirmation',
    type: 'booking_confirmation',
    subject: 'Booking Confirmed - {{business_name}}',
    content: `Hi {{name}},

Your appointment has been confirmed.

📅 Date: {{date}}
🕐 Time: {{time}}
📍 Location: {{location}}

If you need to reschedule, please let us know at least 24 hours in advance.

Looking forward to seeing you.

Best regards,
Mila
{{business_name}}`,
    description: 'Sent when an appointment is booked',
  },
  {
    id: '3',
    name: 'Appointment Reminder',
    type: 'reminder',
    subject: 'Reminder: Your appointment tomorrow',
    content: `Hi {{name}},

This is a friendly reminder about your appointment tomorrow.

📅 Date: {{date}}
🕐 Time: {{time}}

If you need to reschedule, please reply to this email or call us.

See you soon.

Best regards,
Mila
{{business_name}}`,
    description: 'Sent 24 hours before appointment',
  },
  {
    id: '4',
    name: 'Follow-up',
    type: 'follow_up',
    subject: 'How was your experience?',
    content: `Hi {{name}},

Thank you for choosing {{business_name}}. 

We hope you had a great experience. We'd love to hear your feedback.

{{review_link}}

If you have any questions or need to book again, just reply to this email.

Best regards,
Mila
{{business_name}}`,
    description: 'Sent after completed appointment',
  },
  {
    id: '5',
    name: 'Escalation Notice',
    type: 'escalation_notice',
    subject: 'Enquiry requires your attention',
    content: `Hi {{owner_name}},

I've received an enquiry that requires your attention.

From: {{customer_name}} ({{customer_email}})
Subject: {{subject}}

{{enquiry_summary}}

Please review and respond when you have a moment.

Best regards,
Mila`,
    description: 'Sent to owner when escalation is needed',
  },
];

const previewData = {
  name: 'John Smith',
  business_name: 'Your Business',
  subject: 'Service enquiry',
  date: 'Monday, January 15',
  time: '2:00 PM',
  location: '123 Main St',
};

export function TemplatesSettings() {
  const [templates] = useState<Template[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'initial_response':
        return <MessageSquare className="w-4 h-4" />;
      case 'booking_confirmation':
        return <Calendar className="w-4 h-4" />;
      case 'reminder':
        return <Bell className="w-4 h-4" />;
      case 'escalation_notice':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const renderPreview = (content: string) => {
    let preview = content;
    Object.entries(previewData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return preview;
  };

  return (
    <div className="space-y-6">
      {/* Brand Voice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Brand Voice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['professional', 'warm', 'minimal', 'luxury'] as const).map((voice) => (
              <button
                key={voice}
                className="p-3 rounded-lg border border-border hover:border-foreground/30 transition-all duration-200 text-left"
              >
                <p className="font-medium capitalize">{voice}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {voice === 'professional' && 'Formal and courteous'}
                  {voice === 'warm' && 'Friendly and approachable'}
                  {voice === 'minimal' && 'Short and direct'}
                  {voice === 'luxury' && 'Elegant and refined'}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <div className="space-y-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    {getTemplateIcon(template.type)}
                  </div>
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Subject: {template.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsEditing(false);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsEditing(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Dialog */}
      <Dialog 
        open={!!selectedTemplate} 
        onOpenChange={() => {
          setSelectedTemplate(null);
          setIsEditing(false);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Template' : 'Preview Template'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Template Name</Label>
                <input
                  type="text"
                  value={selectedTemplate.name}
                  disabled={!isEditing}
                  className="mila-input mt-1"
                />
              </div>
              
              <div>
                <Label>Subject Line</Label>
                <input
                  type="text"
                  value={selectedTemplate.subject}
                  disabled={!isEditing}
                  className="mila-input mt-1"
                />
              </div>
              
              <div>
                <Label>Content</Label>
                {isEditing ? (
                  <textarea
                    value={selectedTemplate.content}
                    className="w-full min-h-[300px] p-3 rounded-lg border border-input bg-background resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1 font-mono text-sm"
                  />
                ) : (
                  <div className="p-4 rounded-lg bg-secondary/50 mt-1 whitespace-pre-wrap text-sm">
                    {renderPreview(selectedTemplate.content)}
                  </div>
                )}
              </div>
              
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Available variables:</strong> {'{{name}}'}, {'{{business_name}}'}, 
                  {'{{subject}}'}, {'{{date}}'}, {'{{time}}'}, {'{{location}}'}
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setIsEditing(false);
                  }}
                >
                  Close
                </Button>
                {isEditing && (
                  <Button>Save changes</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
