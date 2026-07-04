'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Edit, Download } from 'lucide-react';
import { ROLE_CONFIGS, ROLE_LABELS } from '@/lib/roles-config';
import { cn } from '@/lib/utils';

const PERMISSIONS = [
  { key: 'canViewFinancials', label: 'Voir les données financières' },
  { key: 'canViewIACosts', label: 'Voir les coûts IA' },
  { key: 'canManageUsers', label: 'Gérer les utilisateurs' },
  { key: 'canManageContent', label: 'Gérer le contenu' },
  { key: 'canModerateForum', label: 'Modérer le forum' },
  { key: 'canManageSupport', label: 'Gérer le support' },
  { key: 'canManageSettings', label: 'Gérer les paramètres' },
  { key: 'canManageTranslations', label: 'Gérer les traductions' },
];

export default function RolesPermissionsPage() {
  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Rôles & Permissions"
          description="Gérez les rôles administrateurs et leurs permissions"
          breadcrumbs={[
            { label: 'Utilisateurs' },
            { label: 'Rôles & Permissions' },
          ]}
          actions={
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter le journal
            </Button>
          }
        />

        {/* Matrix View */}
        <Card>
          <CardHeader>
            <CardTitle>Matrice des permissions par rôle</CardTitle>
            <CardDescription>Vue d'ensemble des permissions accordées à chaque rôle</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Permission</TableHead>
                  {Object.values(ROLE_CONFIGS).map((role) => (
                    <TableHead key={role.id} className="text-center">
                      <Badge variant="outline" className={cn('text-xs', role.badgeColor)}>
                        {role.label}
                      </Badge>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSIONS.map((permission) => (
                  <TableRow key={permission.key}>
                    <TableCell className="font-medium">{permission.label}</TableCell>
                    {Object.values(ROLE_CONFIGS).map((role) => (
                      <TableCell key={role.id} className="text-center">
                        <Checkbox
                          checked={role[permission.key as keyof typeof role] as boolean}
                          disabled
                          className="mx-auto"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Admin Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Comptes administrateurs</CardTitle>
            <CardDescription>Liste des administrateurs avec leur périmètre</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Périmètre pays</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Marie Nguema</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-100 text-red-800">Super Admin</Badge>
                  </TableCell>
                  <TableCell>Tous</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Paul Mbeki</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">Admin Pays</Badge>
                  </TableCell>
                  <TableCell>Cameroun</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Sophie Atangana</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800">Admin Contenu</Badge>
                  </TableCell>
                  <TableCell>Tous</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Claire Fouda</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800">Modérateur</Badge>
                  </TableCell>
                  <TableCell>Cameroun</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
