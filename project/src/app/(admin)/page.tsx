'use client';

import React from 'react';
import { useApp } from '@/lib/app-context';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Activity,
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react';
import { MOCK_STATS, MOCK_CONTENT_VALIDATION, MOCK_TICKETS } from '@/lib/mock-data';
import { ROLE_CONFIGS } from '@/lib/roles-config';

function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
  description,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center gap-1 text-xs mt-1">
            {changeType === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
            {changeType === 'down' && <ArrowDownRight className="h-3 w-3 text-red-500" />}
            <span className={changeType === 'up' ? 'text-emerald-600' : changeType === 'down' ? 'text-red-600' : 'text-muted-foreground'}>
              {change}
            </span>
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const { currentUser } = useApp();
  const roleConfig = ROLE_CONFIGS[currentUser.role];

  const pendingContent = MOCK_CONTENT_VALIDATION.filter(c => c.status === 'pending').length;
  const totalExercises = MOCK_STATS.contentStats.exercises;
  const totalLessons = MOCK_STATS.contentStats.lessons;
  const totalExams = MOCK_STATS.contentStats.exams;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description={`Bienvenue, ${currentUser.name}. Voici un apercu de l activite de la plateforme.`}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Utilisateurs actifs"
          value={MOCK_STATS.activeUsers.toLocaleString()}
          change="+12.5% ce mois"
          changeType="up"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Contenu pedagogique"
          value={`${totalLessons + totalExercises + totalExams}`}
          description={`${totalLessons} cours - ${totalExercises} exercices - ${totalExams} examens`}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Taux de renouvellement"
          value={`${MOCK_STATS.renewalRate}%`}
          change="+2.3%"
          changeType="up"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Taux de reussite"
          value={`${MOCK_STATS.successRate}%`}
          icon={<Award className="h-4 w-4" />}
        />
      </div>

      {/* Financial Stats - Super Admin Only */}
      {roleConfig.canViewFinancials && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Revenus du mois"
            value="15.2M FCFA"
            change="+8.3%"
            changeType="up"
            icon={<Activity className="h-4 w-4" />}
          />
          <StatCard
            title="Nouveaux abonnements"
            value="1,247"
            change="-3.2%"
            changeType="down"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Transactions en attente"
            value="23"
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            title="Couts IA du mois"
            value="245 EUR"
            change="-5.1%"
            changeType="up"
            icon={<BarChart3 className="h-4 w-4" />}
            description="Claude: 180EUR - Gemini: 65EUR"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Validation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Contenu en attente de validation</CardTitle>
                <CardDescription>{pendingContent} elements necessitent votre attention</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {pendingContent} en attente
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_CONTENT_VALIDATION.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.author}</span>
                      <span>-</span>
                      <span>{item.subject}</span>
                      <span>-</span>
                      <span>{item.class}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.aiReport && (
                      <div className="hidden sm:block text-xs text-right">
                        <span className="text-muted-foreground">Qualite: </span>
                        <span className={item.aiReport.quality >= 80 ? 'text-emerald-600' : 'text-amber-600'}>
                          {item.aiReport.quality}%
                        </span>
                      </div>
                    )}
                    <Badge
                      variant="outline"
                      className={
                        item.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        item.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        item.status === 'correction' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }
                    >
                      {item.status === 'pending' && 'En attente'}
                      {item.status === 'published' && 'Publie'}
                      {item.status === 'correction' && 'A corriger'}
                      {item.status === 'draft' && 'Brouillon'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activite recente</CardTitle>
            <CardDescription>Dernieres actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <div className="rounded-full bg-blue-100 p-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="leading-none">Nouveau cours soumis</p>
                  <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="rounded-full bg-emerald-100 p-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="leading-none">127 nouveaux utilisateurs</p>
                  <p className="text-xs text-muted-foreground">Aujourd hui</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="rounded-full bg-amber-100 p-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="leading-none">3 tickets support ouverts</p>
                  <p className="text-xs text-muted-foreground">Cette heure</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="rounded-full bg-violet-100 p-1.5">
                  <Award className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="leading-none">Exam. Blanc termine</p>
                  <p className="text-xs text-muted-foreground">Il y a 5 heures</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* More Stats - Moderators see forum stats, support sees tickets */}
      {(roleConfig.canModerateForum || roleConfig.canManageSupport) && (
        <div className="grid gap-4 md:grid-cols-2">
          {roleConfig.canModerateForum && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Moderation Forum</CardTitle>
                <CardDescription>Signalements en attente de traitement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">5</div>
                    <p className="text-sm text-muted-foreground">Signalements non traites</p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Traite ce mois</span>
                    <span className="font-medium">89%</span>
                  </div>
                  <Progress value={89} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {roleConfig.canManageSupport && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support</CardTitle>
                <CardDescription>Tickets ouverts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{MOCK_TICKETS.filter(t => t.status === 'open' || t.status === 'in_progress').length}</div>
                    <p className="text-sm text-muted-foreground">Tickets en cours</p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-cyan-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-cyan-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Temps moyen de reponse</span>
                    <span className="font-medium">2.3h</span>
                  </div>
                  <Progress value={77} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Top Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contenu le plus consulte</CardTitle>
          <CardDescription>Top 5 des cours et exercices ce mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MOCK_STATS.topContent.map((content, index) => (
              <div
                key={content.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{content.title}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {content.views.toLocaleString()} vues
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HomePage() {
  return <DashboardContent />;
}
