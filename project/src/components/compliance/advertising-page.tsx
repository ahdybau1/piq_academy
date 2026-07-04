'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Switch } from '@/components/ui/switch';
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Eye,
  MousePointerClick,
  Image,
  AlertTriangle,
  Shield,
  Ban,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { MOCK_ADVERTISERS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { Advertiser, AdCampaign } from '@/lib/types';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700' },
  paused: { label: 'En pause', color: 'bg-amber-100 text-amber-700' },
  suspended: { label: 'Suspendu', color: 'bg-red-100 text-red-700' },
  pending: { label: 'En attente', color: 'bg-slate-100 text-slate-700' },
  completed: { label: 'Terminé', color: 'bg-blue-100 text-blue-700' },
};

const CAMPAIGN_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  banner: { label: 'Bannière', color: 'bg-blue-100 text-blue-700' },
  interstitial: { label: 'Interstitial', color: 'bg-purple-100 text-purple-700' },
  native: { label: 'Native', color: 'bg-emerald-100 text-emerald-700' },
};

const FORBIDDEN_CATEGORIES = [
  { id: 'alcohol', label: 'Alcool', description: 'Boissons alcoolisées' },
  { id: 'tobacco', label: 'Tabac', description: 'Produits du tabac et cigarettes électroniques' },
  { id: 'pharmaceuticals', label: 'Médicaments', description: 'Médicaments sur ordonnance' },
  { id: 'gambling', label: 'Jeux d\'argent', description: 'Casinos, paris sportifs, loteries' },
  { id: 'adult', label: 'Contenu adulte', description: 'Contenu sexually explicite' },
  { id: 'weapons', label: 'Armes', description: 'Armes à feu et explosifs' },
  { id: 'political', label: 'Politique', description: 'Contenu politique partisan' },
  { id: 'hate', label: 'Discours de haine', description: 'Contenu discriminatoire' },
];

export default function AdvertisingPage() {
  const [activeTab, setActiveTab] = useState('advertisers');
  const [showAddAdvertiserDialog, setShowAddAdvertiserDialog] = useState(false);
  const [showAddCampaignDialog, setShowAddCampaignDialog] = useState(false);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null);

  const allCampaigns = MOCK_ADVERTISERS.flatMap(a => a.campaigns);
  const totalImpressions = allCampaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = allCampaigns.reduce((acc, c) => acc + c.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Gestion de la publicité"
          description="Gestion des annonceurs, campagnes publicitaires et catégories interdites sur le palier gratuit"
          breadcrumbs={[
            { label: 'Conformité' },
            { label: 'Publicités' },
          ]}
        />

        {/* Info Banner */}
        <div className="rounded-lg bg-slate-50 border p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-slate-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-slate-800">Modération automatique</p>
              <p className="text-slate-600 mt-1">
                Les publicités sont affichées uniquement aux utilisateurs du palier gratuit.
                Toutes les campagnes doivent respecter les catégories interdites définies ci-dessous.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Annonceurs</p>
                  <p className="text-2xl font-bold">{MOCK_ADVERTISERS.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {MOCK_ADVERTISERS.filter(a => a.status === 'active').length} actifs
                  </p>
                </div>
                <Megaphone className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Campagnes actives</p>
                  <p className="text-2xl font-bold">{allCampaigns.filter(c => c.status === 'active').length}</p>
                  <p className="text-xs text-muted-foreground">
                    / {allCampaigns.length} total
                  </p>
                </div>
                <Play className="h-8 w-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Impressions total</p>
                  <p className="text-xl font-bold">{totalImpressions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CTR moyen</p>
                  <p className="text-xl font-bold">{avgCtr}%</p>
                  <p className="text-xs text-muted-foreground">
                    {totalClicks.toLocaleString()} clics
                  </p>
                </div>
                <MousePointerClick className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="advertisers">Annonceurs</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
            <TabsTrigger value="restrictions">Catégories interdites</TabsTrigger>
          </TabsList>

          <TabsContent value="advertisers" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Liste des annonceurs</h3>
              <Button onClick={() => setShowAddAdvertiserDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel annonceur
              </Button>
            </div>
            <div className="grid gap-4">
              {MOCK_ADVERTISERS.map((advertiser) => (
                <Card key={advertiser.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAdvertiser(advertiser)}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-slate-200 flex items-center justify-center">
                          <Megaphone className="h-6 w-6 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-semibold">{advertiser.name}</p>
                          <p className="text-sm text-muted-foreground">{advertiser.contactEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{advertiser.campaigns.length} campagne(s)</p>
                          <p className="text-xs text-muted-foreground">
                            {advertiser.campaigns.filter(c => c.status === 'active').length} active(s)
                          </p>
                        </div>
                        <Badge variant="outline" className={STATUS_CONFIG[advertiser.status].color}>
                          {STATUS_CONFIG[advertiser.status].label}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Toutes les campagnes</h3>
              <Button onClick={() => setShowAddCampaignDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle campagne
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campagne</TableHead>
                      <TableHead>Annonceur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Classes cibles</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Clics</TableHead>
                      <TableHead>CTR</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_ADVERTISERS.flatMap(a => a.campaigns.map(c => ({ ...c, advertiserName: a.name }))).map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-slate-200 flex items-center justify-center">
                              <Image className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="font-medium">{campaign.name}</p>
                              <p className="text-xs text-muted-foreground">{campaign.targetUrl}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{campaign.advertiserName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={CAMPAIGN_TYPE_CONFIG[campaign.type].color}>
                            {CAMPAIGN_TYPE_CONFIG[campaign.type].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {campaign.targetClasses.slice(0, 3).map(c => (
                              <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                            ))}
                            {campaign.targetClasses.length > 3 && (
                              <Badge variant="secondary" className="text-xs">+{campaign.targetClasses.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{campaign.impressions.toLocaleString()}</TableCell>
                        <TableCell>{campaign.clicks.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={cn(
                            'font-medium',
                            campaign.impressions > 0 && (campaign.clicks / campaign.impressions) > 0.03 ? 'text-emerald-600' :
                            campaign.impressions > 0 && (campaign.clicks / campaign.impressions) > 0.02 ? 'text-blue-600' : 'text-slate-600'
                          )}>
                            {campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : '0'}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_CONFIG[campaign.status].color}>
                            {STATUS_CONFIG[campaign.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {campaign.status === 'active' && (
                              <Button variant="ghost" size="sm" title="Mettre en pause">
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            {campaign.status === 'paused' && (
                              <Button variant="ghost" size="sm" title="Activer">
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" title="Modifier">
                              <Edit className="h-4 w-4" />
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

          <TabsContent value="restrictions" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Catégories publicitaires interdites</CardTitle>
                <CardDescription>
                  Ces catégories ne peuvent pas être diffusées sur la plateforme, conformément à la protection des mineurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {FORBIDDEN_CATEGORIES.map((category) => (
                    <div key={category.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100">
                          <Ban className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">{category.label}</p>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      <Switch defaultChecked disabled />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Règles de modération</CardTitle>
                <CardDescription>
                  Configuration des vérifications automatiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Vérification automatique des visuels</p>
                      <p className="text-sm text-muted-foreground">Analyse par IA pour détecter le contenu inapproprié</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Validation des URLs cibles</p>
                      <p className="text-sm text-muted-foreground">Vérification que l&apos;URL de destination est sécurisée</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Limite de fréquence d&apos;affichage</p>
                      <p className="text-sm text-muted-foreground">Maximum 3 publicités par sessionutilisateur</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Advertiser Dialog */}
      <Dialog open={showAddAdvertiserDialog} onOpenChange={setShowAddAdvertiserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel annonceur</DialogTitle>
            <DialogDescription>
              Ajouter un nouvel annonceur à la plateforme
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adv-name">Nom de l&apos;entreprise</Label>
              <Input id="adv-name" placeholder="Ex: Boutique Scolaire Plus" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adv-email">Email de contact</Label>
              <Input id="adv-email" type="email" placeholder="contact@entreprise.cm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adv-phone">Téléphone</Label>
              <Input id="adv-phone" placeholder="+237 6XX XX XX XX" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAdvertiserDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => setShowAddAdvertiserDialog(false)}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Campaign Dialog */}
      <Dialog open={showAddCampaignDialog} onOpenChange={setShowAddCampaignDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle campagne</DialogTitle>
            <DialogDescription>
              Créer une nouvelle campagne publicitaire
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Annonceur</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un annonceur" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_ADVERTISERS.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="camp-name">Nom de la campagne</Label>
              <Input id="camp-name" placeholder="Ex: Rentrée 2025" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Bannière</SelectItem>
                    <SelectItem value="interstitial">Interstitial</SelectItem>
                    <SelectItem value="native">Native</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>URL cible</Label>
                <Input placeholder="https://..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Classes cibles</Label>
              <div className="flex flex-wrap gap-2 p-3 rounded-lg border">
                {['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Tle'].map(c => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    {c}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCampaignDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => setShowAddCampaignDialog(false)}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advertiser Detail Dialog */}
      <Dialog open={!!selectedAdvertiser} onOpenChange={() => setSelectedAdvertiser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedAdvertiser?.name}</DialogTitle>
            <DialogDescription>
              Détails de l&apos;annonceur et ses campagnes
            </DialogDescription>
          </DialogHeader>
          {selectedAdvertiser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedAdvertiser.contactEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Statut</p>
                  <Badge variant="outline" className={STATUS_CONFIG[selectedAdvertiser.status].color}>
                    {STATUS_CONFIG[selectedAdvertiser.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Date de création</p>
                  <p className="font-medium">{new Date(selectedAdvertiser.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Campagnes</p>
                  <p className="font-medium">{selectedAdvertiser.campaigns.length}</p>
                </div>
              </div>
              <div className="border-t pt-4 space-y-3">
                <p className="font-medium text-sm">Campagnes</p>
                {selectedAdvertiser.campaigns.map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.impressions.toLocaleString()} impressions - {c.clicks.toLocaleString()} clics
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={STATUS_CONFIG[c.status].color}>
                        {STATUS_CONFIG[c.status].label}
                      </Badge>
                      <a href={c.targetUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
