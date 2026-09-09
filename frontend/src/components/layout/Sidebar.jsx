import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Lightbulb,
  Boxes,
  Database,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { needsBankService } from '../../services/needsBankService';
import { offerBankService } from '../../services/offerBankService';
import { normalizeNeedsList, normalizeOffersList } from '../../utils/dataNormalizer';

export const Sidebar = ({ isOpen, onClose }) => {
  const [needsCount, setNeedsCount] = useState(12);
  const [offersCount, setOffersCount] = useState(12);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const needsData = await needsBankService.getNeeds();
        setNeedsCount(normalizeNeedsList(needsData).length);
      } catch (err) {
        setNeedsCount(normalizeNeedsList([]).length);
      }

      try {
        const offersData = await offerBankService.getOffers();
        setOffersCount(normalizeOffersList(offersData).length);
      } catch (err) {
        setOffersCount(normalizeOffersList([]).length);
      }
    };
    fetchCounts();
  }, []);

  const navItems = [
    {
      title: 'Main Workspace',
      items: [
        { path: '/dashboard', label: 'Workspaces', icon: LayoutDashboard },
        { path: '/needs-bank', label: 'Needs Bank', icon: Database, badge: String(needsCount) },
        { path: '/offer-bank', label: 'Offer Bank', icon: Briefcase, badge: String(offersCount) },
      ],
    },
    {
      title: 'Lifecycle Stages',
      items: [
        { path: '/discovery', label: '1. Discovery Agent', icon: Compass },
        { path: '/concept', label: '2. Concept Validation', icon: Lightbulb },
        { path: '/prototype', label: '3. Offer Blueprint', icon: Boxes },
      ],
    },
  ];

  const sidebarContent = (
    <div className="h-full p-4 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-6">
        {navItems.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {group.title && (
              <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {group.title}
              </h4>
            )}
            <div className="space-y-1 mt-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100/80 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info Box */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2 mt-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Stage Gate Methodology</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Autonomous AI agents enforce differentiation gates and kill filters before commercial investment.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <aside className="relative w-64 max-w-xs bg-white h-full shadow-xl z-10 flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
