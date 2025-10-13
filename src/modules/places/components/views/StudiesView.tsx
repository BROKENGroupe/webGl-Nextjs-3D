import React from 'react';
import { LinearProgress } from '../progress/LinearProgress';

interface StudiesViewProps {
  establishments: any[];
  allStudies: any[];
}

export const StudiesView: React.FC<StudiesViewProps> = ({ establishments, allStudies }) => {
  const completedStudies = allStudies.filter(s => s.status === 'completed');
  const inProgressStudies = allStudies.filter(s => s.status === 'in_progress');
  const pendingStudies = allStudies.filter(s => s.status === 'pending');
  
  const avgCompliance = completedStudies.length > 0 
    ? Math.round(completedStudies.reduce((sum, s) => sum + s.metrics.iso_compliance_level, 0) / completedStudies.length)
    : 0;

  const avgNoiseIsolation = completedStudies.length > 0 
    ? Math.round(completedStudies.reduce((sum, s) => sum + s.metrics.noise_isolation, 0) / completedStudies.length)
    : 0;

  const avgExternalReduction = establishments.length > 0 
    ? Math.round(establishments.reduce((sum, e) => sum + e.noise_impact_external, 0) / establishments.length)
    : 0;
  
  return (
    <div className="space-y-6">
      {/* Panel de Control Principal */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Panel de Control Acústico</h3>
            <p className="text-sm text-gray-600 mt-1">Análisis ISO 12354-4 consolidado</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-gray-900">{allStudies.length}</div>
            <div className="text-sm text-gray-600">estudios totales</div>
          </div>
        </div>
        
        {/* Estadísticas principales con barras lineales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <LinearProgress 
              percentage={avgCompliance} 
              color={avgCompliance >= 85 ? 'green' : avgCompliance >= 70 ? 'orange' : 'red'}
              label="Cumplimiento ISO Promedio"
              height="h-3"
            />
            <p className="text-xs text-gray-500 mt-1">
              {avgCompliance >= 85 ? '✅ Excelente cumplimiento normativo' : 
               avgCompliance >= 70 ? '⚠️ Cumplimiento aceptable' : 
               '🚨 Requiere mejoras urgentes'}
            </p>
          </div>
          <div>
            <LinearProgress 
              percentage={(completedStudies.length / allStudies.length) * 100} 
              color="blue"
              label="Estudios Completados"
              height="h-3"
            />
            <p className="text-xs text-gray-500 mt-1">
              {completedStudies.length} de {allStudies.length} estudios finalizados
            </p>
          </div>
        </div>

        {/* Métricas detalladas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {avgNoiseIsolation} dB
            </div>
            <div className="text-sm font-medium text-green-800 mb-1">Aislamiento Promedio</div>
            <div className="text-xs text-green-600">
              {avgNoiseIsolation >= 55 ? 'Excelente' : avgNoiseIsolation >= 45 ? 'Bueno' : 'Mejorable'}
            </div>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {avgExternalReduction} dB
            </div>
            <div className="text-sm font-medium text-purple-800 mb-1">Reducción Externa</div>
            <div className="text-xs text-purple-600">
              {avgExternalReduction >= 35 ? 'Excelente' : avgExternalReduction >= 25 ? 'Bueno' : 'Mejorable'}
            </div>
          </div>

          <div className="text-center p-6 bg-blue-50 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.round((completedStudies.length / allStudies.length) * 100)}%
            </div>
            <div className="text-sm font-medium text-blue-800 mb-1">Progreso General</div>
            <div className="text-xs text-blue-600">
              {completedStudies.length} completados
            </div>
          </div>
        </div>

        {/* Estado de estudios */}
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Estado de Estudios</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-green-800">Completados</span>
              </div>
              <span className="text-lg font-bold text-green-600">{completedStudies.length}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-blue-800">En Progreso</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{inProgressStudies.length}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-600">Pendientes</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{pendingStudies.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista detallada de estudios */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Estudios Detallados</h3>
          <p className="text-sm text-gray-600">Análisis individual por establecimiento</p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {establishments.map((establishment) => (
            <div key={establishment.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={establishment.image} 
                    alt={establishment.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{establishment.name}</h4>
                    <p className="text-sm text-gray-600">{establishment.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {establishment.compliance_score}%
                  </div>
                  <div className="text-xs text-gray-500">ISO Compliance</div>
                </div>
              </div>
              
              {/* Estudios del establecimiento */}
              <div className="space-y-3">
                {establishment.studies.map((study: any, index: number) => (
                  <div key={study.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        study.status === 'completed' ? 'bg-green-500' :
                        study.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{study.name}</div>
                        <div className="text-xs text-gray-500">{study.date}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{study.metrics.iso_compliance_level}%</div>
                        <div className="text-gray-500">ISO</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{study.metrics.noise_isolation} dB</div>
                        <div className="text-gray-500">STC</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{study.metrics.sound_transmission_class} dB</div>
                        <div className="text-gray-500">Rating</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Características del sistema */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Características Activas del Sistema
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            Barras de progreso con popovers informativos
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            Métricas detalladas con recomendaciones
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            Sistema de distinciones gamificado
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            Análisis consolidado multi-establecimiento
          </div>
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">🔄</span>
            Análisis detallado con gráficos de frecuencia (próximamente)
          </div>
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">🔄</span>
            Reportes de cumplimiento ISO 12354-4 (próximamente)
          </div>
        </div>
      </div>
    </div>
  );
};