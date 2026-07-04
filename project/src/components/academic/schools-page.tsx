'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Plus,
  Search,
  Upload,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
  Users,
  Calendar,
} from 'lucide-react';
import { MOCK_SCHOOLS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const MOCK_SCHOOL_EXAMS = [
  {
    id: 'se1',
    schoolId: 'sch1',
    schoolName: 'Lycée Général Leclerc',
    class: 'Terminale C',
    subject: 'Mathématiques',
    year: 2024,
    status: 'approved',
    submittedBy: 'Jean-Baptiste Mba',
    submittedAt: '2024-12-01',
    hasSubject: true,
    hasCorrection: true,
  },
  {
    id: 'se2',
    schoolId: 'sch2',
    schoolName: 'Lycée Général de Douala',
    class: '1ère D',
    subject: 'Physique-Chimie',
    year: 2024,
    status: 'pending',
    submittedBy: 'Marie-Claire Atangana',
    submittedAt: '2024-12-08',
    hasSubject: true,
    hasCorrection: false,
  },
  {
    id: 'se3',
    schoolId: 'sch3',
    schoolName: 'Collège Libermann',
    class: '3ème',
    subject: 'Français',
    year: 2024,
    status: 'rejected',
    submittedBy: 'Paul Etoundi',
    submittedAt: '2024-12-05',
    hasSubject: true,
    hasCorrection: true,
    reason: 'Qualité du scan insuffisante',
  },
  {
    id: 'se4',
    schoolId: 'sch1',
    schoolName: 'Lycée Général Leclerc',
    class: 'Terminale D',
    subject: 'SVT',
    year: 2024,
    status: 'pending',
    submittedBy: 'Emmanuel Nkodo',
    submittedAt: '2024-12-10',
    hasSubject: true,
    hasCorrection: false,
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="h-3.5 w-3.5" /> },
  approved: { label: 'Approuvée', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  rejected: { label: 'Rejetée', color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="h-3.5 w-3.5" /> },
};

export default function SchoolsPage() {
  const [activeTab, setActiveTab] = useState('schools');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateSchoolDialog, setShowCreateSchoolDialog] = useState(false);

  const schools = MOCK_SCHOOLS.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingExams = MOCK_SCHOOL_EXAMS.filter(e => e.status === 'pending');

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Établissements & Épreuves"
          description="Gestion des établissements scolaires et épreuves soumises"
          breadcrumbs={[
            { label: 'Académique' },
            { label: 'Établissements & Épreuves' },
          ]}
          actions={
            <Button onClick={() => setShowCreateSchoolDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel établissement
            </Button>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="schools" className="gap-2">
              <Building2 className="h-4 w-4" />
              Établissements
            </TabsTrigger>
            <TabsTrigger value="exams" className="gap-2">
              <FileText className="h-4 w-4" />
              Épreuves en attente
              {pendingExams.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-700">
                  {pendingExams.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schools" className="space-y-6 mt-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total établissements</p>
                      <p className="text-2xl font-bold">{MOCK_SCHOOLS.length}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Établissements publics</p>
                      <p className="text-2xl font-bold">{MOCK_SCHOOLS.filter(s => s.type === 'public').length}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-blue-500/50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Établissements privés</p>
                      <p className="text-2xl font-bold">{MOCK_SCHOOLS.filter(s => s.type === 'private').length}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-violet-500/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schools List */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Liste des établissements</CardTitle>
                  <div className="relative w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un établissement..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Ville</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell>{school.city}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              school.type === 'public'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-violet-50 text-violet-700 border-violet-200'
                            }
                          >
                            {school.type === 'public' ? 'Public' : 'Privé'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              school.active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }
                          >
                            {school.active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Épreuves en attente de validation</CardTitle>
                <CardDescription>
                  Épreuves soumises par les enseignants, en attente d'approbation
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Établissement</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Matière</TableHead>
                      <TableHead>Soumis par</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Correction</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_SCHOOL_EXAMS.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.schoolName}</TableCell>
                        <TableCell>{exam.class}</TableCell>
                        <TableCell>{exam.subject}</TableCell>
                        <TableCell>{exam.submittedBy}</TableCell>
                        <TableCell>{exam.submittedAt}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              exam.hasCorrection
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }
                          >
                            {exam.hasCorrection ? 'Oui' : 'Non'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={STATUS_CONFIG[exam.status].color}
                          >
                            <span className="flex items-center gap-1">
                              {STATUS_CONFIG[exam.status].icon}
                              {STATUS_CONFIG[exam.status].label}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {exam.status === 'pending' && (
                              <>
                                <Button variant="ghost" size="icon" className="text-emerald-600">
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-600">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create School Dialog */}
        <Dialog open={showCreateSchoolDialog} onOpenChange={setShowCreateSchoolDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un établissement</DialogTitle>
              <DialogDescription>
                Ajoutez un nouvel établissement scolaire au système
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="school-name">Nom de l'établissement</Label>
                <Input id="school-name" placeholder="Ex: Lycée Général de Douala" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" placeholder="Ex: Douala" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Privé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateSchoolDialog(false)}>
                Annuler
              </Button>
              <Button onClick={() => setShowCreateSchoolDialog(false)}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
