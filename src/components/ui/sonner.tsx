import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            'glass !bg-card/80 !text-foreground !border-border/60 !rounded-xl',
          description: '!text-muted-foreground',
          actionButton: '!bg-primary !text-primary-foreground',
          cancelButton: '!bg-secondary !text-secondary-foreground',
        },
      }}
      offset="84px"
      {...props}
    />
  );
}

export { toast } from 'sonner';
