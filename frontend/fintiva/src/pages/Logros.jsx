import { useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Trophy, Star, Award } from 'lucide-react';
import { DashboardHeader } from '@/components/ui/dashboard-header';
import { AdminSidebar } from '@/components/ui/admin-sidebar';
import medal1 from '@/assets/medal1.png';
import medal2 from '@/assets/medal2.png';
import medal3 from '@/assets/medal3.png';
import medal from '@/assets/medal.png';

const achievements = [
    {
        id: 1,
        title: 'Primer Registro',
        description: 'Completaste tu primer registro de gastos',
        image: medal3,
        earned: true,
        date: '2025-01-15',
        bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-100',
        borderColor: 'border-yellow-400'
    },
    {
        id: 2,
        title: 'Constancia',
        description: 'Registraste gastos durante 4 trimestres consecutivos',
        image: medal2,
        earned: true,
        date: '2025-03-20',
        bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-100',
        borderColor: 'border-blue-400'
    },
    {
        id: 3,
        title: 'Maestro Agrícola',
        description: 'Alcanzaste 10 registros completos',
        image: medal1,
        earned: false,
        date: null,
        bgColor: 'bg-gradient-to-br from-purple-50 to-pink-100',
        borderColor: 'border-purple-400'
    },
    {
        id: 4,
        title: 'Comandante del dinero',
        description: 'Aprobaste un quiz de préstamos y financiamiento para la prevención de fraudes',
        image: medal,
        earned: true,
        date: '2025-02-10',
        bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
        borderColor: 'border-green-400'
    },
    {
        id: 5,
        title: 'Ahorrador',
        description: 'Aprobaste un quiz de finanzas básicas (cómo tomar mejores decisiones con tu dinero personal y del rancho)',
        image: medal,
        earned: false,
        date: null,
        bgColor: 'bg-gradient-to-br from-orange-50 to-red-100',
        borderColor: 'border-orange-400'
    },
    {
        id: 6,
        title: 'Cuentas Claras',
        description: 'Aprobaste un quiz de contaduría básica (costos, inventarios y registros)',
        image: medal,
        earned: false,
        date: null,
        bgColor: 'bg-gradient-to-br from-indigo-50 to-violet-100',
        borderColor: 'border-indigo-400'
    },
];

export default function Logros() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsRefreshing(false);
    };

    const handleExport = () => {
        console.log('Exporting data...');
    };

    const earnedCount = achievements.filter(a => a.earned).length;

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
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header */}
          <div className="mt-4">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Logros</h1>
            <p className="text-muted-foreground">
              Has desbloqueado <span className="font-bold text-primary">{earnedCount}</span> de {achievements.length} logros
            </p>
          </div>

          {/* Achievement Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`relative overflow-hidden rounded-xl border-2 ${achievement.borderColor} ${achievement.bgColor} transition-all duration-300 hover:scale-105 hover:shadow-xl ${!achievement.earned && 'opacity-60 grayscale'}`}
              >
                <div className="p-6">
                  {/* Medal Image */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <img 
                        src={achievement.image} 
                        alt={achievement.title}
                        className="w-24 h-24 object-contain drop-shadow-lg"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {achievement.description}
                    </p>
                    
                    {/* Status */}
                    {achievement.earned ? (
                      <div className="pt-3">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                          <Trophy className="w-3 h-3" />
                          Desbloqueado: {achievement.date}
                        </span>
                      </div>
                    ) : (
                      <div className="pt-3">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                          <Star className="w-3 h-3" />
                          Bloqueado
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative element */}
                {achievement.earned && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/30 rounded-bl-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}