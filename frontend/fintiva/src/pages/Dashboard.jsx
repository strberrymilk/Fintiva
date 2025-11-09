import { useMemo, useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Users, Activity, DollarSign } from 'lucide-react';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { UsersTable } from '@/components/ui/users-table';
import { QuickActions } from '@/components/ui/quick-actions';
import { SystemStatus } from '@/components/ui/system-status';
import { RecentActivity } from '@/components/ui/recent-activity';
import { DashboardHeader } from '@/components/ui/dashboard-header';
import { AdminSidebar } from '@/components/ui/admin-sidebar';

// NUEVOS imports (reemplazan RevenueChart)
import ParcelaCultivosChart from "../components/ui/ParcelaCultivosChart.jsx";
import GastosTrimestralesCard from "../components/ui/GastosTrimestralesCard.jsx";

const stats = [
  {
    title: 'Usuarios Totales',
    value: '6,305',
    change: '+12%',
    changeType: 'positive',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Ingresos',
    value: '$45,678',
    change: '+8.2%',
    changeType: 'positive',
    icon: DollarSign,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Avance Educación Financiera',
    value: '80%',
    change: '+15%',
    changeType: 'positive',
    icon: Activity,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

export default function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Saca id_usuario del JWT (sub)
  const idUsuario = useMemo(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Number(payload?.sub) || null;
    } catch {
      return null;
    }
  }, []);

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

  return (
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

        <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
          <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-lg p-3 sm:rounded-xl sm:p-4 md:p-6">
            <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
              <div className="px-2 sm:px-0">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  ¡Bienvenido de nuevo Oscar Aguilar!
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Cuando siembras tu primera inversión, cosechas la autonomía financiera.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <DashboardCard key={stat.title} stat={stat} index={index} />
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
                {/* IZQ: Gráficas */}
                <div className="space-y-4 sm:space-y-6 xl:col-span-2">
                  {/* Reemplazo de Revenue Analytics */}
                  <ParcelaCultivosChart idUsuario={idUsuario ?? 0} />
                  <UsersTable onAddUser={handleAddUser} />
                </div>

                {/* DER: Panel derecho con gastos trimestrales y demás widgets */}
                <div className="space-y-4 sm:space-y-6">
                  <GastosTrimestralesCard idUsuario={idUsuario ?? 0} />
                  <QuickActions
                    onAddUser={handleAddUser}
                    onExport={handleExport}
                  />
                  <SystemStatus />
                  <RecentActivity />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
