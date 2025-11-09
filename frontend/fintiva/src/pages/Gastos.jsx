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

export default function Dashboard() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        agua: '',
        gas: '',
        luz: '',
        semillas: '',
        fertilizantes: '',
        mano_obra: '',
        combustible: ''
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
            const response = await fetch('http://127.0.0.1:8000/gastos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_usuario: 22, // Cambiar por el ID del usuario logueado
                    gasto_semillas: parseFloat(formData.semillas) || 0,
                    gasto_fertilizantes: parseFloat(formData.fertilizantes) || 0,
                    gasto_agua: parseFloat(formData.agua) || 0,
                    gasto_gas: parseFloat(formData.gas) || 0,
                    gasto_luz: parseFloat(formData.luz) || 0,
                    gasto_mantenimiento: parseFloat(formData.mano_obra) || 0,
                    gasto_combustible: parseFloat(formData.combustible) || 0
                })
            });

            if (!response.ok) {
                throw new Error('Error al registrar los gastos');
            }

            const data = await response.json();
            console.log('Gastos registrados:', data);
            
            // Limpiar el formulario
            setFormData({
                agua: '',
                gas: '',
                luz: '',
                semillas: '',
                fertilizantes: '',
                mano_obra: '',
                combustible: ''
            });
            alert('Gastos registrados correctamente');
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            alert('Hubo un error al registrar los gastos');
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
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mt-4">Gastos</h1>
          <div className="bg-background rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Registra tus gastos trimestrales</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="agua" className="text-sm font-medium">
                    Agua
                  </label>
                  <Input
                    id="agua"
                    name="agua"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.agua}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="gas" className="text-sm font-medium">
                    Gas
                  </label>
                  <Input
                    id="gas"
                    name="gas"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.gas}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="luz" className="text-sm font-medium">
                    Luz
                  </label>
                  <Input
                    id="luz"
                    name="luz"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.luz}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="semillas" className="text-sm font-medium">
                    Semillas
                  </label>
                  <Input
                    id="semillas"
                    name="semillas"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.semillas}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="fertilizantes" className="text-sm font-medium">
                    Fertilizantes
                  </label>
                  <Input
                    id="fertilizantes"
                    name="fertilizantes"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.fertilizantes}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="mano_obra" className="text-sm font-medium">
                    Mano de obra
                  </label>
                  <Input
                    id="mano_obra"
                    name="mano_obra"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.mano_obra}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="combustible" className="text-sm font-medium">
                    Combustible
                  </label>
                  <Input
                    id="combustible"
                    name="combustible"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.combustible}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" className="hover:bg-[var(--accent)]">
                  Registrar Gasto
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}