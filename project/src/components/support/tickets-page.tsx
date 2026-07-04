'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Headphones,
  Clock,
  CheckCircle,
  MessageSquare,
  User,
  Send,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { MOCK_TICKETS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  open: { label: 'Ouvert', color: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  waiting: { label: 'En attente', color: 'bg-slate-100 text-slate-700' },
  resolved: { label: 'Résolu', color: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Fermé', color: 'bg-slate-100 text-slate-700' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Basse', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Moyenne', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Haute', color: 'bg-red-100 text-red-700' },
};

export default function SupportTicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<typeof MOCK_TICKETS[0] | null>(null);
  const [message, setMessage] = useState('');

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Tickets de support"
          description="Gérez les demandes de support des utilisateurs"
          breadcrumbs={[
            { label: 'Support' },
            { label: 'Tickets' },
          ]}
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ouverts</p>
                  <p className="text-2xl font-bold text-amber-600">{MOCK_TICKETS.filter(t => t.status === 'open').length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En cours</p>
                  <p className="text-2xl font-bold text-blue-600">{MOCK_TICKETS.filter(t => t.status === 'in_progress' || t.status === 'waiting').length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Temps moyen</p>
                  <p className="text-2xl font-bold">2.3h</p>
                </div>
                <Clock className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Résolus (mois)</p>
                  <p className="text-2xl font-bold text-emerald-600">128</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tickets List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle>Tickets</CardTitle>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="open">Ouverts</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="waiting">En attente</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[450px]">
                <div className="space-y-2">
                  {MOCK_TICKETS.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={cn(
                        'rounded-lg border p-3 cursor-pointer transition-all hover:shadow-sm',
                        selectedTicket?.id === ticket.id && 'border-primary bg-primary/5'
                      )}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm line-clamp-1">{ticket.title}</p>
                        <Badge variant="outline" className={cn('text-[10px]', STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG].color)}>
                          {STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{ticket.userName}</span>
                        <span>•</span>
                        <Badge variant="outline" className={cn('text-[10px]', PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG].color)}>
                          {PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG].label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Ticket Detail & Conversation */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {selectedTicket ? selectedTicket.title : 'Sélectionnez un ticket'}
                  </CardTitle>
                  {selectedTicket && (
                    <CardDescription>
                      {selectedTicket.userName} ({selectedTicket.userType === 'eleve' ? 'Élève' : 'Parent'})
                    </CardDescription>
                  )}
                </div>
                {selectedTicket && (
                  <Select value={selectedTicket.status}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Ouvert</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="waiting">En attente</SelectItem>
                      <SelectItem value="resolved">Résolu</SelectItem>
                      <SelectItem value="closed">Fermé</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedTicket ? (
                <div className="space-y-4">
                  {/* Messages */}
                  <ScrollArea className="h-[300px] rounded-lg border p-4">
                    <div className="space-y-4">
                      {selectedTicket.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex gap-3',
                            msg.sender === 'support' && 'flex-row-reverse'
                          )}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={msg.sender === 'support' ? 'bg-primary text-white' : 'bg-slate-600 text-white'}>
                              {msg.sender === 'support' ? 'S' : selectedTicket.userName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            'rounded-lg p-3 max-w-[70%]',
                            msg.sender === 'support' ? 'bg-primary text-primary-foreground' : 'bg-slate-100'
                          )}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={cn(
                              'text-[10px] mt-1',
                              msg.sender === 'support' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            )}>
                              {new Date(msg.createdAt).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Reply */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Votre réponse..."
                      className="min-h-[60px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button className="h-auto">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Headphones className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Sélectionnez un ticket pour voir la conversation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
