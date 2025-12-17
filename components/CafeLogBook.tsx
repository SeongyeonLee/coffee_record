import React, { useState } from 'react';
import { CafeLog } from '../types';
import CafeLogForm from './forms/CafeLogForm';
import FlavorTag from './FlavorTag';
import { Plus, Coffee, Calendar, MapPin } from 'lucide-react';

interface CafeLogBookProps {
    logs: CafeLog[];
    onRefresh: () => void;
}

const CafeLogBook: React.FC<CafeLogBookProps> = ({ logs, onRefresh }) => {
    const [isAdding, setIsAdding] = useState(false);

    // Group logs by Cafe Name
    const groupedLogs = logs.reduce((acc, log) => {
        const name = log.cafeName.trim();
        if (!acc[name]) acc[name] = [];
        acc[name].push(log);
        return acc;
    }, {} as Record<string, CafeLog[]>);

    const sortedCafeNames = Object.keys(groupedLogs).sort();

    if (isAdding) {
        return (
            <CafeLogForm 
                onSuccess={() => { setIsAdding(false); onRefresh(); }} 
                onCancel={() => setIsAdding(false)} 
            />
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-light text-slate-100">Cafe Journal</h1>
                    <p className="text-slate-500 mt-1">Track your visits and tastings.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} /> New Log
                </button>
            </div>

            {sortedCafeNames.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-800">
                    <Coffee size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-500">No cafe visits logged yet.</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {sortedCafeNames.map(cafeName => (
                        <div key={cafeName} className="space-y-4">
                            <h2 className="text-xl text-slate-200 font-medium flex items-center gap-2 border-b border-slate-800 pb-2">
                                <MapPin size={20} className="text-slate-500" />
                                {cafeName}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {groupedLogs[cafeName].map((log, idx) => (
                                    <div key={log.id || idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-medium text-slate-200">{log.beanName}</div>
                                            <div className="text-emerald-400 text-sm">₩{log.price.toLocaleString()}</div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {log.flavorNotes && log.flavorNotes.map((f, i) => (
                                                <FlavorTag key={i} flavor={f} size="sm" />
                                            ))}
                                        </div>

                                        <p className="text-sm text-slate-400 mb-3 line-clamp-3">{log.review}</p>
                                        
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Calendar size={12} />
                                            {log.date}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CafeLogBook;