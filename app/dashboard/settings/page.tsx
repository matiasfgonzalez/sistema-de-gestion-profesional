"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Configuracion</h1>
        <p className="mt-1 text-muted-foreground">
          Administra las preferencias de tu cuenta
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar */}
        <Card>
          <CardContent className="p-4">
            <nav className="space-y-1">
              {[
                { icon: Settings, label: "General", active: true },
                { icon: Bell, label: "Notificaciones", active: false },
                { icon: Shield, label: "Seguridad", active: false },
                { icon: Palette, label: "Apariencia", active: false },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Main content */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configuracion General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Centro</Label>
              <Input id="name" defaultValue="Centro de Kinesiologia Salud" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email de Contacto</Label>
              <Input id="email" type="email" defaultValue="contacto@centro.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" defaultValue="+54 11 1234-5678" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Direccion</Label>
              <Input id="address" defaultValue="Av. Principal 1234, Ciudad" />
            </div>

            <div className="pt-4">
              <Button>Guardar Cambios</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
