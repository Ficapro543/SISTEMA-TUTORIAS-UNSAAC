import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/ui/card';
import { Button } from '../../componentes/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../componentes/ui/table';
import { CalendarPlus, Search } from 'lucide-react';
import { Input } from '../../componentes/ui/input';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cronograma de Tutorías</h2>
        <Button className="bg-[#003366]">
          <CalendarPlus className="w-4 h-4 mr-2" /> Crear nueva cronograma
        </Button>
      </div>

      <div className="flex gap-2 max-w-sm mb-4">
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar por tutor o aula..." className="pl-8" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Aula</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Ejemplo estático como en tu imagen */}
              <TableRow>
                <TableCell>12/02/25</TableCell>
                <TableCell>10:00 - 12:00</TableCell>
                <TableCell>Aula 201</TableCell>
                <TableCell>Carlo Rodriguez</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline">Ver detalle</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;