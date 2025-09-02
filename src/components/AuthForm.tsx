import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const AuthForm = () => {
  console.log("AuthForm: Rendering auth form");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate that only allowed emails can log in
    if (email !== "admin@usm.edu.co" && email !== "rectoria@usm.edu.co") {
      toast({
        title: "Acceso no autorizado",
        description: "Solo los usuarios autorizados pueden acceder al sistema",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error al iniciar sesión",
        description: "Credenciales incorrectas. Verifica tu email y contraseña.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/20">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sistema de Convocatorias USM</CardTitle>
          <CardDescription>
            Sistema de gestión de convocatorias para usuarios autorizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Institucional</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@usm.edu.co"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Usuarios Autorizados:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• admin@usm.edu.co - Administrador</li>
              <li>• rectoria@usm.edu.co - Usuario Consulta</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};