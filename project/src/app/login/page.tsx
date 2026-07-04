'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { signIn, type SignInState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Globe, Lock, Mail } from 'lucide-react';

const initialState: SignInState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-float-slow absolute -top-40 -right-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="animate-float-slow-reverse absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="animate-float-slow absolute top-1/3 left-1/4 h-48 w-48 rounded-full bg-cyan-400/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-slate-700 bg-slate-900/95 backdrop-blur animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700">
        <CardHeader className="space-y-2 text-center pb-2">
          <div className="flex flex-col items-center">
            <Image
              src="/logo-full.png"
              alt="PIQ Academy"
              width={671}
              height={653}
              className="h-32 w-32 object-contain transition-transform duration-300 hover:scale-105"
              priority
            />
          </div>
          <p className="text-sm text-slate-400">Administration</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@piqacademy.com"
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                  required
                />
              </div>
            </div>

            {state?.error && (
              <div className="animate-in rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 fade-in slide-in-from-top-1 duration-300">
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98]"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-600">
        <div className="flex items-center justify-center gap-2">
          <Globe className="h-3.5 w-3.5" />
          <span>PIQ Academy - Plateforme e-learning pour l&apos;Afrique</span>
        </div>
      </div>
    </div>
  );
}
