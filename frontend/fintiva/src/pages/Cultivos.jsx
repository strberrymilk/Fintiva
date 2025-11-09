import { useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Users, Activity, DollarSign, Eye } from 'lucide-react';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { RevenueChart } from '@/components/ui/revenue-chart';
import { UsersTable } from '@/components/ui/users-table';
import { QuickActions } from '@/components/ui/quick-actions';
import { SystemStatus } from '@/components/ui/system-status';
import { RecentActivity } from '@/components/ui/recent-activity';
import { DashboardHeader } from '@/components/ui/dashboard-header';
import { AdminSidebar } from '@/components/ui/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const stats = [
    {
        title: 'Total Users',
        value: '12,345',
        change: '+12%',
        changeType: 'positive',
        icon: Users,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
    },
    {
        title: 'Revenue',
        value: '$45,678',
        change: '+8.2%',
        changeType: 'positive',
        icon: DollarSign,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
    },
    {
        title: 'Active Sessions',
        value: '2,456',
        change: '+15%',
        changeType: 'positive',
        icon: Activity,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
    },
    {
        title: 'Page Views',
        value: '34,567',
        change: '-2.4%',
        changeType: 'negative',
        icon: Eye,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
    },
];

export default function Cultivos() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        tipo_cultivo: '',
        mes_siembra: '',
        mes_cosecha: '',
        produccion_anio_pasado: '',
        produccion_anio_antepasado: ''
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsRefreshing(false);
    };

    const handleExport = () => {
        console.log('Exporting data...');
    };

    const handleAddUser = () => {
        console.log('Adding new user...');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        
        try {
            const response = await fetch('http://127.0.0.1:8000/cultivos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_parcela: 1, // Cambiar por el ID de la parcela seleccionada
                    id_usuario: 1, // Cambiar por el ID del usuario logueado
                    tipo_cultivo: formData.tipo_cultivo,
                    mes_siembra: formData.mes_siembra,
                    mes_cosecha: formData.mes_cosecha,
                    produccion_anio_pasado: parseFloat(formData.produccion_anio_pasado) || 0,
                    produccion_anio_antepasado: parseFloat(formData.produccion_anio_antepasado) || 0
                })
            });

            if (!response.ok) {
                throw new Error('Error al registrar el cultivo');
            }

            const data = await response.json();
            console.log('Cultivo registrado:', data);
            
            // Limpiar el formulario
            setFormData({
                tipo_cultivo: '',
                mes_siembra: '',
                mes_cosecha: '',
                produccion_anio_pasado: '',
                produccion_anio_antepasado: ''
            });
            alert('Cultivo registrado correctamente');
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            alert('Hubo un error al registrar el cultivo');
        }
    };
    return(
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          onExport={handleExport}
          isRefreshing={isRefreshing}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mt-4">Cultivos</h1>
          <div className="bg-background rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Registra un nuevo cultivo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="tipo_cultivo" className="text-sm font-medium">
                    Tipo de Cultivo
                  </label>
                  <Input
                    id="tipo_cultivo"
                    name="tipo_cultivo"
                    type="text"
                    placeholder="Ej: Maíz, Trigo, Jitomate"
                    value={formData.tipo_cultivo}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="mes_siembra" className="text-sm font-medium">
                    Mes de Siembra
                  </label>
                  <Input
                    id="mes_siembra"
                    name="mes_siembra"
                    type="text"
                    placeholder="Ej: Enero, Febrero"
                    value={formData.mes_siembra}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="mes_cosecha" className="text-sm font-medium">
                    Mes de Cosecha
                  </label>
                  <Input
                    id="mes_cosecha"
                    name="mes_cosecha"
                    type="text"
                    placeholder="Ej: Junio, Julio"
                    value={formData.mes_cosecha}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="produccion_anio_pasado" className="text-sm font-medium">
                    Producción Año Pasado (toneladas)
                  </label>
                  <Input
                    id="produccion_anio_pasado"
                    name="produccion_anio_pasado"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.produccion_anio_pasado}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="produccion_anio_antepasado" className="text-sm font-medium">
                    Producción Año Antepasado (toneladas)
                  </label>
                  <Input
                    id="produccion_anio_antepasado"
                    name="produccion_anio_antepasado"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.produccion_anio_antepasado}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" className="hover:bg-[var(--accent)]">
                  Registrar Cultivo
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}