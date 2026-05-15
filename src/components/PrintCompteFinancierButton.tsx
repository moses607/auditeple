import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { ComponentProps } from 'react';

interface PrintCompteFinancierButtonProps extends Omit<ComponentProps<typeof Button>, 'onClick'> {
  onPrint: () => void;
  label?: string;
}

/**
 * Bouton standardisé "Imprimer (compte financier)".
 * Utilisé sur les pages dont la pièce doit être annexée au compte financier
 * (cartographie des risques, organigramme fonctionnel, plan d'action).
 */
export function PrintCompteFinancierButton({
  onPrint,
  label = 'Imprimer (compte financier)',
  className,
  variant = 'outline',
  ...rest
}: PrintCompteFinancierButtonProps) {
  return (
    <Button {...rest} variant={variant} className={className} onClick={onPrint}>
      <Printer className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
