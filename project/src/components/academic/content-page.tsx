'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BookOpen,
  Folder,
  FileText,
  Plus,
  Search,
  Edit,
  Eye,
  ChevronRight,
  FolderOpen,
  File,
  ListOrdered,
  Video,
  Image,
  FileAudio,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { MOCK_SUBJECTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

// Mock chapters and lessons
const MOCK_CHAPTERS = [
  {
    id: 'ch1',
    subjectId: 'sub1',
    name: 'Équations et inéquations',
    lessons: [
      { id: 'l1', name: 'Équations du premier degré', status: 'published', version: 1, hasMedia: true },
      { id: 'l2', name: 'Équations du second degré', status: 'pending', version: 1, hasMedia: true },
      { id: 'l3', name: 'Systèmes d\'équations', status: 'draft', version: 1, hasMedia: false },
    ],
  },
  {
    id: 'ch2',
    subjectId: 'sub1',
    name: 'Fonctions',
    lessons: [
      { id: 'l4', name: 'Généralités sur les fonctions', status: 'published', version: 2, hasMedia: true },
      { id: 'l5', name: 'Fonctions affines', status: 'published', version: 1, hasMedia: true },
    ],
  },
  {
    id: 'ch3',
    subjectId: 'sub1',
    name: 'Statistiques',
    lessons: [
      { id: 'l6', name: 'Séries statistiques', status: 'correction', version: 1, hasMedia: false },
    ],
  },
];

const MOCK_EXERCISES = [
  { id: 'ex1', title: 'Exercices équations 1er degré', type: 'lesson_linked', lessonId: 'l1', difficulty: 'easy', status: 'published' },
  { id: 'ex2', title: 'Exercices équations 2nd degré', type: 'lesson_linked', lessonId: 'l2', difficulty: 'medium', status: 'published' },
  { id: 'ex3', title: 'Problèmes résolution équations', type: 'chapter_linked', chapterId: 'ch1', difficulty: 'hard', status: 'pending' },
  { id: 'ex4', title: 'Quiz fonctions affines', type: 'lesson_linked', lessonId: 'l5', difficulty: 'easy', status: 'published' },
  { id: 'ex5', title: 'Évaluation chapitre Fonctions', type: 'chapter_linked', chapterId: 'ch2', difficulty: 'medium', status: 'draft' },
  { id: 'ex6', title: 'Problèmes ouverts - Mathématiques', type: 'independent', difficulty: 'hard', status: 'pending' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-700', icon: <Clock className="h-3 w-3" /> },
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: <AlertCircle className="h-3 w-3" /> },
  correction: { label: 'À corriger', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
  published: { label: 'Publié', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="h-3 w-3" /> },
};

export default function ContentPage() {
  const [selectedSubject, setSelectedSubject] = useState('sub1');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const subjects = MOCK_SUBJECTS;
  const chapters = MOCK_CHAPTERS.filter(c => c.subjectId === selectedSubject);
  const selectedChapterData = chapters.find(c => c.id === selectedChapter);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Matières & Contenu"
          description="Gérez les matières, chapitres, leçons et exercices"
          breadcrumbs={[
            { label: 'Académique' },
            { label: 'Matières & Contenu' },
          ]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowMediaLibrary(true)}>
                <Image className="h-4 w-4 mr-2" />
                Bibliothèque médias
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau contenu
              </Button>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Subjects List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Matières</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-1 px-3 pb-3">
                  {subjects
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => {
                          setSelectedSubject(subject.id);
                          setSelectedChapter(null);
                          setSelectedLesson(null);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left',
                          selectedSubject === subject.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-slate-100'
                        )}
                      >
                        <BookOpen className="h-4 w-4" />
                        <div className="flex-1">
                          <p className="font-medium">{subject.name}</p>
                          <p className={cn(
                            'text-xs',
                            selectedSubject === subject.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}>
                            {subject.classes.length} classes
                          </p>
                        </div>
                        {subject.active && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px]',
                              selectedSubject === subject.id ? 'border-primary-foreground/30 bg-primary-foreground/10' : ''
                            )}
                          >
                            {subject.code}
                          </Badge>
                        )}
                      </button>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chapters and Lessons */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Chapitres & Leçons</CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Chapitre
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="px-3 pb-3 space-y-2">
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="border rounded-lg overflow-hidden">
                      {/* Chapter Header */}
                      <button
                        onClick={() => setSelectedChapter(selectedChapter === chapter.id ? null : chapter.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                          selectedChapter === chapter.id ? 'bg-slate-100' : 'hover:bg-slate-50'
                        )}
                      >
                        <ChevronRight className={cn(
                          'h-4 w-4 transition-transform',
                          selectedChapter === chapter.id && 'rotate-90'
                        )} />
                        <FolderOpen className="h-4 w-4 text-amber-600" />
                        <span className="font-medium flex-1 text-left">{chapter.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {chapter.lessons.length} leçons
                        </Badge>
                      </button>

                      {/* Lessons */}
                      {selectedChapter === chapter.id && (
                        <div className="border-t bg-slate-50/50 px-3 py-2 space-y-1">
                          {chapter.lessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => setSelectedLesson(selectedLesson === lesson.id ? null : lesson.id)}
                              className={cn(
                                'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                selectedLesson === lesson.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-slate-100'
                              )}
                            >
                              <File className="h-4 w-4 text-blue-600" />
                              <span className="flex-1 text-left">{lesson.name}</span>
                              {lesson.hasMedia && (
                                <Video className="h-3.5 w-3.5 text-violet-500" />
                              )}
                              <Badge
                                variant="outline"
                                className={cn('text-[10px]', STATUS_CONFIG[lesson.status].color)}
                              >
                                {STATUS_CONFIG[lesson.status].label}
                              </Badge>
                              {lesson.version > 1 && (
                                <span className="text-[10px] text-muted-foreground">v{lesson.version}</span>
                              )}
                            </button>
                          ))}
                          <Button variant="ghost" size="sm" className="w-full mt-2">
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter une leçon
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Lesson/Exercise Detail */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">
                {selectedLesson ? 'Détails leçon' : selectedChapter ? 'Exercices du chapitre' : 'Sélectionnez'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedLesson ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {selectedChapterData?.lessons.find(l => l.id === selectedLesson)?.name}
                      </span>
                    </div>
                    <Badge className={STATUS_CONFIG[selectedChapterData?.lessons.find(l => l.id === selectedLesson)?.status || 'draft'].color}>
                      {STATUS_CONFIG[selectedChapterData?.lessons.find(l => l.id === selectedLesson)?.status || 'draft'].label}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span>{selectedChapterData?.lessons.find(l => l.id === selectedLesson)?.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Médias</span>
                      <span>{selectedChapterData?.lessons.find(l => l.id === selectedLesson)?.hasMedia ? 'Oui' : 'Non'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Aperçu
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Modifier
                    </Button>
                  </div>

                  {/* Exercises for this lesson */}
                  <div className="border-t pt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Exercices liés</p>
                    <div className="space-y-2">
                      {MOCK_EXERCISES.filter(e => e.lessonId === selectedLesson).map((ex) => (
                        <div key={ex.id} className="flex items-center justify-between text-sm p-2 rounded bg-slate-50">
                          <span>{ex.title}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {ex.difficulty === 'easy' ? 'Facile' : ex.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : selectedChapter ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Exercices du chapitre</p>
                  {MOCK_EXERCISES.filter(e => e.chapterId === selectedChapter).map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between text-sm p-2 rounded border">
                      <div>
                        <p className="font-medium">{ex.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ex.type === 'chapter_linked' ? 'Lié au chapitre' : 'Indépendant'}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn('text-[10px]', STATUS_CONFIG[ex.status].color)}>
                        {STATUS_CONFIG[ex.status].label}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <ListOrdered className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Sélectionnez une leçon pour voir les détails</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Exercise Management Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gestion des exercices</CardTitle>
            <CardDescription>Exercices par type et statut</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="lesson_linked">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="lesson_linked">
                  Liés à une leçon
                  <Badge variant="secondary" className="ml-2">{MOCK_EXERCISES.filter(e => e.type === 'lesson_linked').length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="chapter_linked">
                  Liés à un chapitre
                  <Badge variant="secondary" className="ml-2">{MOCK_EXERCISES.filter(e => e.type === 'chapter_linked').length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="independent">
                  Indépendants
                  <Badge variant="secondary" className="ml-2">{MOCK_EXERCISES.filter(e => e.type === 'independent').length}</Badge>
                </TabsTrigger>
              </TabsList>

              {['lesson_linked', 'chapter_linked', 'independent'].map((type) => (
                <TabsContent key={type} value={type} className="mt-4">
                  <div className="grid gap-3">
                    {MOCK_EXERCISES.filter(e => e.type === type).map((ex) => (
                      <div key={ex.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-1">
                          <p className="font-medium">{ex.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{ex.difficulty === 'easy' ? 'Facile' : ex.difficulty === 'medium' ? 'Moyen' : 'Difficile'}</span>
                            <span>•</span>
                            <span>{ex.lessonId || ex.chapterId || 'Aucun parent'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={STATUS_CONFIG[ex.status].color}>
                            {STATUS_CONFIG[ex.status].label}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
