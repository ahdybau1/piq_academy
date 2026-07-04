'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  MessageSquare,
  User,
  Flag,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  UserX,
} from 'lucide-react';
import { MOCK_FORUM_REPORTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Résolu', color: 'bg-emerald-100 text-emerald-700' },
  dismissed: { label: 'Ignoré', color: 'bg-slate-100 text-slate-700' },
};

export default function ForumModerationPage() {
  const [selectedReport, setSelectedReport] = useState<typeof MOCK_FORUM_REPORTS[0] | null>(null);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Modération Forum"
          description="Gérez les signalements et modérez le contenu du forum"
          breadcrumbs={[
            { label: 'Engagement' },
            { label: 'Forum' },
          ]}
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Signalements en attente</p>
                  <p className="text-2xl font-bold text-amber-600">{MOCK_FORUM_REPORTS.filter(r => r.status === 'pending').length}</p>
                </div>
                <Flag className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Messages modérés (mois)</p>
                  <p className="text-2xl font-bold">127</p>
                </div>
                <Trash2 className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs avertis</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Comptes suspendus</p>
                  <p className="text-2xl font-bold text-red-600">8</p>
                </div>
                <UserX className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Reports List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Signalements récents</CardTitle>
              <CardDescription>Cliquez sur un signalement pour voir le contexte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_FORUM_REPORTS.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={cn(
                      'rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md',
                      selectedReport?.id === report.id && 'border-primary bg-primary/5'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">Signalé par {report.reportedBy}</span>
                      </div>
                      <Badge variant="outline" className={STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG].color}>
                        {STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {report.reason}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detail Panel */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedReport ? 'Contexte du message' : 'Sélectionnez un signalement'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedReport ? (
                <div className="space-y-4">
                  {/* Author */}
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-red-600 text-white">!</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Utilisateur signalé</p>
                      <p className="text-xs text-muted-foreground">ID message: {selectedReport.messageId}</p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <p className="text-sm font-medium mb-1">Raison du signalement</p>
                    <p className="text-sm text-muted-foreground">{selectedReport.reason}</p>
                  </div>

                  {/* Messages Context */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Contexte</p>
                    <div className="space-y-2">
                      {selectedReport.context.beforeMessages.map((msg, idx) => (
                        <div key={idx} className="rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground">
                          {msg}
                        </div>
                      ))}
                      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-3 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          <span className="text-xs font-medium text-red-600">Message signalé</span>
                        </div>
                        {selectedReport.context.reportedMessage}
                      </div>
                      {selectedReport.context.afterMessages.map((msg, idx) => (
                        <div key={idx} className="rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground">
                          {msg}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4 space-y-2">
                    {selectedReport.status === 'pending' && (
                      <>
                        <Button className="w-full bg-red-600 hover:bg-red-700">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer le message
                        </Button>
                        <Button variant="outline" className="w-full">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Avertir l'utilisateur
                        </Button>
                        <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                          <UserX className="h-4 w-4 mr-2" />
                          Suspendre l'utilisateur
                        </Button>
                        <Button variant="ghost" className="w-full">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ignorer le signalement
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Sélectionnez un signalement pour voir le contexte</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
