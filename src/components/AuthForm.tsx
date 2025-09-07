import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logoUsm from "@/assets/logo-usm.png";
export const AuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {
    toast
  } = useToast();
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/20">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img 
              src={logoUsm} 
              alt="Logo USM" 
              className="h-20 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Mapeo de Convocatorias USM</CardTitle>
          <CardDescription>
            Ingresa con tus credenciales institucionales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Institucional</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@usm.edu.co" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Información de Acceso:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Utiliza tus credenciales institucionales para acceder al sistema.</p>
              <p>Si no tienes credenciales, contacta al administrador del sistema.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};