import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/ui/card';
import { Button } from '../../componentes/ui/button';
import { Label } from '../../componentes/ui/label';
import { Textarea } from '../../componentes/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../componentes/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../componentes/ui/tabs';
import { Checkbox } from "../../componentes/ui/checkbox";
import { Plus, FileText, Printer, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const TutorDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cronograma_id: '',
    obs_academico: '',
    obs_personal: '',
    obs_profesional: '',
    requiere_derivacion: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Aquí llamarías a tu servicio: api.post('/tutorias', formData)
    toast.success('Registro guardado correctamente en la base de datos');
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestión de Tutorías</h2>
        <Button variant="outline" className="border-blue-600 text-blue-600">
          <Printer className="w-4 h-4 mr-2" /> Imprimir Reporte
        </Button>
      </div>

      <Tabs defaultValue="registrar">
        <TabsList>
          <TabsTrigger value="registrar"><Plus className="w-4 h-4 mr-2" /> Nuevo Registro</TabsTrigger>
          <TabsTrigger value="historial"><FileText className="w-4 h-4 mr-2" /> Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="registrar">
          <Card className="border-t-4 border-t-blue-700 shadow-lg">
            <CardHeader>
              <CardTitle>Formulario de Seguimiento Integral</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Seleccionar Sesión Programada</Label>
                    <Select onValueChange={(v) => setFormData({...formData, cronograma_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Estudiante - Fecha" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">GARCIA PEREZ, Juan - 28/12/2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3 mt-4">
                  <div className="p-4 border rounded-lg bg-blue-50/50">
                    <Label className="text-blue-800 font-bold mb-2 block">1. Aspecto Académico</Label>
                    <Textarea 
                      placeholder="Cursos desaprobados, ficha de seguimiento..." 
                      className="bg-white h-32"
                      onChange={(e) => setFormData({...formData, obs_academico: e.target.value})}
                    />
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50/50">
                    <Label className="text-green-800 font-bold mb-2 block">2. Aspecto Personal</Label>
                    <Textarea 
                      placeholder="Entorno familiar, salud, motivación..." 
                      className="bg-white h-32"
                      onChange={(e) => setFormData({...formData, obs_personal: e.target.value})}
                    />
                  </div>
                  <div className="p-4 border rounded-lg bg-purple-50/50">
                    <Label className="text-purple-800 font-bold mb-2 block">3. Aspecto Profesional</Label>
                    <Textarea 
                      placeholder="Visión de carrera, prácticas, talleres..." 
                      className="bg-white h-32"
                      onChange={(e) => setFormData({...formData, obs_profesional: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-4 border-2 border-orange-100 bg-orange-50 rounded-md">
                  <Checkbox 
                    id="derivacion" 
                    onCheckedChange={(val) => setFormData({...formData, requiere_derivacion: val})} 
                  />
                  <Label htmlFor="derivacion" className="flex items-center gap-2 cursor-pointer text-orange-800 font-medium">
                    <AlertCircle className="w-4 h-4" /> Marcar si el estudiante requiere derivación psicológica
                  </Label>
                </div>

                <Button className="w-full bg-[#003366] hover:bg-blue-900 h-12 text-lg">
                  Finalizar y Guardar Tutoría
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TutorDashboard;