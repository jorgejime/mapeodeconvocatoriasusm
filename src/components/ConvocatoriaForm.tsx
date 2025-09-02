import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Convocatoria {
  id: number;
  nombre_convocatoria: string;
  entidad: string;
  orden: string | null;
  tipo: string | null;
  valor: number | null;
  tipo_moneda: string | null;
  sector_tema: string | null;
  componentes_transversales: string | null;
  cumplimos_requisitos: boolean | null;
  que_nos_falta: string | null;
  fecha_limite_aplicacion: string | null;
  link_convocatoria: string | null;
  estado_convocatoria: string | null;
  estado_usm: string | null;
  observaciones: string | null;
}

interface ConvocatoriaFormProps {
  convocatoria?: Convocatoria | null;
  mode: "create" | "edit" | "clone";
  onSuccess: () => void;
  onCancel: () => void;
}

export const ConvocatoriaForm = ({ convocatoria, mode, onSuccess, onCancel }: ConvocatoriaFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_convocatoria: "",
    entidad: "",
    orden: "",
    tipo: "",
    valor: "",
    tipo_moneda: "COP",
    sector_tema: "",
    componentes_transversales: "",
    cumplimos_requisitos: false,
    que_nos_falta: "",
    fecha_limite_aplicacion: "",
    link_convocatoria: "",
    estado_convocatoria: "",
    estado_usm: "",
    observaciones: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (convocatoria && (mode === "edit" || mode === "clone")) {
      setFormData({
        nombre_convocatoria: convocatoria.nombre_convocatoria,
        entidad: convocatoria.entidad,
        orden: convocatoria.orden || "",
        tipo: convocatoria.tipo || "",
        valor: convocatoria.valor?.toString() || "",
        tipo_moneda: convocatoria.tipo_moneda || "COP",
        sector_tema: convocatoria.sector_tema || "",
        componentes_transversales: convocatoria.componentes_transversales || "",
        cumplimos_requisitos: convocatoria.cumplimos_requisitos || false,
        que_nos_falta: convocatoria.que_nos_falta || "",
        fecha_limite_aplicacion: convocatoria.fecha_limite_aplicacion || "",
        link_convocatoria: convocatoria.link_convocatoria || "",
        estado_convocatoria: convocatoria.estado_convocatoria || "",
        estado_usm: convocatoria.estado_usm || "",
        observaciones: convocatoria.observaciones || "",
      });
    }
  }, [convocatoria, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        cumplimos_requisitos: formData.cumplimos_requisitos,
        fecha_limite_aplicacion: formData.fecha_limite_aplicacion || null,
      };

      let error;

      if (mode === "edit" && convocatoria) {
        ({ error } = await supabase
          .from("convocatorias")
          .update(dataToSubmit)
          .eq("id", convocatoria.id));
      } else {
        ({ error } = await supabase
          .from("convocatorias")
          .insert([dataToSubmit]));
      }

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Convocatoria ${mode === "edit" ? "actualizada" : "creada"} correctamente`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving convocatoria:", error);
      toast({
        title: "Error",
        description: `Error al ${mode === "edit" ? "actualizar" : "crear"} la convocatoria`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_convocatoria">Nombre de la Convocatoria *</Label>
              <Input
                id="nombre_convocatoria"
                value={formData.nombre_convocatoria}
                onChange={(e) => updateField("nombre_convocatoria", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entidad">Entidad *</Label>
              <Input
                id="entidad"
                value={formData.entidad}
                onChange={(e) => updateField("entidad", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orden">Orden</Label>
              <Select value={formData.orden} onValueChange={(value) => updateField("orden", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el orden" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="Nacional">Nacional</SelectItem>
                  <SelectItem value="Internacional">Internacional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={formData.tipo} onValueChange={(value) => updateField("tipo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Investigación">Investigación</SelectItem>
                  <SelectItem value="Fortalecimiento institucional">Fortalecimiento institucional</SelectItem>
                  <SelectItem value="Formación">Formación</SelectItem>
                  <SelectItem value="Movilidad">Movilidad</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                  <SelectItem value="Varios">Varios</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Financiera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor/Monto</Label>
                <Input
                  id="valor"
                  type="number"
                  value={formData.valor}
                  onChange={(e) => updateField("valor", e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipo_moneda">Moneda</Label>
                <Select value={formData.tipo_moneda} onValueChange={(value) => updateField("tipo_moneda", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COP">COP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="UYU">UYU</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector_tema">Sector/Tema</Label>
              <Select value={formData.sector_tema} onValueChange={(value) => updateField("sector_tema", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Educación">Educación</SelectItem>
                  <SelectItem value="Inclusión Social">Inclusión Social</SelectItem>
                  <SelectItem value="Cultura">Cultura</SelectItem>
                  <SelectItem value="TIC">TIC</SelectItem>
                  <SelectItem value="CT&I+D">CT&I+D</SelectItem>
                  <SelectItem value="Medio Ambiente">Medio Ambiente</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Componentes que Financia (múltiple)</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Infraestructura", "Dotación", "Servicios", "Investigación", "Otro", "Varios"].map((component) => (
                  <div key={component} className="flex items-center space-x-2">
                    <Checkbox
                      id={`component-${component}`}
                      checked={formData.componentes_transversales.includes(component)}
                      onCheckedChange={(checked) => {
                        const current = formData.componentes_transversales.split(", ").filter(c => c);
                        if (checked) {
                          updateField("componentes_transversales", [...current, component].join(", "));
                        } else {
                          updateField("componentes_transversales", current.filter(c => c !== component).join(", "));
                        }
                      }}
                    />
                    <Label htmlFor={`component-${component}`} className="text-sm">{component}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requisitos y Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cumplimos_requisitos"
                checked={formData.cumplimos_requisitos}
                onCheckedChange={(checked) => updateField("cumplimos_requisitos", checked)}
              />
              <Label htmlFor="cumplimos_requisitos">¿Cumplimos los requisitos?</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="que_nos_falta">¿Qué nos falta para cumplir?</Label>
              <Textarea
                id="que_nos_falta"
                value={formData.que_nos_falta}
                onChange={(e) => updateField("que_nos_falta", e.target.value)}
                placeholder="Describe qué requisitos faltan por cumplir..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_limite_aplicacion">Fecha Límite de Aplicación</Label>
              <Input
                id="fecha_limite_aplicacion"
                type="date"
                value={formData.fecha_limite_aplicacion}
                onChange={(e) => updateField("fecha_limite_aplicacion", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_convocatoria">Link de la Convocatoria</Label>
              <Input
                id="link_convocatoria"
                type="url"
                value={formData.link_convocatoria}
                onChange={(e) => updateField("link_convocatoria", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estado_convocatoria">Estado de la Convocatoria</Label>
              <Select value={formData.estado_convocatoria} onValueChange={(value) => updateField("estado_convocatoria", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Abierta">Abierta</SelectItem>
                  <SelectItem value="Cerrada">Cerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado_usm">Estado Interno (USM)</Label>
              <Select value={formData.estado_usm} onValueChange={(value) => updateField("estado_usm", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado interno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="En revisión">En revisión</SelectItem>
                  <SelectItem value="En preparación">En preparación</SelectItem>
                  <SelectItem value="Presentada">Presentada</SelectItem>
                  <SelectItem value="En subsanación">En subsanación</SelectItem>
                  <SelectItem value="Archivada">Archivada</SelectItem>
                  <SelectItem value="Adjudicada">Adjudicada</SelectItem>
                  <SelectItem value="Rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => updateField("observaciones", e.target.value)}
                placeholder="Observaciones adicionales..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : mode === "edit" ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
};