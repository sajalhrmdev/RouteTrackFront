'use client';

import { PanelLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app';

export function MobileHeader() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <div className="fixed top-0 left-0 right-0 h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 z-30 md:hidden">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <PanelLeft className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <MapPin className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="font-bold text-sm">FieldTrack</span>
      </div>
      <div className="w-10" />
    </div>
  );
}
