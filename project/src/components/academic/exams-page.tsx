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
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  Plus,
  Search,
  Upload,
  Eye,
  Download,
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_OFFICIAL_EXAMS = [
  {
    id: 'oe1',
    name: 'BEP 2024 - Mathématiques',
    type: 'BEPC',
    class: '3ème',
    subject: 'Mathématiques',
    year: 2024,
    hasSubject: true,
    hasCorrection: true,
    correctionHidden: false,
    status: 'published',
  },
  {
    id: 'oe2',
    name: 'Bac 2024 - Mathématiques',
    type: 'Bac',
    class: 'Terminale C',
    subject: 'Mathématiques',
    year: 2024,
    hasSubject: true,
    hasCorrection: true,
    correctionHidden: true,
    status: 'published',
  },
  {
    id: 'oe3',
    name: 'Probatoire 2024 - Physique',
    type: 'Probatoire',
    class: '1ère C',
    subject: 'Physique-Chimie',
    year: 2024,
    hasSubject: true,
    hasCorrection: false,
    correctionHidden: false,
    status: 'draft',
  },
  {
    id: 'oe4',
    name: 'BEP 2023 - Français',
    type: 'BEPC',
    class: '3ème',
    subject: 'Français',
    year: 2023,
    hasSubject: true,
    hasCorrection: true,
    correctionHidden: false,
    status: 'published',
  },
  {
    id: 'oe5',
    name: 'Bac 2023 - Philosophie',
    type: 'Bac',
    class: 'Terminale A',
    subject: 'Philosophie',
    year: 2023,
    hasSubject: true,
    hasCorrection: true,
    correctionHidden: false,
    status: 'published',
  },
];

const EXAM_TYPES = ['BEPC', 'Probatoire', 'Bac'];
const YEARS = [2024, 2023, 2022, 2021, 2020];
const CLASSES = ['3ème', '2nde', '1ère C', '1ère D', 'Terminale C', 'Terminale D', 'Terminale A'];

export default function OfficialExamsPage() {
  const [selectedType, setSelectedType] = useState<string | null>('all');
  const [selectedYear, setSelectedYear] = useState<string | null>('2024');
  const [selectedClass, setSelectedClass] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const filteredExams = MOCK_OFFICIAL_EXAMS.filter(exam => {
    if (selectedType !== 'all' && exam.type !== selectedType) return false;
    if (selectedYear !== 'all' && exam.year.toString() !== selectedYear) return false;
    if (selectedClass !== 'all' && exam.class !== selectedClass) return false;
    if (searchQuery && !exam.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: MOCK_OFFICIAL_EXAMS.length,
    withCorrection: MOCK_OFFICIAL_EXAMS.filter(e => e.hasCorrection).length,
    published: MOCK_OFFICIAL_EXAMS.filter(e => e.status === 'published').length,
    drafts: MOCK_OFFICIAL_EXAMS.filter(e => e.status === 'draft').length,
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Examens officiels nationaux"
          description="Gestion des sujets et corrigés des examens nationaux"
          breadcrumbs={[
            { label: 'Académique' },
            { label: 'Examens officiels' },
          ]}
          actions={
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Nouveau sujet
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total sujets</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avec correction</p>
                  <p className="text-2xl font-bold">{stats.withCorrection}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Publiés</p>
                  <p className="text-2xl font-bold">{stats.published}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En brouillon</p>
                  <p className="text-2xl font-bold">{stats.drafts}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un sujet..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  {EXAM_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Classe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes classes</SelectItem>
                  {CLASSES.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Exams List */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Année</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Matière</TableHead>
                  <TableHead>Correction</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          exam.type === 'Bac' ? 'bg-red-50 text-red-700 border-red-200' :
                          exam.type === 'Probatoire' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }
                      >
                        {exam.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{exam.year}</TableCell>
                    <TableCell>{exam.class}</TableCell>
                    <TableCell>{exam.subject}</TableCell>
                    <TableCell>
                      {exam.hasCorrection ? (
                        exam.correctionHidden ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Masquée
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            Visible
                          </Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground text-sm">Aucune</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          exam.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }
                      >
                        {exam.status === 'published' ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un sujet d'examen</DialogTitle>
              <DialogDescription>
                Téléversez un sujet d'examen national et optionnellement sa correction
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type d'examen</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXAM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Année</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((year) => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Classe</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSES.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Matière</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Mathématiques</SelectItem>
                      <SelectItem value="physique">Physique-Chimie</SelectItem>
                      <SelectItem value="francais">Français</SelectItem>
                      <SelectItem value="anglais">Anglais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fichier sujet (PDF)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Glissez-déposez ou cliquez pour sélectionner
                  </p>
                  <Input type="file" className="hidden" accept=".pdf" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fichier correction (PDF, optionnel)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Glissez-déposez ou cliquez pour sélectionner
                  </p>
                  <Input type="file" className="hidden" accept=".pdf" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="hide-correction" />
                <Label htmlFor="hide-correction" className="text-sm font-normal">
                  Masquer la correction (visible uniquement par l'admin)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Annuler
              </Button>
              <Button onClick={() => setShowUploadDialog(false)}>
                Enregistrer en brouillon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
