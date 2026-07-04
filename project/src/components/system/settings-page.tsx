'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Settings, Palette, Globe, CreditCard, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Paramètres"
          description="Configuration de la plateforme"
          breadcrumbs={[
            { label: 'Système' },
            { label: 'Paramètres' },
          ]}
        />

        <Tabs defaultValue="appearance">
          <TabsList>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Apparence
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Paiements
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Identité visuelle</CardTitle>
                <CardDescription>Personnalisez l'apparence de la plateforme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nom de la plateforme</Label>
                    <Input defaultValue="PIQ Academy" />
                  </div>
                  <div className="space-y-2">
                    <Label>Baseline</Label>
                    <Input defaultValue="LEARN - GROW - ACHIEVE" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Couleur principale</Label>
                    <div className="flex gap-2">
                      <Input type="color" defaultValue="#0ea5e9" className="w-12 h-10 p-1" />
                      <Input defaultValue="#0ea5e9" className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Couleur secondaire</Label>
                    <div className="flex gap-2">
                      <Input type="color" defaultValue="#1e3a5f" className="w-12 h-10 p-1" />
                      <Input defaultValue="#1e3a5f" className="flex-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logo</CardTitle>
                <CardDescription>Logo affiché sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-lg bg-slate-900 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">piq</span>
                  </div>
                  <Button variant="outline">Changer le logo</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Agrégateur de paiement</CardTitle>
                <CardDescription>Configuration du provider de paiement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select defaultValue="cinetpay">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cinetpay">CinetPay</SelectItem>
                        <SelectItem value="feedzai">Feedzai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Environnement</Label>
                    <Select defaultValue="production">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input type="password" defaultValue="sk_live_**************************" />
                  </div>
                  <div className="space-y-2">
                    <Label>Merchant ID</Label>
                    <Input defaultValue="MERCH_123456" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Méthodes de paiement</CardTitle>
                <CardDescription>Opérateurs activés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Orange Money</p>
                      <p className="text-sm text-muted-foreground">Paiements mobile Orange</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">MTN Mobile Money</p>
                      <p className="text-sm text-muted-foreground">Paiements mobile MTN</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Express Union</p>
                      <p className="text-sm text-muted-foreground">Paiements mobile EU</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Canaux de notification</CardTitle>
                <CardDescription>Activez les canaux de notification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">Notifications par email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS</p>
                      <p className="text-sm text-muted-foreground">Notifications par SMS</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push</p>
                      <p className="text-sm text-muted-foreground">Notifications push navigateur</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button>Enregistrer les modifications</Button>
        </div>
      </div>
    </>
  );
}
