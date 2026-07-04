'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  Search,
  Building2,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  UserPlus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MOCK_TEACHERS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const MOCK_PENDING_REQUESTS = [
  { id: 'pr1', teacherName: 'Marie-Claire Atangana', school: 'Lycée Général de Douala', subject: 'Physique-Chimie', classes: ['Terminale D'], requestedAt: '2024-12-09', status: 'pending' },
  { id: 'pr2', teacherName: 'Joseph Nkongo', school: 'Collège Libermann', subject: 'Anglais', classes: ['2nde', '1ère'], requestedAt: '2024-12-08', status: 'pending' },
];

export default function TeachersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const teachers = MOCK_TEACHERS.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.schools.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Enseignants"
          description="Gestion des enseignants et demandes de rattachement"
          breadcrumbs={[
            { label: 'Utilisateurs' },
            { label: 'Enseignants' },
          ]}
          actions={
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter un enseignant
            </Button>
          }
        />

        <Tabs defaultValue="teachers">
          <TabsList>
            <TabsTrigger value="teachers" className="gap-2">
              <Users className="h-4 w-4" />
              Enseignants
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <Clock className="h-4 w-4" />
              Demandes en attente
              {MOCK_PENDING_REQUESTS.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-700">
                  {MOCK_PENDING_REQUESTS.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teachers" className="space-y-6 mt-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total enseignants</p>
                      <p className="text-2xl font-bold">{MOCK_TEACHERS.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Établissements partenaires</p>
                      <p className="text-2xl font-bold">127</p>
                    </div>
                    <Building2 className="h-8 w-8 text-blue-500/50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">En attente</p>
                      <p className="text-2xl font-bold text-amber-600">{MOCK_PENDING_REQUESTS.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-500/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Teachers List */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Liste des enseignants</CardTitle>
                  <div className="relative w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un enseignant..."
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
                      <TableHead>Enseignant</TableHead>
                      <TableHead>Établissement(s)</TableHead>
                      <TableHead>Matières</TableHead>
                      <TableHead>Classes</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-slate-700 text-white">
                                {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{teacher.name}</p>
                              <p className="text-xs text-muted-foreground">{teacher.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacher.schools.map((school, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {school}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects.map((subject, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{teacher.classes.join(', ')}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={teacher.pendingRequest ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
                          >
                            {teacher.pendingRequest ? 'Demande en attente' : 'Actif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-2 rounded-md hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir le profil
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Contenu soumis
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Demandes de rattachement</CardTitle>
                <CardDescription>
                  Demandes d'enseignants pour être rattachés à des établissements
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Enseignant</TableHead>
                      <TableHead>Établissement</TableHead>
                      <TableHead>Matière</TableHead>
                      <TableHead>Classes</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_PENDING_REQUESTS.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.teacherName}</TableCell>
                        <TableCell>{request.school}</TableCell>
                        <TableCell>{request.subject}</TableCell>
                        <TableCell>{request.classes.join(', ')}</TableCell>
                        <TableCell>{request.requestedAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                            <Button variant="destructive" size="sm">
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
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
      </div>
    </>
  );
}
