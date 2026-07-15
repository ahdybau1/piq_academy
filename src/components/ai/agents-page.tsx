'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Activity, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Cpu, Clock, ChartBar as BarChart3 } from 'lucide-react';
import { MOCK_AI_AGENTS, MOCK_AI_RECORDS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const AGENT_TYPE_CONFIG = {
  structuring: { label: 'Structuration', color: 'bg-blue-100 text-blue-700' },
  exercise_generation: { label: 'Generation exercices', color: 'bg-emerald-100 text-emerald-700' },
  moderation: { label: 'Moderation', color: 'bg-violet-100 text-violet-700' },
  ocr: { label: 'OCR', color: 'bg-amber-100 text-amber-700' },
};

export default function AIAgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<typeof MOCK_AI_AGENTS[0] | null>(null);

  const totalProcessed = MOCK_AI_AGENTS.reduce((acc, a) => acc + a.totalProcessed, 0);
  const successRate = 94.7;

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Suivi des agents IA"
          description="Historique des traitements et performance des agents"
          breadcrumbs={[
            { label: 'Intelligence Artificielle' },
            { label: 'Suivi des agents IA' },
          ]}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Agents actifs</p>
                  <p className="text-2xl font-bold">{MOCK_AI_AGENTS.filter(a => a.status === 'active').length}</p>
                </div>
                <Brain className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Traitements total</p>
                  <p className="text-2xl font-bold">{totalProcessed.toLocaleString('fr-FR')}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de succes</p>
                  <p className="text-2xl font-bold text-emerald-600">{successRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Echecs (mois)</p>
                  <p className="text-2xl font-bold text-red-600">847</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Agents IA</CardTitle>
              <CardDescription>Liste des agents actifs et leur performance</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Traitements</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Derniere activite</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_AI_AGENTS.map((agent) => (
                    <TableRow
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={cn('cursor-pointer', selectedAgent?.id === agent.id && 'bg-primary/5')}
                    >
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={AGENT_TYPE_CONFIG[agent.type as keyof typeof AGENT_TYPE_CONFIG].color}>
                          {AGENT_TYPE_CONFIG[agent.type as keyof typeof AGENT_TYPE_CONFIG].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={agent.provider === 'claude' ? 'default' : 'secondary'}>
                          {agent.provider === 'claude' ? 'Claude' : 'Gemini'}
                        </Badge>
                      </TableCell>
                      <TableCell>{agent.totalProcessed.toLocaleString('fr-FR')}</TableCell>
                      <TableCell>
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className={agent.status === 'active' ? 'bg-emerald-600' : ''}>
                          {agent.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {agent.lastActivity ? new Date(agent.lastActivity).toLocaleString('fr-FR') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details agent</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAgent ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Cpu className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{selectedAgent.name}</p>
                      <Badge variant="outline" className={AGENT_TYPE_CONFIG[selectedAgent.type as keyof typeof AGENT_TYPE_CONFIG].color}>
                        {AGENT_TYPE_CONFIG[selectedAgent.type as keyof typeof AGENT_TYPE_CONFIG].label}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider</span>
                      <Badge variant={selectedAgent.provider === 'claude' ? 'default' : 'secondary'}>
                        {selectedAgent.provider === 'claude' ? 'Claude' : 'Gemini'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut</span>
                      <Badge variant={selectedAgent.status === 'active' ? 'default' : 'secondary'} className={selectedAgent.status === 'active' ? 'bg-emerald-600' : ''}>
                        {selectedAgent.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total traite</span>
                      <span className="font-medium">{selectedAgent.totalProcessed.toLocaleString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Taux de succes</span>
                      <span className="font-medium">95.2%</span>
                    </div>
                    <Progress value={95.2} className="h-2" />
                  </div>

                  <Button variant="outline" className="w-full">
                    Voir l historique complet
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Selectionnez un agent</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historique des traitements</CardTitle>
            <CardDescription>Les derniers traitements effectues par les agents</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tokens entree</TableHead>
                  <TableHead>Tokens sortie</TableHead>
                  <TableHead>Cout</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_AI_RECORDS.slice(0, 8).map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.agentName}</TableCell>
                    <TableCell>{record.type}</TableCell>
                    <TableCell>{record.inputTokens.toLocaleString('fr-FR')}</TableCell>
                    <TableCell>{record.outputTokens.toLocaleString('fr-FR')}</TableCell>
                    <TableCell>${record.cost.toFixed(3)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={record.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}>
                        {record.status === 'success' ? 'Succes' : 'Echec'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(record.createdAt).toLocaleString('fr-FR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
