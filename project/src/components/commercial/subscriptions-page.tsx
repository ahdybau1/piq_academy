'use client';

import React from 'react';
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
import { Check, X, Edit, History } from 'lucide-react';
import { MOCK_SUBSCRIPTION_TIERS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const TIER_FEATURES = ['lessons', 'exercises', 'exams', 'forum', 'whatsapp', 'mock_exams'];

export default function SubscriptionsPage() {
  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Abonnements & Tarifs"
          description="Configurez les paliers d'abonnement et la grille tarifaire"
          breadcrumbs={[
            { label: 'Commercial' },
            { label: 'Abonnements & Tarifs' },
          ]}
          actions={
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Modifier les tarifs
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Abonnés actifs</p>
                  <p className="text-2xl font-bold">8,420</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">42.1M</p>
                  <p className="text-xs text-muted-foreground">FCFA/mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nouveaux (mois)</p>
                  <p className="text-2xl font-bold">+1,247</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-600">+12.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de renouvellement</p>
                  <p className="text-2xl font-bold">78.5%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-amber-600">-2.1%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Matrice de droits par palier</CardTitle>
            <CardDescription>Configuration des fonctionnalités disponibles par palier</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Fonctionnalite</TableHead>
                  <TableHead className="text-center">
                    Basique
                    <Badge variant="outline" className="ml-2 bg-slate-50">2,500 FCFA</Badge>
                  </TableHead>
                  <TableHead className="text-center">
                    Standard
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">5,000 FCFA</Badge>
                  </TableHead>
                  <TableHead className="text-center">
                    Premium
                    <Badge variant="outline" className="ml-2 bg-violet-50 text-violet-700">8,000 FCFA</Badge>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'Acces aux cours', key: 'lessons' },
                  { name: 'Exercices', key: 'exercises' },
                  { name: 'Examens officiels', key: 'exams' },
                  { name: 'Forum', key: 'forum' },
                  { name: 'Communautes WhatsApp', key: 'whatsapp' },
                  { name: 'Examens blancs', key: 'mock_exams' },
                ].map((feature) => (
                  <TableRow key={feature.key}>
                    <TableCell className="font-medium">{feature.name}</TableCell>
                    {MOCK_SUBSCRIPTION_TIERS.map((tier) => (
                      <TableCell key={tier.id} className="text-center">
                        {tier.features[feature.key as keyof typeof tier.features] ? (
                          <Check className="h-5 w-5 mx-auto text-emerald-500" />
                        ) : (
                          <X className="h-5 w-5 mx-auto text-slate-300" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classes par palier</CardTitle>
            <CardDescription>Association des classes aux differents paliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {MOCK_SUBSCRIPTION_TIERS.map((tier) => (
                <div key={tier.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{tier.name}</h4>
                    <Badge variant="outline">{tier.price.toLocaleString()} FCFA</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tier.classIds.map((classId) => (
                      <Badge key={classId} variant="secondary" className="text-xs">
                        {classId === 'c6e' ? '6eme' : classId === 'c5e' ? '5eme' : classId === 'c4e' ? '4eme' : classId === 'c3e' ? '3eme' : classId === 'c2nde' ? '2nde' : classId === 'c1ere' ? '1ere' : 'Terminale'}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique des prix</CardTitle>
            <CardDescription>Historique des changements de tarifs</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Palier</TableHead>
                  <TableHead>Ancien prix</TableHead>
                  <TableHead>Nouveau prix</TableHead>
                  <TableHead>Modifie par</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>01/09/2024</TableCell>
                  <TableCell>Premium</TableCell>
                  <TableCell>7,500 FCFA</TableCell>
                  <TableCell>8,000 FCFA</TableCell>
                  <TableCell>Marie Nguema</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>15/06/2024</TableCell>
                  <TableCell>Standard</TableCell>
                  <TableCell>4,500 FCFA</TableCell>
                  <TableCell>5,000 FCFA</TableCell>
                  <TableCell>Marie Nguema</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
