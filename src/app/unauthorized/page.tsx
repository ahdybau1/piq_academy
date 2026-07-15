import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="animate-in w-full max-w-md fade-in zoom-in-95 duration-500">
        <CardContent className="space-y-4 py-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Accès refusé</h1>
          <p className="text-sm text-muted-foreground">
            Votre rôle ne permet pas d&apos;accéder à cette page de l&apos;Administration.
          </p>
          <Link
            href="/"
            className="inline-block text-sm text-primary transition-colors hover:underline"
          >
            Retour au tableau de bord
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
