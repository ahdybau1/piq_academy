'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  BookOpen,
  Clock,
  Award,
} from 'lucide-react';
import { MOCK_STATS } from '@/lib/mock-data';
import { useApp } from '@/lib/app-context';
import { ROLE_CONFIGS } from '@/lib/roles-config';

export default function StatisticsPage() {
  const { currentUser } = useApp();
  const roleConfig = ROLE_CONFIGS[currentUser.role];

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Statistiques"
          description="Tableaux de bord et métriques de la plateforme"
          breadcrumbs={[
            { label: 'Système' },
            { label: 'Statistiques' },
          ]}
          actions={
            <Select defaultValue="month">
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        {/* Main Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold">{MOCK_STATS.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600">+12.5% ce mois</p>
                </div>
                <Users className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de renouvellement</p>
                  <p className="text-2xl font-bold">{MOCK_STATS.renewalRate}%</p>
                  <p className="text-xs text-emerald-600">+2.3%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de réussite</p>
                  <p className="text-2xl font-bold">{MOCK_STATS.successRate}%</p>
                  <p className="text-xs text-muted-foreground">Exercices complétés</p>
                </div>
                <Award className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Temps moyen/session</p>
                  <p className="text-2xl font-bold">24 min</p>
                  <p className="text-xs text-muted-foreground">Par utilisateur</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Stats - Super Admin Only */}
        {roleConfig.canViewFinancials && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenus mensuels</p>
                    <p className="text-2xl font-bold">42.1M FCFA</p>
                    <p className="text-xs text-emerald-600">+8.3%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-emerald-500/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ARPU</p>
                    <p className="text-2xl font-bold">5,005 FCFA</p>
                    <p className="text-xs text-muted-foreground">Par utilisateur</p>
                  </div>
                  <Activity className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Nouveaux abonnés</p>
                    <p className="text-2xl font-bold">1,247</p>
                    <p className="text-xs text-amber-600">-3.2%</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Dons du mois</p>
                    <p className="text-2xl font-bold">850K FCFA</p>
                    <p className="text-xs text-emerald-600">+15%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-pink-500/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Content Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Contenu pédagogique</CardTitle>
              <CardDescription>Volume de contenu par type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cours</span>
                    <span className="font-medium">{MOCK_STATS.contentStats.lessons.toLocaleString()}</span>
                  </div>
                  <Progress value={70} className="h-3 [&>div]:bg-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Exercices</span>
                    <span className="font-medium">{MOCK_STATS.contentStats.exercises.toLocaleString()}</span>
                  </div>
                  <Progress value={90} className="h-3 [&>div]:bg-emerald-500" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Examens officiels</span>
                    <span className="font-medium">{MOCK_STATS.contentStats.exams}</span>
                  </div>
                  <Progress value={20} className="h-3 [&>div]:bg-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Content */}
          <Card>
            <CardHeader>
              <CardTitle>Contenu le plus consulté</CardTitle>
              <CardDescription>Top 5 des contenus ce mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MOCK_STATS.topContent.map((content, index) => (
                  <div key={content.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{content.title}</p>
                      <p className="text-xs text-muted-foreground">{content.views.toLocaleString()} vues</p>
                    </div>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Users Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs actifs par jour</CardTitle>
            <CardDescription>Évolution sur les 10 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-[150px]">
              {MOCK_STATS.dailyActiveUsers.map((count, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/20 rounded-t transition-all hover:bg-primary/40"
                    style={{ height: `${(count / 12000) * 100}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">J{index + 1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
