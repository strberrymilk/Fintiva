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

export default function Parcelas() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        nombre_parcela: '',
        ubicacion: '',
        tamano: '',
        tipo_tenencia: '',
        sistema_riego: ''
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
            const response = await fetch('http://127.0.0.1:8000/parcelas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_usuario: 1, // Cambiar por el ID del usuario logueado
                    nombre_parcela: formData.nombre_parcela,
                    ubicacion: formData.ubicacion,
                    tamano: parseFloat(formData.tamano) || 0,
                    tipo_tenencia: formData.tipo_tenencia,
                    sistema_riego: formData.sistema_riego
                })
            });

            if (!response.ok) {
                throw new Error('Error al registrar la parcela');
            }

            const data = await response.json();
            console.log('Parcela registrada:', data);
            
            // Limpiar el formulario
            setFormData({
                nombre_parcela: '',
                ubicacion: '',
                tamano: '',
                tipo_tenencia: '',
                sistema_riego: ''
            });
            alert('Parcela registrada correctamente');
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            alert('Hubo un error al registrar la parcela');
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
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mt-4">Parcelas</h1>
          <div className="bg-background rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Registra una nueva parcela</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="nombre_parcela" className="text-sm font-medium">
                    Nombre de la Parcela
                  </label>
                  <Input
                    id="nombre_parcela"
                    name="nombre_parcela"
                    type="text"
                    placeholder="Ej: Parcela Norte"
                    value={formData.nombre_parcela}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="ubicacion" className="text-sm font-medium">
                    Ubicación
                  </label>
                  <Input
                    id="ubicacion"
                    name="ubicacion"
                    type="text"
                    placeholder="Ej: Veracruz, México"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="tamano" className="text-sm font-medium">
                    Tamaño (hectáreas)
                  </label>
                  <Input
                    id="tamano"
                    name="tamano"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.tamano}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="tipo_tenencia" className="text-sm font-medium">
                    Tipo de Tenencia
                  </label>
                  <Input
                    id="tipo_tenencia"
                    name="tipo_tenencia"
                    type="text"
                    placeholder="Ej: Propia, Arrendada"
                    value={formData.tipo_tenencia}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="sistema_riego" className="text-sm font-medium">
                    Sistema de Riego
                  </label>
                  <Input
                    id="sistema_riego"
                    name="sistema_riego"
                    type="text"
                    placeholder="Ej: Goteo, Aspersión, Temporal"
                    value={formData.sistema_riego}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" className="hover:bg-[var(--accent)]">
                  Registrar Parcela
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}